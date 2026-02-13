
-- Drop the permissive policy that exposes answers
DROP POLICY IF EXISTS "Anyone can view quiz questions" ON public.curso_quiz_perguntas;

-- Block direct access to base table (answers hidden)
CREATE POLICY "Block direct access to quiz questions"
  ON public.curso_quiz_perguntas FOR SELECT
  USING (false);

-- Create a safe view WITHOUT resposta_correta and explicacao
CREATE VIEW public.curso_quiz_perguntas_publico AS
  SELECT id, aula_id, ordem, pergunta, opcoes, created_at
  FROM public.curso_quiz_perguntas;

-- Only authenticated users can access the view
GRANT SELECT ON public.curso_quiz_perguntas_publico TO authenticated;
REVOKE ALL ON public.curso_quiz_perguntas_publico FROM anon;
