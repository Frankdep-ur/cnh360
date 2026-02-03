import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  console.log(`[start-kyc] ${step}`, details ? JSON.stringify(details) : "");
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

    // Check if we have a valid cached KYC URL
    if (instrutorData.kyc_url && instrutorData.kyc_link_expires_at) {
      const expiresAt = new Date(instrutorData.kyc_link_expires_at);
      const now = new Date();
      
      // Add 2 minute buffer to avoid edge cases
      if (expiresAt > new Date(now.getTime() + 2 * 60 * 1000)) {
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

    // Try to generate KYC link on-demand (may fail due to IP restriction)
    logStep("Attempting to generate KYC link on-demand", { recipientId });
    
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
    logStep("KYC API response", { status: kycResponse.status, hasUrl: !!kycData?.url });

    if (!kycResponse.ok) {
      logStep("KYC link generation failed", kycData);
      
      const errorMessage = kycData?.message || kycData?.errors?.[0]?.message || "";
      
      // Check for IP restriction error
      if (errorMessage.toLowerCase().includes("ip") || 
          errorMessage.toLowerCase().includes("origem") ||
          errorMessage.toLowerCase().includes("autorizado")) {
        logStep("IP restriction detected, returning email fallback");
        
        return new Response(
          JSON.stringify({ 
            success: false,
            error: "ip_restricted",
            fallback: "email",
            message: "Por segurança, o link de verificação foi enviado para o e-mail cadastrado na sua conta. Verifique também a pasta de spam.",
          }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "kyc_link_failed",
          message: errorMessage || "Erro ao gerar link de verificação",
          details: kycData,
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Success! Save the new KYC URL to cache
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

    logStep("KYC link generated and cached successfully", { 
      url: kycData.url,
      expirationDate: kycExpiresAt 
    });

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
    logStep("Error", { message: error.message });
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
