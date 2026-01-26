import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  console.log(`[check-payment-status-pagarme] ${step}`, details ? JSON.stringify(details) : "");
};

// Validate user authentication
async function validateAuth(req: Request): Promise<{ userId: string } | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }
  
  const token = authHeader.replace("Bearer ", "");
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data, error } = await supabase.auth.getUser(token);
  
  if (error || !data.user) {
    return null;
  }
  
  return { userId: data.user.id };
}

// Map Pagar.me status to simplified status
function mapStatus(pagarmeStatus: string): string {
  const statusMap: Record<string, string> = {
    "pending": "pending",
    "processing": "processing",
    "pre_authorized": "authorized",
    "authorized": "authorized",
    "paid": "succeeded",
    "canceled": "canceled",
    "voided": "canceled",
    "refunded": "refunded",
    "failed": "failed",
    "expired": "failed",
    "waiting_payment": "pending",
    "waiting_capture": "authorized",
  };
  return statusMap[pagarmeStatus] || "pending";
}

// Function to send WhatsApp notification
async function sendWhatsAppNotification(
  supabase: any,
  aulaId: string
) {
  try {
    logStep("Fetching lesson data for WhatsApp", { aulaId });

    // Fetch lesson data
    const { data: aulaCompleta, error: aulaError } = await supabase
      .from("aulas")
      .select(`
        id, data_hora, duracao_minutos, ponto_encontro, valor,
        instrutor_id, aluno_id
      `)
      .eq("id", aulaId)
      .single();

    if (aulaError || !aulaCompleta) {
      logStep("Error fetching lesson", { error: aulaError });
      return;
    }

    // Fetch instructor data
    const { data: instrutor } = await supabase
      .from("instrutores")
      .select("user_id, cnh_categoria")
      .eq("id", aulaCompleta.instrutor_id)
      .single();

    if (!instrutor) {
      logStep("Instructor not found");
      return;
    }

    const { data: instrutorProfile } = await supabase
      .from("profiles")
      .select("full_name, phone")
      .eq("id", instrutor.user_id)
      .single();

    // Fetch student data
    const { data: aluno } = await supabase
      .from("alunos")
      .select("user_id")
      .eq("id", aulaCompleta.aluno_id)
      .single();

    const { data: alunoProfile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", aluno?.user_id)
      .single();

    // Send WhatsApp if instructor has phone registered
    if (instrutorProfile?.phone) {
      logStep("Sending WhatsApp notification", { 
        instrutorPhone: instrutorProfile.phone,
        alunoNome: alunoProfile?.full_name 
      });

      const whatsappPayload = {
        aulaId,
        alunoNome: alunoProfile?.full_name || "Aluno",
        instrutorPhone: instrutorProfile.phone,
        instrutorNome: instrutorProfile.full_name || "Instrutor",
        dataHora: aulaCompleta.data_hora,
        duracaoMinutos: aulaCompleta.duracao_minutos,
        pontoEncontro: aulaCompleta.ponto_encontro,
        valor: aulaCompleta.valor,
        categoria: `Categoria ${instrutor.cnh_categoria || "B"}`,
      };

      const response = await fetch(
        `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-whatsapp-notification`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          },
          body: JSON.stringify(whatsappPayload),
        }
      );

      const whatsappResult = await response.json();
      logStep("WhatsApp notification result", whatsappResult);
    } else {
      logStep("Instructor has no phone registered, skipping WhatsApp");
    }
  } catch (whatsappError: any) {
    logStep("Failed to send WhatsApp", { error: whatsappError.message });
    // Don't fail the payment check because of WhatsApp
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate authentication
    const auth = await validateAuth(req);
    if (!auth) {
      logStep("Authentication failed");
      return new Response(
        JSON.stringify({ error: "Não autorizado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    logStep("User authenticated", { userId: auth.userId });

    const pagarmeApiKey = Deno.env.get("PAGARME_API_KEY");
    if (!pagarmeApiKey) {
      throw new Error("PAGARME_API_KEY não configurada");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { transactionId, aulaId } = await req.json();
    logStep("Check status request", { transactionId, aulaId });

    let orderId = transactionId;

    // If aulaId provided, get transactionId from database
    if (!orderId && aulaId) {
      const { data: aulaData } = await supabase
        .from("aulas")
        .select("transaction_id")
        .eq("id", aulaId)
        .single();

      orderId = aulaData?.transaction_id;
    }

    if (!orderId) {
      throw new Error("Transaction ID ou Aula ID necessário");
    }

    // Fetch order from Pagar.me
    const orderResponse = await fetch(
      `https://api.pagar.me/core/v5/orders/${orderId}`,
      {
        method: "GET",
        headers: {
          "Authorization": `Basic ${btoa(pagarmeApiKey + ":")}`,
        },
      }
    );

    if (!orderResponse.ok) {
      const errorData = await orderResponse.json();
      logStep("Pagar.me error", errorData);
      throw new Error("Erro ao consultar status do pagamento");
    }

    const orderData = await orderResponse.json();
    logStep("Order status fetched", { 
      orderId, 
      status: orderData.status,
      charges: orderData.charges?.length 
    });

    // Get charge status (first charge)
    const charge = orderData.charges?.[0];
    const chargeStatus = charge?.status || orderData.status;
    const simplifiedStatus = mapStatus(chargeStatus);

    // If payment is successful and we have aulaId, update lesson status
    if (simplifiedStatus === "succeeded" && aulaId) {
      // Check if payment was already confirmed to avoid duplicate notifications
      const { data: currentAula } = await supabase
        .from("aulas")
        .select("payment_confirmed")
        .eq("id", aulaId)
        .single();

      const wasAlreadyConfirmed = currentAula?.payment_confirmed === true;

      const { error: updateError } = await supabase
        .from("aulas")
        .update({ 
          status: "confirmada",
          payment_confirmed: true 
        })
        .eq("id", aulaId);

      if (!updateError) {
        logStep("Lesson status and payment_confirmed updated");
        
        // Send WhatsApp notification only if this is the first time payment is confirmed
        if (!wasAlreadyConfirmed) {
          await sendWhatsAppNotification(supabase, aulaId);
        } else {
          logStep("Payment was already confirmed, skipping WhatsApp notification");
        }
      }
    }

    // Get PIX details if available
    const pixData = charge?.last_transaction?.qr_code 
      ? {
          qrCode: charge.last_transaction.qr_code,
          qrCodeUrl: charge.last_transaction.qr_code_url,
          expiresAt: charge.last_transaction.expires_at,
        }
      : null;

    return new Response(
      JSON.stringify({
        success: true,
        orderId,
        status: simplifiedStatus,
        rawStatus: chargeStatus,
        amount: charge?.amount ? charge.amount / 100 : null,
        paidAt: charge?.paid_at,
        paymentMethod: charge?.payment_method,
        pix: pixData,
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
