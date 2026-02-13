import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);
    const { data: userData, error: userError } = await supabaseAuth.auth.getUser(token);

    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = userData.user.id;

    const { aulaId, respostas } = await req.json();

    if (!aulaId || !Array.isArray(respostas)) {
      return new Response(JSON.stringify({ error: "Missing aulaId or respostas" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role to read correct answers (bypasses RLS)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get aluno_id
    const { data: aluno } = await supabaseAdmin
      .from("alunos")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (!aluno) {
      return new Response(JSON.stringify({ error: "Student not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch correct answers (service role bypasses RLS)
    const { data: perguntas, error: perguntasError } = await supabaseAdmin
      .from("curso_quiz_perguntas")
      .select("id, resposta_correta, explicacao")
      .eq("aula_id", aulaId);

    if (perguntasError || !perguntas || perguntas.length === 0) {
      return new Response(JSON.stringify({ aprovado: true, nota: 100, acertos: 0, total: 0, detalhes: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Calculate score
    let acertos = 0;
    const detalhes = perguntas.map((pergunta) => {
      const resposta = respostas.find((r: { perguntaId: string }) => r.perguntaId === pergunta.id);
      const acertou = resposta?.resposta === pergunta.resposta_correta;
      if (acertou) acertos++;
      return {
        perguntaId: pergunta.id,
        resposta_correta: pergunta.resposta_correta,
        explicacao: pergunta.explicacao,
        acertou,
      };
    });

    const nota = Math.round((acertos / perguntas.length) * 100);
    const aprovado = nota >= 70;

    // Get previous attempts
    const { data: progressoAtual } = await supabaseAdmin
      .from("progresso_aulas")
      .select("tentativas_quiz")
      .eq("aluno_id", aluno.id)
      .eq("aula_id", aulaId)
      .maybeSingle();

    const tentativas = (progressoAtual?.tentativas_quiz || 0) + 1;

    // Upsert progress
    await supabaseAdmin
      .from("progresso_aulas")
      .upsert(
        {
          aluno_id: aluno.id,
          aula_id: aulaId,
          quiz_nota: nota,
          quiz_aprovado: aprovado,
          tentativas_quiz: tentativas,
          concluida_em: aprovado ? new Date().toISOString() : null,
          iniciada_em: new Date().toISOString(),
        },
        { onConflict: "aluno_id,aula_id" }
      );

    return new Response(
      JSON.stringify({ aprovado, nota, acertos, total: perguntas.length, detalhes }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in validate-quiz:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
