import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const ts = new Date().toISOString();
  console.log(`[pagarme-payment-webhook][${ts}] ${step}`, details ? JSON.stringify(details) : "");
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    logStep("Webhook received", { type: body.type, id: body.id });

    // Only process order.paid events
    if (body.type !== "order.paid") {
      logStep("Ignoring event type", { type: body.type });
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const order = body.data;
    const orderId = order?.id;
    if (!orderId) {
      logStep("No order ID in payload");
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    logStep("Processing order.paid", { orderId, status: order.status });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find lesson by transaction_id
    const { data: aula, error: aulaError } = await supabase
      .from("aulas")
      .select("id, status, payment_confirmed, aluno_id, instrutor_id, valor, duracao_minutos")
      .eq("transaction_id", orderId)
      .single();

    if (aulaError || !aula) {
      logStep("Lesson not found for order", { orderId, error: aulaError?.message });
      return new Response(JSON.stringify({ received: true, warning: "lesson_not_found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    if (aula.payment_confirmed) {
      logStep("Payment already confirmed", { aulaId: aula.id });
      return new Response(JSON.stringify({ received: true, status: "already_confirmed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Update lesson: confirm payment + set status to confirmada
    const { error: updateError } = await supabase
      .from("aulas")
      .update({
        payment_confirmed: true,
        status: aula.status === "pendente" ? "confirmada" : aula.status,
      })
      .eq("id", aula.id)
      .eq("payment_confirmed", false); // Atomic check

    if (updateError) {
      logStep("Error updating lesson", { aulaId: aula.id, error: updateError.message });
      return new Response(JSON.stringify({ received: true, error: "update_failed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    logStep("Payment confirmed via webhook", { aulaId: aula.id, orderId });

    // Send WhatsApp notification to instructor
    try {
      const { data: instrutorData } = await supabase
        .from("instrutores")
        .select("user_id")
        .eq("id", aula.instrutor_id)
        .single();

      if (instrutorData?.user_id) {
        const { data: instrutorProfile } = await supabase
          .from("profiles")
          .select("phone, full_name")
          .eq("id", instrutorData.user_id)
          .single();

        const { data: alunoData } = await supabase
          .from("alunos")
          .select("user_id")
          .eq("id", aula.aluno_id)
          .single();

        let alunoName = "Aluno";
        if (alunoData?.user_id) {
          const { data: alunoProfile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", alunoData.user_id)
            .single();
          alunoName = alunoProfile?.full_name || "Aluno";
        }

        if (instrutorProfile?.phone) {
          await supabase.functions.invoke("send-whatsapp-notification", {
            body: {
              phone: instrutorProfile.phone,
              message: `🚀 *Parabéns! Você tem uma nova aula confirmada!*\n\nSeu aluno acabou de pagar via PIX.\n\n👤 ${alunoName}\n⏱ ${aula.duracao_minutos} min\n💰 R$ ${Number(aula.valor).toFixed(2)}\n\n💬 Envie um "Oi" agora mesmo e alinhe local e horário.\n\n👉 Clique aqui para abrir o chat:\nhttps://cnh360.com/instrutor/chat`,
            },
          });
          logStep("WhatsApp sent to instructor", { phone: instrutorProfile.phone });
        }
      }
    } catch (whatsappErr: any) {
      logStep("WhatsApp notification failed (non-blocking)", { error: whatsappErr.message });
    }

    // Create in-app notification
    try {
      const { data: instrutorData } = await supabase
        .from("instrutores")
        .select("user_id")
        .eq("id", aula.instrutor_id)
        .single();

      if (instrutorData?.user_id) {
        await supabase.from("notifications").insert({
          user_id: instrutorData.user_id,
          title: "Pagamento PIX confirmado",
          body: "Um pagamento PIX foi confirmado para uma nova aula.",
          type: "payment_confirmed",
          reference_id: aula.id,
        });
      }
    } catch (notifErr: any) {
      logStep("In-app notification failed (non-blocking)", { error: notifErr.message });
    }

    return new Response(JSON.stringify({ received: true, status: "confirmed" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    logStep("Unhandled webhook error", { message: error.message });
    return new Response(JSON.stringify({ received: true, error: "internal" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200, // Always return 200 to prevent Pagar.me retries
    });
  }
});
