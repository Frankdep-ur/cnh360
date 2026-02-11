
-- 1. Add cidade column to instrutores_publico_cache
ALTER TABLE public.instrutores_publico_cache ADD COLUMN cidade text;

-- 2. Update sync_instrutor_cache to include cidade from profiles
CREATE OR REPLACE FUNCTION public.sync_instrutor_cache()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_profile_name text;
  v_profile_photo text;
  v_profile_cidade text;
BEGIN
  SELECT full_name, avatar_url, cidade INTO v_profile_name, v_profile_photo, v_profile_cidade
  FROM public.profiles
  WHERE id = NEW.user_id;

  INSERT INTO public.instrutores_publico_cache (
    id, ativo, bio, cnh_categoria, nota_media, preco_hora, 
    raio_atendimento_km, total_aulas, total_avaliacoes, nome, foto, cidade, updated_at
  ) VALUES (
    NEW.id, NEW.ativo, NEW.bio, NEW.cnh_categoria, NEW.nota_media, NEW.preco_hora,
    NEW.raio_atendimento_km, NEW.total_aulas, NEW.total_avaliacoes, 
    v_profile_name, v_profile_photo, v_profile_cidade, now()
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
    cidade = EXCLUDED.cidade,
    updated_at = now();

  RETURN NEW;
END;
$function$;

-- 3. Update sync_profile_to_instrutor_cache to also sync cidade
CREATE OR REPLACE FUNCTION public.sync_profile_to_instrutor_cache()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.instrutores_publico_cache ipc
  SET 
    nome = NEW.full_name,
    foto = NEW.avatar_url,
    cidade = NEW.cidade,
    updated_at = now()
  FROM public.instrutores i
  WHERE i.user_id = NEW.id
    AND ipc.id = i.id;
  
  RETURN NEW;
END;
$function$;

-- 4. Populate existing data from profiles
UPDATE public.instrutores_publico_cache ipc
SET cidade = p.cidade
FROM public.instrutores i
JOIN public.profiles p ON p.id = i.user_id
WHERE ipc.id = i.id AND p.cidade IS NOT NULL;
