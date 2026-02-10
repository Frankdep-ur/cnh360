

# Protecao Robusta Contra Saques Duplicados

## Problema

A Pagar.me nao zera o saldo instantaneamente apos um saque. Com a janela atual de 10 minutos (apenas status "pendente"), o instrutor consegue fazer multiplos saques do mesmo saldo se tentar apos esse intervalo. Isso resultou em 5 saques de R$ 4,51 para a mesma instrutora (Cleia).

## O que sera feito

### 1. Edge Function: Bloquear saques por 2 horas apos processamento

Na `request-manual-transfer-pagarme`, alem da verificacao de saques "pendente" (10 min), adicionar uma segunda verificacao: se existir qualquer saque com status "processado" nas ultimas **2 horas**, bloquear a nova tentativa com mensagem clara.

### 2. Frontend: Esconder botao de saque apos saque processado

No `WithdrawModal`, antes de exibir o modal, consultar a tabela `saques` para verificar se ha um saque "processado" recente (2h). Se houver, mostrar uma mensagem informando que o saque ja foi realizado e o proximo estara disponivel apos o prazo.

No `InstructorBalanceCard`, apos um saque bem-sucedido, o saldo exibido como "disponivel" deve refletir que o valor ja foi sacado -- o `fetchBalance` ja e chamado via `onSuccess`, mas a API da Pagar.me pode ainda mostrar saldo. Entao adicionar um estado local `recentWithdrawal` que, quando ativo, substitui o botao "Sacar Saldo" por "Saque realizado - aguarde credito" desabilitado.

---

## Secao Tecnica

### Arquivos impactados

| Arquivo | Alteracao |
|---------|-----------|
| `supabase/functions/request-manual-transfer-pagarme/index.ts` | Adicionar verificacao de saques "processado" nas ultimas 2h |
| `src/components/instrutor/WithdrawModal.tsx` | Verificar saques recentes ao abrir modal, mostrar aviso se ja sacou |
| `src/components/instrutor/InstructorBalanceCard.tsx` | Estado local `recentWithdrawal` para bloquear botao apos saque |

### Edge Function - Alteracoes

Apos o bloco existente que verifica `pendente` (linhas 62-86), adicionar:

```text
// CAMADA 3: Verificar saque processado nas ultimas 2 horas
SELECT * FROM saques
WHERE instrutor_id = X
  AND status = 'processado'
  AND created_at >= (now - 2 hours)
LIMIT 1

Se encontrar -> rejeitar com mensagem:
"Voce ja realizou um saque recentemente. Aguarde 2 horas para solicitar outro."
```

### WithdrawModal - Alteracoes

1. Ao abrir o modal (`useEffect` com `open`), consultar `saques` do instrutor com status `processado` nas ultimas 2h
2. Se encontrar, setar `recentlyWithdrawn = true`
3. Exibir alerta verde: "Saque de R$ X,XX realizado com sucesso as HH:MM. O valor sera creditado em ate 1 dia util."
4. Desabilitar botao "Confirmar Saque"

### InstructorBalanceCard - Alteracoes

1. Adicionar estado `recentWithdrawal: boolean`
2. No `handleWithdrawSuccess`, setar `recentWithdrawal = true`
3. Quando `recentWithdrawal === true`, o botao de saque muda para "Saque realizado" (desabilitado, cor verde)
4. Ao recarregar a pagina, o estado reseta mas o WithdrawModal fara a verificacao no banco novamente

