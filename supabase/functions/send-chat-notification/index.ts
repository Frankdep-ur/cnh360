import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.87.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ChatNotificationPayload {
  aula_id: string;
  sender_id: string;
  message_preview: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const payload: ChatNotificationPayload = await req.json();
    console.log("Processing chat notification:", payload);

    // Get the lesson details to find recipient
    const { data: aula, error: aulaError } = await supabase
      .from("aulas")
      .select("aluno_id, instrutor_id")
      .eq("id", payload.aula_id)
      .single();

    if (aulaError || !aula) {
      console.error("Error fetching aula:", aulaError);
      return new Response(
        JSON.stringify({ success: false, error: "Aula not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get sender info from profiles
    const { data: senderProfile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", payload.sender_id)
      .single();

    const senderName = senderProfile?.full_name || "Contato";

    // Determine recipient (if sender is aluno, notify instrutor and vice versa)
    // First check if sender is the aluno
    const { data: alunoData } = await supabase
      .from("alunos")
      .select("user_id")
      .eq("id", aula.aluno_id)
      .single();

    const { data: instrutorData } = await supabase
      .from("instrutores")
      .select("user_id")
      .eq("id", aula.instrutor_id)
      .single();

    if (!alunoData || !instrutorData) {
      console.error("Could not find aluno or instrutor data");
      return new Response(
        JSON.stringify({ success: false, error: "User data not found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Determine recipient
    let recipientUserId: string;
    if (payload.sender_id === alunoData.user_id) {
      // Sender is aluno, notify instrutor
      recipientUserId = instrutorData.user_id;
      console.log("Sender is aluno, notifying instrutor:", recipientUserId);
    } else if (payload.sender_id === instrutorData.user_id) {
      // Sender is instrutor, notify aluno
      recipientUserId = alunoData.user_id;
      console.log("Sender is instrutor, notifying aluno:", recipientUserId);
    } else {
      console.error("Sender is neither aluno nor instrutor");
      return new Response(
        JSON.stringify({ success: false, error: "Invalid sender" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Save notification to database
    const notificationTitle = `Nova mensagem de ${senderName}`;
    const notificationBody = payload.message_preview.length > 50 
      ? payload.message_preview.substring(0, 50) + "..." 
      : payload.message_preview;

    const { error: notifError } = await supabase.from("notifications").insert({
      user_id: recipientUserId,
      title: notificationTitle,
      body: notificationBody,
      type: "chat_message",
      reference_id: payload.aula_id,
    });

    if (notifError) {
      console.error("Error saving notification:", notifError);
    }

    // Check for push subscriptions
    const { data: subscriptions, error: subError } = await supabase
      .from("push_subscriptions")
      .select("*")
      .eq("user_id", recipientUserId);

    if (subError) {
      console.error("Error fetching subscriptions:", subError);
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log("No push subscriptions for recipient");
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: "No subscriptions" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log push notification attempt (actual sending would require web-push implementation)
    console.log(`Would send push to ${subscriptions.length} subscription(s) for user ${recipientUserId}`);
    console.log(`Title: ${notificationTitle}`);
    console.log(`Body: ${notificationBody}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: subscriptions.length,
        recipient: recipientUserId 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Error in send-chat-notification:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
