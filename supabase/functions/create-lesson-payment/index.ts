import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-LESSON-PAYMENT] ${step}${detailsStr}`);
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
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Get payment details from request
    const { 
      amount, 
      duration, 
      instructorName, 
      instructorId,
      paymentMethod,
      // New fields for creating the lesson
      scheduledDate,
      meetingPoint,
      useOwnCar,
      studentLat,
      studentLng,
    } = await req.json();

    if (!amount || !instructorName || !instructorId) {
      throw new Error("Amount, instructorName and instructorId are required");
    }
    
    if (!scheduledDate || !meetingPoint) {
      throw new Error("scheduledDate and meetingPoint are required");
    }
    
    logStep("Payment details received", { amount, duration, instructorName, instructorId, paymentMethod });

    // Get the aluno_id for this user
    const { data: alunoData, error: alunoError } = await supabaseClient
      .from("alunos")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (alunoError || !alunoData) {
      throw new Error("Aluno não encontrado. Complete seu cadastro primeiro.");
    }
    logStep("Aluno found", { alunoId: alunoData.id });

    const stripe = new Stripe(stripeKey, { apiVersion: "2024-12-18.acacia" });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { user_id: user.id }
      });
      customerId = customer.id;
      logStep("New customer created", { customerId });
    }

    // Calculate amounts
    const amountInCents = Math.round(amount * 100);
    const taxaPlataforma = Math.round(amount * 0.20 * 100); // 20% platform fee
    const valorInstrutor = amountInCents - taxaPlataforma;

    // Apply PIX discount if selected
    const finalAmount = paymentMethod === 'pix' 
      ? Math.round(amountInCents * 0.95) // 5% discount
      : amountInCents;

    logStep("Amount calculated", { amountInCents, finalAmount, taxaPlataforma, valorInstrutor });

    // Create PaymentIntent with manual capture (authorization only)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: finalAmount,
      currency: 'brl',
      customer: customerId,
      capture_method: 'manual', // IMPORTANT: Only authorize, don't capture
      payment_method_types: ['card'],
      metadata: {
        user_id: user.id,
        instrutor_id: instructorId,
        valor_instrutor: valorInstrutor.toString(),
        taxa_plataforma: taxaPlataforma.toString(),
        payment_method: paymentMethod,
        instructor_name: instructorName,
        duration_minutes: duration?.toString() || '',
      },
      description: `Aula de Direção - ${duration || 60}min com ${instructorName}`,
    });

    logStep("PaymentIntent created with manual capture", { 
      paymentIntentId: paymentIntent.id, 
      status: paymentIntent.status,
      captureMethod: paymentIntent.capture_method
    });

    // Create the lesson with the payment_intent_id ATOMICALLY
    const { data: aulaData, error: aulaError } = await supabaseClient
      .from("aulas")
      .insert({
        aluno_id: alunoData.id,
        instrutor_id: instructorId,
        data_hora: scheduledDate,
        duracao_minutos: duration || 60,
        ponto_encontro: meetingPoint,
        valor: amount,
        usa_carro_aluno: useOwnCar || false,
        status: "pendente",
        latitude_aluno: studentLat || null,
        longitude_aluno: studentLng || null,
        payment_intent_id: paymentIntent.id, // ALWAYS set with the payment intent
      })
      .select()
      .single();

    if (aulaError) {
      logStep("Error creating aula", { error: aulaError });
      // Cancel the payment intent if we can't create the lesson
      await stripe.paymentIntents.cancel(paymentIntent.id);
      throw new Error(`Erro ao criar aula: ${aulaError.message}`);
    }

    logStep("Aula created with payment_intent_id", { aulaId: aulaData.id, paymentIntentId: paymentIntent.id });

    // Update PaymentIntent metadata with aula_id
    await stripe.paymentIntents.update(paymentIntent.id, {
      metadata: {
        ...paymentIntent.metadata,
        aula_id: aulaData.id,
      }
    });

    return new Response(
      JSON.stringify({ 
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        aulaId: aulaData.id,
        amount: finalAmount,
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
    } else if (errorMessage.includes("Authentication")) {
      friendlyMessage = "Faça login para continuar com o pagamento.";
    } else if (errorMessage.includes("Aluno não encontrado")) {
      friendlyMessage = "Complete seu cadastro de aluno antes de agendar uma aula.";
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
