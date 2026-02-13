DROP VIEW IF EXISTS public.curso_quiz_perguntas_publico;
CREATE VIEW public.curso_quiz_perguntas_publico
  WITH (security_invoker = true) AS
  SELECT id, aula_id, ordem, pergunta, opcoes, created_at
  FROM public.curso_quiz_perguntas;
GRANT SELECT ON public.curso_quiz_perguntas_publico TO authenticated;