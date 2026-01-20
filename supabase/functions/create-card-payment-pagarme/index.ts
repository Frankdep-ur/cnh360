import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  console.log(`[create-card-payment-pagarme] ${step}`, details ? JSON.stringify(details) : "");
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const pagarmeApiKey = Deno.env.get("PAGARME_API_KEY");
    const recipientCNH360 = Deno.env.get("PAGARME_RECIPIENT_CNH360");
    
    if (!pagarmeApiKey) {
      throw new Error("PAGARME_API_KEY não configurada");
    }
    if (!recipientCNH360) {
      throw new Error("PAGARME_RECIPIENT_CNH360 não configurado");
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
      throw new Error("Usuário não autenticado");
    }
    logStep("User authenticated", { email: user.email });

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const { 
      card,
      lessonId,
      amount,
    } = await req.json();

    if (!card || !lessonId || !amount) {
      throw new Error("Dados incompletos: card, lessonId e amount são obrigatórios");
    }

    // Validate card data
    if (!card.number || !card.holder_name || !card.exp_month || !card.exp_year || !card.cvv) {
      throw new Error("Dados do cartão incompletos");
    }

    const amountCents = Math.round(amount * 100);
    
    logStep("Card payment request", { 
      amount, 
      amountCents,
      lessonId,
      cardLastFour: card.number.slice(-4),
    });

    // Get lesson details
    const { data: aula, error: aulaError } = await supabase
      .from("aulas")
      .select("aluno_id, instrutor_id, duracao_minutos")
      .eq("id", lessonId)
      .single();

    if (aulaError || !aula) {
      throw new Error("Aula não encontrada");
    }

    // Verify lesson belongs to user
    const { data: alunoData, error: alunoError } = await supabase
      .from("alunos")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (alunoError || !alunoData || alunoData.id !== aula.aluno_id) {
      throw new Error("Aula não pertence ao usuário autenticado");
    }

    // Get instructor's recipient_id
    const { data: instrutorData } = await supabase
      .from("instrutores")
      .select("pagarme_recipient_id")
      .eq("id", aula.instrutor_id)
      .single();

    // Calculate split (50/50)
    const platformFeeCents = Math.round(amountCents * 0.50);
    const instructorAmountCents = amountCents - platformFeeCents;

    // Get customer profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, phone, cpf")
      .eq("id", user.id)
      .single();

    // Format expiration date
    const expMonth = card.exp_month.toString().padStart(2, '0');
    const expYear = card.exp_year.toString().length === 2 
      ? `20${card.exp_year}` 
      : card.exp_year.toString();

    // Create card order in Pagar.me
    const orderPayload: any = {
      code: `card-${Date.now()}`,
      customer: {
        email: user.email,
        name: profile?.full_name || card.holder_name || "Cliente CNH360",
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
      items: [
        {
          amount: amountCents,
          description: `Aula de Direção - ${aula.duracao_minutos}min`,
          quantity: 1,
        },
      ],
      payments: [
        {
          payment_method: "credit_card",
          credit_card: {
            card: {
              number: card.number.replace(/\s/g, ""),
              holder_name: card.holder_name.toUpperCase(),
              exp_month: parseInt(expMonth),
              exp_year: parseInt(expYear),
              cvv: card.cvv,
            },
            installments: 1,
            capture: false, // Pre-authorization - will be captured when instructor accepts
            statement_descriptor: "CNH360",
          },
        },
      ],
      metadata: {
        user_id: user.id,
        instrutor_id: aula.instrutor_id,
        lesson_id: lessonId,
        payment_type: "credit_card",
      },
    };

    // Add split rules if instructor has recipient_id
    if (instrutorData?.pagarme_recipient_id) {
      orderPayload.payments[0].split = [
        {
          amount: platformFeeCents,
          recipient_id: recipientCNH360,
          type: "flat",
          options: {
            charge_processing_fee: true,
            liable: true,
          },
        },
        {
          amount: instructorAmountCents,
          recipient_id: instrutorData.pagarme_recipient_id,
          type: "flat",
          options: {
            charge_processing_fee: false,
            liable: false,
          },
        },
      ];
    }

    logStep("Creating card order", { 
      code: orderPayload.code,
      amountCents,
      hasSplit: !!instrutorData?.pagarme_recipient_id,
    });

    const orderResponse = await fetch("https://api.pagar.me/core/v5/orders", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${btoa(pagarmeApiKey + ":")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderPayload),
    });

    const orderData = await orderResponse.json();

    if (!orderResponse.ok) {
      logStep("Pagar.me card error", orderData);
      
      // Extract user-friendly error message
      let errorMessage = "Erro ao processar cartão";
      if (orderData.message) {
        errorMessage = orderData.message;
      } else if (orderData.errors && orderData.errors.length > 0) {
        errorMessage = orderData.errors.map((e: any) => e.message).join(", ");
      }
      
      throw new Error(errorMessage);
    }

    logStep("Card order created", { orderId: orderData.id, status: orderData.status });

    // Check if payment was authorized
    const charge = orderData.charges?.[0];
    const transaction = charge?.last_transaction;
    const status = transaction?.status || orderData.status;
    
    // Update lesson with transaction_id
    await supabase
      .from("aulas")
      .update({ 
        transaction_id: orderData.id,
        status: status === "authorized" || status === "pending" ? "confirmada" : "pendente",
      })
      .eq("id", lessonId);

    logStep("Lesson updated with card payment", { lessonId, transactionId: orderData.id, status });

    return new Response(
      JSON.stringify({
        success: true,
        transactionId: orderData.id,
        status: status,
        message: status === "authorized" 
          ? "Pagamento pré-autorizado com sucesso" 
          : status === "paid"
          ? "Pagamento confirmado"
          : "Pagamento em processamento",
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error: any) {
    logStep("Error", { message: error.message });
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
