

# Remover opcao "Usar meu proprio carro" do fluxo do aluno

## Resumo

Remover a opcao de carro proprio do aluno em todas as telas relevantes. O aluno sempre usara o carro do instrutor por enquanto.

## Alteracoes

### 1. `src/pages/aluno/AgendarAula.tsx`
- Remover o estado `useOwnCar` (linha 170) -- ou forcar como `false`
- Remover o bloco do botao "Usar meu proprio carro" (linhas 586-620)
- Remover o calculo de `carDiscount` -- fica sempre 0
- Remover a prop `carDiscount` do componente `PaymentStepContent` e a exibicao condicional do desconto (linhas 87-92)
- Remover o import `Car` e `Check` do lucide-react (se nao usados em outro lugar do arquivo)
- Na insercao da aula no banco, enviar `usa_carro_aluno: false` fixo

### 2. `src/pages/aluno/AlunoPerfil.tsx`
- Remover a linha que exibe "Carro proprio: Sim/Nao" (linhas 409-414)

### 3. `src/pages/aluno/BuscarInstrutores.tsx`
- Remover o campo `aceitaCarroProprio` do mapeamento de instrutores (linha 116)
- Remover a prop `showCarroProprio` do `InstructorCard` (linha 351)

### 4. `src/components/cards/InstructorCard.tsx`
- Remover a badge "Aceita carro proprio" (linhas 121-125)
- Remover a prop `showCarroProprio`

### 5. `src/pages/aluno/AulaSolicitada.tsx`
- Remover a exibicao "Seu proprio carro / Carro do instrutor" (linhas 340-343) ou deixar fixo "Carro do instrutor"

### 6. `src/components/payment/PixPaymentModal.tsx`
- Remover a prop `useOwnCar` e sempre enviar `false` no payload

### 7. Edge Function `create-lesson-payment-pagarme`
- Remover `useOwnCar` do destructuring do body e forcar `usa_carro_aluno: false`

## O que NAO sera alterado
- Colunas do banco de dados (`usa_carro_aluno`, `possui_carro_proprio`, `aceita_carro_proprio`) permanecem -- apenas a UI e remove. Isso facilita reativar no futuro.
- Telas do instrutor que exibem `usa_carro_aluno` em aulas existentes continuam funcionando normalmente (novas aulas sempre terao `false`).

