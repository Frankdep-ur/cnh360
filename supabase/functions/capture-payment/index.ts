import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CAPTURE-PAYMENT] ${step}${detailsStr}`);
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

    // Get aula_id from request
    const { aulaId } = await req.json();
    if (!aulaId) throw new Error("aulaId is required");
    logStep("Aula ID received", { aulaId });

    // Get the aula to find the payment_intent_id
    const { data: aulaData, error: aulaError } = await supabaseClient
      .from("aulas")
      .select("payment_intent_id, valor, instrutor_id, aluno_id")
      .eq("id", aulaId)
      .single();

    if (aulaError) {
      logStep("Error fetching aula", { error: aulaError });
      throw new Error("Aula não encontrada");
    }

    if (!aulaData.payment_intent_id) {
      logStep("No payment_intent_id found for aula");
      // Aula without payment (wallet balance) - just return success
      return new Response(
        JSON.stringify({ success: true, message: "Aula without payment - no capture needed" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Verify the user is the instructor for this aula
    const { data: instrutorData } = await supabaseClient
      .from("instrutores")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!instrutorData || instrutorData.id !== aulaData.instrutor_id) {
      throw new Error("Usuário não autorizado a capturar este pagamento");
    }

    logStep("Payment intent found", { paymentIntentId: aulaData.payment_intent_id });

    const stripe = new Stripe(stripeKey, { apiVersion: "2024-12-18.acacia" });

    // Capture the PaymentIntent
    const paymentIntent = await stripe.paymentIntents.capture(aulaData.payment_intent_id);
    logStep("PaymentIntent captured", { 
      paymentIntentId: paymentIntent.id, 
      status: paymentIntent.status,
      amountCaptured: paymentIntent.amount_received
    });

    // Get aluno_id to create payment record
    const { data: alunoData } = await supabaseClient
      .from("alunos")
      .select("id")
      .eq("id", aulaData.aluno_id)
      .single();

    // Create payment record
    const valorBruto = paymentIntent.amount / 100;
    const taxaPlataforma = valorBruto * 0.20;
    const valorInstrutor = valorBruto - taxaPlataforma;

    const { error: pagamentoError } = await supabaseClient
      .from("pagamentos")
      .insert({
        aluno_id: aulaData.aluno_id,
        aula_id: aulaId,
        instrutor_id: aulaData.instrutor_id,
        valor_bruto: valorBruto,
        taxa_plataforma: taxaPlataforma,
        valor_instrutor: valorInstrutor,
        metodo: paymentIntent.metadata.payment_method === 'pix' ? 'pix' : 'cartao_credito',
        status: 'aprovado',
        external_id: paymentIntent.id,
        pago_em: new Date().toISOString(),
      });

    if (pagamentoError) {
      logStep("Error creating payment record", { error: pagamentoError });
      // Don't throw - payment was captured, just log the error
    } else {
      logStep("Payment record created");
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
        amountCaptured: paymentIntent.amount_received / 100
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
