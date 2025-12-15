-- Add name and photo columns to public instructor cache
ALTER TABLE public.instrutores_publico_cache 
ADD COLUMN IF NOT EXISTS nome text,
ADD COLUMN IF NOT EXISTS foto text;

-- Create function to sync instructor cache with profile data
CREATE OR REPLACE FUNCTION public.sync_instrutor_cache()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile_name text;
  v_profile_photo text;
BEGIN
  -- Get profile data
  SELECT full_name, avatar_url INTO v_profile_name, v_profile_photo
  FROM public.profiles
  WHERE id = NEW.user_id;

  -- Upsert into cache
  INSERT INTO public.instrutores_publico_cache (
    id, ativo, bio, cnh_categoria, nota_media, preco_hora, 
    raio_atendimento_km, total_aulas, total_avaliacoes, nome, foto, updated_at
  ) VALUES (
    NEW.id, NEW.ativo, NEW.bio, NEW.cnh_categoria, NEW.nota_media, NEW.preco_hora,
    NEW.raio_atendimento_km, NEW.total_aulas, NEW.total_avaliacoes, 
    v_profile_name, v_profile_photo, now()
  )
  ON CONFLICT (id) DO UPDATE SET
    ativo = EXCLUDED.ativo,
    bio = EXCLUDED.bio,
    cnh_categoria = EXCLUDED.cnh_categoria,
    nota_media = EXCLUDED.nota_media,
    preco_hora = EXCLUDED.preco_hora,
    raio_atendimento_km = EXCLUDED.raio_atendimento_km,
    total_aulas = EXCLUDED.total_aulas,
    total_avaliacoes = EXCLUDED.total_avaliacoes,
    nome = EXCLUDED.nome,
    foto = EXCLUDED.foto,
    updated_at = now();

  RETURN NEW;
END;
$$;

-- Create trigger to auto-sync on instructor changes
DROP TRIGGER IF EXISTS sync_instrutor_cache_trigger ON public.instrutores;
CREATE TRIGGER sync_instrutor_cache_trigger
AFTER INSERT OR UPDATE ON public.instrutores
FOR EACH ROW
EXECUTE FUNCTION public.sync_instrutor_cache();