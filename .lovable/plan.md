

# Hardening do Sistema de Pagamentos PIX e Cartao de Credito

## Root Cause Identificada

A falha do pagamento PIX da Cleia Santos foi causada por um erro de configuracao das split rules na API da Pagar.me V5:

**Erro:** `"At least 1 recipient must be responsible for the charge_remainder_fee"`

**Causa tecnica:** Quando split rules sao incluidas, a Pagar.me V5 exige que pelo menos um recebedor tenha `charge_remainder_fee: true` nas opcoes. O codigo atual envia apenas `charge_processing_fee` e `liable`, mas omite `charge_remainder_fee`. Com valores impares (ex: R$ 9,50 com desconto PIX 5% = R$ 9,03 = 903 centavos), a divisao 50/50 gera um centavo de "resto" (452 + 451 = 903) e a API nao sabe para quem direcionar esse centavo restante.

**Evidencia dos logs:**
- Payload enviado: `split: [{amount: 452, options: {charge_processing_fee: true, liable: true}}, {amount: 451, options: {charge_processing_fee: false, liable: false}}]`
- Resposta Pagar.me: `gateway_response.code: 400, errors: [{message: "At least 1 recipient must be responsible for the charge_remainder_fee"}]`

**Este mesmo erro afeta o fluxo de cartao de credito** pois ambas as Edge Functions (`create-pix-payment-pagarme` e `create-card-payment-pagarme`) usam a mesma logica de split sem `charge_remainder_fee`.

---

## Plano de Correcao e Hardening

### 1. Corrigir Split Rules (Root Cause - CRITICO)

Adicionar `charge_remainder_fee: true` ao recebedor da plataforma (CNH360) em todas as 3 Edge Functions que criam pagamentos:

**Arquivos afetados:**
- `supabase/functions/create-pix-payment-pagarme/index.ts`
- `supabase/functions/create-card-payment-pagarme/index.ts`
- `supabase/functions/create-lesson-payment-pagarme/index.ts`

Mudanca no split options da plataforma:
```text
// ANTES:
options: {
  charge_processing_fee: true,
  liable: true,
}

// DEPOIS:
options: {
  charge_processing_fee: true,
  charge_remainder_fee: true,
  liable: true,
}
```

### 2. Validacao Pre-Pagamento do Recebedor (CRITICO)

Antes de tentar criar um pagamento com split, validar o status completo do recebedor (nao apenas `status === "active"`, mas tambem verificar kyc e conta bancaria).

**Mudancas em `create-pix-payment-pagarme` e `create-card-payment-pagarme`:**

- Buscar `kyc_status` da tabela `instrutores` junto com `pagarme_recipient_id`
- Validar que `kyc_status === "approved"` antes de incluir split
- Se `kyc_status` nao for "approved", nao incluir split (100% para plataforma)
- Logar o motivo da exclusao do split para auditoria

### 3. Mapeamento de Erros Deterministicos (CRITICO)

Substituir mensagens genericas por mensagens especificas.

**Mudancas no frontend (`PixPaymentModal.tsx` e `PaymentCheckout.tsx`):**

Expandir o mapa de erros para incluir erros reais da Pagar.me:

```text
Erros mapeados:
- "charge_remainder_fee" -> "Erro de configuracao do split. Contate o suporte."
- "PIX falhou:" -> Extrair e exibir a mensagem real
- "recipient" -> "Instrutor nao habilitado para receber pagamentos."
- "document" -> "CPF invalido ou incompleto. Atualize seu perfil."
- "insufficient" -> "Saldo insuficiente para esta operacao."
- "timeout" / "ECONNRESET" -> "Servidor de pagamentos indisponivel. Tente em alguns minutos."
```

**Mudancas nas Edge Functions:**

Retornar codigos de erro padronizados junto com a mensagem:

```text
{
  error: "mensagem amigavel",
  error_code: "SPLIT_CONFIG_ERROR" | "RECIPIENT_INACTIVE" | "KYC_NOT_APPROVED" | "GATEWAY_ERROR" | "VALIDATION_ERROR",
  details: "mensagem tecnica completa (para logs)"
}
```

### 4. Logs Estruturados e Auditaveis (IMPORTANTE)

Melhorar os logs em todas as Edge Functions de pagamento para incluir:

```text
Log padrao obrigatorio:
- timestamp (automatico)
- payment_method: "pix" | "credit_card"
- transaction_id / order_id
- charge_id
- recipient_id (instrutor)
- recipient_status
- kyc_status
- amount_cents
- split_enabled: boolean
- payload_sent (resumido)
- api_response_status
- api_response_body (completo)
- error_code (se houver)
```

### 5. Resiliencia: Retry e Timeout (IMPORTANTE)

Adicionar timeout controlado e retry para chamadas a API da Pagar.me:

**Mudancas nas Edge Functions:**

- Adicionar `AbortController` com timeout de 30s para chamadas a API Pagar.me
- Implementar retry com backoff exponencial (max 2 retries) para erros 5xx
- Nao fazer retry para erros 4xx (sao erros de validacao, nao transitoiros)
- Validar Content-Type da resposta antes de fazer JSON.parse (proteger contra respostas HTML)

### 6. Prevencao de Pagamento Duplicado (IMPORTANTE)

**Mudancas em `create-pix-payment-pagarme`:**

- Antes de criar um novo pedido, verificar se ja existe um `transaction_id` valido para a aula
- Se ja existir, verificar status do pedido existente na Pagar.me
- Se o pedido existente estiver `pending` ou `waiting_payment`, retornar os dados do PIX existente
- So criar novo pedido se o anterior estiver `failed`, `canceled` ou `expired`

**Mudancas em `create-card-payment-pagarme`:**

- Verificar se a aula ja tem `transaction_id` com pagamento autorizado/pago
- Se sim, retornar erro `PAYMENT_ALREADY_EXISTS`

---

## Secao Tecnica - Arquivos e Mudancas Detalhadas

### Edge Functions (Backend)

| Arquivo | Mudancas |
|---------|----------|
| `supabase/functions/create-pix-payment-pagarme/index.ts` | Fix split (charge_remainder_fee), validacao pre-pagamento, retry/timeout, prevencao duplicata, logs estruturados, codigos de erro |
| `supabase/functions/create-card-payment-pagarme/index.ts` | Fix split (charge_remainder_fee), validacao pre-pagamento, retry/timeout, prevencao duplicata, logs estruturados, codigos de erro |
| `supabase/functions/create-lesson-payment-pagarme/index.ts` | Fix split (charge_remainder_fee), validacao pre-pagamento |

### Frontend

| Arquivo | Mudancas |
|---------|----------|
| `src/components/payment/PixPaymentModal.tsx` | Expandir getFriendlyErrorMessage com mapeamento deterministico, exibir error_code |
| `src/components/payment/PaymentCheckout.tsx` | Mesmo mapeamento de erros, tratar error_code do backend |

### Fluxo de validacao pre-pagamento

```text
1. Receber request de pagamento
2. Buscar instrutor: pagarme_recipient_id + kyc_status
3. SE tem recipient_id:
   3a. Verificar status do recipient na API Pagar.me
   3b. SE status === "active" E kyc_status === "approved":
       -> Incluir split rules (com charge_remainder_fee)
   3c. SENAO:
       -> Logar motivo (recipient_inactive, kyc_pending, etc)
       -> Nao incluir split (100% plataforma)
4. Criar pedido na Pagar.me
5. SE resposta nao-JSON -> erro GATEWAY_ERROR
6. SE HTTP 5xx -> retry com backoff
7. SE HTTP 4xx -> mapear erro para codigo interno
8. SE sucesso -> retornar dados
```

### Teste pos-implementacao

Apos implementar, testar diretamente via chamada a Edge Function:
1. PIX com Cleia Santos (recipient approved) -> Deve gerar QR Code
2. Cartao com Cleia Santos -> Deve pre-autorizar
3. PIX com valor impar (centavo restante) -> Deve funcionar com charge_remainder_fee

