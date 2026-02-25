CREATE OR REPLACE FUNCTION public.notify_new_user_registration()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  request_id bigint;
  user_email text;
  login_provider text;
BEGIN
  SELECT email INTO user_email FROM auth.users WHERE id = NEW.id;

  SELECT COALESCE(
    (SELECT raw_app_meta_data->>'provider' FROM auth.users WHERE id = NEW.id),
    'email'
  ) INTO login_provider;

  SELECT net.http_post(
    url := 'https://kyvtlmpkjjinhjelipvr.supabase.co/functions/v1/notify-admin-registration',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5dnRsbXBramppbmhqZWxpcHZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzNzk3MTYsImV4cCI6MjA4MDk1NTcxNn0.BW20n5vTVhKFjhaxvsPyPN1XMsTszjW5O7hI2_uHfmw'
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

  RETURN NEW;
END;
$function$;