-- Create public view with only non-sensitive instructor data for marketplace
CREATE VIEW public.instrutores_public AS
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

-- Grant access to the view for anonymous and authenticated users
GRANT SELECT ON public.instrutores_public TO anon, authenticated;

-- Add comment explaining the view's purpose
COMMENT ON VIEW public.instrutores_public IS 'Public view of instructors excluding sensitive PII (CNH numbers, MEI CNPJ, DETRAN credentials)';