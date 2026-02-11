import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { checkRateLimit, rateLimitResponse } from "../_shared/rateLimit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const ts = new Date().toISOString();
  console.log(`[create-card-payment-pagarme][${ts}] ${step}`, details ? JSON.stringify(details) : "");
};

// Fetch with timeout (30s) and retry for 5xx errors
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 2): Promise<Response> {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeoutId);
      if (response.status >= 400 && response.status < 500) return response;
      if (response.status >= 500 && attempt < maxRetries) {
        logStep(`Retry ${attempt + 1}/${maxRetries}`, { status: response.status, url });
        await new Promise(r => setTimeout(r, 2000 * (attempt + 1)));
        continue;
      }
      return response;
    } catch (err: any) {
      clearTimeout(timeoutId);
      lastError = err.name === "AbortError" ? new Error("Gateway timeout (30s)") : err;
      if (attempt < maxRetries) {
        logStep(`Retry ${attempt + 1}/${maxRetries} after error`, { error: lastError.message });
        await new Promise(r => setTimeout(r, 2000 * (attempt + 1)));
        continue;
      }
    }
  }
  throw lastError || new Error("Gateway unavailable");
}

// Return 200 with error in body (supabase client puts in data, not error)
function businessError(message: string, errorCode: string, details?: string) {
  logStep("Business error", { error_code: errorCode, message, details });
  return new Response(
    JSON.stringify({ error: message, error_code: errorCode, details }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
  );
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const pagarmeApiKey = Deno.env.get("PAGARME_API_KEY");
    const recipientCNH360 = Deno.env.get("PAGARME_RECIPIENT_CNH360");

    if (!pagarmeApiKey) {
      return businessError("Sistema de pagamento indisponível.", "CONFIG_ERROR", "PAGARME_API_KEY missing");
    }
    if (!recipientCNH360) {
      return businessError("Sistema de pagamento indisponível.", "CONFIG_ERROR", "PAGARME_RECIPIENT_CNH360 missing");
    }

    // Auth
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization");
    let user: any = null;
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);
      const { data: userData } = await supabaseAuth.auth.getUser(token);
      user = userData?.user;
    }
    if (!user) {
      return businessError("Faça login para continuar com o pagamento.", "AUTH_ERROR");
    }
    logStep("User authenticated", { email: user.email, userId: user.id });

    // Rate limit: 5 payment attempts per minute per user
    const { allowed, remaining } = checkRateLimit(`card:${user.id}`, 5, 60000);
    if (!allowed) {
      return rateLimitResponse(corsHeaders);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const {
      cardHash, card, walletToken, walletType,
      lessonId, amount,
    } = await req.json();

    if (!lessonId || !amount) {
      return businessError("Dados incompletos: lessonId e amount são obrigatórios.", "VALIDATION_ERROR");
    }

    const useWallet = !!walletToken;
    const useCardHash = !!cardHash;

    if (!useWallet && !useCardHash && !card) {
      return businessError("Dados de pagamento não fornecidos.", "VALIDATION_ERROR");
    }

    if (!useWallet && !useCardHash && card) {
      if (!card.number || !card.holder_name || !card.exp_month || !card.exp_year || !card.cvv) {
        return businessError("Dados do cartão incompletos.", "VALIDATION_ERROR");
      }
      logStep("Warning: Using legacy raw card data - should migrate to cardHash");
    }

    const amountCents = Math.round(amount * 100);

    logStep("Card payment request", {
      amount, amountCents, lessonId, useWallet,
      walletType: walletType || null, useCardHash,
      payment_method: useWallet ? walletType : "credit_card",
    });

    // Get lesson details
    const { data: aula, error: aulaError } = await supabase
      .from("aulas")
      .select("aluno_id, instrutor_id, duracao_minutos, transaction_id, status")
      .eq("id", lessonId)
      .single();

    if (aulaError || !aula) {
      return businessError("Aula não encontrada.", "NOT_FOUND");
    }

    // Verify lesson belongs to user
    const { data: alunoData, error: alunoError } = await supabase
      .from("alunos").select("id").eq("user_id", user.id).single();

    if (alunoError || !alunoData || alunoData.id !== aula.aluno_id) {
      return businessError("Aula não pertence ao usuário autenticado.", "AUTH_ERROR");
    }

    // === DUPLICATE PAYMENT CHECK ===
    if (aula.transaction_id) {
      logStep("Checking existing transaction", { transactionId: aula.transaction_id, status: aula.status });
      try {
        const existingResp = await fetchWithRetry(
          `https://api.pagar.me/core/v5/orders/${aula.transaction_id}`,
          { headers: { "Authorization": `Basic ${btoa(pagarmeApiKey + ":")}` } }
        );
        if (existingResp.ok) {
          const existingOrder = await existingResp.json();
          const existingCharge = existingOrder.charges?.[0];
          const existingTxStatus = existingCharge?.last_transaction?.status;

          if (existingTxStatus === "authorized" || existingTxStatus === "captured" || existingOrder.status === "paid") {
            return businessError("Esta aula já possui um pagamento autorizado.", "PAYMENT_ALREADY_EXISTS");
          }
          logStep("Existing order terminal, creating new", { status: existingOrder.status, txStatus: existingTxStatus });
        }
      } catch (err: any) {
        logStep("Error checking existing order (proceeding)", { error: err.message });
      }
    }

    // === GET INSTRUCTOR + KYC STATUS ===
    const { data: instrutorData } = await supabase
      .from("instrutores")
      .select("pagarme_recipient_id, kyc_status")
      .eq("id", aula.instrutor_id)
      .single();

    // === VALIDATE RECIPIENT FOR SPLIT ===
    let splitEnabled = false;
    let splitExclusionReason = "";

    if (!instrutorData?.pagarme_recipient_id) {
      splitExclusionReason = "no_recipient_id";
    } else if (instrutorData.kyc_status !== "approved") {
      splitExclusionReason = `kyc_status=${instrutorData.kyc_status || "null"}`;
    } else {
      try {
        const recipientResp = await fetchWithRetry(
          `https://api.pagar.me/core/v5/recipients/${instrutorData.pagarme_recipient_id}`,
          { headers: { "Authorization": `Basic ${btoa(pagarmeApiKey + ":")}` } }
        );
        if (recipientResp.ok) {
          const info = await recipientResp.json();
          if (info.status === "active") {
            splitEnabled = true;
          } else {
            splitExclusionReason = `recipient_status=${info.status}`;
          }
        } else {
          splitExclusionReason = `recipient_check_http_${recipientResp.status}`;
        }
      } catch (err: any) {
        splitExclusionReason = `recipient_check_error: ${err.message}`;
      }
    }

    logStep("Split validation", {
      splitEnabled, splitExclusionReason: splitExclusionReason || "none",
      recipientId: instrutorData?.pagarme_recipient_id || "none",
      kycStatus: instrutorData?.kyc_status || "none",
    });

    // Calculate split (50/50)
    const platformFeeCents = Math.round(amountCents * 0.50);
    const instructorAmountCents = amountCents - platformFeeCents;

    // Get customer profile
    const { data: profile } = await supabase
      .from("profiles").select("full_name, phone, cpf").eq("id", user.id).single();

    // Build credit_card payment object
    let creditCardPayment: any;

    if (useWallet) {
      creditCardPayment = {
        card_token: walletToken, installments: 1,
        capture: false, statement_descriptor: "CNH360",
      };
      logStep(`Using ${walletType} wallet payment`);
    } else if (useCardHash) {
      creditCardPayment = {
        card_hash: cardHash, installments: 1,
        capture: false, statement_descriptor: "CNH360",
      };
      logStep("Using secure card_hash tokenization");
    } else {
      const expMonth = card.exp_month.toString().padStart(2, '0');
      const expYear = card.exp_year.toString().length === 2 ? `20${card.exp_year}` : card.exp_year.toString();
      creditCardPayment = {
        card: {
          number: card.number.replace(/\s/g, ""),
          holder_name: card.holder_name.toUpperCase(),
          exp_month: parseInt(expMonth), exp_year: parseInt(expYear), cvv: card.cvv,
        },
        installments: 1, capture: false, statement_descriptor: "CNH360",
      };
      logStep("Using legacy raw card data (deprecated)");
    }

    // Build order payload
    const orderPayload: any = {
      code: `${useWallet ? walletType : "card"}-${Date.now()}`,
      customer: {
        email: user.email,
        name: profile?.full_name || (card?.holder_name ? card.holder_name : "Cliente CNH360"),
        type: "individual",
        document: profile?.cpf || undefined,
        phones: profile?.phone ? {
          mobile_phone: {
            country_code: "55",
            area_code: profile.phone.substring(0, 2),
            number: profile.phone.substring(2).replace(/\D/g, ""),
          },
        } : undefined,
      },
      items: [{ amount: amountCents, description: `Aula de Direção - ${aula.duracao_minutos}min`, quantity: 1 }],
      payments: [{ payment_method: "credit_card", credit_card: creditCardPayment }],
      metadata: {
        user_id: user.id, instrutor_id: aula.instrutor_id,
        lesson_id: lessonId, payment_type: useWallet ? walletType : "credit_card",
        tokenized: useCardHash || useWallet, split_enabled: String(splitEnabled),
      },
    };

    // Add split rules ONLY if fully validated
    if (splitEnabled && instrutorData?.pagarme_recipient_id) {
      orderPayload.payments[0].split = [
        {
          amount: platformFeeCents,
          recipient_id: recipientCNH360,
          type: "flat",
          options: { charge_processing_fee: true, charge_remainder_fee: true, liable: true },
        },
        {
          amount: instructorAmountCents,
          recipient_id: instrutorData.pagarme_recipient_id,
          type: "flat",
          options: { charge_processing_fee: false, charge_remainder_fee: false, liable: false },
        },
      ];
      logStep("Split rules added", { platform: platformFeeCents, instructor: instructorAmountCents });
    } else {
      logStep("No split - 100% platform", { reason: splitExclusionReason });
    }

    logStep("Creating card order", { code: orderPayload.code, amountCents, splitEnabled });

    // === CREATE ORDER WITH RETRY ===
    const orderResponse = await fetchWithRetry("https://api.pagar.me/core/v5/orders", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${btoa(pagarmeApiKey + ":")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderPayload),
    });

    // Validate content-type
    const ct = orderResponse.headers.get("content-type") || "";
    if (!ct.includes("application/json")) {
      const raw = await orderResponse.text();
      logStep("Non-JSON response", { status: orderResponse.status, ct, body: raw.substring(0, 500) });
      return businessError("Servidor de pagamentos retornou resposta inesperada.", "GATEWAY_ERROR");
    }

    const orderData = await orderResponse.json();

    if (!orderResponse.ok) {
      logStep("Pagar.me card HTTP error", {
        httpStatus: orderResponse.status, response: orderData,
        payment_method: useWallet ? walletType : "credit_card",
      });

      const rawMsg = orderData.message || orderData.errors?.[0]?.message || "Erro no gateway";
      const lower = rawMsg.toLowerCase();

      if (lower.includes("charge_remainder_fee") || lower.includes("split")) {
        return businessError("Erro de configuração do split. Contate o suporte.", "SPLIT_CONFIG_ERROR", rawMsg);
      }
      if (lower.includes("recipient")) {
        return businessError("Instrutor não habilitado para receber pagamentos.", "RECIPIENT_INACTIVE", rawMsg);
      }
      if (lower.includes("document") || lower.includes("cpf")) {
        return businessError("CPF inválido ou incompleto. Atualize seu perfil.", "VALIDATION_ERROR", rawMsg);
      }
      if (lower.includes("card") || lower.includes("cartão") || lower.includes("declined")) {
        return businessError("Cartão recusado. Verifique os dados ou tente outro cartão.", "VALIDATION_ERROR", rawMsg);
      }

      return businessError(rawMsg, "GATEWAY_ERROR", JSON.stringify(orderData));
    }

    logStep("Card order created", {
      orderId: orderData.id, status: orderData.status,
      chargeId: orderData.charges?.[0]?.id,
      payment_method: useWallet ? walletType : "credit_card",
    });

    // Check payment status
    const charge = orderData.charges?.[0];
    const transaction = charge?.last_transaction;
    const status = transaction?.status || orderData.status;

    // Check if payment was declined
    if (orderData.status === "failed" || status === "refused" || status === "failed") {
      const declineMsg = transaction?.acquirer_message
        || transaction?.gateway_response?.errors?.[0]?.message
        || "Pagamento recusado";
      logStep("Card payment declined", {
        status, acquirerMessage: transaction?.acquirer_message,
        gatewayResponse: transaction?.gateway_response,
      });
      return businessError(`Cartão recusado: ${declineMsg}`, "GATEWAY_ERROR", declineMsg);
    }

    // Update lesson - include payment_confirmed when authorized/paid
    const isConfirmed = status === "authorized" || status === "paid";
    const updatePayload: any = {
      transaction_id: orderData.id,
      status: isConfirmed ? "confirmada" : "pendente",
    };
    if (isConfirmed) {
      updatePayload.payment_confirmed = true;
    }

    await supabase.from("aulas").update(updatePayload).eq("id", lessonId);

    // Send WhatsApp notification immediately when card is authorized/paid
    if (isConfirmed) {
      try {
        logStep("Sending WhatsApp notification for card payment", { lessonId });

        // Fetch lesson + instructor + student data for WhatsApp
        const { data: aulaCompleta } = await supabase
          .from("aulas")
          .select("id, data_hora, duracao_minutos, ponto_encontro, valor, instrutor_id, aluno_id")
          .eq("id", lessonId)
          .single();

        if (aulaCompleta) {
          const { data: instrutor } = await supabase
            .from("instrutores")
            .select("user_id, cnh_categoria")
            .eq("id", aulaCompleta.instrutor_id)
            .single();

          const { data: instrutorProfile } = instrutor
            ? await supabase.from("profiles").select("full_name, phone").eq("id", instrutor.user_id).single()
            : { data: null };

          const { data: aluno } = await supabase
            .from("alunos").select("user_id").eq("id", aulaCompleta.aluno_id).single();

          const { data: alunoProfile } = aluno
            ? await supabase.from("profiles").select("full_name").eq("id", aluno.user_id).single()
            : { data: null };

          if (instrutorProfile?.phone) {
            const phoneMasked = instrutorProfile.phone.substring(0, 2) + "****" + instrutorProfile.phone.slice(-4);
            logStep("Dispatching WhatsApp via card flow", {
              aulaId: lessonId,
              instrutor_id: aulaCompleta.instrutor_id,
              phone_masked: phoneMasked,
            });

            const { error: whatsappError } = await supabase.functions.invoke(
              "send-whatsapp-notification",
              {
                body: {
                  aulaId: lessonId,
                  alunoNome: alunoProfile?.full_name || "Aluno",
                  instrutorPhone: instrutorProfile.phone,
                  instrutorNome: instrutorProfile.full_name || "Instrutor",
                  dataHora: aulaCompleta.data_hora,
                  duracaoMinutos: aulaCompleta.duracao_minutos,
                  pontoEncontro: aulaCompleta.ponto_encontro,
                  valor: aulaCompleta.valor,
                  categoria: `Categoria ${instrutor?.cnh_categoria || "B"}`,
                },
              }
            );

            if (whatsappError) {
              logStep("WhatsApp error (card flow)", { error: whatsappError, aulaId: lessonId });
            } else {
              logStep("WhatsApp sent successfully (card flow)", { aulaId: lessonId });
            }
          } else {
            logStep("Instructor has no phone, skipping WhatsApp", { instrutor_id: aulaCompleta.instrutor_id });
          }
        }
      } catch (whatsappErr: any) {
        // Never fail the payment because of WhatsApp
        logStep("WhatsApp dispatch failed (non-blocking)", { error: whatsappErr.message, lessonId });
      }
    }

    logStep("Card payment complete", {
      lessonId, transactionId: orderData.id, status,
      splitEnabled, payment_method: useWallet ? walletType : "credit_card",
      chargeId: charge?.id,
      recipientId: instrutorData?.pagarme_recipient_id || "none",
      kycStatus: instrutorData?.kyc_status || "none",
      whatsappDispatched: isConfirmed,
    });

    return new Response(JSON.stringify({
      success: true, transactionId: orderData.id, status,
      message: status === "authorized" ? "Pagamento pré-autorizado com sucesso"
        : status === "paid" ? "Pagamento confirmado"
        : "Pagamento em processamento",
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });

  } catch (error: any) {
    logStep("Unhandled error", { message: error.message, stack: error.stack?.substring(0, 500) });

    const msg = error.message || "";
    if (msg.includes("timeout") || msg.includes("abort") || msg.includes("Gateway")) {
      return businessError(
        "Servidor de pagamentos indisponível. Tente novamente em alguns minutos.",
        "GATEWAY_TIMEOUT", msg
      );
    }

    return new Response(
      JSON.stringify({ error: error.message || "Erro interno", error_code: "INTERNAL_ERROR" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
