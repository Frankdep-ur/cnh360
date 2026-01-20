import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-RECIPIENT] ${step}${detailsStr}`);
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
      throw new Error("PAGARME_API_KEY not configured");
    }

    // Verify user
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser(token);
    
    if (userError || !user) {
      logStep("Auth failed", { error: userError?.message });
      throw new Error("Unauthorized");
    }

    logStep("User authenticated", { userId: user.id });

    // Parse request body
    const body = await req.json();
    const {
      type, // "individual" or "company"
      documentNumber, // CPF or CNPJ
      name,
      email,
      bankCode,
      agencia,
      agenciaDv,
      conta,
      contaDv,
      accountType, // "checking" or "savings"
      pixKey, // Optional - if provided, use PIX instead of bank account
    } = body;

    // Validate required fields
    if (!type || !documentNumber || !name || !email) {
      throw new Error("Missing required fields: type, documentNumber, name, email");
    }

    if (!pixKey && (!bankCode || !agencia || !conta || !accountType)) {
      throw new Error("Either pixKey or bank account details are required");
    }

    logStep("Building recipient payload", { type, documentNumber: documentNumber.slice(0, 4) + "***" });

    // Build recipient payload
    const recipientPayload: any = {
      register_information: {
        type: type, // "individual" or "company"
        document_number: documentNumber.replace(/\D/g, ""),
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
      code: `instrutor-${user.id.slice(0, 8)}-${Date.now()}`
    };

    // Add bank account or PIX
    if (pixKey) {
      recipientPayload.default_bank_account = {
        holder_name: name.trim(),
        holder_type: type,
        holder_document: documentNumber.replace(/\D/g, ""),
        bank: "000", // PIX uses special bank code
        branch_number: "0001",
        branch_check_digit: "0",
        account_number: "0000000",
        account_check_digit: "0",
        type: "checking",
        metadata: {
          pix_key: pixKey
        }
      };
    } else {
      recipientPayload.default_bank_account = {
        holder_name: name.trim(),
        holder_type: type,
        holder_document: documentNumber.replace(/\D/g, ""),
        bank: bankCode.padStart(3, "0"),
        branch_number: agencia,
        branch_check_digit: agenciaDv || "",
        account_number: conta,
        account_check_digit: contaDv || "",
        type: accountType // "checking" or "savings"
      };
    }

    logStep("Creating recipient in Pagar.me");

    // Create recipient in Pagar.me
    const pagarmeResponse = await fetch("https://api.pagar.me/core/v5/recipients", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${btoa(pagarmeApiKey + ":")}`,
      },
      body: JSON.stringify(recipientPayload),
    });

    const pagarmeData = await pagarmeResponse.json();

    if (!pagarmeResponse.ok) {
      logStep("Pagar.me error", pagarmeData);
      
      // Map common errors to user-friendly messages
      let errorMessage = "Erro ao criar recebedor na Pagar.me";
      
      if (pagarmeData.message) {
        if (pagarmeData.message.includes("document")) {
          errorMessage = "CPF/CNPJ inválido ou já cadastrado";
        } else if (pagarmeData.message.includes("bank")) {
          errorMessage = "Dados bancários inválidos";
        } else if (pagarmeData.message.includes("email")) {
          errorMessage = "E-mail inválido";
        } else {
          errorMessage = pagarmeData.message;
        }
      }
      
      throw new Error(errorMessage);
    }

    const recipientId = pagarmeData.id;
    logStep("Recipient created", { recipientId });

    // Update instructor with recipient_id
    const supabaseService = createClient(supabaseUrl, supabaseServiceKey);
    
    const { error: updateError } = await supabaseService
      .from("instrutores")
      .update({ pagarme_recipient_id: recipientId })
      .eq("user_id", user.id);

    if (updateError) {
      logStep("Failed to save recipient_id", { error: updateError.message });
      throw new Error("Recebedor criado mas falhou ao salvar no banco");
    }

    logStep("Recipient ID saved to database");

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
    logStep("Error", { message: error.message });
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
