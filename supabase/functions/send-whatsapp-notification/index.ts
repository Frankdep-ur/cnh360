// =============================================================================
// NOTIFICAÇÕES WHATSAPP MIGRADAS PARA SENDPULSE
// Twilio foi removida permanentemente em 25/01/2026
// Agora usamos SendPulse como provedor oficial WhatsApp Business API
// Motivo: sandbox Twilio travado e setup complicado no trial
// =============================================================================

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

// Função para obter token de acesso do SendPulse (OAuth2)
async function getSendPulseAccessToken(): Promise<string | null> {
  const apiUserId = Deno.env.get("SENDPULSE_API_USER_ID");
  const apiSecret = Deno.env.get("SENDPULSE_API_SECRET");

  if (!apiUserId || !apiSecret) {
    logStep("SendPulse não configurado - credenciais ausentes");
    return null;
  }

  try {
    const response = await fetch("https://api.sendpulse.com/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "client_credentials",
        client_id: apiUserId,
        client_secret: apiSecret,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      logStep("Erro ao obter token SendPulse", { status: response.status, error });
      return null;
    }

    const data = await response.json();
    return data.access_token;
  } catch (error: any) {
    logStep("Exceção ao obter token SendPulse", { message: error.message });
    return null;
  }
}

// Função para enviar mensagem WhatsApp via SendPulse
async function sendWhatsAppViaSendPulse(
  accessToken: string,
  phone: string,
  message: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const botId = Deno.env.get("SENDPULSE_WHATSAPP_BOT_ID");

  if (!botId) {
    return { success: false, error: "SENDPULSE_WHATSAPP_BOT_ID não configurado" };
  }

  // Formatar número para padrão internacional
  const phoneClean = phone.replace(/\D/g, "");
  const phoneFormatted = phoneClean.startsWith("55") ? phoneClean : `55${phoneClean}`;

  try {
    const response = await fetch("https://api.sendpulse.com/whatsapp/contacts/sendByPhone", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bot_id: botId,
        phone: phoneFormatted,
        message: {
          type: "text",
          text: {
            body: message,
          },
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      logStep("Erro SendPulse API", { status: response.status, data });
      return { success: false, error: data.message || "Erro ao enviar mensagem" };
    }

    logStep("Mensagem enviada via SendPulse", { phone: phoneFormatted, data });
    return { success: true, messageId: data.id || "sent" };
  } catch (error: any) {
    logStep("Exceção ao enviar via SendPulse", { message: error.message });
    return { success: false, error: error.message };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: WhatsAppPayload = await req.json();
    logStep("Payload recebido", { 
      aulaId: payload.aulaId, 
      alunoNome: payload.alunoNome,
      instrutorNome: payload.instrutorNome 
    });

    // Verificar se SendPulse está configurado
    const accessToken = await getSendPulseAccessToken();
    
    if (!accessToken) {
      logStep("SendPulse não configurado, notificação WhatsApp pulada");
      return new Response(
        JSON.stringify({ 
          success: false, 
          reason: "sendpulse_not_configured",
          message: "Configure SENDPULSE_API_USER_ID, SENDPULSE_API_SECRET e SENDPULSE_WHATSAPP_BOT_ID"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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

    // Enviar via SendPulse
    const result = await sendWhatsAppViaSendPulse(accessToken, payload.instrutorPhone, message);

    if (!result.success) {
      logStep("Falha ao enviar WhatsApp", { error: result.error });
      return new Response(
        JSON.stringify({ success: false, error: result.error }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    logStep("WhatsApp enviado com sucesso via SendPulse", { messageId: result.messageId });

    return new Response(
      JSON.stringify({ success: true, messageId: result.messageId, provider: "sendpulse" }),
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
