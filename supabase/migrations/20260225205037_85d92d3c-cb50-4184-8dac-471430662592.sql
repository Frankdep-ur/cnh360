
-- Enable pg_net extension for async HTTP calls from Postgres
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Function to notify admin about new user registration (incomplete onboarding)
CREATE OR REPLACE FUNCTION public.notify_new_user_registration()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  supabase_url text;
  service_key text;
  request_id bigint;
  user_email text;
  login_provider text;
BEGIN
  -- Get Supabase URL and service key from vault/env
  supabase_url := current_setting('app.settings.supabase_url', true);
  service_key := current_setting('app.settings.service_role_key', true);

  -- If settings not available, try from the edge function URL pattern
  IF supabase_url IS NULL OR supabase_url = '' THEN
    supabase_url := 'https://kyvtlmpkjjinhjelipvr.supabase.co';
  END IF;

  -- Get user email from auth.users
  SELECT email INTO user_email FROM auth.users WHERE id = NEW.id;

  -- Determine login provider
  SELECT COALESCE(
    (SELECT raw_app_meta_data->>'provider' FROM auth.users WHERE id = NEW.id),
    'email'
  ) INTO login_provider;

  -- Only proceed if we have the service key
  IF service_key IS NOT NULL AND service_key != '' THEN
    SELECT net.http_post(
      url := supabase_url || '/functions/v1/notify-admin-registration',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || service_key
      ),
      body := jsonb_build_object(
        'tipo', 'novo_usuario',
        'dados', jsonb_build_object(
          'nome', COALESCE(NEW.full_name, 'Sem nome'),
          'email', COALESCE(user_email, 'N/A'),
          'login_via', login_provider
        )
      )
    ) INTO request_id;
  END IF;

  RETURN NEW;
END;
$function$;

-- Create trigger on profiles table
DROP TRIGGER IF EXISTS on_new_profile_notify_admin ON public.profiles;
CREATE TRIGGER on_new_profile_notify_admin
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_user_registration();
