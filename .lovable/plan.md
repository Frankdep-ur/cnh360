

## Remover Aulas de Exemplo do Dashboard do Instrutor

### O que sera feito

Remover toda a secao "Solicitacoes e Aulas" do dashboard do instrutor, incluindo:

1. **Aula de demonstracao estatica** (`aulaDemostracao`) - o objeto mock com "Joao Silva"
2. **Card de alerta** "Exemplo de solicitacao" / "Nova(s) solicitacao(oes)"
3. **Secao "Solicitacoes e Aulas"** completa (linhas 339-458) com os cards de aula, botoes Aceitar/Recusar
4. **Funcao `handleDemoAction`** e logica relacionada (`aulasParaExibir`, `temAulasReais`, etc.)

### O que permanece

- Header com foto, nome e avaliacao
- Toggle "Estou disponivel"
- Banner de aula ativa (quando houver aula em andamento)
- Premium upsell
- Quick Stats (4 cards)
- Meta do Mes
- Resumo da Semana
- Ranking
- Notificacao popup Uber-style (RideRequestNotification) para novas aulas reais

### Detalhes tecnicos

**Arquivo:** `src/pages/instrutor/InstrutorDashboard.tsx`

- Remover o objeto `aulaDemostracao` (linhas 41-55)
- Remover estados e funcoes: `processingId`, `handleDemoAction`, `handleAceitarAula`, `handleRecusarAula`, `aulasParaExibir`, `temAulasReais`, `formatDateTime`
- Remover o card de alerta "Pending Lessons Alert" (linhas 227-245)
- Remover a secao "Solicitacoes e Aulas" (linhas 339-458)
- Remover imports nao utilizados: `X`, `Check`, `Loader2`, `AlertCircle`, `Clock` (se nao usado em outro lugar), `MapPin`
- Manter o hook `useAulasPendentes` apenas se necessario para o badge na nav; caso contrario, remover tambem

