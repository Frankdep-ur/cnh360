

## Plano: Atualizar labels de saldo nos cards financeiros

Modificar os textos em **2 arquivos** que exibem os cards "A receber" e "Já transferido":

### 1. `src/pages/instrutor/InstrutorGanhos.tsx` (linhas 294-320)

**Card "A receber" → "Em processamento":**
- Trocar ícone `Clock` por `Hourglass` (já importado)
- Label: **"Em processamento"**
- Remover a linha "Líquido (taxa: R$ 3,67)" — exibir apenas `(Valor das aulas ainda não liberadas)` como subtexto
- Mostrar valor bruto `saldo.pendente` sem subtrair taxa
- Se pendente = 0, mostrar R$ 0,00 sem subtexto

**Card "Este mês" → "Total já recebido":**
- Label: **"Total já recebido"**
- Remover subtexto "Líquido"
- Manter ícone `TrendingUp`

### 2. `src/components/instrutor/InstructorBalanceCard.tsx` (linhas 571-602)

**Mesmas mudanças no componente do dashboard:**
- "A receber" → **"Em processamento"** com ícone `Hourglass`
- Remover subtração da taxa e texto "Líquido (taxa: R$ 3,67)"
- Subtexto: `(Aulas ainda não liberadas)`
- "Já transferido" → **"Total já recebido"**

Nenhuma mudança de lógica de saque — quando o saque zera o `waitingFunds`, o valor já aparece R$ 0,00 automaticamente.

