

# Remover botoes de carteira digital (Apple Pay / Google Pay)

## Problema

O botao Apple Pay aparece no iPhone mas a funcionalidade nao esta implementada. O codigo atual e apenas um stub que sempre retorna erro "Apple Pay requer configuracao de merchant no servidor". Isso confunde o usuario.

O Google Pay tambem depende de uma chave publica da Pagar.me (`VITE_PAGARME_PUBLIC_KEY`) que nao esta configurada no `.env`.

## Solucao

Desabilitar completamente os botoes de carteira digital ate que a integracao real seja implementada.

### Alteracoes

**1. `src/hooks/useWalletPayments.ts`**
- Forcar `applePayReady` e `googlePayReady` a sempre retornarem `false`
- Alternativa mais limpa: fazer o hook retornar tudo como `false`/desabilitado diretamente, sem carregar scripts nem verificar disponibilidade

**2. `src/components/payment/PaymentCheckout.tsx`**
- Remover a secao condicional que renderiza os botoes Apple Pay e Google Pay (linhas ~767-783 para Apple Pay e o bloco equivalente para Google Pay)
- Manter o hook importado mas sem uso visual, para facilitar reativacao futura

### Resultado

- O usuario vera apenas as opcoes **PIX** e **Cartao**, que estao funcionais
- Nenhum erro sera exibido ao usuario
- O codigo do hook permanece no projeto para reativacao futura quando a integracao real for feita

