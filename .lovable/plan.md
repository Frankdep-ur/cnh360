

# Correção: Notificação Admin Sempre com WhatsApp e Cidade

## Problema

Os dados de WhatsApp e Cidade do aluno FRANCO LUIGE ANDERSON existem no banco de dados (phone: `18991591661`, cidade: `RIO PRETO`), mas a notificação WhatsApp mostrou "N/A" para ambos. Isso acontece porque a edge function `notify-admin-registration` depende exclusivamente dos dados enviados pelo frontend no payload. Se por qualquer motivo (race condition, re-trigger, chamada manual) esses campos chegarem vazios, a notificação sai incompleta.

## Solução

Tornar a edge function `notify-admin-registration` **autossuficiente**: sempre buscar os dados atualizados diretamente do banco de dados como fallback, garantindo que WhatsApp e cidade nunca apareçam como "N/A" quando existem no perfil do usuário.

## Mudanças

### Arquivo: `supabase/functions/notify-admin-registration/index.ts`

1. **Adicionar lookup no banco de dados**: Quando `whatsapp` ou `cidade` estiverem vazios no payload, buscar da tabela `profiles` usando o email do usuário
2. **Aceitar campo `user_id` opcional** no payload para busca mais precisa
3. **Enriquecer os dados** antes de construir a mensagem

### Lógica do enriquecimento:

```text
Payload recebido com dados do frontend
         |
   whatsapp ou cidade vazios?
         |
    SIM --> Buscar na tabela profiles (por user_id ou email)
         |
   Dados encontrados --> Preencher campos faltantes
         |
   Construir mensagem com dados completos
```

### Arquivo: `src/pages/onboarding/AlunoOnboarding.tsx`

Adicionar `user_id: user.id` ao payload da notificação para facilitar a busca no banco.

### Arquivo: `src/pages/onboarding/InstrutorOnboarding.tsx`

Mesmo ajuste: adicionar `user_id` ao payload.

### Arquivo: `src/pages/onboarding/AutoescolaOnboarding.tsx`

Mesmo ajuste: adicionar `user_id` ao payload.

## Detalhes Técnicos

Na edge function, após receber o payload:

1. Verificar se `dados.whatsapp` e `dados.cidade` estão preenchidos
2. Se algum estiver vazio, usar o Supabase Admin Client (service role key) para buscar da tabela `profiles`:
   - Por `user_id` se fornecido
   - Por `email` como fallback
3. Preencher os campos faltantes com os dados do banco
4. Formatar o telefone para exibição na mensagem (ex: `(18) 99159-1661`)

Isso garante que **toda notificação admin terá os dados completos**, independente de como a function foi chamada.
