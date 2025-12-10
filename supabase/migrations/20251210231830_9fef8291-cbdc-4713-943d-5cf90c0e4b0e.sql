-- Criar função SECURITY DEFINER para verificar se instrutor pode ver aluno
CREATE OR REPLACE FUNCTION public.instructor_can_view_student(_aluno_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.aulas a
    JOIN public.instrutores i ON a.instrutor_id = i.id
    WHERE a.aluno_id = _aluno_id AND i.user_id = auth.uid()
  )
$$;

-- Atualizar política de alunos para usar a função
DROP POLICY IF EXISTS "Instrutores can view their students" ON public.alunos;
CREATE POLICY "Instrutores can view their students" ON public.alunos
FOR SELECT USING (public.instructor_can_view_student(id));