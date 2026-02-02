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

    // Get instructor's recipient_id
    let query = supabase
      .from("instrutores")
      .select("id, pagarme_recipient_id, kyc_status");
    
    if (instructorId) {
      query = query.eq("id", instructorId);
    } else {
      query = query.eq("user_id", user.id);
    }

    const { data: instrutorData, error: instrutorError } = await query.single();

    if (instrutorError || !instrutorData) {
      throw new Error("Instrutor não encontrado");
    }

    logStep("Instructor found", { id: instrutorData.id, hasRecipient: !!instrutorData.pagarme_recipient_id });

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

    // Generate KYC link on-demand (NO email, NO SMS)
    logStep("Generating KYC link on-demand", { recipientId });
    
    const kycResponse = await fetch(
      `https://api.pagar.me/core/v5/recipients/${recipientId}/kyc_link`,
      {
        method: "POST",
        headers: {
          "Authorization": `Basic ${btoa(pagarmeApiKey + ":")}`,
          "Content-Type": "application/json",
        },
        // Empty body - no email, no SMS
        body: JSON.stringify({}),
      }
    );

    const kycData = await kycResponse.json();
    logStep("KYC API response", { status: kycResponse.status, hasUrl: !!kycData?.url });

    if (!kycResponse.ok) {
      logStep("KYC link generation failed", kycData);
      
      // Check for specific error codes
      const errorMessage = kycData?.message || kycData?.errors?.[0]?.message || "Erro ao gerar link de verificação";
      
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

    // Update kyc_status to in_review since user is starting verification
    if (instrutorData.kyc_status === "not_started" || instrutorData.kyc_status === "refused") {
      await supabase
        .from("instrutores")
        .update({ kyc_status: "initiated", kyc_updated_at: new Date().toISOString() })
        .eq("id", instrutorData.id);
    }

    logStep("KYC link generated successfully", { 
      url: kycData.url,
      expirationDate: kycData.expiration_date 
    });

    return new Response(
      JSON.stringify({
        success: true,
        kyc_url: kycData.url,
        base64_qr_code: kycData.base64,
        expiration_date: kycData.expiration_date,
        message: "Link de verificação gerado! Complete a verificação em até 20 minutos.",
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
