

# Analise Completa: O que falta para ir ao publico real

Depois de revisar todo o codigo, banco de dados, seguranca e fluxos, aqui esta minha avaliacao honesta do que precisa ser feito antes do lancamento publico.

---

## CRITICO - Fazer ANTES de lancar

### 1. Migrar chaves Pagar.me para Producao
Voce esta usando `sk_test_...` (modo teste). Pagamentos reais nao funcionam assim.
- Trocar `PAGARME_API_KEY` de `sk_test_` para `sk_live_`
- Trocar `PAGARME_PUBLIC_KEY` e `VITE_PAGARME_PUBLIC_KEY` para `pk_live_`
- Gerar novo `PAGARME_RECIPIENT_CNH360` no ambiente de producao (IDs de teste nao persistem)
- Todos os instrutores precisam re-cadastrar contas bancarias apos a migracao

### 2. Habilitar protecao contra senhas vazadas
O linter de seguranca detectou que a protecao de senhas vazadas esta desabilitada. Isso permite que usuarios usem senhas ja comprometidas em vazamentos de dados.

### 3. Corrigir politica RLS permissiva (USING true)
Existe pelo menos uma politica de RLS com `USING (true)` em operacoes de UPDATE/DELETE/INSERT, o que pode permitir acesso nao autorizado a dados.

---

## IMPORTANTE - Fazer na primeira semana

### 4. Confirmacao de email no cadastro
Atualmente o signup parece permitir acesso imediato sem confirmar email. Para producao, o usuario deveria verificar o email antes de acessar a plataforma para evitar contas falsas.

### 5. Rate limiting nas Edge Functions
As Edge Functions de pagamento (`create-card-payment-pagarme`, `create-pix-payment-pagarme`) nao tem rate limiting. Um usuario mal-intencionado poderia fazer milhares de chamadas e sobrecarregar a API da Pagar.me ou gerar custos.

### 6. Antecipacao automatica na Pagar.me
O sistema solicita D+0 via API, mas a Pagar.me exige aprovacao manual. Contatar `relacionamento@pagar.me` para ativar "Antecipacao Automatica", caso contrario os instrutores so vao receber em D+14/D+30.

### 7. Remover console.log de debug em producao
O `AlunoDashboard.tsx` tem `console.log('[AlunoDashboard] progressoGeral:...')` que expoe dados do usuario no console do navegador. Existem provavelmente outros espalhados pelo codigo.

---

## RECOMENDADO - Melhorias para robustez

### 8. Webhook da Pagar.me para PIX
Atualmente o PIX depende do polling do frontend (`check-payment-status-pagarme` a cada 3s). Se o usuario fechar o app antes da confirmacao, o pagamento pode ficar "pendente" mesmo estando pago. Um webhook resolveria isso automaticamente.

### 9. Monitoramento e alertas
Nao ha sistema de monitoramento para falhas de pagamento, erros de Edge Functions ou problemas de WhatsApp. Para producao, seria importante ter alertas quando algo falhar silenciosamente.

### 10. Pagina de erro amigavel (Error Boundary)
Se um componente React quebrar, o usuario ve uma tela branca. Um Error Boundary global mostraria uma mensagem amigavel e um botao para recarregar.

---

## Resumo por prioridade

| Prioridade | Item | Esforco |
|-----------|------|---------|
| Critico | Chaves Pagar.me producao | Configuracao manual |
| Critico | Protecao senhas vazadas | 1 migracao |
| Critico | Corrigir RLS permissiva | 1 migracao |
| Importante | Confirmacao de email | Configuracao |
| Importante | Rate limiting | Codigo |
| Importante | Antecipacao Pagar.me | Contato comercial |
| Importante | Remover console.logs | Codigo |
| Recomendado | Webhook PIX | Edge Function |
| Recomendado | Monitoramento | Edge Function |
| Recomendado | Error Boundary | Componente React |

---

## Secao Tecnica

### Chaves Pagar.me (Item 1)
Secrets a atualizar via painel Lovable Cloud:
- `PAGARME_API_KEY`: sk_test_ -> sk_live_
- `PAGARME_PUBLIC_KEY`: pk_test_ -> pk_live_
- `VITE_PAGARME_PUBLIC_KEY`: pk_test_ -> pk_live_
- `PAGARME_RECIPIENT_CNH360`: Criar novo recipient no ambiente live

### RLS Permissiva (Item 3)
Identificar a tabela com `USING (true)` e restringir para `auth.uid()` ou funcao SECURITY DEFINER adequada.

### Rate Limiting (Item 5)
Implementar via header `X-RateLimit` ou tabela de controle no banco, limitando por IP/userId a X chamadas por minuto nas funcoes de pagamento.

### Webhook PIX (Item 8)
Criar `supabase/functions/pagarme-payment-webhook/index.ts` que recebe eventos `order.paid` da Pagar.me e atualiza o status da aula + dispara WhatsApp automaticamente, eliminando dependencia do polling.

