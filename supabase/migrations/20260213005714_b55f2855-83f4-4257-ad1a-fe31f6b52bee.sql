
-- Drop the overly permissive public policy
DROP POLICY IF EXISTS "Public can view all ratings" ON public.avaliacoes;

-- Only authenticated users can view ratings
CREATE POLICY "Authenticated users can view ratings"
  ON public.avaliacoes FOR SELECT
  TO authenticated
  USING (true);
