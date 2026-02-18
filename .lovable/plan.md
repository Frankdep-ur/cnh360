

# Bloquear saque antes da finalização da aula

## Problema

O split de pagamento na Pagar.me acontece no momento em que o aluno paga (PIX ou cartão). Isso significa que o saldo já aparece na conta do instrutor no gateway **antes** da aula ser iniciada ou finalizada com QR Code. O instrutor consegue sacar o dinheiro sem nunca ter dado a aula.

## Causa raiz

O fluxo atual:
1. Aluno paga --> Pagar.me faz o split 50/50 imediatamente
2. Saldo aparece como "disponível" no receptor do instrutor
3. Instrutor pode sacar a qualquer momento
4. Aula pode nem ter acontecido ainda

## Solução

Adicionar uma verificação no backend de saque (`request-manual-transfer-pagarme`) que bloqueia a transferência se o instrutor tiver aulas pagas mas ainda não finalizadas (validadas por QR Code). Também ajustar a UI para informar o instrutor.

## Alterações

### 1. Edge Function `request-manual-transfer-pagarme/index.ts`

Antes de consultar o saldo e criar a transferência, adicionar uma verificação que:
- Busca todas as aulas do instrutor com `payment_confirmed = true` mas que **não** foram validadas por QR Code (`qr_validado = false` ou `status` diferente de `finalizada`)
- Se houver aulas pendentes de finalização, retorna erro claro bloqueando o saque
- Mensagem: "Você tem aula(s) em andamento ou aguardando validação. Finalize a aula com o aluno antes de sacar."

A query seria algo como:
```sql
SELECT id, status FROM aulas 
WHERE instrutor_id = :instrutorId 
AND payment_confirmed = true
AND status NOT IN ('finalizada', 'cancelada')
```

Se retornar alguma linha, o saque é bloqueado.

### 2. UI `InstructorBalanceCard.tsx`

Quando o botão de saque for clicado e houver aulas não finalizadas, exibir um toast informativo ao invés de abrir o modal de saque. Para isso:
- Adicionar uma verificação local antes de abrir o modal
- Consultar aulas ativas do instrutor (status em `confirmada`, `em_rota`, `aguardando_confirmacao`, `em_andamento`, `aguardando_qr`)
- Se houver, mostrar toast: "Finalize suas aulas em andamento antes de sacar"

### 3. Edge Function `get-instructor-balance-pagarme/index.ts`

Adicionar um campo `hasUnfinishedLessons` na resposta do saldo, para que a UI possa usar essa informação sem precisar fazer query separada. A edge function já tem acesso ao `instrutorData.id`, então basta:
- Contar aulas com `payment_confirmed = true` e `status NOT IN ('finalizada', 'cancelada')`
- Retornar `hasUnfinishedLessons: true/false` no response

## Resumo das mudanças

| Arquivo | O que muda |
|---------|-----------|
| `supabase/functions/request-manual-transfer-pagarme/index.ts` | Bloqueia saque se houver aulas não finalizadas |
| `supabase/functions/get-instructor-balance-pagarme/index.ts` | Retorna flag `hasUnfinishedLessons` |
| `src/components/instrutor/InstructorBalanceCard.tsx` | Usa a flag para desabilitar botão de saque e mostrar aviso |

