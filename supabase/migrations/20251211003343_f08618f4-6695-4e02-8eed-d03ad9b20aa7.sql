-- Remover função pública que pode expor dados de autoescolas
DROP FUNCTION IF EXISTS public.get_public_autoescolas();

-- Criar nova função que retorna apenas dados mínimos necessários (sem dados sensíveis)
CREATE OR REPLACE FUNCTION public.get_public_autoescolas()
RETURNS TABLE(id uuid, nome_fantasia text, cidade text, estado text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT a.id, 
         COALESCE(a.nome_fantasia, 'Autoescola') as nome_fantasia, 
         a.cidade, 
         a.estado
  FROM public.autoescolas a
  WHERE a.ativa = true
$function$;

-- Garantir que a função get_public_instructors não expõe dados sensíveis
DROP FUNCTION IF EXISTS public.get_public_instructors();

CREATE OR REPLACE FUNCTION public.get_public_instructors()
RETURNS TABLE(id uuid, preco_hora numeric, nota_media numeric, total_avaliacoes integer, cnh_categoria categoria_cnh, bio text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT i.id, i.preco_hora, i.nota_media, i.total_avaliacoes, i.cnh_categoria, i.bio
  FROM public.instrutores i
  WHERE i.ativo = true
$function$;

-- Criar função para buscar nome do perfil apenas para participantes de aulas (não público)
CREATE OR REPLACE FUNCTION public.get_participant_name(p_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT p.full_name
  FROM public.profiles p
  WHERE p.id = p_user_id
    AND (
      -- Usuário está buscando seu próprio nome
      p.id = auth.uid()
      OR
      -- Usuário é instrutor que tem aula com este aluno
      EXISTS (
        SELECT 1 FROM public.aulas a
        JOIN public.instrutores i ON a.instrutor_id = i.id
        JOIN public.alunos al ON a.aluno_id = al.id
        WHERE i.user_id = auth.uid() AND al.user_id = p_user_id
      )
      OR
      -- Usuário é aluno que tem aula com este instrutor
      EXISTS (
        SELECT 1 FROM public.aulas a
        JOIN public.alunos al ON a.aluno_id = al.id
        JOIN public.instrutores i ON a.instrutor_id = i.id
        WHERE al.user_id = auth.uid() AND i.user_id = p_user_id
      )
    )
$function$;