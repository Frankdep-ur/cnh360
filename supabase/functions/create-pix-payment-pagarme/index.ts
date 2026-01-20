import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  console.log(`[create-pix-payment-pagarme] ${step}`, details ? JSON.stringify(details) : "");
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
      amount,
      duration,
      instructorId,
      aulaId,
      useOwnCar,
      meetingPoint,
      scheduledDate,
      studentLat,
      studentLng,
    } = await req.json();

    // Apply 5% PIX discount
    const discountedAmount = amount * 0.95;
    const amountCents = Math.round(discountedAmount * 100);
    
    logStep("PIX payment request", { 
      originalAmount: amount, 
      discountedAmount, 
      amountCents,
      instructorId 
    });

    // Get aluno_id
    const { data: alunoData, error: alunoError } = await supabase
      .from("alunos")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (alunoError || !alunoData) {
      throw new Error("Aluno não encontrado");
    }

    // Get instructor's recipient_id
    const { data: instrutorData } = await supabase
      .from("instrutores")
      .select("pagarme_recipient_id")
      .eq("id", instructorId)
      .single();

    // Calculate split (50/50 for test)
    const platformFeeCents = Math.round(amountCents * 0.50);
    const instructorAmountCents = amountCents - platformFeeCents;

    // Get customer profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, phone, cpf")
      .eq("id", user.id)
      .single();

    // Create PIX order in Pagar.me
    const orderPayload: any = {
      code: `pix-${Date.now()}`,
      customer: {
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
      },
      items: [
        {
          amount: amountCents,
          description: `Aula de Direção - ${duration}h (PIX)`,
          quantity: 1,
        },
      ],
      payments: [
        {
          payment_method: "pix",
          pix: {
            expires_in: 3600, // 1 hour
          },
        },
      ],
      metadata: {
        user_id: user.id,
        instrutor_id: instructorId,
        duration: String(duration),
        payment_type: "pix",
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

    logStep("Creating PIX order", orderPayload);

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
      logStep("Pagar.me PIX error", errorData);
      throw new Error(errorData.message || "Erro ao criar PIX no Pagar.me");
    }

    const orderData = await orderResponse.json();
    logStep("PIX order created", { orderId: orderData.id, status: orderData.status });

    // Extract PIX data from response
    const pixCharge = orderData.charges?.[0];
    const pixTransaction = pixCharge?.last_transaction;
    
    if (!pixTransaction) {
      throw new Error("Dados do PIX não encontrados na resposta");
    }

    const qrCode = pixTransaction.qr_code;
    const qrCodeUrl = pixTransaction.qr_code_url;
    const expiresAt = pixTransaction.expires_at;
    const transactionId = orderData.id;

    // Create or update lesson record
    let lessonId = aulaId;
    
    if (!aulaId) {
      // Create new lesson
      const { data: newAula, error: aulaError } = await supabase
        .from("aulas")
        .insert({
          aluno_id: alunoData.id,
          instrutor_id: instructorId,
          data_hora: scheduledDate,
          duracao_minutos: duration * 60,
          valor: discountedAmount,
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
        throw new Error("Erro ao criar aula");
      }
      lessonId = newAula.id;
    } else {
      // Update existing lesson with transaction_id
      await supabase
        .from("aulas")
        .update({ transaction_id: transactionId })
        .eq("id", aulaId);
    }

    logStep("Lesson updated with PIX", { lessonId, transactionId });

    return new Response(
      JSON.stringify({
        success: true,
        transactionId,
        aulaId: lessonId,
        qrCode,
        qrCodeUrl,
        expiresAt,
        amount: discountedAmount,
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
