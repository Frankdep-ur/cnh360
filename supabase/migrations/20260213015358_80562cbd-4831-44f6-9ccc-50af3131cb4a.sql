
DROP POLICY IF EXISTS "Block direct access to quiz questions" ON public.curso_quiz_perguntas;

CREATE POLICY "Authenticated can read quiz questions"
  ON public.curso_quiz_perguntas
  FOR SELECT
  TO authenticated
  USING (true);
