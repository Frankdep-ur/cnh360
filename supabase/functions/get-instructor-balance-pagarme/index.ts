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

    // Get instructor's recipient_id
    const { data: instrutorData, error: instrutorError } = await supabase
      .from("instrutores")
      .select("id, pagarme_recipient_id")
      .eq("user_id", user.id)
      .single();

    if (instrutorError || !instrutorData) {
      throw new Error("Instrutor não encontrado");
    }

    if (!instrutorData.pagarme_recipient_id) {
      // Return 200 with needsSetup flag instead of 400 error
      // This allows the frontend to handle it gracefully
      return new Response(
        JSON.stringify({ 
          success: false,
          needsSetup: true,
          message: "Dados bancários não configurados",
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200, // Use 200 so frontend doesn't treat as error
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

    // Parse balance data from Pagar.me response
    // Pagar.me returns amounts in cents
    const balance: BalanceResponse = {
      available: (balanceData.available?.amount || 0) / 100,
      waitingFunds: (balanceData.waiting_funds?.amount || 0) / 100,
      transferred: (balanceData.transferred?.amount || 0) / 100,
      currency: balanceData.available?.currency || "BRL",
    };

    return new Response(
      JSON.stringify({
        success: true,
        balance,
        recipientId,
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
