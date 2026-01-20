import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  console.log(`[cancel-payment-pagarme] ${step}`, details ? JSON.stringify(details) : "");
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
    logStep("User authenticated", { userId: user.id });

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { aulaId, reason } = await req.json();
    logStep("Cancel request", { aulaId, reason });

    // Get lesson data
    const { data: aulaData, error: aulaError } = await supabase
      .from("aulas")
      .select(`
        *,
        instrutores!inner(user_id),
        alunos!inner(user_id)
      `)
      .eq("id", aulaId)
      .single();

    if (aulaError || !aulaData) {
      throw new Error("Aula não encontrada");
    }

    // Verify the user is either the instructor or student
    const isInstructor = aulaData.instrutores.user_id === user.id;
    const isStudent = aulaData.alunos.user_id === user.id;
    
    if (!isInstructor && !isStudent) {
      throw new Error("Você não tem permissão para cancelar este pagamento");
    }

    const transactionId = aulaData.transaction_id;

    // If no transaction_id, nothing to cancel
    if (!transactionId) {
      logStep("No transaction_id, nothing to cancel");
      return new Response(
        JSON.stringify({ success: true, message: "Nenhum pagamento para cancelar" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get order from Pagar.me
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
      logStep("Error fetching order, may already be canceled");
      return new Response(
        JSON.stringify({ success: true, message: "Pedido não encontrado ou já cancelado" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const orderData = await orderResponse.json();
    logStep("Order fetched", { status: orderData.status });

    // Handle based on order status
    const chargeId = orderData.charges?.[0]?.id;
    const chargeStatus = orderData.charges?.[0]?.status;

    if (!chargeId) {
      logStep("No charge found, nothing to cancel");
      return new Response(
        JSON.stringify({ success: true, message: "Nenhuma cobrança para cancelar" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If charge is pre-authorized, cancel it
    if (chargeStatus === "pending" || chargeStatus === "pre_authorized") {
      const cancelResponse = await fetch(
        `https://api.pagar.me/core/v5/charges/${chargeId}`,
        {
          method: "DELETE",
          headers: {
            "Authorization": `Basic ${btoa(pagarmeApiKey + ":")}`,
          },
        }
      );

      if (!cancelResponse.ok) {
        const errorData = await cancelResponse.json();
        logStep("Cancel error", errorData);
        // Continue anyway, the charge might already be canceled
      } else {
        logStep("Charge canceled", { chargeId });
      }
    }
    // If charge is paid, refund it
    else if (chargeStatus === "paid") {
      const refundResponse = await fetch(
        `https://api.pagar.me/core/v5/charges/${chargeId}/refund`,
        {
          method: "POST",
          headers: {
            "Authorization": `Basic ${btoa(pagarmeApiKey + ":")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code: `refund-${aulaId}-${Date.now()}`,
          }),
        }
      );

      if (!refundResponse.ok) {
        const errorData = await refundResponse.json();
        logStep("Refund error", errorData);
        throw new Error(errorData.message || "Erro ao estornar pagamento");
      }

      logStep("Charge refunded", { chargeId });

      // Update payment status in database
      await supabase
        .from("pagamentos")
        .update({ status: "estornado" })
        .eq("external_id", transactionId);
    }

    return new Response(
      JSON.stringify({
        success: true,
        chargeId,
        action: chargeStatus === "paid" ? "refunded" : "canceled",
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
