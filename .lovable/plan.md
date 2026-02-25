

# Notificacao Admin via WhatsApp para Novos Cadastros

## Resumo

Criar um sistema automatico que envia uma mensagem WhatsApp para o numero administrador (+351 961 395 247) sempre que:
1. Um novo usuario **completa** o onboarding (aluno, instrutor ou autoescola)
2. Um novo usuario **cria conta** mas ainda nao completou o onboarding

## Arquitetura

```text
Cadastro Completo:
  AlunoOnboarding.tsx ─────┐
  InstrutorOnboarding.tsx ──┼──> Edge Function: notify-admin-registration
  AutoescolaOnboarding.tsx ─┘          │
                                       ▼
                              send-whatsapp-notification
                                       │
                                       ▼
                              WhatsApp Admin: +351961395247

Cadastro Incompleto (apenas criou conta):
  handle_new_user() trigger ──> pg_net HTTP call ──> notify-admin-registration
                                                          │
                                                          ▼
                                                WhatsApp Admin: +351961395247
```

## Alteracoes

### 1. Nova Edge Function: `notify-admin-registration`

Criar `supabase/functions/notify-admin-registration/index.ts`:

- Recebe payload com tipo (`aluno`, `instrutor`, `autoescola` ou `novo_usuario`)
- Monta mensagem formatada conforme o tipo
- Chama `send-whatsapp-notification` com `{ phone: "351961395247", message }` usando service role key
- Validacao interna via service role key (mesma abordagem do send-whatsapp-notification)

Mensagens por tipo:

**Aluno completo:**
```
🚨 NOVO ALUNO CADASTRADO - CNH360
👤 Nome: {nome}
📧 E-mail: {email}
📱 WhatsApp: {whatsapp}
📍 Cidade: {cidade}
🪪 Categoria pretendida: {categoria}
📅 Data do cadastro: {data}
Status: Cadastro finalizado ✅
```

**Instrutor completo:**
```
🚨 NOVO INSTRUTOR CADASTRADO - CNH360
👤 Nome: {nome}
📧 E-mail: {email}
📱 WhatsApp: {whatsapp}
📍 Cidade: {cidade}
🚘 Categoria: B
📅 Data do cadastro: {data}
Status: Cadastro finalizado ✅
```

**Autoescola completa:**
```
🚨 NOVA AUTOESCOLA CADASTRADA - CNH360
🏢 Nome: {nome_fantasia}
👤 Responsável: {responsavel}
📧 E-mail: {email}
📱 WhatsApp: {whatsapp}
📍 Cidade: {cidade}
📅 Data do cadastro: {data}
Status: Cadastro finalizado ✅
```

**Novo usuario (incompleto):**
```
⚠️ NOVO USUARIO REGISTRADO - CNH360
👤 Nome: {nome}
📧 E-mail: {email}
🔑 Login via: {google/email}
📅 Data: {data}
Status: Aguardando completar cadastro ⏳
```

### 2. Trigger no banco de dados para cadastros incompletos

Criar migration SQL que:
- Habilita a extensao `pg_net` (para HTTP calls do Postgres)
- Cria uma funcao `notify_new_user_registration()` que dispara apos INSERT na tabela `profiles`
- Faz um HTTP POST para a edge function `notify-admin-registration` com os dados do novo usuario
- Usa `net.http_post` para chamada assincrona

### 3. Modificar paginas de Onboarding

**AlunoOnboarding.tsx** (linha ~293, apos `navigate("/aluno")`):
- Adicionar chamada `supabase.functions.invoke("notify-admin-registration", { body: { tipo, dados } })`
- Fire-and-forget (nao bloqueia o usuario)

**InstrutorOnboarding.tsx** (linha ~321, apos `navigate("/instrutor")`):
- Mesma logica

**AutoescolaOnboarding.tsx** (linha ~222, apos `navigate("/autoescola")`):
- Mesma logica

### 4. Configuracao

- Adicionar `notify-admin-registration` ao `supabase/config.toml` com `verify_jwt = false`
- O numero admin (+351961395247) sera hardcoded na edge function como constante
- Usa os mesmos secrets Z-API ja configurados (ZAPI_INSTANCE_ID, ZAPI_TOKEN, ZAPI_CLIENT_TOKEN)

## Detalhes tecnicos

- A notificacao e fire-and-forget: se falhar, nao impacta o usuario
- A edge function `notify-admin-registration` chama internamente `send-whatsapp-notification` via fetch com service role key
- O trigger no banco usa `pg_net` para chamada HTTP assincrona, evitando bloquear a transacao
- Logs sao registrados na edge function para auditoria
