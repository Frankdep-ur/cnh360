

## Plano: Remover subtexto e zerar valor de "Em processamento"

### Alterações

**1. `src/pages/instrutor/InstrutorGanhos.tsx` (linhas 306-308)**
- Remover o bloco condicional `{saldo.pendente > 0 && (...)}` com o texto "(Valor das aulas ainda não liberadas)"
- Na linha 303, forçar exibição de `R$ 0,00` sempre (ignorar `saldo.pendente`)

**2. `src/components/instrutor/InstructorBalanceCard.tsx` (linhas 580-584)**
- Remover o bloco condicional com "(Aulas ainda não liberadas)"
- Na linha 578, forçar `formatCurrency(0, balance.currency)` em vez de `balance.waitingFunds`

O card "Em processamento" sempre mostrará R$ 0,00, sem subtexto.

