-- Add UNIQUE constraint to localizacao_tempo_real for proper upsert
ALTER TABLE public.localizacao_tempo_real
ADD CONSTRAINT localizacao_tempo_real_user_aula_unique UNIQUE (user_id, aula_id);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_localizacao_aula_updated 
ON public.localizacao_tempo_real (aula_id, updated_at DESC);

-- Create function to auto-cleanup old locations (> 2 hours)
CREATE OR REPLACE FUNCTION public.cleanup_old_locations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.localizacao_tempo_real
  WHERE updated_at < NOW() - INTERVAL '2 hours';
END;
$$;