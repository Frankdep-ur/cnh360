-- Recriar view instrutores_public sem o campo user_id
DROP VIEW IF EXISTS public.instrutores_public;

CREATE VIEW public.instrutores_public AS
SELECT 
  id,
  autoescola_id,
  cnh_categoria,
  preco_hora,
  raio_atendimento_km,
  nota_media,
  total_avaliacoes,
  total_aulas,
  ativo,
  bio,
  created_at
FROM public.instrutores
WHERE ativo = true;