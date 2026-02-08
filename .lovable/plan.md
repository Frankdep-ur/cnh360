
# Correcao do Bug de Saldo - Parsing Incorreto da API Pagar.me

## Problema Identificado

O saldo da Cleia Santos mostra **R$ 0,00 disponivel** e **R$ 4,52 a receber** quando deveria mostrar **R$ 4,51 disponivel para saque**.

### Causa Raiz

A Edge Function `get-instructor-balance-pagarme` esta parseando a resposta da API Pagar.me V5 usando o formato ERRADO.

**Resposta real da Pagar.me V5 (formato FLAT):**

```text
{
  "currency": "BRL",
  "available_amount": 451,        <-- campo correto
  "waiting_funds_amount": 0,
  "transferred_amount": 0
}
```

**Codigo atual (espera formato NESTED):**

```text
balance.available = (balanceData.available?.amount || 0) / 100
//                   ^^^^^^^^^^^^^^^^^^^^^^^^
//                   balanceData.available nao existe!
//                   Resultado: (undefined || 0) / 100 = 0
```

### Consequencia em Cadeia

1. `balance.available` = 0 (parsing errado)
2. `balance.waitingFunds` = 0 (parsing errado)
3. A condicao `balance.available === 0 && balance.waitingFunds === 0` vira TRUE
4. O fallback local busca R$ 4,52 do banco de dados e coloca em `waitingFunds`
5. O botao de saque fica desabilitado porque `balance.available` continua 0

---

## Correcao

Alterar **1 arquivo**: `supabase/functions/get-instructor-balance-pagarme/index.ts`

### Antes (linhas 139-144):

```text
const balance = {
  available: (balanceData.available?.amount || 0) / 100,
  waitingFunds: (balanceData.waiting_funds?.amount || 0) / 100,
  transferred: (balanceData.transferred?.amount || 0) / 100,
  currency: balanceData.available?.currency || "BRL",
};
```

### Depois:

```text
const balance = {
  available: (balanceData.available_amount ?? balanceData.available?.amount ?? 0) / 100,
  waitingFunds: (balanceData.waiting_funds_amount ?? balanceData.waiting_funds?.amount ?? 0) / 100,
  transferred: (balanceData.transferred_amount ?? balanceData.transferred?.amount ?? 0) / 100,
  currency: balanceData.currency ?? balanceData.available?.currency ?? "BRL",
};
```

Usa o operador `??` (nullish coalescing) para tentar primeiro o formato flat (`available_amount`) e, se nao existir, o formato nested (`available.amount`), garantindo compatibilidade com ambos os formatos.

---

## Resultado Esperado

Apos a correcao:
- "Disponivel para saque" mostrara **R$ 4,51** (451 centavos / 100)
- "A receber" mostrara **R$ 0,00** (nenhum valor pendente no gateway)
- O botao mudara de "Sem saldo disponivel" para **"Sacar Saldo"** (verde, habilitado)
- O fallback local NAO sera acionado (pois `available > 0`)

---

## Secao Tecnica

### Arquivos impactados

| Arquivo | Alteracao |
|---------|-----------|
| `supabase/functions/get-instructor-balance-pagarme/index.ts` | Corrigir parsing do balance (linhas 139-144) |

### Validacao

Apos o deploy da Edge Function, testar chamando diretamente a funcao para confirmar que o balance retorna os valores corretos antes de verificar na UI.
