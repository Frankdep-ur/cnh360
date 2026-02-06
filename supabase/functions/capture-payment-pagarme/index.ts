import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  console.log(`[capture-payment-pagarme] ${step}`, details ? JSON.stringify(details) : "");
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const pagarmeApiKey = Deno.env.get("PAGARME_API_KEY");
    if (!pagarmeApiKey) {
      throw new Error("PAGARME_API_KEY não configurada");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Check for authentication - support both user JWT and internal calls
    const authHeader = req.headers.get("Authorization");
    let isInternalCall = false;
    let userId: string | null = null;

    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      
      // Try to authenticate as user
      const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);
      const { data: userData, error: userError } = await supabaseAuth.auth.getUser(token);
      
      if (!userError && userData.user) {
        userId = userData.user.id;
        logStep("User authenticated", { userId });
      } else {
        // Invalid user token but has auth header - treat as internal call
        isInternalCall = true;
        logStep("Internal call detected (invalid user token)");
      }
    } else {
      // No auth header = internal call from another Edge Function
      isInternalCall = true;
      logStep("Internal call detected (no auth header)");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { aulaId } = await req.json();
    logStep("Capture request", { aulaId, isInternalCall });

    if (!aulaId) {
      throw new Error("aulaId é obrigatório");
    }

    // Get lesson data
    const { data: aulaData, error: aulaError } = await supabase
      .from("aulas")
      .select("*, instrutores!inner(user_id)")
      .eq("id", aulaId)
      .single();

    if (aulaError || !aulaData) {
      logStep("Lesson not found", { aulaId, error: aulaError });
      throw new Error("Aula não encontrada");
    }

    // Authorization check: if not internal call, verify the user is the instructor
    if (!isInternalCall) {
      if (userId !== aulaData.instrutores.user_id) {
        logStep("Unauthorized", { userId, instructorUserId: aulaData.instrutores.user_id });
        throw new Error("Apenas o instrutor pode capturar o pagamento");
      }
    }

    const transactionId = aulaData.transaction_id;

    // If no transaction_id, create payment record directly if missing
    if (!transactionId) {
      logStep("No transaction_id — checking for existing payment record");

      const { data: existingPayment } = await supabase
        .from("pagamentos")
        .select("id")
        .eq("aula_id", aulaId)
        .single();

      if (existingPayment) {
        logStep("Payment record already exists", { paymentId: existingPayment.id });
        return new Response(
          JSON.stringify({ success: true, message: "Pagamento já registrado" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // No payment record exists — create one with correct split
      const { data: instrutorData } = await supabase
        .from("instrutores")
        .select("kyc_status")
        .eq("id", aulaData.instrutor_id)
        .single();

      const kycApproved = instrutorData?.kyc_status === "approved";
      const valorBruto = Number(aulaData.valor);
      const taxaPlataforma = kycApproved ? valorBruto * 0.50 : valorBruto;
      const valorInstrutor = kycApproved ? valorBruto * 0.50 : 0;

      const { error: pagamentoError } = await supabase
        .from("pagamentos")
        .insert({
          aula_id: aulaId,
          aluno_id: aulaData.aluno_id,
          instrutor_id: aulaData.instrutor_id,
          valor_bruto: valorBruto,
          taxa_plataforma: taxaPlataforma,
          valor_instrutor: valorInstrutor,
          metodo: "pix",
          status: "aprovado",
          pago_em: new Date().toISOString(),
        });

      if (pagamentoError) {
        logStep("Error creating payment record", pagamentoError);
        throw new Error("Erro ao registrar pagamento");
      }

      logStep("Direct payment record created", {
        valorBruto, taxaPlataforma, valorInstrutor, kycStatus: instrutorData?.kyc_status
      });

      return new Response(
        JSON.stringify({
          success: true,
          message: "Pagamento registrado",
          amount: valorBruto,
          platformFee: taxaPlataforma,
          instructorAmount: valorInstrutor,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get order from Pagar.me to find charge_id
    const orderResponse = await fetch(
      `https://api.pagar.me/core/v5/orders/${transactionId}`,
      {
        method: "GET",
        headers: {
          "Authorization": `Basic ${btoa(pagarmeApiKey + ":")}`,
        },
      }
    );

    if (!orderResponse.ok) {
      const errorText = await orderResponse.text();
      logStep("Failed to fetch order from Pagar.me", { transactionId, error: errorText });
      throw new Error("Erro ao buscar pedido no Pagar.me");
    }

    const orderData = await orderResponse.json();
    logStep("Order fetched", { status: orderData.status, transactionId });

    // Check if already captured/paid
    if (orderData.status === "paid") {
      logStep("Order already paid, recording in database");
      
      // Record payment if not already recorded
      const { data: existingPayment } = await supabase
        .from("pagamentos")
        .select("id")
        .eq("aula_id", aulaId)
        .single();

      if (!existingPayment) {
        const valorBruto = Number(aulaData.valor);
        const taxaPlataforma = valorBruto * 0.50; // 50% split
        const valorInstrutor = valorBruto - taxaPlataforma;

        await supabase.from("pagamentos").insert({
          aula_id: aulaId,
          aluno_id: aulaData.aluno_id,
          instrutor_id: aulaData.instrutor_id,
          valor_bruto: valorBruto,
          taxa_plataforma: taxaPlataforma,
          valor_instrutor: valorInstrutor,
          metodo: "cartao_credito",
          status: "aprovado",
          external_id: transactionId,
          pago_em: new Date().toISOString(),
        });
        logStep("Payment recorded for already-paid order");
      }

      return new Response(
        JSON.stringify({ success: true, message: "Pagamento já capturado" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if order is canceled
    if (orderData.status === "canceled" || orderData.status === "failed") {
      logStep("Order is canceled/failed", { status: orderData.status });
      throw new Error(`Pedido ${orderData.status} - não é possível capturar`);
    }

    // Get charge_id for capture
    const chargeId = orderData.charges?.[0]?.id;
    if (!chargeId) {
      logStep("No charge found", { orderData });
      throw new Error("Charge não encontrado no pedido");
    }

    // Capture the charge
    logStep("Capturing charge", { chargeId });
    const captureResponse = await fetch(
      `https://api.pagar.me/core/v5/charges/${chargeId}/capture`,
      {
        method: "POST",
        headers: {
          "Authorization": `Basic ${btoa(pagarmeApiKey + ":")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: `capture-${aulaId}`,
        }),
      }
    );

    if (!captureResponse.ok) {
      const errorData = await captureResponse.json();
      logStep("Capture error", errorData);
      throw new Error(errorData.message || "Erro ao capturar pagamento");
    }

    const captureData = await captureResponse.json();
    logStep("Payment captured successfully", { chargeId, status: captureData.status });

    // Calculate amounts for payment record
    const valorBruto = Number(aulaData.valor);
    const taxaPlataforma = valorBruto * 0.50; // 50% split
    const valorInstrutor = valorBruto - taxaPlataforma;

    // Record payment in database
    const { error: pagamentoError } = await supabase
      .from("pagamentos")
      .insert({
        aula_id: aulaId,
        aluno_id: aulaData.aluno_id,
        instrutor_id: aulaData.instrutor_id,
        valor_bruto: valorBruto,
        taxa_plataforma: taxaPlataforma,
        valor_instrutor: valorInstrutor,
        metodo: "cartao_credito",
        status: "aprovado",
        external_id: transactionId,
        pago_em: new Date().toISOString(),
      });

    if (pagamentoError) {
      logStep("Error recording payment", pagamentoError);
      // Don't throw - payment was captured, just log the error
    } else {
      logStep("Payment recorded in database");
    }

    return new Response(
      JSON.stringify({
        success: true,
        chargeId,
        amount: valorBruto,
        platformFee: taxaPlataforma,
        instructorAmount: valorInstrutor,
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
