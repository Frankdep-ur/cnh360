
-- =====================================================
-- CORREÇÃO DE SEGURANÇA COMPLETA - CNH 360
-- =====================================================

-- 1. CORRIGIR ESCALAÇÃO DE PRIVILÉGIOS EM USER_ROLES
-- Remover política que permite inserir qualquer role
DROP POLICY IF EXISTS "Users can insert own role" ON public.user_roles;

-- Criar nova política que restringe roles permitidas (apenas aluno e instrutor)
CREATE POLICY "Users can insert own allowed role"
ON public.user_roles
FOR INSERT
WITH CHECK (
  auth.uid() = user_id 
  AND role IN ('aluno'::app_role, 'instrutor'::app_role)
);

-- 2. BLOQUEAR ACESSO ANÔNIMO A TODAS AS TABELAS SENSÍVEIS

-- profiles: bloquear anônimos
CREATE POLICY "Block anonymous access to profiles"
ON public.profiles
FOR SELECT
TO anon
USING (false);

-- alunos: bloquear anônimos
CREATE POLICY "Block anonymous access to alunos"
ON public.alunos
FOR SELECT
TO anon
USING (false);

-- instrutores: bloquear anônimos
CREATE POLICY "Block anonymous access to instrutores"
ON public.instrutores
FOR SELECT
TO anon
USING (false);

-- autoescolas: bloquear anônimos
CREATE POLICY "Block anonymous access to autoescolas"
ON public.autoescolas
FOR SELECT
TO anon
USING (false);

-- aulas: bloquear anônimos
CREATE POLICY "Block anonymous access to aulas"
ON public.aulas
FOR SELECT
TO anon
USING (false);

-- pagamentos: bloquear anônimos
CREATE POLICY "Block anonymous access to pagamentos"
ON public.pagamentos
FOR SELECT
TO anon
USING (false);

-- user_roles: bloquear anônimos
CREATE POLICY "Block anonymous access to user_roles"
ON public.user_roles
FOR SELECT
TO anon
USING (false);

-- veiculos: bloquear anônimos e adicionar política de leitura para participantes
CREATE POLICY "Block anonymous access to veiculos"
ON public.veiculos
FOR SELECT
TO anon
USING (false);

-- Permitir alunos verem veículos de suas aulas
CREATE POLICY "Students can view vehicles from their lessons"
ON public.veiculos
FOR SELECT
TO authenticated
USING (
  is_instructor_owner(instrutor_id) 
  OR EXISTS (
    SELECT 1 FROM public.aulas a
    JOIN public.alunos al ON a.aluno_id = al.id
    WHERE a.veiculo_id = veiculos.id AND al.user_id = auth.uid()
  )
);

-- progresso_renach: bloquear anônimos
CREATE POLICY "Block anonymous access to progresso_renach"
ON public.progresso_renach
FOR SELECT
TO anon
USING (false);

-- logs_renach: bloquear anônimos
CREATE POLICY "Block anonymous access to logs_renach"
ON public.logs_renach
FOR SELECT
TO anon
USING (false);

-- validacoes_gps: bloquear anônimos
CREATE POLICY "Block anonymous access to validacoes_gps"
ON public.validacoes_gps
FOR SELECT
TO anon
USING (false);

-- 3. ADICIONAR POLÍTICAS DE PROTEÇÃO DE INTEGRIDADE

-- Impedir deleção/modificação de avaliações
CREATE POLICY "Prevent rating updates"
ON public.avaliacoes
FOR UPDATE
USING (false);

CREATE POLICY "Prevent rating deletion"
ON public.avaliacoes
FOR DELETE
USING (false);

-- Impedir modificação/deleção de validações GPS (dados de auditoria)
CREATE POLICY "Prevent GPS validation updates"
ON public.validacoes_gps
FOR UPDATE
USING (false);

CREATE POLICY "Prevent GPS validation deletion"
ON public.validacoes_gps
FOR DELETE
USING (false);

-- Impedir deleção de progresso RENACH (dados críticos)
CREATE POLICY "Prevent progress deletion"
ON public.progresso_renach
FOR DELETE
USING (false);

-- Permitir que alunos criem seu próprio progresso
CREATE POLICY "Students can create own progress"
ON public.progresso_renach
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.alunos
    WHERE id = aluno_id AND user_id = auth.uid()
  )
);

-- 4. PROTEGER LOGS RENACH
CREATE POLICY "Prevent logs_renach updates"
ON public.logs_renach
FOR UPDATE
USING (false);

CREATE POLICY "Prevent logs_renach deletion"
ON public.logs_renach
FOR DELETE
USING (false);
