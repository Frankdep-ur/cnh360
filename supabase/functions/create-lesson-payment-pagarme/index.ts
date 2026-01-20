import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  console.log(`[create-lesson-payment-pagarme] ${step}`, details ? JSON.stringify(details) : "");
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

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);
    const { data: userData, error: userError } = await supabaseAuth.auth.getUser(token);
    
    if (userError || !userData.user) {
      throw new Error("Usuário não autenticado");
    }
    const user = userData.user;
    logStep("User authenticated", { email: user.email });

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const { 
      amount, 
      duration, 
      instructorId, 
      useOwnCar, 
      meetingPoint, 
      scheduledDate,
      studentLat,
      studentLng,
    } = await req.json();

    logStep("Request data", { amount, duration, instructorId, useOwnCar });

    // Get aluno_id
    const { data: alunoData, error: alunoError } = await supabase
      .from("alunos")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (alunoError || !alunoData) {
      throw new Error("Aluno não encontrado. Complete seu cadastro primeiro.");
    }
    logStep("Aluno found", { alunoId: alunoData.id });

    // Get instructor's recipient_id
    const { data: instrutorData, error: instrutorError } = await supabase
      .from("instrutores")
      .select("pagarme_recipient_id, user_id")
      .eq("id", instructorId)
      .single();

    if (instrutorError) {
      throw new Error("Instrutor não encontrado");
    }

    // Calculate amounts (in centavos)
    const amountCents = Math.round(amount * 100);
    const platformFeeCents = Math.round(amountCents * 0.50); // 50% for platform (test)
    const instructorAmountCents = amountCents - platformFeeCents; // 50% for instructor

    logStep("Amounts calculated", { 
      amountCents, 
      platformFeeCents, 
      instructorAmountCents 
    });

    // Create customer in Pagar.me if needed
    let customerId: string | undefined;
    
    // First check if customer exists by searching
    const searchCustomerResponse = await fetch(
      `https://api.pagar.me/core/v5/customers?email=${encodeURIComponent(user.email!)}`,
      {
        method: "GET",
        headers: {
          "Authorization": `Basic ${btoa(pagarmeApiKey + ":")}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (searchCustomerResponse.ok) {
      const searchData = await searchCustomerResponse.json();
      if (searchData.data && searchData.data.length > 0) {
        customerId = searchData.data[0].id;
        logStep("Existing customer found", { customerId });
      }
    }

    // Create order with pre-authorization (capture: false for credit card)
    const orderPayload: any = {
      code: `aula-${Date.now()}`,
      customer_id: customerId,
      items: [
        {
          amount: amountCents,
          description: `Aula de Direção - ${duration}h`,
          quantity: 1,
        },
      ],
      payments: [
        {
          payment_method: "checkout",
          checkout: {
            expires_in: 3600, // 1 hour
            accepted_payment_methods: ["credit_card"],
            success_url: `${req.headers.get("origin")}/aluno/aula-confirmada`,
            skip_checkout_success_page: true,
            customer_editable: !customerId, // Allow editing if no customer
            billing_address_editable: true,
            credit_card: {
              capture: false, // Pre-authorization only
              statement_descriptor: "CNH360",
              installments: [
                {
                  number: 1,
                  total: amountCents,
                },
              ],
            },
          },
        },
      ],
      metadata: {
        user_id: user.id,
        instrutor_id: instructorId,
        duration: String(duration),
      },
    };

    // Add split rules if instructor has recipient_id
    if (instrutorData.pagarme_recipient_id) {
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
      logStep("Split rules added", { 
        platform: platformFeeCents, 
        instructor: instructorAmountCents 
      });
    }

    // If no customer, add customer data to the order
    if (!customerId) {
      // Get profile for customer data
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, phone, cpf")
        .eq("id", user.id)
        .single();

      orderPayload.customer = {
        email: user.email,
        name: profile?.full_name || "Cliente CNH360",
        type: "individual",
        document: profile?.cpf || undefined,
        phones: profile?.phone ? {
          mobile_phone: {
            country_code: "55",
            area_code: profile.phone.substring(0, 2),
            number: profile.phone.substring(2).replace(/\D/g, ""),
          },
        } : undefined,
      };
    }

    logStep("Creating order in Pagar.me", { code: orderPayload.code });

    const orderResponse = await fetch("https://api.pagar.me/core/v5/orders", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${btoa(pagarmeApiKey + ":")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderPayload),
    });

    if (!orderResponse.ok) {
      const errorData = await orderResponse.json();
      logStep("Pagar.me order error", errorData);
      throw new Error(errorData.message || "Erro ao criar pedido no Pagar.me");
    }

    const orderData = await orderResponse.json();
    logStep("Order created", { orderId: orderData.id, status: orderData.status });

    // Get checkout URL from the order
    const checkoutUrl = orderData.checkouts?.[0]?.payment_url;
    const transactionId = orderData.id;

    if (!checkoutUrl) {
      throw new Error("URL de checkout não gerada");
    }

    // Create lesson record in database
    const { data: aulaData, error: aulaError } = await supabase
      .from("aulas")
      .insert({
        aluno_id: alunoData.id,
        instrutor_id: instructorId,
        data_hora: scheduledDate,
        duracao_minutos: duration * 60,
        valor: amount,
        usa_carro_aluno: useOwnCar,
        ponto_encontro: meetingPoint,
        latitude_aluno: studentLat,
        longitude_aluno: studentLng,
        status: "pendente",
        transaction_id: transactionId,
      })
      .select()
      .single();

    if (aulaError) {
      logStep("Error creating lesson", aulaError);
      throw new Error("Erro ao criar aula no sistema");
    }

    logStep("Lesson created", { aulaId: aulaData.id });

    return new Response(
      JSON.stringify({
        success: true,
        checkoutUrl,
        transactionId,
        aulaId: aulaData.id,
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
