
# Correcao do Bug de Saque - Mesmo Parsing Incorreto

## Problema

O erro "EDGE NON-2XX" ocorre porque a Edge Function `request-manual-transfer-pagarme` tem o **mesmo bug de parsing** que acabamos de corrigir na `get-instructor-balance-pagarme`.

### Evidencia nos Logs

```text
Balance fetched: {"available_amount": 451, ...}  <-- API retorna formato FLAT
Error: "Saldo insuficiente para saque"           <-- Mas o codigo le formato NESTED
```

### Causa Raiz (linha 80)

```text
// ERRADO - le formato nested que nao existe
const availableAmount = balanceData.available?.amount || 0;
// Resultado: undefined || 0 = 0
// Condicao availableAmount <= 0 dispara o erro
```

---

## Correcao

Alterar **1 linha** no arquivo `supabase/functions/request-manual-transfer-pagarme/index.ts`:

### Linha 80 - De:
```text
const availableAmount = balanceData.available?.amount || 0;
```

### Para:
```text
const availableAmount = balanceData.available_amount ?? balanceData.available?.amount ?? 0;
```

Mesma abordagem da correcao anterior: tenta primeiro o formato flat (`available_amount`), depois o nested (`available.amount`), com fallback para 0.

---

## Resultado Esperado

1. `availableAmount` sera `451` (centavos) em vez de `0`
2. A condicao `availableAmount <= 0` NAO sera acionada
3. A transferencia sera criada na Pagar.me com `amount: 451`
4. O saque de R$ 4,51 sera processado com sucesso

---

## Secao Tecnica

### Arquivos impactados

| Arquivo | Alteracao |
|---------|-----------|
| `supabase/functions/request-manual-transfer-pagarme/index.ts` | Corrigir parsing do balance na linha 80 |

### Validacao

Apos o deploy, testar chamando a funcao diretamente para confirmar que o saque e processado sem erro.
