

# Correcao: Card "A receber" com valor incorreto

## Problema

O card "A receber" no saldo do instrutor exibe R$ 4,52 com "Aguardando liberacao" mesmo apos o instrutor ja ter sacado. Esse valor vem do campo `waiting_funds` da API Pagar.me, que pode representar centavos residuais pos-transferencia e nao um valor real a ser recebido.

## Solucao

Ajustar a logica de exibicao em dois arquivos:

### 1. InstructorBalanceCard.tsx (linhas 560-583)

- Se `waitingFunds > 0` e `waitingFunds > WITHDRAWAL_FEE (R$ 3,67)`: mostrar o valor liquido que o instrutor recebera (waitingFunds - R$ 3,67) com texto "Liquido apos taxa de saque"
- Se `waitingFunds > 0` mas `waitingFunds <= WITHDRAWAL_FEE`: mostrar R$ 0,00 com texto "Valor insuficiente para saque" (a taxa consumiria tudo)
- Se `waitingFunds === 0`: mostrar R$ 0,00 sem subtexto
- Remover o texto "Aguardando liberacao" e o link de WhatsApp que confunde o instrutor quando o valor e residual

### 2. InstrutorGanhos.tsx (linhas 294-307)

Aplicar a mesma logica no card "Pendente":
- Calcular o valor liquido (pendente - taxa)
- Se o liquido for <= 0, mostrar R$ 0,00
- Remover "Liberacao em 24h" que e impreciso

## Detalhes Tecnicos

**InstructorBalanceCard.tsx** - Substituir bloco "A receber" (linhas 560-583):

```typescript
<div className="bg-muted/50 rounded-xl p-3">
  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
    <Clock className="w-3 h-3" />
    A receber
  </div>
  <div className="font-semibold text-foreground">
    {balance.waitingFunds > WITHDRAWAL_FEE
      ? formatCurrency(balance.waitingFunds - WITHDRAWAL_FEE, balance.currency)
      : formatCurrency(0, balance.currency)}
  </div>
  {balance.waitingFunds > WITHDRAWAL_FEE && (
    <p className="text-xs text-muted-foreground mt-1">
      Liquido (taxa de saque: R$ 3,67)
    </p>
  )}
  {balance.waitingFunds > 0 && balance.waitingFunds <= WITHDRAWAL_FEE && (
    <p className="text-xs text-muted-foreground mt-1">
      Valor insuficiente para saque
    </p>
  )}
</div>
```

**InstrutorGanhos.tsx** - Substituir card "Pendente" (linhas 294-307):

```typescript
const pendenteLiquido = saldo.pendente > 3.67 ? saldo.pendente - 3.67 : 0;
```

Mostrar `pendenteLiquido` em vez de `saldo.pendente`, com contexto adequado.

