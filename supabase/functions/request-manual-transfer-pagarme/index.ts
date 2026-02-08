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
    logStep("Recipient found", { recipientId });

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
    
    if (availableAmount <= 0) {
      throw new Error("Saldo insuficiente para saque. Aguarde a liberação do saldo pendente.");
    }

    logStep("Creating transfer", { recipientId, amount: availableAmount });

    // Create transfer (Pagar.me V5)
    const transferRes = await fetch("https://api.pagar.me/core/v5/transfers", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${btoa(pagarmeApiKey + ":")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recipient_id: recipientId,
        amount: availableAmount, // já está em centavos
      }),
    });

    const transferData = await transferRes.json();

    if (!transferRes.ok) {
      logStep("Transfer error", transferData);
      const errorMessage = transferData.message || 
        transferData.errors?.[0]?.message || 
        "Erro ao solicitar saque na Pagar.me";
      throw new Error(errorMessage);
    }

    logStep("Transfer created successfully", { 
      transferId: transferData.id,
      status: transferData.status,
      amount: transferData.amount 
    });

    return new Response(
      JSON.stringify({
        success: true,
        transfer_id: transferData.id,
        amount: availableAmount / 100, // Retorna em reais
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
        status: 400 
      }
    );
  }
});
