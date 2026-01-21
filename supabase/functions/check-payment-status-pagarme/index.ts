import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  console.log(`[check-payment-status-pagarme] ${step}`, details ? JSON.stringify(details) : "");
};

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
      const { error: updateError } = await supabase
        .from("aulas")
        .update({ 
          status: "confirmada",
          payment_confirmed: true 
        })
        .eq("id", aulaId);

      if (!updateError) {
        logStep("Lesson status and payment_confirmed updated");
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
