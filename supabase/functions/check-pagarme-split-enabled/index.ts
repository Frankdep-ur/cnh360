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

    // First check: Try to list recipients (basic connectivity)
    logStep("Step 1: Checking if we can list recipients");
    
    const listResponse = await fetch("https://api.pagar.me/core/v5/recipients?page=1&size=1", {
      method: "GET",
      headers: {
        "Authorization": `Basic ${btoa(pagarmeApiKey + ":")}`,
        "Content-Type": "application/json",
      },
    });

    const listText = await listResponse.text();
    logStep("List recipients response", { status: listResponse.status });

    let listData: any = {};
    try {
      listData = JSON.parse(listText);
    } catch {
      logStep("Failed to parse list response as JSON");
    }

    // If listing fails with 412 or forbidden, Split is definitely not enabled
    if (!listResponse.ok) {
      const isDisabled =
        listResponse.status === 412 ||
        listData.message?.toLowerCase().includes("action_forbidden") ||
        listData.message?.toLowerCase().includes("not allowed");

      if (isDisabled) {
        logStep("Split not enabled - cannot even list recipients");
        return new Response(
          JSON.stringify({
            enabled: false,
            reason: "split_not_enabled",
            message: "A funcionalidade de Split/Marketplace não está habilitada na conta Pagar.me"
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }
    }

    // Second check: Try to create a recipient with minimal invalid data
    // This will fail with validation error if creation is allowed, or action_forbidden if not
    logStep("Step 2: Testing if we can create recipients (dry-run)");
    
    const testPayload = {
      name: "TEST_VALIDATION_CHECK",
      document: "00000000000", // Invalid CPF - will fail validation if creation is allowed
      type: "individual",
      code: `test-check-${Date.now()}`,
    };

    const createResponse = await fetch("https://api.pagar.me/core/v5/recipients", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${btoa(pagarmeApiKey + ":")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testPayload),
    });

    const createText = await createResponse.text();
    logStep("Create test response", { status: createResponse.status, body: createText.substring(0, 500) });

    let createData: any = {};
    try {
      createData = JSON.parse(createText);
    } catch {
      logStep("Failed to parse create response as JSON");
    }

    // Check if the creation attempt was blocked due to permissions (not validation)
    const createErrorMessage = (createData.message || "").toLowerCase();
    const isCreationBlocked = 
      createResponse.status === 412 ||
      createErrorMessage.includes("action_forbidden") ||
      createErrorMessage.includes("not allowed to create") ||
      createErrorMessage.includes("company it not allowed");

    if (isCreationBlocked) {
      logStep("Split enabled for listing but NOT for creating recipients");
      return new Response(
        JSON.stringify({
          enabled: false,
          reason: "creation_not_allowed",
          message: "A conta Pagar.me pode listar recebedores, mas não pode criar novos. Habilite o Split/Marketplace completo no dashboard Pagar.me."
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // If we got here, either:
    // 1. Creation failed with validation error (400) - which means creation IS allowed
    // 2. Some other error occurred
    
    // A 400 with validation errors means the endpoint is accessible
    if (createResponse.status === 400 || createResponse.status === 422) {
      logStep("Split/Marketplace is fully enabled - creation endpoint accessible");
      return new Response(
        JSON.stringify({
          enabled: true,
          reason: "ok",
          message: "Sistema de pagamentos configurado corretamente"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Unexpected response - log and assume it might work
    logStep("Unexpected create response, assuming enabled", { status: createResponse.status });
    return new Response(
      JSON.stringify({
        enabled: true,
        reason: "assumed_ok",
        message: "Sistema de pagamentos aparenta estar configurado"
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
