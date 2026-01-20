import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-RECIPIENT] ${step}${detailsStr}`);
};

// Lista de bancos suportados pela Pagar.me para saques automáticos
// Bancos digitais como PicPay (380), Stone (197), Neon (655) NÃO são suportados
const SUPPORTED_BANKS = [
  "001", // Banco do Brasil
  "033", // Santander
  "104", // Caixa Econômica
  "237", // Bradesco
  "341", // Itaú
  "260", // Nubank
  "077", // Inter
  "336", // C6 Bank
  "756", // Sicoob
  "748", // Sicredi
  "422", // Safra
  "212", // Banco Original
  "290", // PagBank
];

const UNSUPPORTED_BANKS: Record<string, string> = {
  "380": "PicPay",
  "197": "Stone",
  "655": "Neon",
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Starting recipient creation");

    // Auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization header required");
    }

    const token = authHeader.replace("Bearer ", "");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const pagarmeApiKey = Deno.env.get("PAGARME_API_KEY");

    if (!pagarmeApiKey) {
      logStep("PAGARME_API_KEY not found in environment");
      throw new Error("PAGARME_API_KEY not configured");
    }

    // Log key format (apenas primeiros caracteres para debug)
    const keyPreview = pagarmeApiKey.substring(0, 10) + "...";
    logStep("API Key loaded", { keyPreview, keyLength: pagarmeApiKey.length });

    // Verify user
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser(token);
    
    if (userError || !user) {
      logStep("Auth failed", { error: userError?.message });
      throw new Error("Unauthorized");
    }

    logStep("User authenticated", { userId: user.id, email: user.email });

    // Parse request body
    const body = await req.json();
    logStep("Request body received", { 
      type: body.type,
      hasBankCode: !!body.bankCode,
      bankCode: body.bankCode,
      hasAgencia: !!body.agencia,
      hasConta: !!body.conta
    });

    const {
      type,
      documentNumber,
      name,
      email,
      bankCode,
      agencia,
      agenciaDv,
      conta,
      contaDv,
      accountType,
    } = body;

    // Validate required fields
    if (!type || !documentNumber || !name || !email) {
      throw new Error("Preencha todos os campos obrigatórios: tipo, documento, nome e e-mail");
    }

    if (!bankCode || !agencia || !conta || !accountType) {
      throw new Error("Dados bancários incompletos. Informe banco, agência, conta e tipo de conta.");
    }

    // Validate bank code
    const cleanBankCode = bankCode.replace(/\D/g, "").padStart(3, "0");
    
    // Check if bank is explicitly unsupported
    if (UNSUPPORTED_BANKS[cleanBankCode]) {
      throw new Error(`O banco ${UNSUPPORTED_BANKS[cleanBankCode]} (${cleanBankCode}) não é suportado para saques automáticos. Por favor, escolha um banco tradicional como Itaú, Bradesco, Nubank, etc.`);
    }

    logStep("Building recipient payload", { 
      type, 
      documentNumber: documentNumber.slice(0, 4) + "***",
      bankCode: cleanBankCode,
      agencia,
      accountType
    });

    // Clean document number
    const cleanDocument = documentNumber.replace(/\D/g, "");
    
    // Validate CPF/CNPJ length
    if (type === "individual" && cleanDocument.length !== 11) {
      throw new Error("CPF deve ter 11 dígitos");
    }
    if (type === "company" && cleanDocument.length !== 14) {
      throw new Error("CNPJ deve ter 14 dígitos");
    }

    // Build recipient payload for Pagar.me V5
    const recipientPayload = {
      register_information: {
        type: type,
        document_number: cleanDocument,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone_numbers: [
          {
            ddd: "11",
            number: "999999999",
            type: "mobile"
          }
        ]
      },
      transfer_settings: {
        transfer_enabled: true,
        transfer_interval: "daily",
        transfer_day: 0
      },
      automatic_anticipation_settings: {
        enabled: true,
        type: "full",
        volume_percentage: 100,
        delay: null
      },
      code: `instrutor-${user.id.slice(0, 8)}-${Date.now()}`,
      default_bank_account: {
        holder_name: name.trim(),
        holder_type: type,
        holder_document: cleanDocument,
        bank: cleanBankCode,
        branch_number: agencia.replace(/\D/g, ""),
        branch_check_digit: agenciaDv?.replace(/\D/g, "") || "",
        account_number: conta.replace(/\D/g, ""),
        account_check_digit: contaDv || "",
        type: accountType
      }
    };

    logStep("Recipient payload built", {
      code: recipientPayload.code,
      bankAccount: {
        bank: recipientPayload.default_bank_account.bank,
        branch: recipientPayload.default_bank_account.branch_number,
        account: recipientPayload.default_bank_account.account_number,
        type: recipientPayload.default_bank_account.type
      }
    });

    logStep("Calling Pagar.me API");

    // Create recipient in Pagar.me V5
    const pagarmeResponse = await fetch("https://api.pagar.me/core/v5/recipients", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${btoa(pagarmeApiKey + ":")}`,
      },
      body: JSON.stringify(recipientPayload),
    });

    const responseStatus = pagarmeResponse.status;
    const responseText = await pagarmeResponse.text();
    
    logStep("Pagar.me response received", { 
      status: responseStatus,
      statusText: pagarmeResponse.statusText
    });

    let pagarmeData: any;
    try {
      pagarmeData = JSON.parse(responseText);
    } catch {
      logStep("Failed to parse response as JSON", { responseText: responseText.slice(0, 500) });
      throw new Error("Resposta inválida da Pagar.me");
    }

    if (!pagarmeResponse.ok) {
      logStep("Pagar.me API error", { 
        status: responseStatus,
        message: pagarmeData.message,
        errors: pagarmeData.errors,
        fullResponse: pagarmeData
      });
      
      // Map common errors to user-friendly messages
      let errorMessage = "Erro ao criar recebedor na Pagar.me";
      
      if (pagarmeData.message) {
        const msg = pagarmeData.message.toLowerCase();
        
        if (msg.includes("authorization") || msg.includes("denied") || msg.includes("unauthorized")) {
          errorMessage = "Erro de autenticação com a Pagar.me. Entre em contato com o suporte.";
          logStep("Auth error - API Key may be invalid or expired");
        } else if (msg.includes("document")) {
          errorMessage = "CPF/CNPJ inválido ou já cadastrado";
        } else if (msg.includes("bank") || msg.includes("branch") || msg.includes("account")) {
          errorMessage = "Dados bancários inválidos. Verifique banco, agência e conta.";
        } else if (msg.includes("email")) {
          errorMessage = "E-mail inválido";
        } else {
          errorMessage = pagarmeData.message;
        }
      }
      
      // Check for specific errors array
      if (pagarmeData.errors && Array.isArray(pagarmeData.errors)) {
        const errorDetails = pagarmeData.errors.map((e: any) => e.message || e.description).join("; ");
        logStep("Error details from API", { errorDetails });
        if (errorDetails) {
          errorMessage = errorDetails;
        }
      }
      
      throw new Error(errorMessage);
    }

    const recipientId = pagarmeData.id;
    logStep("Recipient created successfully", { recipientId, status: pagarmeData.status });

    // Update instructor with recipient_id
    const supabaseService = createClient(supabaseUrl, supabaseServiceKey);
    
    const { error: updateError } = await supabaseService
      .from("instrutores")
      .update({ pagarme_recipient_id: recipientId })
      .eq("user_id", user.id);

    if (updateError) {
      logStep("Failed to save recipient_id to database", { error: updateError.message });
      throw new Error("Recebedor criado mas falhou ao salvar no banco de dados");
    }

    logStep("Recipient ID saved to database successfully");

    return new Response(
      JSON.stringify({
        success: true,
        recipientId,
        message: "Dados bancários configurados com sucesso!"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error: any) {
    logStep("Final error", { message: error.message, stack: error.stack?.slice(0, 200) });
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
