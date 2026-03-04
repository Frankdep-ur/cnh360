

## Plano: Remover card Premium da página de Ganhos

### Alteração

**Arquivo:** `src/pages/instrutor/InstrutorGanhos.tsx`

Remover o bloco condicional `{!isPremium && (...)}` que renderiza o card "Economize com Premium!" (aproximadamente linhas 322-349). Também remover as variáveis `isPremium`, `showPremiumModal`, `setShowPremiumModal` e o componente `PremiumActivationModal` se não forem usados em outro lugar da página.

