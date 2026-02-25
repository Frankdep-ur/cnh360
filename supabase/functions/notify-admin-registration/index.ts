import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_PHONE = "351961395247";

const logStep = (step: string, details?: any) => {
  console.log(`[notify-admin-registration] ${step}`, details ? JSON.stringify(details) : "");
};

interface RegistrationPayload {
  tipo: "aluno" | "instrutor" | "autoescola" | "novo_usuario";
  dados: {
    nome?: string;
    email?: string;
    whatsapp?: string;
    cidade?: string;
    categoria?: string;
    nome_fantasia?: string;
    responsavel?: string;
    login_via?: string;
  };
}

function buildMessage(payload: RegistrationPayload): string {
  const { tipo, dados } = payload;
  const agora = new Date().toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  });

  switch (tipo) {
    case "aluno":
      return `🚨 *NOVO ALUNO CADASTRADO - CNH360*

👤 Nome: ${dados.nome || "N/A"}
📧 E-mail: ${dados.email || "N/A"}
📱 WhatsApp: ${dados.whatsapp || "N/A"}
📍 Cidade: ${dados.cidade || "N/A"}
🪪 Categoria pretendida: ${dados.categoria || "N/A"}
📅 Data do cadastro: ${agora}
Status: Cadastro finalizado ✅`;

    case "instrutor":
      return `🚨 *NOVO INSTRUTOR CADASTRADO - CNH360*

👤 Nome: ${dados.nome || "N/A"}
📧 E-mail: ${dados.email || "N/A"}
📱 WhatsApp: ${dados.whatsapp || "N/A"}
📍 Cidade: ${dados.cidade || "N/A"}
🚘 Categoria: ${dados.categoria || "B"}
📅 Data do cadastro: ${agora}
Status: Cadastro finalizado ✅`;

    case "autoescola":
      return `🚨 *NOVA AUTOESCOLA CADASTRADA - CNH360*

🏢 Nome: ${dados.nome_fantasia || dados.nome || "N/A"}
👤 Responsável: ${dados.responsavel || "N/A"}
📧 E-mail: ${dados.email || "N/A"}
📱 WhatsApp: ${dados.whatsapp || "N/A"}
📍 Cidade: ${dados.cidade || "N/A"}
📅 Data do cadastro: ${agora}
Status: Cadastro finalizado ✅`;

    case "novo_usuario":
      return `⚠️ *NOVO USUARIO REGISTRADO - CNH360*

👤 Nome: ${dados.nome || "N/A"}
📧 E-mail: ${dados.email || "N/A"}
🔑 Login via: ${dados.login_via || "email"}
📅 Data: ${agora}
Status: Aguardando completar cadastro ⏳`;

    default:
      return `📋 Novo registro na CNH360: ${dados.nome || dados.email || "desconhecido"}`;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: RegistrationPayload = await req.json();
    logStep("Payload recebido", { tipo: payload.tipo, nome: payload.dados?.nome });

    if (!payload.tipo || !payload.dados) {
      return new Response(
        JSON.stringify({ error: "Payload inválido: tipo e dados são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const message = buildMessage(payload);
    logStep("Mensagem construída", { tipo: payload.tipo, length: message.length });

    // Call send-whatsapp-notification with simple format
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceKey) {
      logStep("SUPABASE_URL ou SERVICE_ROLE_KEY não configurados");
      return new Response(
        JSON.stringify({ success: false, error: "Configuração do servidor incompleta" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const whatsappUrl = `${supabaseUrl}/functions/v1/send-whatsapp-notification`;

    const whatsappResponse = await fetch(whatsappUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({
        phone: ADMIN_PHONE,
        message: message,
      }),
    });

    const whatsappResult = await whatsappResponse.json();
    logStep("Resultado do envio WhatsApp", whatsappResult);

    return new Response(
      JSON.stringify({ success: whatsappResult.success ?? false, ...whatsappResult }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    logStep("Erro", { message: error.message });
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
