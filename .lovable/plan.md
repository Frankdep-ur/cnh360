

## Plano: Trocar "Disponibilidade" por seção "Financeiro" no perfil do instrutor

### O que muda

O botão "Disponibilidade" (linhas 535-543 de `InstrutorPerfil.tsx`) será substituído por um botão **"💵 Financeiro"** que navega para a página `/instrutor/ganhos` (que já existe com dados reais de saldo, aulas, repasses).

### Alteração única

**Arquivo:** `src/pages/instrutor/InstrutorPerfil.tsx` (linhas 535-543)

Trocar o botão estático "Disponibilidade" por um botão que:
- Ícone: `Wallet` (já importado via `InstructorBalanceCard`) ou `Banknote`
- Texto: **"Financeiro"**
- Subtexto: **"Ganhos, repasses e histórico"**
- Cor: verde (`bg-emerald-500/10`, `text-emerald-600`)
- `onClick`: navega para `/instrutor/ganhos`

A página `InstrutorGanhos` já possui todos os dados reais conectados:
- Saldo disponível (API Pagar.me)
- Aulas realizadas e valores (tabela `pagamentos`)
- Histórico de repasses (tabela `saques`)
- Valor por aula
- KYC e dados bancários

Nenhuma tabela ou backend precisa ser alterado.

