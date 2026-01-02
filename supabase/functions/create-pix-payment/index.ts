import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-PIX-PAYMENT] ${step}${detailsStr}`);
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

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // Get authenticated user - try with auth header first
    const authHeader = req.headers.get("Authorization");
    let user = null;
    let userEmail = null;
    let userId = null;

    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      
      // Create a client with the user's token to verify
      const userClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: `Bearer ${token}` } }
      });
      
      const { data: userData, error: userError } = await userClient.auth.getUser();
      
      if (!userError && userData?.user) {
        user = userData.user;
        userEmail = user.email;
        userId = user.id;
        logStep("User authenticated", { userId: user.id, email: user.email });
      } else {
        logStep("Auth header present but invalid", { error: userError?.message });
      }
    }

    // If no valid auth, try to get user info from request body
    if (!userId) {
      logStep("No valid auth, will use data from request body");
    }

    // Get payment details from request
    const { 
      amount, 
      duration, 
      instructorName, 
      instructorId,
      aulaId,
      userEmail: bodyUserEmail,
    } = await req.json();

    if (!amount || !instructorName || !aulaId) {
      throw new Error("Amount, instructorName and aulaId are required");
    }
    logStep("Payment details received", { amount, duration, instructorName, aulaId });

    // Get user email from the aula if not authenticated
    let finalUserEmail = userEmail;
    let finalUserId = userId;
    
    if (!finalUserEmail) {
      // Try to get user info from the aula record
      const { data: aulaData, error: aulaError } = await supabaseClient
        .from("aulas")
        .select("aluno_id")
        .eq("id", aulaId)
        .maybeSingle();
      
      if (aulaData?.aluno_id) {
        const { data: alunoData } = await supabaseClient
          .from("alunos")
          .select("user_id")
          .eq("id", aulaData.aluno_id)
          .maybeSingle();
        
        if (alunoData?.user_id) {
          finalUserId = alunoData.user_id;
          
          // Get email from auth.users via profiles or direct
          const { data: profileData } = await supabaseClient
            .from("profiles")
            .select("id")
            .eq("id", alunoData.user_id)
            .maybeSingle();
          
          if (profileData) {
            // Use a generic email based on user ID for Stripe
            finalUserEmail = `user_${alunoData.user_id}@cnh360.app`;
          }
        }
      }
      
      // Fallback to body email or generate one
      if (!finalUserEmail) {
        finalUserEmail = bodyUserEmail || `aula_${aulaId}@cnh360.app`;
      }
      
      logStep("User info from aula", { finalUserId, finalUserEmail });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2024-12-18.acacia" });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: finalUserEmail, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    } else {
      const customer = await stripe.customers.create({
        email: finalUserEmail,
        metadata: { user_id: finalUserId || aulaId }
      });
      customerId = customer.id;
      logStep("New customer created", { customerId });
    }

    // Calculate amounts with 5% PIX discount
    const originalAmountInCents = Math.round(amount * 100);
    const discountedAmountInCents = Math.round(originalAmountInCents * 0.95); // 5% discount
    const taxaPlataforma = Math.round(discountedAmountInCents * 0.20); // 20% platform fee
    const valorInstrutor = discountedAmountInCents - taxaPlataforma;

    logStep("Amount calculated with PIX discount", { 
      originalAmountInCents, 
      discountedAmountInCents, 
      discountPercentage: 5,
      taxaPlataforma, 
      valorInstrutor 
    });

    // Create PaymentIntent with PIX as payment method
    // PIX payments are immediate (no manual capture option)
    let paymentIntent;
    try {
      paymentIntent = await stripe.paymentIntents.create({
        amount: discountedAmountInCents,
        currency: 'brl',
        customer: customerId,
        payment_method_types: ['pix'],
        metadata: {
          user_id: finalUserId || '',
          instrutor_id: instructorId || '',
          aula_id: aulaId,
          valor_instrutor: valorInstrutor.toString(),
          taxa_plataforma: taxaPlataforma.toString(),
          payment_method: 'pix',
          instructor_name: instructorName,
          duration_minutes: duration?.toString() || '',
          original_amount: originalAmountInCents.toString(),
          discount_applied: '5',
        },
        description: `Aula de Direção - ${duration || 60}min com ${instructorName} (PIX)`,
      });
    } catch (stripeError: any) {
      logStep("Stripe PaymentIntent creation failed", { 
        error: stripeError.message,
        code: stripeError.code,
        type: stripeError.type
      });
      
      // Check if PIX is not enabled
      if (stripeError.message?.includes("pix") || stripeError.code === "payment_method_not_available") {
        throw new Error("PIX payment method is not enabled. Please contact support.");
      }
      throw stripeError;
    }

    logStep("PIX PaymentIntent created", { 
      paymentIntentId: paymentIntent.id, 
      status: paymentIntent.status,
    });

    // Update the aula with the payment_intent_id
    const { error: updateError } = await supabaseClient
      .from("aulas")
      .update({ payment_intent_id: paymentIntent.id })
      .eq("id", aulaId);

    if (updateError) {
      logStep("Error updating aula with payment_intent_id", { error: updateError });
    } else {
      logStep("Aula updated with payment_intent_id");
    }

    // Get the PIX QR code data from the PaymentIntent
    // We need to confirm the payment intent first to generate the PIX code
    let confirmedPaymentIntent;
    try {
      confirmedPaymentIntent = await stripe.paymentIntents.confirm(paymentIntent.id, {
        payment_method_data: {
          type: 'pix',
        },
        return_url: `${req.headers.get("origin") || "https://cnh360.com"}/aluno/aula-solicitada/${aulaId}`,
      });
    } catch (confirmError: any) {
      logStep("Error confirming PaymentIntent for PIX", { 
        error: confirmError.message,
        code: confirmError.code 
      });
      
      // Cancel the payment intent if confirmation fails
      try {
        await stripe.paymentIntents.cancel(paymentIntent.id);
      } catch (cancelError) {
        logStep("Failed to cancel PaymentIntent", { error: cancelError });
      }
      
      throw new Error("Não foi possível gerar o código PIX. Tente novamente.");
    }

    logStep("PaymentIntent confirmed for PIX", { 
      status: confirmedPaymentIntent.status,
      nextAction: confirmedPaymentIntent.next_action?.type
    });

    // Extract PIX data
    const pixAction = confirmedPaymentIntent.next_action?.pix_display_qr_code;
    
    if (!pixAction) {
      logStep("No PIX QR Code data in response", { 
        nextAction: confirmedPaymentIntent.next_action 
      });
      throw new Error("Não foi possível gerar o QR Code PIX. Verifique se o PIX está habilitado na conta.");
    }

    logStep("PIX QR Code generated successfully");

    return new Response(
      JSON.stringify({ 
        paymentIntentId: paymentIntent.id,
        clientSecret: confirmedPaymentIntent.client_secret,
        amount: discountedAmountInCents,
        originalAmount: originalAmountInCents,
        discount: originalAmountInCents - discountedAmountInCents,
        pix: {
          qrCode: pixAction.data, // Base64 QR Code image or raw data
          expiresAt: pixAction.expires_at,
          hostedInstructionsUrl: pixAction.hosted_instructions_url,
          imageUrlPng: pixAction.image_url_png,
          imageUrlSvg: pixAction.image_url_svg,
        }
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    
    // Return user-friendly error messages
    let friendlyMessage = errorMessage;
    if (errorMessage.includes("STRIPE_SECRET_KEY")) {
      friendlyMessage = "Sistema de pagamento temporariamente indisponível.";
    } else if (errorMessage.includes("not enabled") || errorMessage.includes("pix")) {
      friendlyMessage = "O pagamento via PIX não está disponível no momento.";
    }
    
    return new Response(
      JSON.stringify({ error: friendlyMessage }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
