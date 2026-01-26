

# Plano: Filtrar Notificacoes Somente para Aulas Pagas

## Resumo do Problema

Atualmente, o sistema de notificacoes do instrutor tem **2 pontos** que ainda nao verificam se a aula foi paga:

1. **`useInstrutorNotifications.ts`** - Hook que busca aulas pendentes e dispara popup/som/vibracao
2. **`send-lesson-notification` Edge Function** - Funcao que cria notificacoes no banco

---

## Arquivos a Modificar

| Arquivo | Modificacao |
|---------|-------------|
| `src/hooks/useInstrutorNotifications.ts` | Adicionar filtro `payment_confirmed = true` na query |
| `supabase/functions/send-lesson-notification/index.ts` | Verificar `payment_confirmed` antes de criar notificacao |

---

## Mudanca 1: useInstrutorNotifications.ts

### Linha 41-46 - Adicionar filtro de pagamento

**Codigo atual:**
```typescript
const { data, error } = await supabase
  .from("aulas")
  .select("*")
  .eq("instrutor_id", instrutorId)
  .eq("status", "pendente")
  .order("created_at", { ascending: false });
```

**Codigo corrigido:**
```typescript
const { data, error } = await supabase
  .from("aulas")
  .select("*")
  .eq("instrutor_id", instrutorId)
  .eq("status", "pendente")
  .eq("payment_confirmed", true)  // NOVA LINHA
  .order("created_at", { ascending: false });
```

### Linha 144 - Verificar pagamento no evento realtime

**Codigo atual:**
```typescript
if (payload.new && payload.new.status === "pendente") {
```

**Codigo corrigido:**
```typescript
if (payload.new && payload.new.status === "pendente" && payload.new.payment_confirmed === true) {
```

---

## Mudanca 2: send-lesson-notification Edge Function

### Linha 161-210 - Verificar pagamento antes de notificar

Adicionar verificacao logo apos receber o payload para garantir que a aula tenha pagamento confirmado antes de enviar qualquer notificacao:

```typescript
// Verificar se a aula tem pagamento confirmado
const { data: aulaCheck, error: aulaCheckError } = await supabase
  .from("aulas")
  .select("payment_confirmed")
  .eq("id", aula_id)
  .single();

if (aulaCheckError || !aulaCheck?.payment_confirmed) {
  console.log("Aula sem pagamento confirmado, ignorando notificacao");
  return new Response(
    JSON.stringify({ 
      success: false, 
      message: "Lesson not paid - notification skipped" 
    }),
    { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
  );
}
```

---

## Fluxo Apos Correcao

```text
Aluno clica "Pagar"
       │
       ▼
Aula criada (payment_confirmed = false)
       │
       ├──► Hook ignora (filtro payment_confirmed)
       ├──► Edge Function ignora (verificacao payment_confirmed)
       └──► Nenhuma notificacao enviada
       │
       ▼
Pagamento concluido
       │
       ▼
payment_confirmed = true
       │
       ├──► Hook detecta nova aula
       ├──► Popup + som + vibracao
       └──► Notificacao in-app criada
```

---

## Checklist de Implementacao

- [ ] Adicionar `.eq("payment_confirmed", true)` na query do hook
- [ ] Verificar `payment_confirmed === true` no handler realtime
- [ ] Adicionar verificacao de pagamento na Edge Function
- [ ] Testar que notificacoes nao aparecem para aulas nao pagas
- [ ] Testar que notificacoes funcionam para aulas pagas

