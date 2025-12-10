-- =====================================================
-- FIX 1: Restringir tabela instrutores (usar a view para acesso público)
-- =====================================================

-- Remover policy pública que expõe dados sensíveis
DROP POLICY IF EXISTS "Public can view active instructors" ON public.instrutores;

-- Criar policy que permite apenas o próprio instrutor ver seus dados completos
CREATE POLICY "Instrutores can view own full data"
ON public.instrutores
FOR SELECT
USING (auth.uid() = user_id);

-- Permitir alunos verem instrutores das suas aulas (dados completos necessários para aula)
CREATE POLICY "Alunos can view instructors from their lessons"
ON public.instrutores
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM aulas a
    JOIN alunos al ON a.aluno_id = al.id
    WHERE a.instrutor_id = instrutores.id
    AND al.user_id = auth.uid()
  )
);

-- =====================================================
-- FIX 2: Criar view pública para autoescolas (sem dados sensíveis)
-- =====================================================

CREATE VIEW public.autoescolas_public
WITH (security_invoker = true) AS
SELECT 
  id,
  nome_fantasia,
  cidade,
  estado,
  ativa,
  created_at
FROM public.autoescolas
WHERE ativa = true;

-- Dar acesso à view
GRANT SELECT ON public.autoescolas_public TO anon, authenticated;

COMMENT ON VIEW public.autoescolas_public IS 'View pública de autoescolas sem dados sensíveis (CNPJ, email, telefone, endereço)';

-- =====================================================
-- FIX 3: Restringir tabela autoescolas
-- =====================================================

-- Remover policy pública
DROP POLICY IF EXISTS "Public can view active autoescolas" ON public.autoescolas;

-- Criar policy para própria autoescola ver seus dados
CREATE POLICY "Autoescolas can view own full data"
ON public.autoescolas
FOR SELECT
USING (auth.uid() = user_id);

-- Permitir instrutores vinculados verem dados da autoescola
CREATE POLICY "Instrutores can view their autoescola"
ON public.autoescolas
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM instrutores i
    WHERE i.autoescola_id = autoescolas.id
    AND i.user_id = auth.uid()
  )
);