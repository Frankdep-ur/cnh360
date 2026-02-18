import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  console.log(`[get-instructor-balance-pagarme] ${step}`, details ? JSON.stringify(details) : "");
};

interface BalanceResponse {
  available: number;
  waitingFunds: number;
  transferred: number;
  currency: string;
}

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
    let user: any = null;

    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);
      const { data: userData } = await supabaseAuth.auth.getUser(token);
      user = userData?.user;
    }

    if (!user) {
      throw new Error("Usuário não autenticado");
    }
    logStep("User authenticated", { email: user.email });

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get instructor's recipient_id and kyc_status
    const { data: instrutorData, error: instrutorError } = await supabase
      .from("instrutores")
      .select("id, pagarme_recipient_id, kyc_status")
      .eq("user_id", user.id)
      .single();

    if (instrutorError || !instrutorData) {
      throw new Error("Instrutor não encontrado");
    }

    if (!instrutorData.pagarme_recipient_id) {
      // Return 200 with needsSetup flag instead of 400 error
      return new Response(
        JSON.stringify({ 
          success: false,
          needsSetup: true,
          message: "Dados bancários não configurados",
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    const recipientId = instrutorData.pagarme_recipient_id;
    logStep("Fetching balance for recipient", { recipientId });

    // Fetch balance from Pagar.me API
    const balanceResponse = await fetch(
      `https://api.pagar.me/core/v5/recipients/${recipientId}/balance`,
      {
        method: "GET",
        headers: {
          "Authorization": `Basic ${btoa(pagarmeApiKey + ":")}`,
          "Content-Type": "application/json",
        },
      }
    );

    const balanceData = await balanceResponse.json();

    if (!balanceResponse.ok) {
      logStep("Pagar.me balance error", balanceData);
      throw new Error(balanceData.message || "Erro ao consultar saldo");
    }

    logStep("Balance fetched successfully", balanceData);

    // Also fetch recipient status
    const recipientResponse = await fetch(
      `https://api.pagar.me/core/v5/recipients/${recipientId}`,
      {
        method: "GET",
        headers: {
          "Authorization": `Basic ${btoa(pagarmeApiKey + ":")}`,
          "Content-Type": "application/json",
        },
      }
    );

    const recipientData = await recipientResponse.json();
    const recipientStatus = recipientData?.status || "unknown";
    logStep("Recipient status", { recipientStatus });

    // AUTO-SYNC: Map Pagar.me status to local kyc_status and update if different
    const statusMapping: Record<string, string> = {
      active: "approved",
      affiliation: "in_review",
      refused: "refused",
      suspended: "refused",
    };
    const mappedStatus = statusMapping[recipientStatus] || instrutorData.kyc_status;
    
    if (mappedStatus && mappedStatus !== instrutorData.kyc_status) {
      logStep("Syncing kyc_status", { from: instrutorData.kyc_status, to: mappedStatus });
      await supabase
        .from("instrutores")
        .update({ kyc_status: mappedStatus, kyc_updated_at: new Date().toISOString() })
        .eq("id", instrutorData.id);
    }

    // Parse balance data from Pagar.me response
    // Pagar.me returns amounts in cents
    // Support both flat format (available_amount) and nested format (available.amount)
    const balance: BalanceResponse = {
      available: (balanceData.available_amount ?? balanceData.available?.amount ?? 0) / 100,
      waitingFunds: (balanceData.waiting_funds_amount ?? balanceData.waiting_funds?.amount ?? 0) / 100,
      transferred: (balanceData.transferred_amount ?? balanceData.transferred?.amount ?? 0) / 100,
      currency: balanceData.currency ?? balanceData.available?.currency ?? "BRL",
    };

    // HYBRID BALANCE LOGIC:
    // If recipient is not active or balance is zero, fetch local payments as pending
    if (recipientStatus !== "active" || (balance.available === 0 && balance.waitingFunds === 0)) {
      logStep("Fetching local payments as fallback", { recipientStatus });

      // Query local payments for this instructor
      const { data: pagamentosData, error: pagamentosError } = await supabase
        .from("pagamentos")
        .select("valor_instrutor, status")
        .eq("instrutor_id", instrutorData.id)
        .eq("status", "aprovado");

      if (!pagamentosError && pagamentosData) {
        const ganhosPendentes = pagamentosData.reduce(
          (sum, p) => sum + (p.valor_instrutor || 0), 0
        );
        
        logStep("Local pending earnings calculated", { 
          totalPayments: pagamentosData.length,
          ganhosPendentes 
        });

        // Add local gains to waitingFunds (since they're pending release)
        if (ganhosPendentes > 0) {
          balance.waitingFunds = ganhosPendentes;
        }
      }
    }

    // Check for unfinished lessons (paid but not finalized)
    const { data: unfinishedLessons, error: unfinishedError } = await supabase
      .from("aulas")
      .select("id")
      .eq("instrutor_id", instrutorData.id)
      .eq("payment_confirmed", true)
      .not("status", "in", '("finalizada","cancelada","concluida")')
      .limit(1);

    const hasUnfinishedLessons = !unfinishedError && unfinishedLessons && unfinishedLessons.length > 0;
    logStep("Unfinished lessons check", { hasUnfinishedLessons });

    // Determine message based on status
    let message: string | null = null;
    if (recipientStatus === "affiliation") {
      message = "Para liberar seus saques, é necessário concluir a verificação de identidade (selfie).";
    } else if (recipientStatus === "refused") {
      message = "Sua conta bancária foi recusada. Por favor, reconfigure seus dados bancários.";
    } else if (recipientStatus === "suspended") {
      message = "Sua conta está suspensa. Entre em contato com o suporte.";
    }

    return new Response(
      JSON.stringify({
        success: true,
        balance,
        recipientId,
        recipientStatus,
        hasUnfinishedLessons,
        message,
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error: any) {
    logStep("Error", { message: error.message });
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
