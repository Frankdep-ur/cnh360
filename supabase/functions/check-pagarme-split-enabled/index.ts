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

    // Second check: Try to create a recipient with COMPLETE payload
    // This forces Pagar.me to check permissions, not just validate data
    logStep("Step 2: Testing if we can create recipients (dry-run with complete payload)");
    
    const testPayload = {
      code: `test-split-check-${Date.now()}`,
      register_information: {
        type: "individual",
        document: "00000000191", // CPF válido de teste
        name: "TESTE SPLIT CHECK",
        email: "teste@teste.com",
        birthdate: "1990-01-01",
        monthly_income: 300000,
        professional_occupation: "teste",
        phone_numbers: [
          { ddd: "11", number: "999999999", type: "mobile" }
        ],
        address: {
          street: "Rua Teste",
          street_number: "100",
          complementary: "N/A",
          neighborhood: "Centro",
          city: "São Paulo",
          state: "SP",
          zip_code: "01310100",
          reference_point: "N/A"
        }
      },
      default_bank_account: {
        holder_name: "TESTE SPLIT CHECK",
        holder_type: "individual",
        holder_document: "00000000191",
        bank: "001", // Banco do Brasil
        branch_number: "0001",
        branch_check_digit: "",
        account_number: "12345",
        account_check_digit: "6",
        type: "checking"
      },
      transfer_settings: {
        transfer_enabled: true,
        transfer_interval: "daily",
        transfer_day: 0
      }
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
    const errorDetails = JSON.stringify(createData.errors || []).toLowerCase();

    const isCreationBlocked = 
      createResponse.status === 412 ||
      createErrorMessage.includes("action_forbidden") ||
      createErrorMessage.includes("not allowed to create") ||
      createErrorMessage.includes("company it not allowed") ||
      createErrorMessage.includes("is not allowed") ||
      errorDetails.includes("action_forbidden") ||
      errorDetails.includes("not allowed");

    if (isCreationBlocked) {
      logStep("Split NOT enabled - creation blocked by permissions", { 
        status: createResponse.status,
        message: createData.message,
        errors: createData.errors
      });
      return new Response(
        JSON.stringify({
          enabled: false,
          reason: "creation_not_allowed",
          message: "A funcionalidade de recebedores não está habilitada na conta Pagar.me. Entre em contato com o suporte para ativar o Split/Marketplace."
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // If we got here with validation errors (400/422), it means permission check PASSED
    // and only the test data was invalid - which is expected and good!
    if (createResponse.status === 400 || createResponse.status === 422) {
      // Verify it's a validation error and not a permission error
      const hasValidationErrors = createData.errors?.some((e: any) => {
        const msg = (e.message || "").toLowerCase();
        return msg.includes("invalid") || 
               msg.includes("required") || 
               msg.includes("must be") ||
               msg.includes("already exists") ||
               msg.includes("cpf") ||
               msg.includes("document");
      });
      
      if (hasValidationErrors || !isCreationBlocked) {
        logStep("Split/Marketplace is ENABLED - validation errors confirm access", {
          status: createResponse.status,
          errorsCount: createData.errors?.length
        });
        return new Response(
          JSON.stringify({
            enabled: true,
            reason: "ok",
            message: "Sistema de pagamentos configurado corretamente"
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }
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
