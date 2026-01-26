

# Plano: Configurar Client-Token Z-API

## Objetivo

Adicionar o Client-Token encontrado e atualizar a Edge Function para corrigir o erro "your client-token is not configured".

---

## Passo 1: Adicionar Secret

| Secret | Valor |
|--------|-------|
| `ZAPI_CLIENT_TOKEN` | `F3e433787498b4210b472e04f3170f4eaS` |

---

## Passo 2: Atualizar Edge Function

Modificar o arquivo `supabase/functions/send-whatsapp-notification/index.ts` para incluir o header `Client-Token` nas requisições à API Z-API.

### Mudança no código

```typescript
// Antes (sem Client-Token)
const response = await fetch(zapiUrl, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ phone, message }),
});

// Depois (com Client-Token)
const response = await fetch(zapiUrl, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Client-Token": clientToken,  // ← Novo header obrigatório
  },
  body: JSON.stringify({ phone, message }),
});
```

---

## Passo 3: Testar Envio

Após as alterações:
1. Fazer deploy automático da Edge Function
2. Chamar a função com dados do instrutor Tiago Silva
3. Verificar se a mensagem WhatsApp é entregue

---

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `supabase/functions/send-whatsapp-notification/index.ts` | Adicionar leitura do `ZAPI_CLIENT_TOKEN` e incluir header `Client-Token` na requisição |

---

## Resultado Esperado

- Requisição à Z-API retorna sucesso (status 200)
- Instrutor Tiago Silva recebe mensagem WhatsApp
- Logs mostram: "Mensagem enviada via Z-API"

