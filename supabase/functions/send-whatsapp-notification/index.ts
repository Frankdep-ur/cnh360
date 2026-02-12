// =============================================================================
// NOTIFICAÇÕES WHATSAPP VIA Z-API
// Migrado de SendPulse para Z-API em 26/01/2026
// Z-API é um provedor brasileiro com integração direta ao WhatsApp
// Documentação: https://developer.z-api.io/
// SECURITY: Esta função deve ser chamada apenas internamente via service role key
// =============================================================================

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  console.log(`[send-whatsapp-notification] ${step}`, details ? JSON.stringify(details) : "");
};

// Validate internal call (service role key only)
function validateInternalCall(req: Request): boolean {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return false;
  }
  
  const token = authHeader.replace("Bearer ", "");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  
  // Only allow service role key (internal calls)
  return token === serviceKey;
}

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

  // Validação mínima: 55 + DDD(2) + número(8-9) = mínimo 12 dígitos
  if (phoneFormatted.length < 12) {
    const errorMsg = `Telefone inválido: ${phoneFormatted.length} dígitos (mínimo 12). Número: ${phoneFormatted.substring(0, 4)}****`;
    logStep(errorMsg);
    return { success: false, error: errorMsg };
  }

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

  // Validate internal call (service role key only)
  if (!validateInternalCall(req)) {
    logStep("Unauthorized: Not an internal call");
    return new Response(
      JSON.stringify({ error: "Unauthorized - Internal use only" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const rawPayload = await req.json();

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

    // === FORMATO SIMPLES: { phone, message } - mensagem já formatada (usado pelo webhook) ===
    if (rawPayload.phone && rawPayload.message) {
      const phoneMasked = rawPayload.phone.substring(0, 2) + "****" + rawPayload.phone.slice(-4);
      logStep("Formato simples detectado (webhook)", { phone_masked: phoneMasked });

      const result = await sendWhatsAppViaZAPI(rawPayload.phone, rawPayload.message);

      if (!result.success) {
        logStep("Falha ao enviar WhatsApp (simples)", { error: result.error, phone_masked: phoneMasked });
        return new Response(
          JSON.stringify({ success: false, error: result.error }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }

      logStep("WhatsApp enviado com sucesso (simples)", { messageId: result.messageId });
      return new Response(
        JSON.stringify({ success: true, messageId: result.messageId, provider: "zapi" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // === FORMATO ESTRUTURADO: WhatsAppPayload - monta mensagem internamente ===
    const payload: WhatsAppPayload = rawPayload;
    const phoneMasked = payload.instrutorPhone
      ? payload.instrutorPhone.substring(0, 2) + "****" + payload.instrutorPhone.slice(-4)
      : "N/A";
    logStep("Formato estruturado detectado", { 
      aulaId: payload.aulaId, 
      alunoNome: payload.alunoNome,
      instrutorNome: payload.instrutorNome,
      phone_masked: phoneMasked,
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

    // Deep link para página do instrutor (domínio oficial)
    const chatDeepLink = `https://cnh360.com/instrutor/a-caminho/${payload.aulaId}`;

    // Mensagem formatada para WhatsApp com emojis e negrito
    const message = `🎉 *Pagamento confirmado!*

👤 *Aluno:* ${payload.alunoNome}
📚 *Aula:* ${payload.categoria || "Categoria B"} - ${payload.duracaoMinutos} min prática
📅 *Data/Hora:* ${dataFormatada}
📍 *Local:* ${payload.pontoEncontro || "A combinar"}
💰 *Valor pago:* R$ ${payload.valor.toFixed(2)}

💬 Acesse o app para ver detalhes e falar com o aluno:
${chatDeepLink}

Bora ensinar! 🚗`;

    // Enviar via Z-API
    const result = await sendWhatsAppViaZAPI(payload.instrutorPhone, message);

    if (!result.success) {
      logStep("Falha ao enviar WhatsApp", { error: result.error, aulaId: payload.aulaId, phone_masked: phoneMasked });
      return new Response(
        JSON.stringify({ success: false, error: result.error }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    logStep("WhatsApp enviado com sucesso via Z-API", { messageId: result.messageId, aulaId: payload.aulaId });

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
