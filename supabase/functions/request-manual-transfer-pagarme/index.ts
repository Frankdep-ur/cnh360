import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  console.log(`[request-manual-transfer] ${step}`, details ? JSON.stringify(details) : "");
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const pagarmeApiKey = Deno.env.get("PAGARME_API_KEY");
    if (!pagarmeApiKey) {
      throw new Error("PAGARME_API_KEY não configurada");
    }

    // Auth
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");
    
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);
    const { data: userData } = await supabaseAuth.auth.getUser(token || "");
    const user = userData?.user;

    if (!user) {
      throw new Error("Usuário não autenticado");
    }
    logStep("User authenticated", { email: user.email });

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get instructor's recipient_id
    const { data: instrutor, error: instrutorError } = await supabase
      .from("instrutores")
      .select("id, pagarme_recipient_id")
      .eq("user_id", user.id)
      .single();

    if (instrutorError || !instrutor) {
      throw new Error("Instrutor não encontrado");
    }

    if (!instrutor.pagarme_recipient_id) {
      throw new Error("Dados bancários não configurados. Cadastre sua conta bancária primeiro.");
    }

    const recipientId = instrutor.pagarme_recipient_id;
    const instrutorId = instrutor.id;
    logStep("Recipient found", { recipientId, instrutorId });

    // ========== CAMADA 2: Verificar saque pendente nos últimos 10 minutos ==========
    const { data: pendingSaques, error: pendingError } = await supabase
      .from("saques")
      .select("id, created_at")
      .eq("instrutor_id", instrutorId)
      .eq("status", "pendente")
      .gte("created_at", new Date(Date.now() - 10 * 60 * 1000).toISOString());

    if (pendingError) {
      logStep("Error checking pending withdrawals", pendingError);
    }

    if (pendingSaques && pendingSaques.length > 0) {
      logStep("Pending withdrawal found, rejecting", { pendingSaqueId: pendingSaques[0].id });
      return new Response(
        JSON.stringify({
          success: false,
          error: "Você já tem um saque em processamento. Aguarde alguns minutos antes de tentar novamente.",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // ========== CAMADA 3: Verificar saque processado nas últimas 2 horas ==========
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    const { data: recentProcessed, error: processedError } = await supabase
      .from("saques")
      .select("id, created_at, valor")
      .eq("instrutor_id", instrutorId)
      .eq("status", "processado")
      .gte("created_at", twoHoursAgo)
      .order("created_at", { ascending: false })
      .limit(1);

    if (processedError) {
      logStep("Error checking processed withdrawals", processedError);
    }

    if (recentProcessed && recentProcessed.length > 0) {
      const lastSaque = recentProcessed[0];
      const saqueTime = new Date(lastSaque.created_at);
      const unlockTime = new Date(saqueTime.getTime() + 2 * 60 * 60 * 1000);
      const minutesRemaining = Math.ceil((unlockTime.getTime() - Date.now()) / 60000);
      
      logStep("Recent processed withdrawal found, rejecting", { 
        saqueId: lastSaque.id, 
        createdAt: lastSaque.created_at,
        minutesRemaining 
      });
      
      return new Response(
        JSON.stringify({
          success: false,
          error: `Você já realizou um saque recentemente. Aguarde ${minutesRemaining} minuto(s) para solicitar outro.`,
          recentWithdrawal: true,
          lastWithdrawalAt: lastSaque.created_at,
          unlockAt: unlockTime.toISOString(),
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Fetch current balance
    const balanceRes = await fetch(
      `https://api.pagar.me/core/v5/recipients/${recipientId}/balance`,
      {
        headers: {
          "Authorization": `Basic ${btoa(pagarmeApiKey + ":")}`,
        },
      }
    );
    
    if (!balanceRes.ok) {
      const errorData = await balanceRes.json();
      logStep("Balance fetch error", errorData);
      throw new Error("Erro ao consultar saldo na Pagar.me");
    }

    const balanceData = await balanceRes.json();
    logStep("Balance fetched", balanceData);

    const availableAmount = balanceData.available_amount ?? balanceData.available?.amount ?? 0;
    const WITHDRAWAL_FEE_CENTS = 367;
    
    if (availableAmount <= 0) {
      throw new Error("Saldo insuficiente para saque. Aguarde a liberação do saldo pendente.");
    }

    if (availableAmount <= WITHDRAWAL_FEE_CENTS) {
      const saldoReais = (availableAmount / 100).toFixed(2);
      logStep("Balance too low for withdrawal fee", { availableAmount, fee: WITHDRAWAL_FEE_CENTS });
      throw new Error(
        `Saldo de R$ ${saldoReais} é insuficiente para cobrir a taxa de saque de R$ 3,67. Acumule mais saldo antes de sacar.`
      );
    }

    const netAmountCents = availableAmount - WITHDRAWAL_FEE_CENTS;
    logStep("Net amount after fee", { gross: availableAmount, fee: WITHDRAWAL_FEE_CENTS, net: netAmountCents });

    // ========== Inserir registro de saque 'pendente' ANTES de chamar a API ==========
    const { data: saqueRecord, error: saqueInsertError } = await supabase
      .from("saques")
      .insert({
        instrutor_id: instrutorId,
        valor: availableAmount,
        status: "pendente",
      })
      .select("id")
      .single();

    if (saqueInsertError || !saqueRecord) {
      logStep("Error inserting saque record", saqueInsertError);
      throw new Error("Erro interno ao registrar solicitação de saque.");
    }

    const saqueId = saqueRecord.id;
    logStep("Saque record created", { saqueId, amount: availableAmount });

    // Create transfer (Pagar.me V5)
    logStep("Creating transfer", { recipientId, amount: availableAmount });

    const transferRes = await fetch("https://api.pagar.me/core/v5/transfers", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${btoa(pagarmeApiKey + ":")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recipient_id: recipientId,
        amount: availableAmount,
      }),
    });

    const transferData = await transferRes.json();

    if (!transferRes.ok) {
      logStep("Transfer error", transferData);

      // Atualizar saque para 'rejeitado'
      await supabase
        .from("saques")
        .update({ status: "rejeitado" })
        .eq("id", saqueId);

      const errorMessage = transferData.message || 
        transferData.errors?.[0]?.message || 
        "Erro ao solicitar saque na Pagar.me";
      throw new Error(errorMessage);
    }

    // Atualizar saque para 'processado' com transfer_id
    await supabase
      .from("saques")
      .update({ 
        status: "processado", 
        transfer_id: String(transferData.id),
      })
      .eq("id", saqueId);

    logStep("Transfer created successfully", { 
      transferId: transferData.id,
      status: transferData.status,
      amount: transferData.amount,
      saqueId,
    });

    return new Response(
      JSON.stringify({
        success: true,
        transfer_id: transferData.id,
        amount: availableAmount / 100,
        status: transferData.status,
        message: "Saque solicitado com sucesso",
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );

  } catch (error: any) {
    logStep("Error", { message: error.message });
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 200 
      }
    );
  }
});
