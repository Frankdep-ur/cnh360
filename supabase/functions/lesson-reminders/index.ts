import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.87.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-edge-secret",
};

// Validate internal edge function secret
function validateEdgeSecret(req: Request): boolean {
  const edgeSecret = Deno.env.get("EDGE_FUNCTION_SECRET");
  if (!edgeSecret) {
    console.warn("EDGE_FUNCTION_SECRET not configured");
    return false;
  }
  
  const providedSecret = req.headers.get("x-edge-secret");
  return providedSecret === edgeSecret;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Validate the edge secret for internal/cron calls
  if (!validateEdgeSecret(req)) {
    console.error("Invalid or missing edge secret");
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get lessons that are 1 hour from now (with a 5 minute window)
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    const windowStart = new Date(oneHourFromNow.getTime() - 5 * 60 * 1000);
    const windowEnd = new Date(oneHourFromNow.getTime() + 5 * 60 * 1000);

    console.log(`Checking for lessons between ${windowStart.toISOString()} and ${windowEnd.toISOString()}`);

    const { data: upcomingLessons, error: lessonsError } = await supabase
      .from("aulas")
      .select(`
        id,
        data_hora,
        ponto_encontro,
        aluno_id,
        instrutor_id,
        alunos!inner(user_id),
        instrutores!inner(user_id)
      `)
      .gte("data_hora", windowStart.toISOString())
      .lte("data_hora", windowEnd.toISOString())
      .in("status", ["confirmada", "pendente"]);

    if (lessonsError) {
      console.error("Error fetching lessons:", lessonsError);
      throw lessonsError;
    }

    console.log(`Found ${upcomingLessons?.length || 0} upcoming lessons`);

    if (!upcomingLessons || upcomingLessons.length === 0) {
      return new Response(
        JSON.stringify({ success: true, reminders_sent: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let remindersSent = 0;

    for (const lesson of upcomingLessons) {
      const lessonTime = new Date(lesson.data_hora);
      const formattedTime = lessonTime.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });

      // Send reminder to student
      const studentUserId = (lesson.alunos as any)?.user_id;
      if (studentUserId) {
        await supabase.from("notifications").insert({
          user_id: studentUserId,
          title: "Lembrete de Aula",
          body: `Sua aula começa às ${formattedTime}${lesson.ponto_encontro ? ` em ${lesson.ponto_encontro}` : ""}`,
          type: "lesson_reminder",
          reference_id: lesson.id,
        });
        remindersSent++;
        console.log(`Sent reminder to student: ${studentUserId}`);
      }

      // Send reminder to instructor
      const instructorUserId = (lesson.instrutores as any)?.user_id;
      if (instructorUserId) {
        await supabase.from("notifications").insert({
          user_id: instructorUserId,
          title: "Lembrete de Aula",
          body: `Você tem uma aula às ${formattedTime}${lesson.ponto_encontro ? ` em ${lesson.ponto_encontro}` : ""}`,
          type: "lesson_reminder",
          reference_id: lesson.id,
        });
        remindersSent++;
        console.log(`Sent reminder to instructor: ${instructorUserId}`);
      }
    }

    return new Response(
      JSON.stringify({ success: true, reminders_sent: remindersSent }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in lesson-reminders:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
