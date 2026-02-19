

# Corrigir Edge Function create-pix-payment-pagarme

## Problema encontrado

A Edge Function `create-pix-payment-pagarme` ainda usa o valor `useOwnCar` vindo do body do request em vez de forcar `false`. Isso significa que, teoricamente, alguem poderia enviar `useOwnCar: true` direto na API.

## Correcao

### `supabase/functions/create-pix-payment-pagarme/index.ts`
- Linha 97: remover `useOwnCar` do destructuring do body
- Linha 341: trocar `usa_carro_aluno: useOwnCar` por `usa_carro_aluno: false`

Alteracao minima, apenas 2 linhas.

## Demais arquivos

Todos os outros arquivos estao corretos e nao precisam de alteracao adicional. As colunas do banco (`usa_carro_aluno`, `possui_carro_proprio`, `aceita_carro_proprio`) permanecem para compatibilidade futura.

