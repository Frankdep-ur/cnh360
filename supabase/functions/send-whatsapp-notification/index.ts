import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  console.log(`[send-whatsapp-notification] ${step}`, details ? JSON.stringify(details) : "");
};

interface WhatsAppPayload {
  aulaId: string;
  alunoNome: string;
  instrutorPhone: string;
  instrutorNome: string;
  dataHora: string;
  duracaoMinutos: number;
  pontoEncontro: string;
  valor: number;
  categoria?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const twilioSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const twilioToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioWhatsApp = Deno.env.get("TWILIO_WHATSAPP_NUMBER");

    if (!twilioSid || !twilioToken || !twilioWhatsApp) {
      logStep("Twilio não configurado, pulando WhatsApp");
      return new Response(
        JSON.stringify({ success: false, reason: "twilio_not_configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload: WhatsAppPayload = await req.json();
    logStep("Payload recebido", { 
      aulaId: payload.aulaId, 
      alunoNome: payload.alunoNome,
      instrutorNome: payload.instrutorNome 
    });

    // Formatar data para exibição em português brasileiro
    const dataFormatada = new Date(payload.dataHora).toLocaleString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Sao_Paulo",
    });

    // Deep link para o chat da aula
    const chatDeepLink = `https://cnh360.lovable.app/aluno/chat/${payload.aulaId}`;

    // Mensagem formatada para WhatsApp
    const message = `🎉 *Pagamento confirmado!*

👤 *Aluno:* ${payload.alunoNome}
📚 *Aula:* ${payload.categoria || "Categoria B"} - ${payload.duracaoMinutos} min prática
📅 *Data/Hora:* ${dataFormatada}
📍 *Local:* ${payload.pontoEncontro || "A combinar"}
💰 *Valor pago:* R$ ${payload.valor.toFixed(2)}

💬 Acesse o chat no app para falar com o aluno:
${chatDeepLink}

Qualquer dúvida, responde aqui ou no app.
Bora ensinar! 🚗`;

    // Formatar número para WhatsApp (remover caracteres especiais)
    const phoneClean = payload.instrutorPhone.replace(/\D/g, "");
    const whatsappTo = phoneClean.startsWith("55")
      ? `whatsapp:+${phoneClean}`
      : `whatsapp:+55${phoneClean}`;

    const fromNumber = `whatsapp:${twilioWhatsApp}`;
    logStep("Enviando para WhatsApp", { to: whatsappTo, from: fromNumber, twilioWhatsAppRaw: twilioWhatsApp });

    // Enviar via Twilio
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
    const twilioAuth = btoa(`${twilioSid}:${twilioToken}`);

    const formData = new URLSearchParams();
    formData.append("From", fromNumber);
    formData.append("To", whatsappTo);
    formData.append("Body", message);

    const twilioResponse = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${twilioAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    const twilioData = await twilioResponse.json();

    if (!twilioResponse.ok) {
      logStep("Twilio error", twilioData);
      throw new Error(twilioData.message || "Erro ao enviar WhatsApp");
    }

    logStep("WhatsApp enviado com sucesso", { messageSid: twilioData.sid });

    return new Response(
      JSON.stringify({ success: true, messageSid: twilioData.sid }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    logStep("Error", { message: error.message });
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
