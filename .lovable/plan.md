

# Remover campo residual useOwnCar do PixPaymentModal

## Alteracao

### `src/components/payment/PixPaymentModal.tsx`
- Linha 142: remover `useOwnCar: false` do body enviado para `create-pix-payment-pagarme`

Apenas 1 linha a remover. O backend ja ignora esse campo, entao a remocao e puramente de limpeza de codigo.

