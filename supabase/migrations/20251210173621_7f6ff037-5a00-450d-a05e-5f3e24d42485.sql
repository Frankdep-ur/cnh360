-- Drop and recreate view with SECURITY INVOKER (safer - respects querying user's permissions)
DROP VIEW IF EXISTS public.instrutores_public;

CREATE VIEW public.instrutores_public 
WITH (security_invoker = true) AS
SELECT 
  id,
  user_id,
  bio,
  preco_hora,
  raio_atendimento_km,
  nota_media,
  total_avaliacoes,
  total_aulas,
  ativo,
  cnh_categoria,
  created_at,
  autoescola_id
FROM public.instrutores
WHERE ativo = true;

-- Grant access to the view
GRANT SELECT ON public.instrutores_public TO anon, authenticated;

COMMENT ON VIEW public.instrutores_public IS 'Public view of instructors excluding sensitive PII (CNH numbers, MEI CNPJ, DETRAN credentials)';