

# Permitir qualquer senha no cadastro

## Problema

Atualmente o sistema exige senha forte (minimo 6 caracteres com letras e numeros). O usuario quer remover essa restricao e permitir qualquer senha.

## Solucao

A validacao de senha forte vem do backend (autenticacao). Para desabilitar, preciso alterar a configuracao de autenticacao para aceitar senhas de qualquer complexidade, mantendo apenas o minimo de 6 caracteres (exigencia do sistema de autenticacao).

Alem disso, remover a mensagem de erro traduzida de "senha fraca" que acabamos de adicionar, ja que nao sera mais necessaria.

## Alteracoes

### 1. Configuracao de autenticacao
- Desabilitar a verificacao de senha forte no backend usando a ferramenta de configuracao de auth
- Definir o comprimento minimo de senha para 6 (minimo permitido pelo sistema)

### 2. `src/pages/Auth.tsx`
- Remover o bloco `else if` de tratamento de senha fraca que foi adicionado, ja que o erro nao vai mais ocorrer
- Manter o tratamento generico de erros para outros casos

