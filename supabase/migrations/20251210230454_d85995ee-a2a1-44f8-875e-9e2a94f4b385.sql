-- Criar função SECURITY DEFINER para verificar se o usuário é dono do instrutor
CREATE OR REPLACE FUNCTION public.is_instructor_owner(_instrutor_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.instrutores
    WHERE id = _instrutor_id AND user_id = auth.uid()
  )
$$;

-- Criar função SECURITY DEFINER para verificar se o usuário é aluno
CREATE OR REPLACE FUNCTION public.is_student_owner(_aluno_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.alunos
    WHERE id = _aluno_id AND user_id = auth.uid()
  )
$$;

-- Atualizar política de veiculos para usar função SECURITY DEFINER
DROP POLICY IF EXISTS "Instrutores can manage own vehicles" ON public.veiculos;
CREATE POLICY "Instrutores can manage own vehicles" ON public.veiculos
FOR ALL USING (public.is_instructor_owner(instrutor_id));

-- Atualizar políticas de aulas para usar funções SECURITY DEFINER
DROP POLICY IF EXISTS "Instrutores can view own lessons" ON public.aulas;
CREATE POLICY "Instrutores can view own lessons" ON public.aulas
FOR SELECT USING (public.is_instructor_owner(instrutor_id));

DROP POLICY IF EXISTS "Alunos can view own lessons" ON public.aulas;
CREATE POLICY "Alunos can view own lessons" ON public.aulas
FOR SELECT USING (public.is_student_owner(aluno_id));

DROP POLICY IF EXISTS "Alunos can create lessons" ON public.aulas;
CREATE POLICY "Alunos can create lessons" ON public.aulas
FOR INSERT WITH CHECK (public.is_student_owner(aluno_id));

DROP POLICY IF EXISTS "Participants can update lessons" ON public.aulas;
CREATE POLICY "Participants can update lessons" ON public.aulas
FOR UPDATE USING (
  public.is_student_owner(aluno_id) OR public.is_instructor_owner(instrutor_id)
);

-- Atualizar políticas de disponibilidade
DROP POLICY IF EXISTS "Instrutores can manage own availability" ON public.disponibilidade;
CREATE POLICY "Instrutores can manage own availability" ON public.disponibilidade
FOR ALL USING (public.is_instructor_owner(instrutor_id));