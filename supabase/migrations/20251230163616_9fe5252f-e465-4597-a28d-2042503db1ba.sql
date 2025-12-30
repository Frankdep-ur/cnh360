-- Fix Security Definer Views by using SECURITY INVOKER instead
-- Drop and recreate views with proper security context

DROP VIEW IF EXISTS public.instrutores_seguros;
DROP VIEW IF EXISTS public.alunos_seguros;
DROP VIEW IF EXISTS public.autoescolas_seguros;
DROP VIEW IF EXISTS public.pagamentos_seguros;

-- Recreate views with SECURITY INVOKER (default, so no need to specify)
-- These views will respect the RLS policies of the underlying tables

CREATE VIEW public.instrutores_seguros
WITH (security_invoker = true)
AS
SELECT 
  i.id,
  i.user_id,
  i.bio,
  i.cnh_categoria,
  i.nota_media,
  i.preco_hora,
  i.raio_atendimento_km,
  i.total_aulas,
  i.total_avaliacoes,
  i.ativo,
  i.autoescola_id,
  i.is_mei_autonomo,
  p.full_name,
  p.avatar_url
FROM public.instrutores i
LEFT JOIN public.profiles p ON p.id = i.user_id;

CREATE VIEW public.alunos_seguros
WITH (security_invoker = true)
AS
SELECT 
  a.id,
  a.user_id,
  a.categoria_pretendida,
  a.objetivo,
  a.possui_carro_proprio,
  a.horas_praticas_completadas,
  a.horas_praticas_total,
  a.exame_teorico_aprovado,
  a.exame_pratico_aprovado,
  p.full_name,
  p.avatar_url,
  p.phone
FROM public.alunos a
LEFT JOIN public.profiles p ON p.id = a.user_id;

CREATE VIEW public.autoescolas_seguros
WITH (security_invoker = true)
AS
SELECT 
  id,
  nome_fantasia,
  cidade,
  estado,
  telefone,
  email,
  ativa
FROM public.autoescolas;

CREATE VIEW public.pagamentos_seguros
WITH (security_invoker = true)
AS
SELECT 
  id,
  aula_id,
  aluno_id,
  instrutor_id,
  valor_bruto,
  valor_instrutor,
  taxa_plataforma,
  metodo,
  status,
  pago_em,
  created_at,
  updated_at
FROM public.pagamentos;

-- Grant SELECT permissions on views
GRANT SELECT ON public.instrutores_seguros TO authenticated;
GRANT SELECT ON public.alunos_seguros TO authenticated;
GRANT SELECT ON public.autoescolas_seguros TO authenticated;
GRANT SELECT ON public.pagamentos_seguros TO authenticated;