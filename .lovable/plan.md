

# Correcao dos Problemas de Pagamento

## Problemas Identificados

### Problema B: Aula concluida sem pagamento registrado

A aula `a5886922` (Lucas, 26/Jan) foi concluida com `qr_validado: true`, porem sem `transaction_id` e sem nenhum registro na tabela `pagamentos`. Isso acontece porque:

1. No `lesson-workflow`, a linha que dispara a captura exige ambas as condicoes: `releasePayment === true` **E** `aula.transaction_id` existir (linha 775)
2. No `capture-payment-pagarme`, quando nao ha `transaction_id`, a funcao retorna "Pagamento ja processado" sem criar nenhum registro

**Resultado**: Aulas sem pagamento via gateway (criadas manualmente, por teste, ou com falha no pagamento) passam pelo fluxo inteiro e sao concluidas sem nenhum registro financeiro.

Existe outra aula `3e54ae28` (Lucas, status `confirmada`, valor R$120, sem `transaction_id`) que pode seguir o mesmo caminho.

### Problema C: Pagamento historico com split 80/20

O unico registro em `pagamentos` mostra `taxa_plataforma: 16.00` (20%) e `valor_instrutor: 64.00` (80%) sobre `valor_bruto: 80.00`. Isso e de dezembro/2025, antes da mudanca para 50/50. O registro precisa ser corrigido para refletir o split correto.

---

## Solucao

### 1. Corrigir o `lesson-workflow` para criar pagamento mesmo sem `transaction_id`

Quando `releasePayment = true` mas nao existe `transaction_id`, o workflow deve:
- Buscar os dados do instrutor (kyc_status)
- Calcular o split 50/50 (ou 100% plataforma se instrutor nao aprovado)
- Inserir o registro na tabela `pagamentos` diretamente, com `metodo: 'pix'` e `status: 'aprovado'`
- Ainda chamar `capture-payment-pagarme` quando existe `transaction_id` (comportamento atual mantido)

Isso garante que **toda** aula concluida tera um registro de pagamento, independente de ter passado pelo gateway ou nao.

### 2. Corrigir o `capture-payment-pagarme` para criar registro quando `transaction_id` ausente

Atualmente, quando nao ha `transaction_id`, a funcao retorna sucesso silencioso. A correcao fara com que ela crie o registro de pagamento com os valores corretos (50/50 ou 100% plataforma) mesmo sem transacao no gateway.

### 3. Corrigir o pagamento historico com split errado

Via migracao SQL, atualizar o registro existente:
- `taxa_plataforma`: de 16.00 para 40.00 (50%)
- `valor_instrutor`: de 64.00 para 40.00 (50%)

### 4. Criar pagamento retroativo para a aula `a5886922`

Via migracao SQL, inserir o registro de pagamento que deveria ter sido criado quando a aula foi concluida.

---

## Secao Tecnica

### Arquivo: `supabase/functions/lesson-workflow/index.ts`

A secao de pagamento (linhas 774-815) sera expandida:

Antes:
```text
if (releasePayment && aula.transaction_id) {
  // chama capture-payment-pagarme
}
```

Depois:
```text
if (releasePayment) {
  if (aula.transaction_id) {
    // chama capture-payment-pagarme (comportamento existente mantido)
  } else {
    // Criar registro de pagamento direto
    // Buscar kyc_status do instrutor
    // Calcular split: 50/50 se approved, 100% plataforma caso contrario
    // Inserir na tabela pagamentos com metodo 'pix', status 'aprovado'
  }
  // Notificacoes de pagamento (WhatsApp + in-app) - mover para fora do if
}
```

### Arquivo: `supabase/functions/capture-payment-pagarme/index.ts`

A secao sem `transaction_id` (linhas 84-92) sera atualizada para criar o registro de pagamento:

Antes:
```text
if (!transactionId) {
  return { success: true, message: "Pagamento ja processado" };
}
```

Depois:
```text
if (!transactionId) {
  // Verificar se ja existe pagamento registrado
  // Se nao existe, criar com split correto (50/50 ou 100% plataforma)
  // Buscar kyc_status do instrutor para determinar split
  return { success: true, message: "Pagamento registrado" };
}
```

### Migracao SQL

```text
-- Corrigir split 80/20 -> 50/50 no pagamento historico
UPDATE pagamentos 
SET taxa_plataforma = 40.00, valor_instrutor = 40.00
WHERE id = '106f20a1-46ca-4ff7-aec0-3090e98418ae';

-- Criar pagamento retroativo para aula a5886922
INSERT INTO pagamentos (aula_id, aluno_id, instrutor_id, valor_bruto, taxa_plataforma, valor_instrutor, metodo, status, pago_em)
SELECT 
  a.id, a.aluno_id, a.instrutor_id, 
  a.valor,
  a.valor * 1.00,  -- 100% plataforma (instrutor refused)
  0.00,             -- 0% instrutor (refused)
  'pix', 'aprovado', a.aula_fim
FROM aulas a WHERE a.id = 'a5886922-3c43-41d5-bded-ff8396f25f1f';
```

Nota: Para o Lucas (refused), o split e 100% plataforma / 0% instrutor conforme a politica vigente.

### Resumo de arquivos

| Arquivo | Mudanca |
|---------|---------|
| `supabase/functions/lesson-workflow/index.ts` | Criar pagamento direto quando nao ha transaction_id |
| `supabase/functions/capture-payment-pagarme/index.ts` | Registrar pagamento quando chamado sem transaction_id |
| Migracao SQL | Corrigir split historico + pagamento retroativo |

