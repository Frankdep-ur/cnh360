-- Dropar políticas problemáticas que causam recursão infinita
DROP POLICY IF EXISTS "Alunos can view basic instructor info from lessons" ON public.instrutores;
DROP POLICY IF EXISTS "Instrutores can view their students basic info" ON public.alunos;
DROP POLICY IF EXISTS "Instrutores can view their autoescola basic info" ON public.autoescolas;

-- Criar funções SECURITY DEFINER para quebrar o ciclo de recursão
CREATE OR REPLACE FUNCTION public.get_user_aluno_id(user_uuid uuid)
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT id FROM public.alunos WHERE user_id = user_uuid LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_user_instrutor_id(user_uuid uuid)
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT id FROM public.instrutores WHERE user_id = user_uuid LIMIT 1;
$$;

-- Nova política para instrutores - permite alunos verem instrutores de suas aulas
CREATE POLICY "Alunos can view instructors from lessons" ON public.instrutores
FOR SELECT USING (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM public.aulas 
    WHERE aulas.instrutor_id = instrutores.id 
    AND aulas.aluno_id = public.get_user_aluno_id(auth.uid())
  )
);

-- Nova política para alunos - permite instrutores verem seus alunos
CREATE POLICY "Instrutores can view their students" ON public.alunos
FOR SELECT USING (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM public.aulas 
    WHERE aulas.aluno_id = alunos.id 
    AND aulas.instrutor_id = public.get_user_instrutor_id(auth.uid())
  )
);

-- Nova política para autoescolas - permite instrutores verem sua autoescola
CREATE POLICY "Instrutores can view their autoescola" ON public.autoescolas
FOR SELECT USING (
  auth.uid() = user_id 
  OR id = (SELECT autoescola_id FROM public.instrutores WHERE user_id = auth.uid() LIMIT 1)
);