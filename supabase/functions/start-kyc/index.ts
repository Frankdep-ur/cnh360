import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`[start-kyc][${timestamp}] ${step}`, details ? JSON.stringify(details) : "");
};

const logError = (step: string, error: any) => {
  const timestamp = new Date().toISOString();
  console.error(`[start-kyc][${timestamp}] ERROR - ${step}`, {
    message: error?.message || error,
    status: error?.status,
    body: error?.body || error?.errors,
  });
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

    // Parse request body (optional instructor_id for admin use)
    let instructorId: string | null = null;
    try {
      const body = await req.json();
      instructorId = body.instructor_id || null;
    } catch {
      // No body provided, will use authenticated user
    }

    // Get instructor's recipient_id and cached KYC URL
    let query = supabase
      .from("instrutores")
      .select("id, pagarme_recipient_id, kyc_status, kyc_url, kyc_base64, kyc_link_expires_at");
    
    if (instructorId) {
      query = query.eq("id", instructorId);
    } else {
      query = query.eq("user_id", user.id);
    }

    const { data: instrutorData, error: instrutorError } = await query.single();

    if (instrutorError || !instrutorData) {
      throw new Error("Instrutor não encontrado");
    }

    logStep("Instructor found", { 
      id: instrutorData.id, 
      hasRecipient: !!instrutorData.pagarme_recipient_id,
      hasCachedKycUrl: !!instrutorData.kyc_url,
      kycExpiresAt: instrutorData.kyc_link_expires_at
    });

    if (!instrutorData.pagarme_recipient_id) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "recipient_not_found",
          message: "Dados bancários não configurados. Configure primeiro para iniciar a verificação.",
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    const recipientId = instrutorData.pagarme_recipient_id;

    // First, check current recipient status
    logStep("Checking recipient status", { recipientId });
    
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
    logStep("Recipient status", { recipientStatus });

    // If already active, no need for KYC
    if (recipientStatus === "active") {
      // Update local status if needed
      if (instrutorData.kyc_status !== "approved") {
        await supabase
          .from("instrutores")
          .update({ kyc_status: "approved", kyc_updated_at: new Date().toISOString() })
          .eq("id", instrutorData.id);
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          status: "already_active",
          message: "Sua conta já está verificada e ativa! Você pode fazer saques normalmente.",
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // If recipient was refused, they need to re-register before KYC
    if (recipientStatus === "refused") {
      logStep("Recipient is refused, needs to re-register");
      
      // Update local status to refused
      if (instrutorData.kyc_status !== "refused") {
        await supabase
          .from("instrutores")
          .update({ kyc_status: "refused", kyc_updated_at: new Date().toISOString() })
          .eq("id", instrutorData.id);
      }

      return new Response(
        JSON.stringify({ 
          success: false,
          error: "recipient_refused",
          message: "Seu cadastro foi recusado pela verificação. Clique em 'Recadastrar dados bancários' para tentar novamente com dados corretos.",
          recipientStatus: "refused",
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // If recipient is suspended, they cannot do KYC
    if (recipientStatus === "suspended") {
      logStep("Recipient is suspended");
      
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "recipient_suspended",
          message: "Sua conta está suspensa. Entre em contato com o suporte para resolver.",
          recipientStatus: "suspended",
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Check if we have a valid cached KYC URL
    if (instrutorData.kyc_url && instrutorData.kyc_link_expires_at) {
      const expiresAt = new Date(instrutorData.kyc_link_expires_at);
      const now = new Date();
      
      // If recipient is in "affiliation" status, Pagar.me may have invalidated previous tokens
      // Always generate a fresh link in this case
      if (recipientStatus === "affiliation") {
        logStep("Status is affiliation, invalidating cached KYC URL to avoid 'access denied'", {
          previousUrl: instrutorData.kyc_url,
          recipientStatus,
        });
        
        // Clear cached link from database
        await supabase
          .from("instrutores")
          .update({ 
            kyc_url: null, 
            kyc_base64: null, 
            kyc_link_expires_at: null,
            kyc_updated_at: new Date().toISOString(),
          })
          .eq("id", instrutorData.id);
        
        logStep("Cached KYC link cleared, will generate fresh link");
        // Fall through to generate a new link below
      }
      // Add 2 minute buffer to avoid edge cases
      else if (expiresAt > new Date(now.getTime() + 2 * 60 * 1000)) {
        logStep("Using cached KYC URL", { 
          url: instrutorData.kyc_url, 
          expiresAt: instrutorData.kyc_link_expires_at 
        });
        
        // Update status to initiated
        if (instrutorData.kyc_status === "not_started" || instrutorData.kyc_status === "refused") {
          await supabase
            .from("instrutores")
            .update({ kyc_status: "initiated", kyc_updated_at: new Date().toISOString() })
            .eq("id", instrutorData.id);
        }
        
        return new Response(
          JSON.stringify({
            success: true,
            kyc_url: instrutorData.kyc_url,
            base64_qr_code: instrutorData.kyc_base64,
            expiration_date: instrutorData.kyc_link_expires_at,
            message: "Complete a verificação em até 20 minutos.",
            source: "cached",
          }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      } else {
        logStep("Cached KYC URL expired", { expiresAt: instrutorData.kyc_link_expires_at });
      }
    }

    // Generate KYC link on-demand
    logStep("Iniciando geração de link KYC", { 
      recipientId,
      apiKeyMasked: pagarmeApiKey.substring(0, 10) + "...",
    });
    
    const kycEndpoint = `https://api.pagar.me/core/v5/recipients/${recipientId}/kyc_link`;
    logStep("Chamando endpoint", { url: kycEndpoint });
    
    const kycResponse = await fetch(kycEndpoint, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${btoa(pagarmeApiKey + ":")}`,
        "Content-Type": "application/json",
      },
      // Body vazio - NÃO enviar parâmetros de email/SMS
    });

    const kycData = await kycResponse.json();
    logStep("KYC API response", { 
      status: kycResponse.status, 
      hasUrl: !!kycData?.url,
      expirationDate: kycData?.expiration_date,
    });

    if (!kycResponse.ok) {
      logError("KYC link generation failed", {
        status: kycResponse.status,
        message: kycData?.message,
        errors: kycData?.errors,
        body: kycData,
      });
      
      // Handle 403 - Pagar.me may temporarily block link generation during processing
      if (kycResponse.status === 403) {
        logStep("Received 403 from Pagar.me, clearing cached link and returning friendly message");
        
        // Clear any cached link to prevent reuse
        await supabase
          .from("instrutores")
          .update({ 
            kyc_url: null, 
            kyc_base64: null, 
            kyc_link_expires_at: null,
            kyc_updated_at: new Date().toISOString(),
          })
          .eq("id", instrutorData.id);
        
        return new Response(
          JSON.stringify({ 
            success: false,
            error: "kyc_processing",
            message: "A verificação está sendo processada pela instituição financeira. Aguarde alguns minutos e tente novamente.",
          }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      }
      
      const errorMessage = kycData?.message || kycData?.errors?.[0]?.message || "Erro desconhecido";
      
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "kyc_link_failed",
          message: errorMessage,
          details: kycData,
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }
    
    // Success!
    logStep("KYC link gerado com sucesso", { 
      url: kycData.url,
      expirationDate: kycData.expiration_date,
      hasQrCode: !!kycData.base64,
    });

    // Log final de sucesso
    console.log(`KYC link gerado com sucesso para recipient_id: ${recipientId}`);

    // Save the new KYC URL to cache
    const kycExpiresAt = kycData.expiration_date || new Date(Date.now() + 20 * 60 * 1000).toISOString();
    
    await supabase
      .from("instrutores")
      .update({ 
        kyc_url: kycData.url,
        kyc_base64: kycData.base64 || null,
        kyc_link_expires_at: kycExpiresAt,
        kyc_status: instrutorData.kyc_status === "not_started" || instrutorData.kyc_status === "refused" 
          ? "initiated" 
          : instrutorData.kyc_status,
        kyc_updated_at: new Date().toISOString(),
      })
      .eq("id", instrutorData.id);

    logStep("KYC link salvo no banco com sucesso");

    return new Response(
      JSON.stringify({
        success: true,
        kyc_url: kycData.url,
        base64_qr_code: kycData.base64,
        expiration_date: kycExpiresAt,
        message: "Link de verificação gerado! Complete a verificação em até 20 minutos.",
        source: "fresh",
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error: any) {
    logError("Erro interno", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: "internal_error",
        message: error.message 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
