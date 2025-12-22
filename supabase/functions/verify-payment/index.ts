import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { sessionId } = await req.json();
    if (!sessionId) throw new Error("Session ID is required");

    logStep("Verifying session", { sessionId });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent'],
    });

    logStep("Session retrieved", { 
      status: session.payment_status,
      paymentIntent: session.payment_intent 
    });

    if (session.payment_status === 'paid') {
      const metadata = session.metadata || {};
      
      // Update aula status if aula_id exists
      if (metadata.aula_id) {
        const { error: aulaError } = await supabaseClient
          .from('aulas')
          .update({ status: 'confirmada' })
          .eq('id', metadata.aula_id);

        if (aulaError) {
          logStep("Error updating aula", { error: aulaError.message });
        } else {
          logStep("Aula updated to confirmada", { aulaId: metadata.aula_id });
        }
      }

      // Insert payment record
      const { error: paymentError } = await supabaseClient
        .from('pagamentos')
        .insert({
          aula_id: metadata.aula_id || null,
          aluno_id: metadata.user_id,
          instrutor_id: metadata.instrutor_id || null,
          valor_bruto: session.amount_total ? session.amount_total / 100 : 0,
          taxa_plataforma: metadata.taxa_plataforma ? parseInt(metadata.taxa_plataforma) / 100 : 0,
          valor_instrutor: metadata.valor_instrutor ? parseInt(metadata.valor_instrutor) / 100 : 0,
          metodo: metadata.payment_method === 'pix' ? 'pix' : 'cartao_credito',
          status: 'aprovado',
          external_id: typeof session.payment_intent === 'string' 
            ? session.payment_intent 
            : session.payment_intent?.id,
          pago_em: new Date().toISOString(),
        });

      if (paymentError) {
        logStep("Error inserting payment", { error: paymentError.message });
      } else {
        logStep("Payment record created");
      }

      return new Response(
        JSON.stringify({ 
          status: 'paid',
          amount: session.amount_total ? session.amount_total / 100 : 0,
          paymentMethod: metadata.payment_method,
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200 
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        status: session.payment_status,
        message: 'Payment not yet completed'
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
