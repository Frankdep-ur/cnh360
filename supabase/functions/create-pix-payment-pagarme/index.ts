import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { checkRateLimit, rateLimitResponse } from "../_shared/rateLimit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const ts = new Date().toISOString();
  console.log(`[create-pix-payment-pagarme][${ts}] ${step}`, details ? JSON.stringify(details) : "");
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

// Return 200 with error in body (so supabase client puts it in data, not error)
function businessError(message: string, errorCode: string, internalDetails?: string) {
  logStep("Business error", { error_code: errorCode, message, details: internalDetails });
  return new Response(
    JSON.stringify({ error: message, error_code: errorCode }),
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
    const { allowed, remaining } = checkRateLimit(`pix:${user.id}`, 5, 60000);
    if (!allowed) {
      return rateLimitResponse(corsHeaders);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const {
      amount, duration, instructorId, aulaId,
      useOwnCar, meetingPoint, scheduledDate,
      studentLat, studentLng,
    } = await req.json();

    // Apply 5% PIX discount
    const discountedAmount = amount * 0.95;
    const amountCents = Math.round(discountedAmount * 100);

    logStep("PIX payment request", {
      originalAmount: amount, discountedAmount, amountCents,
      instructorId, aulaId: aulaId || "new", payment_method: "pix",
    });

    // Get aluno_id
    const { data: alunoData, error: alunoError } = await supabase
      .from("alunos").select("id").eq("user_id", user.id).single();

    if (alunoError || !alunoData) {
      return businessError("Complete seu cadastro para agendar aulas.", "NOT_FOUND", "Aluno not found");
    }

    // === DUPLICATE PAYMENT CHECK ===
    if (aulaId) {
      const { data: existingAula } = await supabase
        .from("aulas").select("transaction_id, status").eq("id", aulaId).single();

      if (existingAula?.transaction_id) {
        logStep("Checking existing transaction", {
          aulaId, transactionId: existingAula.transaction_id, status: existingAula.status,
        });
        try {
          const existingResp = await fetchWithRetry(
            `https://api.pagar.me/core/v5/orders/${existingAula.transaction_id}`,
            { headers: { "Authorization": `Basic ${btoa(pagarmeApiKey + ":")}` } }
          );
          if (existingResp.ok) {
            const existingOrder = await existingResp.json();
            const existingTx = existingOrder.charges?.[0]?.last_transaction;

            if (existingOrder.status === "pending" && existingTx?.qr_code) {
              logStep("Returning existing PIX (avoiding duplicate)", { orderId: existingOrder.id });
              return new Response(JSON.stringify({
                success: true, transactionId: existingOrder.id, aulaId,
                qrCode: existingTx.qr_code, qrCodeUrl: existingTx.qr_code_url,
                expiresAt: existingTx.expires_at, amount: discountedAmount, reused: true,
              }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
            }
            if (existingOrder.status === "paid") {
              return businessError("Esta aula já possui um pagamento confirmado.", "PAYMENT_ALREADY_EXISTS");
            }
            logStep("Existing order terminal, creating new", { existingStatus: existingOrder.status });
          }
        } catch (err: any) {
          logStep("Error checking existing order (proceeding)", { error: err.message });
        }
      }
    }

    // === GET INSTRUCTOR + KYC STATUS ===
    const { data: instrutorData } = await supabase
      .from("instrutores")
      .select("pagarme_recipient_id, kyc_status")
      .eq("id", instructorId)
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

    let phoneAreaCode = "11";
    let phoneNumber = "999999999";
    if (profile?.phone) {
      const cleanPhone = profile.phone.replace(/\D/g, "");
      if (cleanPhone.length >= 10) {
        phoneAreaCode = cleanPhone.substring(0, 2);
        phoneNumber = cleanPhone.substring(2);
      }
    }

    // Build order payload
    const orderPayload: any = {
      code: `pix-${Date.now()}`,
      customer: {
        email: user.email,
        name: profile?.full_name || "Cliente CNH360",
        type: "individual",
        document: profile?.cpf || undefined,
        phones: { mobile_phone: { country_code: "55", area_code: phoneAreaCode, number: phoneNumber } },
      },
      items: [{ amount: amountCents, description: `Aula de Direção - ${duration}h (PIX)`, quantity: 1 }],
      payments: [{ payment_method: "pix", pix: { expires_in: 3600 } }],
      metadata: {
        user_id: user.id, instrutor_id: instructorId,
        duration: String(duration), payment_type: "pix", split_enabled: String(splitEnabled),
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

    logStep("Creating PIX order", { code: orderPayload.code, amountCents, splitEnabled });

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
      const rawMsg = orderData.message || orderData.errors?.[0]?.message || "Erro no gateway";
      logStep("Pagar.me PIX HTTP error", {
        httpStatus: orderResponse.status, rawMsg, payment_method: "pix",
      });
      const lower = rawMsg.toLowerCase();

      if (lower.includes("charge_remainder_fee") || lower.includes("split")) {
        return businessError("Erro ao processar pagamento. Entre em contato com o suporte.", "SPLIT_CONFIG_ERROR");
      }
      if (lower.includes("recipient")) {
        return businessError("Instrutor não habilitado para receber pagamentos.", "RECIPIENT_INACTIVE");
      }
      if (lower.includes("document") || lower.includes("cpf")) {
        return businessError("CPF inválido ou incompleto. Atualize seu perfil.", "VALIDATION_ERROR");
      }
      return businessError("Serviço de pagamento temporariamente indisponível. Tente novamente.", "GATEWAY_ERROR");
    }

    logStep("PIX order created", {
      orderId: orderData.id, status: orderData.status,
      chargeId: orderData.charges?.[0]?.id, payment_method: "pix",
    });

    // Check if order failed
    if (orderData.status === "failed") {
      const charge = orderData.charges?.[0];
      const lastTx = charge?.last_transaction;
      const errMsg = lastTx?.gateway_response?.errors?.[0]?.message
        || lastTx?.acquirer_message || lastTx?.status || "Pagamento recusado";

      logStep("PIX order failed", {
        chargeStatus: charge?.status, txStatus: lastTx?.status,
        gatewayResponse: lastTx?.gateway_response, acquirerMessage: lastTx?.acquirer_message,
      });
      return businessError(`PIX recusado: ${errMsg}`, "GATEWAY_ERROR", errMsg);
    }

    // Extract PIX data
    const pixCharge = orderData.charges?.[0];
    const pixTx = pixCharge?.last_transaction;

    if (!pixTx) {
      logStep("PIX transaction missing", { charges: orderData.charges });
      return businessError("Dados do PIX não encontrados na resposta.", "GATEWAY_ERROR");
    }

    const qrCode = pixTx.qr_code;
    const qrCodeUrl = pixTx.qr_code_url;
    if (!qrCode || !qrCodeUrl) {
      logStep("PIX QR missing", { qrCode: !!qrCode, qrCodeUrl: !!qrCodeUrl });
      return businessError("QR Code PIX não foi gerado. Tente novamente.", "GATEWAY_ERROR");
    }

    const expiresAt = pixTx.expires_at;
    const transactionId = orderData.id;

    // Create or update lesson
    let lessonId = aulaId;
    if (!aulaId) {
      const { data: newAula, error: aulaCreateErr } = await supabase
        .from("aulas")
        .insert({
          aluno_id: alunoData.id, instrutor_id: instructorId,
          data_hora: scheduledDate, duracao_minutos: duration * 60,
          valor: discountedAmount, usa_carro_aluno: useOwnCar,
          ponto_encontro: meetingPoint, latitude_aluno: studentLat,
          longitude_aluno: studentLng, status: "pendente", transaction_id: transactionId,
        })
        .select().single();

      if (aulaCreateErr) {
        logStep("Error creating lesson", { error: aulaCreateErr });
        return businessError("Erro ao criar aula no sistema.", "VALIDATION_ERROR", aulaCreateErr.message);
      }
      lessonId = newAula.id;
    } else {
      await supabase.from("aulas").update({ transaction_id: transactionId }).eq("id", aulaId);
    }

    logStep("PIX payment complete", {
      lessonId, transactionId, amount: discountedAmount, amountCents,
      splitEnabled, payment_method: "pix", chargeId: pixCharge?.id,
      recipientId: instrutorData?.pagarme_recipient_id || "none",
      kycStatus: instrutorData?.kyc_status || "none",
    });

    return new Response(JSON.stringify({
      success: true, transactionId, aulaId: lessonId,
      qrCode, qrCodeUrl, expiresAt, amount: discountedAmount,
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
      JSON.stringify({ error: "Erro interno do servidor. Tente novamente.", error_code: "INTERNAL_ERROR" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
