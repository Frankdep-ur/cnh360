import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${step}`, details ? JSON.stringify(details, null, 2) : "");
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Starting Split/Marketplace verification");

    const pagarmeApiKey = Deno.env.get("PAGARME_API_KEY");
    if (!pagarmeApiKey) {
      logStep("ERROR: PAGARME_API_KEY not configured");
      return new Response(
        JSON.stringify({
          enabled: false,
          reason: "api_key_missing",
          message: "Chave da API de pagamentos não configurada"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    logStep("Attempting to list recipients to check if Split is enabled");

    // Try to list recipients - this endpoint fails with 412 if Split is not enabled
    const response = await fetch("https://api.pagar.me/core/v5/recipients?page=1&size=1", {
      method: "GET",
      headers: {
        "Authorization": `Basic ${btoa(pagarmeApiKey + ":")}`,
        "Content-Type": "application/json",
      },
    });

    const responseText = await response.text();
    logStep("Pagar.me response", { status: response.status, body: responseText });

    let data: any = {};
    try {
      data = JSON.parse(responseText);
    } catch {
      logStep("Failed to parse response as JSON");
    }

    // Check for Split not enabled errors
    if (!response.ok) {
      const isDisabled =
        response.status === 412 ||
        data.message?.toLowerCase().includes("action_forbidden") ||
        data.message?.toLowerCase().includes("not allowed") ||
        data.message?.toLowerCase().includes("recipient") ||
        data.errors?.some((e: any) =>
          e.message?.toLowerCase().includes("forbidden") ||
          e.message?.toLowerCase().includes("not allowed")
        );

      logStep("Split check failed", { isDisabled, status: response.status });

      if (isDisabled) {
        return new Response(
          JSON.stringify({
            enabled: false,
            reason: "split_not_enabled",
            message: "A funcionalidade de Split/Marketplace não está habilitada na conta Pagar.me"
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }

      // Other API error
      return new Response(
        JSON.stringify({
          enabled: false,
          reason: "api_error",
          message: data.message || "Erro ao verificar configuração de pagamentos"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Success - Split is enabled
    logStep("Split/Marketplace is enabled", { 
      recipientCount: Array.isArray(data.data) ? data.data.length : 0 
    });

    return new Response(
      JSON.stringify({
        enabled: true,
        reason: "ok",
        message: "Sistema de pagamentos configurado corretamente"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error: any) {
    logStep("ERROR: Unexpected error", { message: error.message, stack: error.stack });

    return new Response(
      JSON.stringify({
        enabled: false,
        reason: "connection_error",
        message: "Erro de conexão ao verificar sistema de pagamentos"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  }
});

