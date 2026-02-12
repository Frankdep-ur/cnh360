

## Correção do Bug de Saque - Taxa R$ 3,67 não descontada

### Problema Identificado

Na Edge Function `request-manual-transfer-pagarme`, o valor enviado para a API da Pagar.me esta errado:

- A funcao calcula `netAmountCents = availableAmount - 367` (linha 164)
- Mas envia `availableAmount` (valor bruto) para a API da Pagar.me (linha ~195)
- A Pagar.me cobra a taxa de R$ 3,67 por fora, entao o saldo nao e suficiente para cobrir transferencia + taxa

No caso da Cleia: saldo de R$ 4,51, a funcao pediu transferencia de R$ 4,51, mas a Pagar.me precisava de R$ 4,51 + R$ 3,67 = R$ 8,18.

### Correcao

Alterar a Edge Function para enviar `netAmountCents` (valor apos desconto da taxa) como o valor da transferencia na API da Pagar.me, em vez de `availableAmount`.

### Mudancas Tecnicas

**Arquivo**: `supabase/functions/request-manual-transfer-pagarme/index.ts`

1. Na chamada `POST /transfers`, trocar `amount: availableAmount` por `amount: netAmountCents`
2. Atualizar o registro na tabela `saques` para gravar o valor liquido (`netAmountCents`) em vez do bruto, ou manter o bruto mas ajustar a resposta
3. Atualizar a resposta de sucesso para refletir o valor correto transferido
4. Adicionar log com o valor exato enviado para a API para facilitar debug futuro

### Resultado Esperado

- Saque da Cleia (saldo R$ 4,51): transferencia de R$ 0,84 (451 - 367 centavos) -- sucesso
- A Pagar.me debita R$ 3,67 de taxa + R$ 0,84 de transferencia = R$ 4,51 total do saldo
- Frontend ja mostra o breakdown correto (saldo, taxa, valor liquido) -- nenhuma mudanca necessaria no frontend
