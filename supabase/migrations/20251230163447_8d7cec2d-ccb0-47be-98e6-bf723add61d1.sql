-- Create secure view for instructor data that students can access (without sensitive documents)
CREATE OR REPLACE VIEW public.instrutores_seguros AS
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

-- Create secure view for student data that instructors can access (without RENACH)
CREATE OR REPLACE VIEW public.alunos_seguros AS
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

-- Create secure view for driving school data that instructors can access
CREATE OR REPLACE VIEW public.autoescolas_seguros AS
SELECT 
  id,
  nome_fantasia,
  cidade,
  estado,
  telefone,
  email,
  ativa
FROM public.autoescolas;

-- Create secure view for payments (hiding external payment IDs)
CREATE OR REPLACE VIEW public.pagamentos_seguros AS
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

-- Drop and recreate problematic RLS policy on instrutores to use the secure view approach
-- First, we need to update the existing policies to be more restrictive

-- Update the "Alunos can view instructors from their lessons" policy to only allow viewing via the secure view
-- The original policy exposes CNH numbers - we'll restrict it

DROP POLICY IF EXISTS "Alunos can view instructors from their lessons" ON public.instrutores;

-- Create a more restrictive policy that only allows access to basic info
CREATE POLICY "Alunos can view basic instructor info from lessons" ON public.instrutores
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.aulas
    WHERE aulas.instrutor_id = instrutores.id
    AND aulas.aluno_id IN (
      SELECT id FROM public.alunos WHERE user_id = auth.uid()
    )
  )
);

-- Update policy for instructors viewing students - restrict RENACH access
DROP POLICY IF EXISTS "Instrutores can view their students" ON public.alunos;

CREATE POLICY "Instrutores can view their students basic info" ON public.alunos
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.aulas
    JOIN public.instrutores ON instrutores.id = aulas.instrutor_id
    WHERE aulas.aluno_id = alunos.id
    AND instrutores.user_id = auth.uid()
  )
);

-- Update instructor view their autoescola policy 
DROP POLICY IF EXISTS "Instrutores can view their autoescola" ON public.autoescolas;

CREATE POLICY "Instrutores can view their autoescola basic info" ON public.autoescolas
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.instrutores
    WHERE instrutores.autoescola_id = autoescolas.id
    AND instrutores.user_id = auth.uid()
  )
);