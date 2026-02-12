
## Correcao: WhatsApp do Frank Alexandre nao foi enviado

### Problema

O webhook `pagarme-payment-webhook` chama `send-whatsapp-notification` com o payload:
```
{ phone: "...", message: "mensagem ja formatada" }
```

Porem, `send-whatsapp-notification` espera o formato `WhatsAppPayload`:
```
{ instrutorPhone: "...", valor: number, alunoNome: string, ... }
```

Como `instrutorPhone` e `valor` chegam `undefined`, o codigo quebra em `payload.valor.toFixed(2)`.

### Solucao

Modificar `send-whatsapp-notification` para aceitar **dois formatos de payload**:

1. **Formato simples** (usado pelo webhook): `{ phone, message }` - mensagem ja pronta, envia direto
2. **Formato estruturado** (usado pelo `check-payment-status-pagarme`): `WhatsAppPayload` com campos separados - monta a mensagem internamente

### Arquivo a alterar

**`supabase/functions/send-whatsapp-notification/index.ts`**

Na secao do handler (linha 122+), adicionar deteccao do formato do payload:

```typescript
const rawPayload = await req.json();

// Formato simples: { phone, message } - mensagem ja formatada
if (rawPayload.phone && rawPayload.message) {
  const result = await sendWhatsAppViaZAPI(rawPayload.phone, rawPayload.message);
  // retornar resultado...
}

// Formato estruturado: WhatsAppPayload - montar mensagem
const payload: WhatsAppPayload = rawPayload;
// codigo existente continua...
```

### Secao Tecnica

- Detectar o formato pelo campo `phone` + `message` (exclusivo do webhook)
- Se presente, chamar `sendWhatsAppViaZAPI(rawPayload.phone, rawPayload.message)` diretamente
- Manter o fluxo existente para o formato `WhatsAppPayload` intacto
- Adicionar log diferenciado para cada formato
- Nenhum outro arquivo precisa ser alterado
