import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CANCEL-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    // Get aula_id and reason from request
    const { aulaId, reason } = await req.json();
    if (!aulaId) throw new Error("aulaId is required");
    logStep("Request received", { aulaId, reason });

    // Get the aula to find the payment_intent_id
    const { data: aulaData, error: aulaError } = await supabaseClient
      .from("aulas")
      .select("payment_intent_id, valor, instrutor_id, aluno_id, status")
      .eq("id", aulaId)
      .single();

    if (aulaError) {
      logStep("Error fetching aula", { error: aulaError });
      throw new Error("Aula não encontrada");
    }

    if (!aulaData.payment_intent_id) {
      logStep("No payment_intent_id found for aula");
      // Aula without payment - just return success
      return new Response(
        JSON.stringify({ success: true, message: "Aula without payment - no cancellation needed" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Verify the user is either the instructor or the student for this aula
    const { data: instrutorData } = await supabaseClient
      .from("instrutores")
      .select("id")
      .eq("user_id", user.id)
      .single();

    const { data: alunoData } = await supabaseClient
      .from("alunos")
      .select("id")
      .eq("user_id", user.id)
      .single();

    const isInstructor = instrutorData?.id === aulaData.instrutor_id;
    const isStudent = alunoData?.id === aulaData.aluno_id;

    if (!isInstructor && !isStudent) {
      throw new Error("Usuário não autorizado a cancelar este pagamento");
    }

    logStep("Payment intent found", { 
      paymentIntentId: aulaData.payment_intent_id,
      isInstructor,
      isStudent
    });

    const stripe = new Stripe(stripeKey, { apiVersion: "2024-12-18.acacia" });

    // Get the PaymentIntent to check its status
    const paymentIntent = await stripe.paymentIntents.retrieve(aulaData.payment_intent_id);
    logStep("PaymentIntent retrieved", { 
      status: paymentIntent.status,
      captureMethod: paymentIntent.capture_method
    });

    let result;

    if (paymentIntent.status === 'requires_capture') {
      // Payment was authorized but not captured - cancel the authorization
      result = await stripe.paymentIntents.cancel(aulaData.payment_intent_id, {
        cancellation_reason: 'requested_by_customer'
      });
      logStep("PaymentIntent cancelled (authorization released)", { 
        paymentIntentId: result.id, 
        status: result.status 
      });
    } else if (paymentIntent.status === 'succeeded') {
      // Payment was already captured - need to refund
      const refund = await stripe.refunds.create({
        payment_intent: aulaData.payment_intent_id,
        reason: 'requested_by_customer'
      });
      logStep("Refund created", { 
        refundId: refund.id, 
        status: refund.status,
        amount: refund.amount / 100
      });

      // Update payment record
      await supabaseClient
        .from("pagamentos")
        .update({ status: 'estornado' })
        .eq("external_id", aulaData.payment_intent_id);

      result = { id: refund.id, status: 'refunded', refund_status: refund.status };
    } else if (paymentIntent.status === 'canceled') {
      // Already cancelled
      logStep("PaymentIntent already cancelled");
      result = paymentIntent;
    } else {
      // Payment is in another state (processing, requires_action, etc.)
      // Try to cancel anyway
      result = await stripe.paymentIntents.cancel(aulaData.payment_intent_id, {
        cancellation_reason: 'requested_by_customer'
      });
      logStep("PaymentIntent cancelled", { 
        paymentIntentId: result.id, 
        status: result.status 
      });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        paymentIntentId: aulaData.payment_intent_id,
        status: result.status,
        message: paymentIntent.status === 'succeeded' 
          ? 'Pagamento reembolsado com sucesso' 
          : 'Autorização cancelada - o valor será liberado no cartão'
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
