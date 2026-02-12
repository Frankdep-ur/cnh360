

## Correcao: Exibir Saldo Real para Saque

### Situacao Atual

A Pagar.me retorna `available_amount: 0` para a Cleia. O sistema de fallback local encontra R$ 9,04 em pagamentos aprovados, mas coloca esse valor em `waitingFunds` ("A receber"), nao em `available` ("Disponivel para saque").

Isso esta tecnicamente correto: o dinheiro nao esta disponivel na Pagar.me ainda (prazo D+14 a D+30). Porem, a experiencia do usuario fica confusa ao ver R$ 0,00 disponivel.

### Problemas Identificados

1. **Saldo da Pagar.me zerado**: A transferencia falha anterior (R$ 4,51) pode ter consumido o saldo disponivel. Como a Pagar.me rejeitou mas o sistema registrou como "processado", o saldo pode nao ter sido devolvido corretamente.

2. **Fallback local so alimenta waitingFunds**: A edge function `get-instructor-balance-pagarme` (linhas 127-148) coloca os ganhos locais em `waitingFunds`, nunca em `available`. Isso e correto para o fluxo de saque, mas o usuario nao entende por que o saldo "disponivel" e zero.

3. **UI nao explica a situacao**: Quando `available = 0` e `waitingFunds > 0`, a UI mostra o valor em "A receber" com um link de "Duvidas? Fale conosco", mas a secao principal "Disponivel para saque: R$ 0,00" fica proeminente e confusa.

### Correcoes Propostas

**Arquivo 1: `supabase/functions/get-instructor-balance-pagarme/index.ts`**
- Adicionar um campo `localPendingEarnings` na resposta para que o frontend saiba separar ganhos locais pendentes do saldo real da Pagar.me
- Adicionar campo `settlementInfo` com mensagem explicativa sobre o prazo de liquidacao

**Arquivo 2: `src/components/instrutor/InstructorBalanceCard.tsx`**
- Quando `available = 0` e `waitingFunds > 0`, mostrar uma mensagem explicativa na secao "Disponivel para saque" em vez de apenas "R$ 0,00"
- Exemplo: "R$ 0,00 - Seus ganhos de R$ 9,04 estao em processamento (prazo: 14-30 dias uteis)"
- Adicionar icone informativo com tooltip explicando o ciclo de liquidacao da Pagar.me

### Secao Tecnica

**Edge Function - Novo campo na resposta:**
```typescript
// Adicionar na resposta de sucesso:
localPendingEarnings: ganhosPendentes > 0 ? ganhosPendentes : undefined,
settlementMessage: (balance.available === 0 && ganhosPendentes > 0) 
  ? "Seus ganhos estão em processamento. Prazo de liberação: 14 a 30 dias úteis após a aula."
  : null,
```

**InstructorBalanceCard.tsx - Secao "Disponivel para saque":**
Quando `balance.available === 0` e `balance.waitingFunds > 0`:
- Manter "R$ 0,00" como valor principal
- Adicionar texto explicativo abaixo: "Seus ganhos de [valor] estao em processamento"
- Mudar a cor do badge para amarelo/amber em vez de verde para indicar estado pendente

Isso mantem a precisao financeira (o saldo realmente nao esta disponivel para saque ainda) mas comunica claramente ao instrutor que ele tem ganhos a caminho.

