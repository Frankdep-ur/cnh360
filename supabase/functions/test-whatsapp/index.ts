import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const instanceId = Deno.env.get("ZAPI_INSTANCE_ID");
  const token = Deno.env.get("ZAPI_TOKEN");
  const clientToken = Deno.env.get("ZAPI_CLIENT_TOKEN");

  if (!instanceId || !token || !clientToken) {
    return new Response(JSON.stringify({ error: "Z-API não configurado" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const phone = "5518997427195";

  const dataTeste = new Date();
  dataTeste.setDate(dataTeste.getDate() + 1);
  dataTeste.setHours(14, 0, 0, 0);

  const dataFormatada = dataTeste.toLocaleString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  });

  const message = `🚀 *Parabéns! Você tem uma nova aula confirmada!*

Seu aluno acabou de pagar via PIX.

👤 Maria Silva (TESTE)
📅 ${dataFormatada}
⏱ 50 min
💰 R$ 120.00

💬 Envie um "Oi" agora mesmo e confirme o ponto de encontro.

👉 Clique aqui para abrir o chat:
https://cnh360.com/instrutor/chat`;

  const zapiUrl = `https://api.z-api.io/instances/${instanceId}/token/${token}/send-text`;

  try {
    const response = await fetch(zapiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Client-Token": clientToken },
      body: JSON.stringify({ phone, message }),
    });

    const data = await response.json();
    console.log("[test-whatsapp] Response:", JSON.stringify(data));

    return new Response(JSON.stringify({ success: response.ok, data, messagePreview: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
