

# Historico de Saques no Dashboard do Instrutor

## O que sera feito

Adicionar uma secao "Historico de Saques" no `InstructorBalanceCard` (visivel no perfil/ganhos do instrutor) que consulta a tabela `saques` em tempo real e exibe cada saque com:

- **Data/hora** do saque
- **Valor bruto** (valor original em centavos convertido para reais)
- **Taxa de saque** (R$ 3,67 fixa)
- **Valor liquido** (bruto - taxa)
- **Status** (pendente, processado, falhou) com badge colorido

## Onde sera exibido

A secao sera adicionada dentro do `InstructorBalanceCard.tsx`, logo abaixo do botao de saque e acima do "Atualizado as HH:MM". Assim, o instrutor ve o historico no mesmo card do saldo, sem precisar navegar para outra pagina.

Tambem sera atualizada a aba "Saques" na pagina `InstrutorGanhos.tsx` para mostrar dados reais em vez dos dados estaticos atuais.

---

## Secao Tecnica

### Arquivos impactados

| Arquivo | Alteracao |
|---------|-----------|
| `src/components/instrutor/InstructorBalanceCard.tsx` | Adicionar secao de historico de saques com query real |
| `src/pages/instrutor/InstrutorGanhos.tsx` | Substituir aba "Saques" estatica por dados reais da tabela `saques` |

### InstructorBalanceCard - Alteracoes

1. Adicionar estado `withdrawals` e `loadingWithdrawals`
2. Criar funcao `fetchWithdrawals` que consulta:
```text
SELECT id, valor, status, created_at, transfer_id
FROM saques
WHERE instrutor_id = (instrutor do usuario logado)
ORDER BY created_at DESC
LIMIT 10
```
3. Chamar `fetchWithdrawals` no `useEffect` junto com `fetchBalance`
4. Renderizar lista compacta abaixo do botao de saque:
   - Cada item mostra: data, valor bruto (valor/100), taxa (R$ 3,67), liquido (bruto - 3.67), status badge
   - Status "processado" = badge verde, "pendente" = badge amarelo, "falhou" = badge vermelho
5. Usar a constante `WITHDRAWAL_FEE = 3.67` para calcular o liquido

### InstrutorGanhos - Alteracoes

1. Na aba "Saques", substituir o array estatico `transacoes.filter(tx => tx.tipo === "saque")` por uma query real a tabela `saques`
2. Exibir breakdown: valor bruto, taxa R$ 3,67, valor liquido, status e data
3. Manter o mesmo estilo visual (Card com icone ArrowUpRight)

### Nenhuma alteracao de banco de dados necessaria

A tabela `saques` ja possui todas as colunas necessarias (id, instrutor_id, valor, transfer_id, status, created_at).

