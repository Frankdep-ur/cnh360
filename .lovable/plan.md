
# Refatoracao Completa do Fluxo WhatsApp Z-API

## Problemas Identificados na Auditoria

1. **Pagamento por cartao nunca dispara WhatsApp diretamente** -- a Edge Function `create-card-payment-pagarme` marca a aula como "confirmada" mas NAO seta `payment_confirmed: true` e NAO chama `send-whatsapp-notification`. O WhatsApp so e enviado se o frontend fizer polling via `check-payment-status-pagarme`, que e um fluxo fragil.

2. **Race condition no polling** -- duas chamadas simultaneas de `check-payment-status-pagarme` podem ambas ler `payment_confirmed = false`, ambas atualizar e ambas disparar WhatsApp duplicado.

3. **Validacao de telefone fraca** -- numeros com menos de 10 digitos sao enviados sem erro, resultando em falha silenciosa na Z-API.

4. **Logs insuficientes no caller** -- quando o WhatsApp falha no `check-payment-status-pagarme`, o log nao inclui instrutor_id nem telefone.

---

## O que sera feito

### 1. Corrigir `create-card-payment-pagarme` (cartao de credito)

Quando o pagamento por cartao for autorizado/pago com sucesso:
- Setar `payment_confirmed: true` no update da aula (atualmente so seta `status: "confirmada"`)
- Chamar `send-whatsapp-notification` diretamente, igual ao fluxo PIX

Isso garante que o instrutor recebe WhatsApp IMEDIATAMENTE quando o cartao e autorizado, sem depender do polling do frontend.

### 2. Corrigir race condition no `check-payment-status-pagarme`

Substituir a logica atual de "SELECT + UPDATE separados" por um UPDATE condicional atomico:

```text
Antes (vulneravel):
  1. SELECT payment_confirmed WHERE id = aulaId
  2. IF false => UPDATE payment_confirmed = true
  3. Send WhatsApp
  (duas chamadas podem executar passo 1 ao mesmo tempo)

Depois (atomico):
  1. UPDATE payment_confirmed = true WHERE id = aulaId AND payment_confirmed = false
  2. Se rowCount > 0 => Send WhatsApp (garante que so 1 execucao envia)
```

### 3. Adicionar validacao de telefone na `send-whatsapp-notification`

Antes de enviar, validar que o numero limpo tem pelo menos 10 digitos (DDD + numero). Caso contrario, retornar erro especifico nos logs sem chamar a Z-API.

### 4. Melhorar logs detalhados

No `check-payment-status-pagarme`, adicionar ao log de WhatsApp:
- `instrutor_id`
- telefone destino (mascarado: `18****8372`)
- `aulaId`

Na `send-whatsapp-notification`, logar o `aulaId` no resultado final.

---

## Secao Tecnica

### Arquivos impactados

| Arquivo | Alteracao |
|---------|-----------|
| `supabase/functions/create-card-payment-pagarme/index.ts` | Adicionar `payment_confirmed: true` no update + chamar WhatsApp |
| `supabase/functions/check-payment-status-pagarme/index.ts` | Update atomico com `.eq("payment_confirmed", false)` para eliminar race condition + logs melhorados |
| `supabase/functions/send-whatsapp-notification/index.ts` | Validacao minima de telefone (10 digitos) + log do aulaId |

### create-card-payment-pagarme -- Alteracoes

Na linha onde atualiza a aula (linha ~358), adicionar `payment_confirmed: true` quando o status for autorizado/pago:

```text
// Antes:
.update({ transaction_id, status: "confirmada" })

// Depois:
.update({ transaction_id, status: "confirmada", payment_confirmed: true })
```

Apos o update bem-sucedido, adicionar chamada para `sendWhatsAppNotification(supabase, lessonId)` usando a mesma logica que ja existe no `check-payment-status-pagarme`. A funcao sera copiada inline para manter independencia entre Edge Functions.

### check-payment-status-pagarme -- Alteracoes

Substituir o SELECT + UPDATE separados (linhas 222-248) por update atomico:

```text
const { data: updatedRows, error: updateError } = await supabase
  .from("aulas")
  .update({ status: "confirmada", payment_confirmed: true })
  .eq("id", aulaId)
  .eq("payment_confirmed", false)  // trava atomica
  .select("id");

if (!updateError && updatedRows && updatedRows.length > 0) {
  // Primeira execucao: envia WhatsApp
  await sendWhatsAppNotification(supabase, aulaId);
} else {
  logStep("Already confirmed or update failed, skipping WhatsApp");
}
```

Melhorar logs do catch do WhatsApp para incluir `instrutor_id` e telefone mascarado.

### send-whatsapp-notification -- Alteracoes

Adicionar validacao antes de chamar a Z-API:

```text
if (phoneFormatted.length < 12) {  // 55 + DDD(2) + numero(8-9) = minimo 12
  return { success: false, error: "Telefone invalido (menos de 10 digitos)" };
}
```

Logar `aulaId` nos logs de sucesso e erro para rastreabilidade.

### Nenhuma alteracao de banco de dados necessaria

Todos os campos ja existem (`payment_confirmed`, `transaction_id`, `status`).

### Nenhuma alteracao de frontend necessaria

O polling no frontend continua funcionando como fallback, mas agora o WhatsApp ja tera sido enviado pelo backend antes do polling detectar.
