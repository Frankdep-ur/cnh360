-- Fix permissive RLS policy on aulas_auditoria (Item 3)
-- Drop the overly permissive INSERT policy
DROP POLICY IF EXISTS "Service role can insert audit" ON public.aulas_auditoria;

-- Create a proper INSERT policy that only allows authenticated users to insert their own audit records
CREATE POLICY "Authenticated users can insert own audit"
ON public.aulas_auditoria
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);