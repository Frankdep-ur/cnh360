

# Tabela de Log de Notificações Admin + Verificação dos Fluxos

## 1. Criar tabela `admin_notification_logs`

Nova tabela no banco de dados para registrar todas as notificações admin enviadas:

```sql
CREATE TABLE public.admin_notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL,              -- 'aluno', 'instrutor', 'autoescola', 'novo_usuario'
  user_id UUID,                    -- ID do usuário registrado
  nome TEXT,
  email TEXT,
  whatsapp TEXT,
  cidade TEXT,
  message_id TEXT,                 -- messageId retornado pela Z-API
  success BOOLEAN DEFAULT false,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: somente service role pode inserir (edge function)
ALTER TABLE public.admin_notification_logs ENABLE ROW LEVEL SECURITY;
-- Nenhuma policy para anon/authenticated = apenas service role tem acesso
```

## 2. Atualizar Edge Function `notify-admin-registration`

Após enviar a mensagem WhatsApp, inserir um registro na tabela `admin_notification_logs` com:
- Tipo de cadastro
- Dados do usuário (nome, email, whatsapp, cidade)
- `message_id` da Z-API
- Status de sucesso/falha
- Mensagem de erro (se houver)

## 3. Verificação dos Fluxos

Os três onboarding (aluno, instrutor, autoescola) já estão configurados corretamente:
- Todos enviam `user_id`, `nome`, `email`, `whatsapp`, `cidade` no payload
- A edge function enriquece dados faltantes do banco
- A formatação do telefone internacional está correta

Nenhuma alteração necessária nos arquivos de onboarding -- apenas a edge function e a nova tabela.

## Resumo das Mudanças

| Arquivo | Ação |
|---------|------|
| Migração SQL | Criar tabela `admin_notification_logs` |
| `supabase/functions/notify-admin-registration/index.ts` | Adicionar insert na tabela de log após envio |

