import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.87.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-edge-secret",
};

interface PushPayload {
  user_id: string;
  title: string;
  body: string;
  type: 'lesson_reminder' | 'status_update';
  reference_id?: string;
  url?: string;
}

// Validate internal edge function secret
function validateEdgeSecret(req: Request): boolean {
  const edgeSecret = Deno.env.get("EDGE_FUNCTION_SECRET");
  if (!edgeSecret) {
    console.warn("EDGE_FUNCTION_SECRET not configured");
    return false;
  }
  
  const providedSecret = req.headers.get("x-edge-secret");
  return providedSecret === edgeSecret;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Validate the edge secret for internal calls
  if (!validateEdgeSecret(req)) {
    console.error("Invalid or missing edge secret");
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const payload: PushPayload = await req.json();
    console.log("[send-push-notification] Saving notification:", {
      userId: payload.user_id,
      title: payload.title,
      type: payload.type,
    });

    // Save notification to database (in-app notification)
    const { error: notifError } = await supabase.from("notifications").insert({
      user_id: payload.user_id,
      title: payload.title,
      body: payload.body,
      type: payload.type,
      reference_id: payload.reference_id,
    });

    if (notifError) {
      console.error("[send-push-notification] Error saving notification:", notifError);
      throw notifError;
    }

    console.log("[send-push-notification] Notification saved successfully");

    // NOTE: Real push notifications (via web-push/Firebase) can be added here
    // when VAPID keys or Firebase credentials are configured.

    return new Response(
      JSON.stringify({ success: true, saved: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("[send-push-notification] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
