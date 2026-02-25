import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    user_id?: string;
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

function formatPhoneDisplay(phone: string): string {
  const clean = phone.replace(/\D/g, "");
  if (clean.length === 11) {
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`;
  }
  if (clean.length === 10) {
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`;
  }
  return phone;
}

async function enrichDadosFromDB(dados: RegistrationPayload["dados"]): Promise<void> {
  if (dados.whatsapp && dados.cidade) return;

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) return;

  const supabaseAdmin = createClient(supabaseUrl, serviceKey);

  let profile: any = null;

  // Try by user_id first, then by email
  if (dados.user_id) {
    const { data } = await supabaseAdmin
      .from("profiles")
      .select("phone, cidade")
      .eq("id", dados.user_id)
      .maybeSingle();
    profile = data;
  }

  if (!profile && dados.email) {
    // Lookup user by email in auth, then get profile
    const { data: authData } = await supabaseAdmin.auth.admin.listUsers();
    const authUser = authData?.users?.find(
      (u: any) => u.email?.toLowerCase() === dados.email?.toLowerCase()
    );
    if (authUser) {
      const { data } = await supabaseAdmin
        .from("profiles")
        .select("phone, cidade")
        .eq("id", authUser.id)
        .maybeSingle();
      profile = data;
    }
  }

  if (profile) {
    logStep("Profile encontrado no DB", { phone: profile.phone, cidade: profile.cidade });
    if (!dados.whatsapp && profile.phone) {
      dados.whatsapp = formatPhoneDisplay(profile.phone);
    }
    if (!dados.cidade && profile.cidade) {
      dados.cidade = profile.cidade;
    }
  }
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

    // Enrich missing data from database
    await enrichDadosFromDB(payload.dados);
    logStep("Dados enriquecidos", { whatsapp: payload.dados.whatsapp, cidade: payload.dados.cidade });

    const message = buildMessage(payload);
    logStep("Mensagem construída", { tipo: payload.tipo, length: message.length });

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

    // Log to admin_notification_logs table
    try {
      const supabaseAdmin = createClient(supabaseUrl, serviceKey);
      await supabaseAdmin.from("admin_notification_logs").insert({
        tipo: payload.tipo,
        user_id: payload.dados.user_id || null,
        nome: payload.dados.nome || payload.dados.nome_fantasia || null,
        email: payload.dados.email || null,
        whatsapp: payload.dados.whatsapp || null,
        cidade: payload.dados.cidade || null,
        message_id: whatsappResult.messageId || null,
        success: whatsappResult.success ?? false,
        error_message: whatsappResult.success ? null : (whatsappResult.error || null),
      });
      logStep("Log inserido na tabela admin_notification_logs");
    } catch (logError: any) {
      logStep("Erro ao inserir log", { message: logError.message });
    }

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
