

# Plano: Atualizar Link para Domínio Oficial

## Objetivo

Alterar o deep link na mensagem WhatsApp para usar o domínio principal `cnh360.com` ao invés de `cnh360.lovable.app`.

---

## Alteração Necessária

### Arquivo: `supabase/functions/send-whatsapp-notification/index.ts`

**Linha atual (linha 100):**
```typescript
const chatDeepLink = `https://cnh360.lovable.app/aluno/chat/${payload.aulaId}`;
```

**Nova linha:**
```typescript
const chatDeepLink = `https://cnh360.com/aluno/chat/${payload.aulaId}`;
```

---

## Resultado Esperado

A mensagem WhatsApp passará a exibir:

```
💬 Acesse o chat no app para falar com o aluno:
https://cnh360.com/aluno/chat/abc123
```

---

## Observação

A conta Z-API está em modo **TRIAL** (teste). Para produção, será necessário ativar o plano pago da Z-API para remover a mensagem de aviso.

