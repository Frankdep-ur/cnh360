-- 1. Sync official photos from profiles to instructor cache
UPDATE public.instrutores_publico_cache ipc
SET 
  foto = p.avatar_url,
  nome = COALESCE(p.full_name, ipc.nome),
  updated_at = now()
FROM public.instrutores i
JOIN public.profiles p ON p.id = i.user_id
WHERE ipc.id = i.id
  AND p.avatar_url IS NOT NULL
  AND p.avatar_url NOT LIKE '%unsplash.com%';

-- 2. Clean up any remaining Unsplash generic photos
UPDATE public.instrutores_publico_cache
SET foto = NULL, updated_at = now()
WHERE foto LIKE '%unsplash.com%';

-- 3. Create trigger function to sync profile updates to instructor cache
CREATE OR REPLACE FUNCTION public.sync_profile_to_instrutor_cache()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Update cache when profile is changed
  UPDATE public.instrutores_publico_cache ipc
  SET 
    nome = NEW.full_name,
    foto = NEW.avatar_url,
    updated_at = now()
  FROM public.instrutores i
  WHERE i.user_id = NEW.id
    AND ipc.id = i.id;
  
  RETURN NEW;
END;
$$;

-- 4. Create trigger on profiles table
DROP TRIGGER IF EXISTS on_profile_update_sync_instrutor_cache ON public.profiles;

CREATE TRIGGER on_profile_update_sync_instrutor_cache
  AFTER UPDATE OF full_name, avatar_url ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_profile_to_instrutor_cache();