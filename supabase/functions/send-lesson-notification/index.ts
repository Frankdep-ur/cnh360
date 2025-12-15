import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LessonNotificationPayload {
  aula_id: string;
  aluno_nome: string;
  instrutor_id: string;
  instrutor_email: string;
  instrutor_nome: string;
  data_hora: string;
  duracao_minutos: number;
  ponto_encontro: string;
  valor: number;
  usa_carro_aluno: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload: LessonNotificationPayload = await req.json();
    console.log("Received lesson notification payload:", payload);

    const {
      aula_id,
      aluno_nome,
      instrutor_id,
      instrutor_email,
      instrutor_nome,
      data_hora,
      duracao_minutos,
      ponto_encontro,
      valor,
      usa_carro_aluno,
    } = payload;

    // Format date for display
    const dataFormatada = new Date(data_hora).toLocaleString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

    // 1. Get instructor's user_id from instrutores table
    const { data: instrutorData, error: instrutorError } = await supabase
      .from("instrutores")
      .select("user_id")
      .eq("id", instrutor_id)
      .single();

    if (instrutorError) {
      console.error("Error fetching instructor:", instrutorError);
      throw new Error("Instructor not found");
    }

    const instrutorUserId = instrutorData.user_id;
    console.log("Instructor user_id:", instrutorUserId);

    // 2. Save in-app notification
    const { error: notificationError } = await supabase
      .from("notifications")
      .insert({
        user_id: instrutorUserId,
        title: "Nova solicitação de aula!",
        body: `${aluno_nome} quer agendar uma aula de ${duracao_minutos} minutos para ${dataFormatada}. Local: ${ponto_encontro}. Valor: R$ ${valor.toFixed(2)}`,
        type: "nova_aula",
        reference_id: aula_id,
      });

    if (notificationError) {
      console.error("Error saving notification:", notificationError);
    } else {
      console.log("In-app notification saved successfully");
    }

    // 3. Send email notification via Resend
    if (resendApiKey && instrutor_email) {
      const resend = new Resend(resendApiKey);

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 30px; border-radius: 16px 16px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🚗 Nova Solicitação de Aula!</h1>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 16px 16px;">
            <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
              Olá <strong>${instrutor_nome}</strong>,
            </p>
            
            <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
              Você recebeu uma nova solicitação de aula prática!
            </p>
            
            <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
              <h3 style="color: #7c3aed; margin-top: 0;">Detalhes da Aula:</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;">Aluno:</td>
                  <td style="padding: 8px 0; color: #111827; font-weight: 600;">${aluno_nome}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;">Data/Hora:</td>
                  <td style="padding: 8px 0; color: #111827; font-weight: 600;">${dataFormatada}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;">Duração:</td>
                  <td style="padding: 8px 0; color: #111827; font-weight: 600;">${duracao_minutos} minutos</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;">Local:</td>
                  <td style="padding: 8px 0; color: #111827; font-weight: 600;">${ponto_encontro}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;">Veículo:</td>
                  <td style="padding: 8px 0; color: #111827; font-weight: 600;">${usa_carro_aluno ? "Carro do aluno" : "Seu veículo"}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;">Valor:</td>
                  <td style="padding: 8px 0; color: #7c3aed; font-weight: 700; font-size: 18px;">R$ ${valor.toFixed(2)}</td>
                </tr>
              </table>
            </div>
            
            <p style="font-size: 14px; color: #6b7280; margin-bottom: 20px;">
              Acesse o app CNH 360 para aceitar ou recusar esta solicitação.
            </p>
            
            <div style="text-align: center;">
              <a href="#" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">
                Abrir App CNH 360
              </a>
            </div>
          </div>
          
          <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 20px;">
            CNH 360 - Sua plataforma de aulas práticas
          </p>
        </div>
      `;

      try {
        const emailResponse = await resend.emails.send({
          from: "CNH 360 <onboarding@resend.dev>",
          to: [instrutor_email],
          subject: `🚗 Nova aula de ${aluno_nome} - ${dataFormatada}`,
          html: emailHtml,
        });

        console.log("Email sent successfully:", emailResponse);
      } catch (emailError) {
        console.error("Error sending email:", emailError);
        // Don't throw - we still want to save the in-app notification
      }
    } else {
      console.log("Resend API key not configured or no instructor email, skipping email notification");
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Notification sent successfully",
        notification_saved: !notificationError 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-lesson-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
