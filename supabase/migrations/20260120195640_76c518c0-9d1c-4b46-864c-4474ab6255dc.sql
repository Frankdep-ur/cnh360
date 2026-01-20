-- Allow authenticated users to view active vehicles from active instructors
-- This enables the instructor search page to display vehicle information
CREATE POLICY "Authenticated users can view active instructor vehicles"
ON public.veiculos
FOR SELECT
TO authenticated
USING (
  ativo = true 
  AND EXISTS (
    SELECT 1 FROM public.instrutores i 
    WHERE i.id = veiculos.instrutor_id 
    AND i.ativo = true
  )
);