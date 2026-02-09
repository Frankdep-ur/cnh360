

# Informar Taxa de Saque Pagar.me (R$ 3,67) no Fluxo de Saque

## Contexto

O suporte da Pagar.me confirmou que toda transferencia (saque) tem uma **taxa fixa de R$ 3,67**. Atualmente o sistema envia o saldo disponivel como valor bruto do saque (ex: R$ 4,51), mas a Pagar.me desconta R$ 3,67, entregando apenas R$ 0,84 ao instrutor. O app nao informa essa taxa em nenhum momento.

## O que sera feito

### 1. Mostrar a taxa de R$ 3,67 no modal de saque (WithdrawModal)

Antes de confirmar, o instrutor vera:

```text
Saldo disponivel:     R$ 4,51
Taxa de saque:       -R$ 3,67
------------------------------
Voce recebera:        R$ 0,84
```

Se o saldo for menor ou igual a R$ 3,67, o botao "Confirmar Saque" ficara desabilitado com a mensagem: "Saldo insuficiente para cobrir a taxa de saque (R$ 3,67)."

### 2. Validar valor minimo na Edge Function

Na `request-manual-transfer-pagarme`, adicionar validacao: se `availableAmount <= 367` (centavos), rejeitar o saque antes de chamar a API, com mensagem clara sobre a taxa.

### 3. Informar valor liquido na tela de sucesso

Apos o saque ser aprovado, a mensagem de sucesso mostrara o valor liquido que o instrutor recebera (bruto - R$ 3,67), nao o valor bruto.

---

## Secao Tecnica

### Constante da taxa

Definir `WITHDRAWAL_FEE = 367` (centavos) / `WITHDRAWAL_FEE_DISPLAY = 3.67` (reais) em ambos os arquivos.

### Arquivos impactados

| Arquivo | Alteracao |
|---------|-----------|
| `src/components/instrutor/WithdrawModal.tsx` | Adicionar breakdown de taxa, validar saldo minimo, mostrar valor liquido no sucesso |
| `supabase/functions/request-manual-transfer-pagarme/index.ts` | Validar `availableAmount > 367` antes de criar transferencia |

### WithdrawModal.tsx - Alteracoes

1. Adicionar constante `WITHDRAWAL_FEE = 3.67`
2. Calcular `netAmount = availableBalance - WITHDRAWAL_FEE`
3. No bloco de "Valor a sacar", adicionar linhas mostrando taxa e valor liquido
4. Desabilitar botao se `availableBalance <= WITHDRAWAL_FEE`
5. Na tela de sucesso, mostrar o valor liquido
6. Na mensagem do toast de sucesso, mostrar o valor liquido

### Edge Function - Alteracoes

1. Adicionar constante `WITHDRAWAL_FEE_CENTS = 367`
2. Apos consultar saldo, verificar: `if (availableAmount <= WITHDRAWAL_FEE_CENTS)` rejeitar com mensagem amigavel
3. Logar o valor liquido esperado para auditoria

