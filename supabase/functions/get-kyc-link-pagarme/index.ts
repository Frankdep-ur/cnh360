import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  console.log(`[get-kyc-link-pagarme] ${step}`, details ? JSON.stringify(details) : "");
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
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Dados bancários não configurados. Configure primeiro para gerar o link de verificação.",
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    const recipientId = instrutorData.pagarme_recipient_id;
    logStep("Generating KYC link for recipient", { recipientId });

    // First, check recipient status
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
    
    if (!recipientResponse.ok) {
      logStep("Error fetching recipient", recipientData);
      throw new Error("Erro ao consultar recebedor na Pagar.me");
    }

    const recipientStatus = recipientData?.status;
    logStep("Recipient status", { recipientStatus, kycDetails: recipientData?.kyc_details });

    // If already active, no need for KYC
    if (recipientStatus === "active") {
      return new Response(
        JSON.stringify({ 
          success: true,
          message: "Sua conta já está ativa! Você pode fazer saques normalmente.",
          alreadyActive: true,
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Generate KYC link
    const kycResponse = await fetch(
      `https://api.pagar.me/core/v5/recipients/${recipientId}/kyc_link`,
      {
        method: "POST",
        headers: {
          "Authorization": `Basic ${btoa(pagarmeApiKey + ":")}`,
          "Content-Type": "application/json",
        },
      }
    );

    const kycData = await kycResponse.json();

    if (!kycResponse.ok) {
      logStep("Error generating KYC link", kycData);
      
      // Check if it's an IP authorization error (Pagar.me requires whitelisted IPs)
      if (kycData?.message?.includes("IP de origem não autorizado") || 
          kycData?.message?.includes("IP") ||
          kycData?.message?.includes("autorizado")) {
        return new Response(
          JSON.stringify({ 
            success: false,
            needsManualVerification: true,
            recipientStatus: recipientStatus,
            message: "A verificação de identidade requer acesso direto. Entre em contato com nosso suporte via WhatsApp para receber o link de verificação.",
            supportPhone: "5511999999999", // Número do suporte
          }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      }
      
      // Check if KYC is not required (some edge cases)
      if (kycData?.message?.includes("not required") || kycData?.message?.includes("already")) {
        return new Response(
          JSON.stringify({ 
            success: false,
            error: "Verificação já realizada ou não necessária. Aguarde a aprovação automática.",
          }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      }

      throw new Error(kycData?.message || "Erro ao gerar link de verificação");
    }

    logStep("KYC link generated successfully", { 
      url: kycData.url,
      expirationDate: kycData.expiration_date 
    });

    return new Response(
      JSON.stringify({
        success: true,
        url: kycData.url,
        base64QrCode: kycData.base64,
        expirationDate: kycData.expiration_date,
        message: "Link de verificação gerado! Você tem 20 minutos para completar.",
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
