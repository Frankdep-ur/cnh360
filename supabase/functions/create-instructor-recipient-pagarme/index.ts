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
      // Campos adicionais para pessoa física (Pagar.me V5)
      birthdate,
      monthlyIncome,
      professionalOccupation,
      address,
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
    const registerInfo: any = {
      type: type,
      document: cleanDocument,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone_numbers: [
        {
          ddd: "11",
          number: "999999999",
          type: "mobile"
        }
      ]
    };

    // Campos adicionais obrigatórios para pessoa física
    if (type === "individual") {
      if (!birthdate) {
        throw new Error("Data de nascimento é obrigatória para pessoa física");
      }
      if (!address || !address.street || !address.streetNumber || !address.neighborhood || !address.city || !address.state || !address.zipCode) {
        throw new Error("Endereço completo é obrigatório para pessoa física");
      }

      // Converter data para formato DD/MM/YYYY se estiver em YYYY-MM-DD
      const birthdateParts = birthdate.split("-");
      const formattedBirthdate = birthdateParts.length === 3 
        ? `${birthdateParts[2]}/${birthdateParts[1]}/${birthdateParts[0]}`
        : birthdate;
      registerInfo.birthdate = formattedBirthdate;
      registerInfo.monthly_income = monthlyIncome || 300000; // Em centavos (R$ 3.000,00)
      registerInfo.professional_occupation = professionalOccupation || "instrutor_transito";
      registerInfo.address = {
        street: address.street,
        street_number: address.streetNumber,
        complementary: address.complement || "N/A",
        neighborhood: address.neighborhood,
        city: address.city,
        state: address.state,
        zip_code: address.zipCode.replace(/\D/g, ""),
        reference_point: address.referencePoint || "N/A"
      };
    }

    const recipientPayload = {
      code: `instrutor-${user.id.slice(0, 8)}-${Date.now()}`,
      register_information: registerInfo,
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
      
      // Mapeamento detalhado de erros para mensagens amigáveis
      const errorMappings: Record<string, string> = {
        // Erros de agência
        "branch_number": "Número da agência inválido. Verifique se digitou corretamente.",
        "branch_check_digit": "Dígito da agência incorreto ou faltando. Confira no seu cartão (ex: 63-9).",
        "agencia_dv": "Dígito da agência obrigatório. Ex: Agência 63-9 → Dígito é '9'",
        "branch": "Agência não encontrada para este banco.",
        
        // Erros de conta
        "account_number": "Número da conta inválido. Verifique se digitou corretamente.",
        "account_check_digit": "Dígito verificador da conta incorreto. Confira no seu cartão ou extrato.",
        "account": "Conta bancária inválida.",
        
        // Erros de documento
        "holder_document": "CPF/CNPJ do titular não confere com a conta bancária.",
        "document_number": "CPF/CNPJ inválido na Receita Federal.",
        "document": "CPF/CNPJ inválido ou já cadastrado.",
        
        // Erros de banco
        "bank": "Código do banco inválido ou não suportado.",
        "bank_code": "Banco não suportado para saques automáticos.",
        
        // Erros de titular
        "holder_name": "Nome do titular inválido ou não confere.",
        "holder_type": "Tipo de pessoa (física/jurídica) inválido.",
        
        // Erros de duplicidade
        "already exists": "Esta conta bancária já está vinculada a outro recebedor.",
        "recipient already exists": "Já existe um recebedor cadastrado com esses dados.",
        "duplicate": "Dados já cadastrados no sistema.",
        
        // Erros de autenticação
        "authorization": "Erro de autenticação. Entre em contato com o suporte.",
        "unauthorized": "Erro de autenticação. Entre em contato com o suporte.",
        "denied": "Acesso negado. Entre em contato com o suporte.",
        
        // Erros de configuração da conta
        "split settings enabled": "Sistema de pagamentos em configuração. Entre em contato com o suporte para habilitar os recebimentos.",
        "split": "Funcionalidade de pagamentos split não habilitada. Entre em contato com o suporte.",
        "action_forbidden": "A funcionalidade de recebedores não está habilitada na conta Pagar.me. Entre em contato com o suporte CNH360 para ativar.",
        "not allowed to create a recipient": "A funcionalidade de recebedores não está habilitada na conta Pagar.me. Entre em contato com o suporte CNH360 para ativar.",
        
        // Erros genéricos
        "email": "E-mail inválido.",
        "phone": "Telefone inválido.",
      };
      
      let errorMessage = "Erro ao criar recebedor na Pagar.me";
      let foundSpecificError = false;
      
      // Primeiro, verificar os erros específicos no array de errors
      if (pagarmeData.errors && Array.isArray(pagarmeData.errors)) {
        for (const err of pagarmeData.errors) {
          const errMsg = (err.message || err.description || "").toLowerCase();
          const errParam = (err.parameter || err.field || "").toLowerCase();
          
          logStep("Processing error", { errMsg, errParam });
          
          // Procurar match no mapeamento
          for (const [key, friendlyMsg] of Object.entries(errorMappings)) {
            if (errMsg.includes(key) || errParam.includes(key)) {
              errorMessage = friendlyMsg;
              foundSpecificError = true;
              break;
            }
          }
          
          if (foundSpecificError) break;
        }
        
        // Se não encontrou no mapeamento, usar a mensagem original traduzida
        if (!foundSpecificError && pagarmeData.errors[0]) {
          const firstErr = pagarmeData.errors[0];
          errorMessage = firstErr.message || firstErr.description || errorMessage;
        }
      }
      
      // Se não encontrou nos errors, verificar na mensagem principal
      if (!foundSpecificError && pagarmeData.message) {
        const msg = pagarmeData.message.toLowerCase();
        
        for (const [key, friendlyMsg] of Object.entries(errorMappings)) {
          if (msg.includes(key)) {
            errorMessage = friendlyMsg;
            foundSpecificError = true;
            break;
          }
        }
        
        // Se ainda não encontrou, usar a mensagem original
        if (!foundSpecificError) {
          errorMessage = pagarmeData.message;
        }
      }
      
      logStep("Final error message", { errorMessage, foundSpecificError });
      throw new Error(errorMessage);
    }

    const recipientId = pagarmeData.id;
    logStep("Recipient created successfully", { recipientId, status: pagarmeData.status });

    // Update instructor with recipient_id
    const supabaseService = createClient(supabaseUrl, supabaseServiceKey);
    
    // Try to generate KYC link immediately after creating recipient
    // This may work if done from the same session/IP, avoiding the allowlist issue
    let kycUrl: string | null = null;
    let kycBase64: string | null = null;
    let kycExpiresAt: string | null = null;
    
    try {
      logStep("Attempting to generate KYC link immediately after recipient creation");
      
      const kycResponse = await fetch(
        `https://api.pagar.me/core/v5/recipients/${recipientId}/kyc_link`,
        {
          method: "POST",
          headers: {
            "Authorization": `Basic ${btoa(pagarmeApiKey + ":")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        }
      );
      
      const kycData = await kycResponse.json();
      logStep("KYC link response", { status: kycResponse.status, hasUrl: !!kycData?.url });
      
      if (kycResponse.ok && kycData?.url) {
        kycUrl = kycData.url;
        kycBase64 = kycData.base64 || null;
        // Link expires in 20 minutes
        kycExpiresAt = kycData.expiration_date || new Date(Date.now() + 20 * 60 * 1000).toISOString();
        logStep("KYC link generated successfully", { url: kycUrl, expiresAt: kycExpiresAt });
      } else {
        logStep("KYC link generation failed (will use fallback)", { 
          error: kycData?.message || kycData?.errors?.[0]?.message 
        });
      }
    } catch (kycError: any) {
      logStep("KYC link generation error (will use fallback)", { error: kycError.message });
    }
    
    // Update instructor with recipient_id and KYC link (if available)
    const updateData: any = { 
      pagarme_recipient_id: recipientId,
      kyc_status: "not_started",
    };
    
    if (kycUrl) {
      updateData.kyc_url = kycUrl;
      updateData.kyc_base64 = kycBase64;
      updateData.kyc_link_expires_at = kycExpiresAt;
    }
    
    const { error: updateError } = await supabaseService
      .from("instrutores")
      .update(updateData)
      .eq("user_id", user.id);

    if (updateError) {
      logStep("Failed to save recipient_id to database", { error: updateError.message });
      throw new Error("Recebedor criado mas falhou ao salvar no banco de dados");
    }

    logStep("Recipient ID saved to database successfully", { hasKycLink: !!kycUrl });

    return new Response(
      JSON.stringify({
        success: true,
        recipientId,
        kycUrl,
        kycExpiresAt,
        message: kycUrl 
          ? "Dados bancários configurados! Complete a verificação de identidade."
          : "Dados bancários configurados com sucesso!"
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
