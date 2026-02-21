

# Corrigir ComplianceBanner e Remover Step de Carro Proprio do Onboarding

## Resumo

Duas correcoes a fazer:
1. **ComplianceBanner**: Esclarecer que "2h" se refere ao minimo por sessao/agendamento, nao ao total de horas do curso
2. **AlunoOnboarding**: Remover completamente o step de "carro proprio", ja que por enquanto o aluno nao vai ter essa opcao

---

## 1. ComplianceBanner - Corrigir texto

**Arquivo**: `src/components/layout/ComplianceBanner.tsx`

- **Variante "full" (linha 35)**: Trocar de:
  `Res. CONTRAN 1.020/2025: 2h Mínimas + Instrutores Autônomos + EAD Grátis!`
  Para:
  `Res. CONTRAN 1.020/2025: Mínimo 2h por aula + Instrutores Autônomos + EAD Grátis!`

- **Variante "compact" (linha 59)**: Trocar de:
  `Res. CONTRAN 1.020/2025: 2h práticas + EAD grátis`
  Para:
  `Res. CONTRAN 1.020/2025: Mínimo 2h por aula + EAD grátis`

---

## 2. AlunoOnboarding - Remover step de carro proprio

**Arquivo**: `src/pages/onboarding/AlunoOnboarding.tsx`

Alteracoes:

- **Remover estado `useOwnCar`** (linha 66): remover `useState(false)` e todas as referencias
- **Remover funcao `renderCarroProprioStep`** (linhas 480-567): deletar inteiramente
- **Ajustar `getTotalSteps`** (linhas 72-76):
  - Renovacao: de 3 para 2 (Nome/CPF, Objetivo)
  - Primeira habilitacao: de 4 para 3 (Nome/CPF, Objetivo, Categoria)
  - Adicao/mudanca: de 5 para 4 (Nome/CPF, Objetivo, Categoria atual, Categoria pretendida)
- **Ajustar `renderStep3Content`** (linhas 570-581): remover o caso `renovacao` que chamava `renderCarroProprioStep`
- **Ajustar `renderStep4Content`** (linhas 584-592): remover o caso `primeira_habilitacao` que chamava `renderCarroProprioStep`
- **Ajustar `renderStep5Content`** (linhas 595-600): remover inteiramente (era so para carro proprio em adicao/mudanca)
- **Ajustar `canProceed`** (linhas 186, 190): remover logica do carro proprio
- **Ajustar `handleNext`** (linha 217): renovacao agora finaliza no step 2 em vez de ir para step 3
- **Ajustar `saveToDatabase`** (linhas 272, 283): trocar `possui_carro_proprio: useOwnCar` por `possui_carro_proprio: false`
- **Remover render do step 5** no JSX (se existir chamada a `renderStep5Content`)

No total: remover ~100 linhas de codigo morto e ajustar a navegacao dos steps.

