

# Correcao do Trigger de Cadastro Incompleto

## Status Atual

- **Edge Function `notify-admin-registration`**: FUNCIONANDO. Teste enviou mensagem com sucesso (messageId: 97780BEA825CDC68C791). Voce deve ter recebido a mensagem no WhatsApp agora mesmo.
- **Onboarding (cadastro completo)**: Codigo integrado nos 3 onboardings (aluno, instrutor, autoescola). Funcionara quando um usuario completar o cadastro.
- **Trigger de cadastro incompleto**: NAO FUNCIONA. O `app.settings.service_role_key` nao esta configurado no PostgreSQL, entao o trigger `pg_net` nao consegue autenticar na edge function.

## Correcao Necessaria

### Alternativa: Usar anon key no trigger (em vez de service_role_key)

Como o `app.settings.service_role_key` nao esta disponivel no PostgreSQL e a edge function `notify-admin-registration` ja tem `verify_jwt = false`, podemos usar a **anon key** diretamente no trigger. Isso funciona porque:

1. A edge function nao valida JWT (verify_jwt = false)
2. A edge function chama `send-whatsapp-notification` usando o service_role_key que ela mesma obtem via `Deno.env`
3. A anon key e publica e ja esta disponivel

### Migration SQL

Atualizar a funcao `notify_new_user_registration()` para:
- Usar a anon key hardcoded (ja e publica, nao e segredo)
- Remover a dependencia de `app.settings.service_role_key`

```sql
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
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
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
```

### Remover validacao de service_role_key na edge function

A edge function `notify-admin-registration` atualmente **nao valida** o caller (nao tem `validateInternalCall`), entao ja funciona com qualquer token. Nenhuma mudanca necessaria na edge function.

## Resultado Esperado

Apos a correcao:
1. **Novo usuario cria conta** -> trigger dispara -> WhatsApp enviado com "Aguardando completar cadastro"
2. **Usuario completa onboarding** -> chamada do frontend -> WhatsApp enviado com "Cadastro finalizado"
