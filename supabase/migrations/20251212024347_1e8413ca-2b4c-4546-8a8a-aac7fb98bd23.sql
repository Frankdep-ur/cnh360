-- Fix RLS policy to allow autoescola role assignment
DROP POLICY IF EXISTS "Users can insert own allowed role" ON public.user_roles;

CREATE POLICY "Users can insert own allowed role" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (
  (auth.uid() = user_id) 
  AND (role = ANY (ARRAY['aluno'::app_role, 'instrutor'::app_role, 'autoescola'::app_role]))
);