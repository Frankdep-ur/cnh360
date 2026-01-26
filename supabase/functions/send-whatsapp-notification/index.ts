// =============================================================================
// NOTIFICAÇÕES WHATSAPP VIA Z-API
// Migrado de SendPulse para Z-API em 26/01/2026
// Z-API é um provedor brasileiro com integração direta ao WhatsApp
// Documentação: https://developer.z-api.io/
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

// Função para enviar mensagem WhatsApp via Z-API
async function sendWhatsAppViaZAPI(
  phone: string,
  message: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const instanceId = Deno.env.get("ZAPI_INSTANCE_ID");
  const token = Deno.env.get("ZAPI_TOKEN");
  const clientToken = Deno.env.get("ZAPI_CLIENT_TOKEN");

  if (!instanceId || !token) {
    logStep("Z-API não configurado - credenciais ausentes");
    return { success: false, error: "ZAPI_INSTANCE_ID ou ZAPI_TOKEN não configurados" };
  }

  if (!clientToken) {
    logStep("Z-API Client-Token não configurado");
    return { success: false, error: "ZAPI_CLIENT_TOKEN não configurado" };
  }

  // Formatar número para padrão brasileiro (apenas dígitos, com 55)
  const phoneClean = phone.replace(/\D/g, "");
  const phoneFormatted = phoneClean.startsWith("55") ? phoneClean : `55${phoneClean}`;

  const zapiUrl = `https://api.z-api.io/instances/${instanceId}/token/${token}/send-text`;

  try {
    logStep("Enviando mensagem via Z-API", { phone: phoneFormatted });

    const response = await fetch(zapiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Client-Token": clientToken,
      },
      body: JSON.stringify({
        phone: phoneFormatted,
        message: message,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      logStep("Erro Z-API", { status: response.status, data });
      return { success: false, error: data.message || data.error || "Erro ao enviar mensagem" };
    }

    logStep("Mensagem enviada via Z-API", { phone: phoneFormatted, data });
    return { success: true, messageId: data.messageId || data.zapiMessageId || "sent" };
  } catch (error: any) {
    logStep("Exceção ao enviar via Z-API", { message: error.message });
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

    // Verificar se Z-API está configurado
    const instanceId = Deno.env.get("ZAPI_INSTANCE_ID");
    const token = Deno.env.get("ZAPI_TOKEN");
    
    if (!instanceId || !token) {
      logStep("Z-API não configurado, notificação WhatsApp pulada");
      return new Response(
        JSON.stringify({ 
          success: false, 
          reason: "zapi_not_configured",
          message: "Configure ZAPI_INSTANCE_ID e ZAPI_TOKEN nos secrets do projeto"
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

    // Mensagem formatada para WhatsApp com emojis e negrito
    const message = `🎉 *Pagamento confirmado!*

👤 *Aluno:* ${payload.alunoNome}
📚 *Aula:* ${payload.categoria || "Categoria B"} - ${payload.duracaoMinutos} min prática
📅 *Data/Hora:* ${dataFormatada}
📍 *Local:* ${payload.pontoEncontro || "A combinar"}
💰 *Valor pago:* R$ ${payload.valor.toFixed(2)}

💬 Acesse o chat no app para falar com o aluno:
${chatDeepLink}

Bora ensinar! 🚗`;

    // Enviar via Z-API
    const result = await sendWhatsAppViaZAPI(payload.instrutorPhone, message);

    if (!result.success) {
      logStep("Falha ao enviar WhatsApp", { error: result.error });
      return new Response(
        JSON.stringify({ success: false, error: result.error }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    logStep("WhatsApp enviado com sucesso via Z-API", { messageId: result.messageId });

    return new Response(
      JSON.stringify({ success: true, messageId: result.messageId, provider: "zapi" }),
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
