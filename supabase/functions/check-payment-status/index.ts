import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-PAYMENT-STATUS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // SECURITY: Validate JWT authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      logStep("Missing authorization header");
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
    if (authError || !user) {
      logStep("Invalid authentication token", { error: authError?.message });
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    logStep("User authenticated", { userId: user.id });

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get paymentIntentId from request body
    const { paymentIntentId } = await req.json();
    
    if (!paymentIntentId) {
      throw new Error("paymentIntentId is required");
    }
    logStep("Payment intent ID received", { paymentIntentId });

    const stripe = new Stripe(stripeKey, { apiVersion: "2024-12-18.acacia" });

    // Retrieve the PaymentIntent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    logStep("PaymentIntent retrieved", { 
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency
    });

    // SECURITY: Verify that the requesting user owns this payment
    const paymentUserId = paymentIntent.metadata?.user_id;
    if (paymentUserId && paymentUserId !== user.id) {
      logStep("User not authorized to view this payment", { 
        paymentUserId, 
        requestingUserId: user.id 
      });
      return new Response(
        JSON.stringify({ error: 'Forbidden: You do not have access to this payment' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Also check via aula_id if user_id is not in metadata
    if (!paymentUserId && paymentIntent.metadata?.aula_id) {
      const aulaId = paymentIntent.metadata.aula_id;
      
      // Verify user is a participant in this lesson
      const { data: aula } = await supabaseClient
        .from("aulas")
        .select(`
          aluno_id,
          instrutor_id,
          alunos(user_id),
          instrutores(user_id)
        `)
        .eq("id", aulaId)
        .single();

      if (aula) {
        const alunoData = aula.alunos as unknown as { user_id: string } | null;
        const instrutorData = aula.instrutores as unknown as { user_id: string } | null;
        const isStudent = alunoData?.user_id === user.id;
        const isInstructor = instrutorData?.user_id === user.id;
        
        if (!isStudent && !isInstructor) {
          logStep("User not a participant of this lesson", { aulaId, userId: user.id });
          return new Response(
            JSON.stringify({ error: 'Forbidden: You are not a participant in this lesson' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    }

    // Map Stripe status to simplified status
    let simplifiedStatus: 'pending' | 'processing' | 'succeeded' | 'failed' | 'canceled';
    
    switch (paymentIntent.status) {
      case 'succeeded':
        simplifiedStatus = 'succeeded';
        break;
      case 'processing':
        simplifiedStatus = 'processing';
        break;
      case 'requires_payment_method':
      case 'requires_confirmation':
      case 'requires_action':
      case 'requires_capture':
        simplifiedStatus = 'pending';
        break;
      case 'canceled':
        simplifiedStatus = 'canceled';
        break;
      default:
        simplifiedStatus = 'failed';
    }

    // If payment succeeded, update the aula status
    if (simplifiedStatus === 'succeeded' && paymentIntent.metadata.aula_id) {
      const aulaId = paymentIntent.metadata.aula_id;
      logStep("Payment succeeded, updating aula status", { aulaId });

      const { error: updateError } = await supabaseClient
        .from("aulas")
        .update({ status: "confirmada" })
        .eq("id", aulaId)
        .eq("status", "pendente"); // Only update if still pending

      if (updateError) {
        logStep("Error updating aula status", { error: updateError });
      } else {
        logStep("Aula status updated to confirmada");
      }

      // Create payment record if it doesn't exist
      const { data: existingPayment } = await supabaseClient
        .from("pagamentos")
        .select("id")
        .eq("external_id", paymentIntentId)
        .maybeSingle();

      if (!existingPayment) {
        // Get aula details
        const { data: aulaData } = await supabaseClient
          .from("aulas")
          .select("aluno_id, instrutor_id")
          .eq("id", aulaId)
          .single();

        if (aulaData) {
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
              metodo: 'pix',
              status: 'aprovado',
              external_id: paymentIntentId,
              pago_em: new Date().toISOString(),
            });

          if (pagamentoError) {
            logStep("Error creating payment record", { error: pagamentoError });
          } else {
            logStep("Payment record created");
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        status: simplifiedStatus,
        stripeStatus: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
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
