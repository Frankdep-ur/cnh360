

## Correcao: Saque Falho + Valor Disponivel Nao Aparecendo

### Problemas Identificados

**1. Saque rejeitado registrado como "processado"**
O saque da Cleia (transfer_id `532678205`, R$ 4,51) foi rejeitado pela Pagar.me (conforme email), mas na tabela `saques` consta como `status: processado`. Isso causa:
- O frontend acha que ja houve saque e pode bloquear novos saques (cooldown de 2h)
- O saldo "disponivel" na Pagar.me esta R$ 0,00 porque a transferencia falhou e o valor pode ter ficado retido

**2. Toast de sucesso subtrai taxa duas vezes**
Na `WithdrawModal.tsx` linha 199, apos o fix da edge function:
- `data.amount` agora ja vem como valor liquido (ex: R$ 0,84)
- O codigo faz `(data.amount || availableBalance) - WITHDRAWAL_FEE` — subtraindo a taxa novamente
- Resultado: toast mostraria R$ -2,83 em vez de R$ 0,84

### Correcoes

**Arquivo 1: Correcao de dados — Marcar saque falho como "rejeitado"**
- Executar SQL para atualizar o saque `fef9b48c-dec3-43ec-95ce-cad944c4ac09` de `processado` para `rejeitado`
- Isso desbloqueia novos saques para a Cleia

**Arquivo 2: `src/components/instrutor/WithdrawModal.tsx`**
- Linha 199: Usar `data.amount` diretamente (ja e o valor liquido) em vez de subtrair a taxa novamente
- A edge function agora retorna `amount` (liquido), `gross_amount` (bruto) e `fee` separados

**Arquivo 3: `src/components/instrutor/InstructorBalanceCard.tsx`**
- Adicionar invalidacao do cache (React Query) apos saque com sucesso, conforme recomendado
- Atualmente usa `useState` local, o que funciona, mas garantir que `fetchBalance()` no `handleWithdrawSuccess` efetivamente atualiza a UI

### Secao Tecnica

**SQL para corrigir o saque falho:**
```sql
UPDATE saques SET status = 'rejeitado' WHERE id = 'fef9b48c-dec3-43ec-95ce-cad944c4ac09';
```

**WithdrawModal.tsx — Linha 199:**
Antes: `const net = (data.amount || availableBalance) - WITHDRAWAL_FEE;`
Depois: `const net = data.amount ?? (availableBalance - WITHDRAWAL_FEE);`

Isso usa o valor liquido retornado pela API (que ja tem a taxa descontada), e so faz o calculo local como fallback.

**Sobre o saldo R$ 0,00 da Cleia na Pagar.me:**
O log mais recente mostra `available_amount: 0` e `transferred_amount: 168` (R$ 1,68). Como a Pagar.me rejeitou o saque, o valor pode ter sido devolvido ao saldo mas ainda nao aparece. Apos corrigir o status local, a Cleia pode tentar um novo saque — desta vez com a correcao do `netAmountCents`, o valor enviado sera correto.

