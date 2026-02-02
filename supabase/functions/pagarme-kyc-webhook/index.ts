import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  console.log(`[pagarme-kyc-webhook] ${step}`, details ? JSON.stringify(details) : "");
};

// Map Pagar.me KYC event types to our internal status
const mapKycEventToStatus = (eventType: string): string | null => {
  const mapping: Record<string, string | null> = {
    "recipient.created": "initiated",
    "recipient.kyc_link.created": "initiated",
    "recipient.kyc.created": "initiated",
    "recipient.kyc.in_review": "in_review",
    "recipient.kyc.approved": "approved",
    "recipient.kyc.refused": "refused",
    "recipient.updated": null, // Will check status in payload
  };
  return mapping[eventType] ?? null;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse webhook payload
    const payload = await req.json();
    logStep("Webhook received", { 
      type: payload.type,
      id: payload.id,
      data: payload.data ? "present" : "missing"
    });

    const eventType = payload.type;
    const recipientData = payload.data;

    if (!recipientData?.id) {
      logStep("No recipient ID in payload");
      return new Response(
        JSON.stringify({ received: true, message: "No recipient ID" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    const recipientId = recipientData.id;
    logStep("Processing for recipient", { recipientId });

    // Determine KYC status from event or payload
    let kycStatus = mapKycEventToStatus(eventType);
    
    // For recipient.updated events, check the actual status
    if (eventType === "recipient.updated" && recipientData.status) {
      const statusMapping: Record<string, string> = {
        "active": "approved",
        "affiliation": "in_review",
        "refused": "refused",
        "suspended": "refused",
      };
      kycStatus = statusMapping[recipientData.status] || null;
    }

    if (!kycStatus) {
      logStep("Event type not relevant for KYC status", { eventType });
      return new Response(
        JSON.stringify({ received: true, message: "Event not relevant" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    logStep("Updating KYC status", { recipientId, kycStatus });

    // Update instructor's KYC status
    const { data: updateData, error: updateError } = await supabase
      .from("instrutores")
      .update({ 
        kyc_status: kycStatus,
        kyc_updated_at: new Date().toISOString()
      })
      .eq("pagarme_recipient_id", recipientId)
      .select("id, user_id, kyc_status");

    if (updateError) {
      logStep("Error updating instructor", { error: updateError.message });
      throw new Error(`Failed to update instructor: ${updateError.message}`);
    }

    if (!updateData || updateData.length === 0) {
      logStep("No instructor found with recipient_id", { recipientId });
      return new Response(
        JSON.stringify({ received: true, message: "Instructor not found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    const instructor = updateData[0];
    logStep("Instructor updated successfully", { 
      instructorId: instructor.id, 
      newStatus: kycStatus 
    });

    // Create notification for the instructor
    if (kycStatus === "approved") {
      await supabase.from("notifications").insert({
        user_id: instructor.user_id,
        title: "Verificação de Identidade Aprovada! 🎉",
        body: "Sua conta foi verificada com sucesso. Você já pode realizar saques.",
        type: "kyc_approved",
      });
    } else if (kycStatus === "refused") {
      await supabase.from("notifications").insert({
        user_id: instructor.user_id,
        title: "Verificação de Identidade Recusada",
        body: "Houve um problema com sua verificação. Entre em contato com o suporte.",
        type: "kyc_refused",
      });
    }

    return new Response(
      JSON.stringify({ 
        received: true, 
        instructorId: instructor.id,
        kycStatus 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error: any) {
    logStep("Error processing webhook", { message: error.message });
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
