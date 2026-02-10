

# Remover Historico de Saques

## O que sera feito

Remover completamente a funcionalidade de "Historico de Saques" dos dois arquivos onde foi adicionada:

1. **InstructorBalanceCard.tsx** - Remover o estado `withdrawals`/`loadingWithdrawals`, a funcao `fetchWithdrawals`, a chamada no `useEffect`, e toda a secao visual do historico (linhas 665-715)
2. **InstrutorGanhos.tsx** - Reverter a aba "Saques" para o formato estatico original (usando o array `transacoes` filtrado), remover o estado `saques`/`loadingSaques`, a funcao `fetchSaques`, a constante `WITHDRAWAL_FEE`, e a chamada no `useEffect`

---

## Secao Tecnica

### InstructorBalanceCard.tsx

Remover:
- Linha 43-44: estados `withdrawals` e `loadingWithdrawals`
- Linhas 102-134: funcao `fetchWithdrawals`
- Linha 166: chamada `fetchWithdrawals()` no useEffect
- Linha 295: chamada `fetchWithdrawals()` no `handleWithdrawSuccess`
- Linhas 665-715: bloco JSX do historico de saques e skeleton de loading

### InstrutorGanhos.tsx

Remover:
- Linhas 51-54: estados `saques`, `loadingSaques` e `WITHDRAWAL_FEE`
- Linha 135: chamada `fetchSaques()` no useEffect
- Linhas 138-165: funcao `fetchSaques`
- Linhas 471-519: bloco JSX da aba "Saques" com dados reais

Restaurar a aba "Saques" para usar `transacoes.filter(tx => tx.tipo === "saque")` com o estilo original (igual a aba "Todas" mas filtrado).

