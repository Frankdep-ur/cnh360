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

    // Step 1: Try to list recipients - this is the definitive test
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

    // If listing succeeds with 200, Split is definitely enabled!
    if (listResponse.status === 200) {
      logStep("Split/Marketplace is ENABLED - list recipients succeeded");
      return new Response(
        JSON.stringify({
          enabled: true,
          reason: "list_recipients_ok",
          message: "Sistema de pagamentos configurado corretamente"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Check if listing failed due to permission issues
    const listErrorMessage = (listData.message || "").toLowerCase();
    const isListPermissionDenied =
      listErrorMessage.includes("action_forbidden") ||
      listErrorMessage.includes("not allowed") ||
      listErrorMessage.includes("company it not allowed");

    if (isListPermissionDenied) {
      logStep("Split NOT enabled - list recipients permission denied", { message: listData.message });
      return new Response(
        JSON.stringify({
          enabled: false,
          reason: "list_permission_denied",
          message: "A funcionalidade de Split/Marketplace não está habilitada na conta Pagar.me"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Step 2: If listing had an unexpected error, try creating a test recipient
    // This forces Pagar.me to check permissions more thoroughly
    logStep("Step 2: Testing recipient creation permissions");
    
    const testPayload = {
      code: `test-split-check-${Date.now()}`,
      register_information: {
        type: "individual",
        document: "00000000191",
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
        bank: "001",
        branch_number: "0001",
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

    const createErrorMessage = (createData.message || "").toLowerCase();
    const errorDetails = JSON.stringify(createData.errors || []).toLowerCase();

    // Check if it's a PERMISSION error (Split not enabled)
    const isPermissionError = 
      createErrorMessage.includes("action_forbidden") ||
      createErrorMessage.includes("not allowed to create") ||
      createErrorMessage.includes("company it not allowed") ||
      createErrorMessage.includes("is not allowed") ||
      errorDetails.includes("action_forbidden") ||
      errorDetails.includes("not allowed");

    if (isPermissionError) {
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

    // Check if it's a VALIDATION error (Split is enabled, just bad test data)
    const isValidationError =
      createErrorMessage.includes("invalid_parameter") ||
      createErrorMessage.includes("invalid format") ||
      createErrorMessage.includes("invalid") ||
      createErrorMessage.includes("required") ||
      createErrorMessage.includes("must be") ||
      createErrorMessage.includes("already exists") ||
      createErrorMessage.includes("cpf") ||
      createErrorMessage.includes("document") ||
      createErrorMessage.includes("agencia") ||
      createErrorMessage.includes("branch");

    // If we got validation errors (400, 412, 422), it means permission check PASSED
    if (isValidationError && !isPermissionError) {
      logStep("Split/Marketplace is ENABLED - validation errors confirm access", {
        status: createResponse.status,
        errorsCount: createData.errors?.length,
        message: createData.message
      });
      return new Response(
        JSON.stringify({
          enabled: true,
          reason: "validation_error_confirms_access",
          message: "Sistema de pagamentos configurado corretamente"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // For any other status (including 400, 412, 422 with unknown errors), assume enabled
    // since we couldn't definitively prove it's disabled
    logStep("Assuming Split enabled - no definitive permission denial detected", { 
      status: createResponse.status 
    });
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
