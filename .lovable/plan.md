

## Correção: Saldo Disponível Antes da Aula Finalizada

### Problema Identificado

Atualmente, o registro de pagamento (`pagamentos`) é criado com status `"aprovado"` no momento em que o instrutor **aceita** a aula (antes mesmo de começar). A consulta de saldo soma TODOS os pagamentos com status `"aprovado"`, independente de a aula ter sido finalizada ou não.

Isso faz com que o instrutor veja saldo disponível para saque antes de concluir a aula com o aluno via QR Code.

### Fluxo Atual (com problema)

```text
Aluno paga (PIX) → Webhook confirma → Instrutor aceita aula
→ pagamentos.insert(status: "aprovado")   ← AQUI o saldo já aparece!
→ Instrutor inicia aula → QR Code → Finaliza aula
```

### Fluxo Correto (após correção)

```text
Aluno paga (PIX) → Webhook confirma → Instrutor aceita aula
→ pagamentos.insert(status: "pendente")   ← Saldo NÃO aparece ainda
→ Instrutor inicia aula → QR Code → Finaliza aula
→ pagamentos.update(status: "aprovado")   ← Agora sim, saldo disponível!
```

### Solução

Introduzir dois estados no campo `status` da tabela `pagamentos`:
- **`"pendente"`**: pagamento capturado, aula ainda em andamento
- **`"aprovado"`**: aula finalizada, saldo liberado para saque

### Arquivos a Alterar

#### 1. `supabase/functions/capture-payment-pagarme/index.ts`
- Mudar os `insert` de `pagamentos` para usar `status: "pendente"` em vez de `"aprovado"`
- Isso se aplica a todas as 3 inserções no arquivo (PIX sem transaction, cartão, e fallback)

#### 2. `src/hooks/useAulasPendentes.ts`
- O `capture-payment-pagarme` chamado ao aceitar a aula já vai inserir com `"pendente"` (via alteração acima)
- Nenhuma mudança necessária neste arquivo

#### 3. `supabase/functions/lesson-workflow/index.ts`
- Na ação de **finalização da aula** (quando o QR Code final é validado):
  - Após chamar `capture-payment-pagarme`, atualizar o registro em `pagamentos` para `status: "aprovado"`
  - Se o registro já foi criado com `"pendente"` (caminho sem gateway), também atualizar para `"aprovado"`

#### 4. `supabase/functions/get-instructor-balance-pagarme/index.ts`
- Nenhuma mudança necessária: a query já filtra por `status: "aprovado"`, então pagamentos `"pendente"` serão automaticamente excluídos do saldo

### Detalhes Técnicos

**`capture-payment-pagarme/index.ts`** (3 locais de insert):
- Linha ~117-127: Caso sem `transaction_id` → mudar `status: "aprovado"` para `status: "pendente"`
- Linha ~194-202: Caso cartão de crédito → mudar para `status: "pendente"`
- Linha ~270-276: Caso fallback → mudar para `status: "pendente"`

**`lesson-workflow/index.ts`** (na ação de finalização):
- Após o bloco que chama `capture-payment-pagarme` (linhas ~780-828), adicionar:
```typescript
// Liberar pagamento: atualizar status para aprovado
await supabase
  .from("pagamentos")
  .update({ status: "aprovado" })
  .eq("aula_id", aula_id);
```

Isso garante que, independente do caminho (gateway ou direto), o pagamento só será contabilizado no saldo após a validação completa da aula.

### Impacto
- Saldo do instrutor só aparece após finalizar a aula com QR Code
- Saques só podem ser feitos com saldo de aulas concluídas
- Pagamentos de aulas em andamento ficam "invisíveis" no saldo até conclusão
- Nenhuma mudança na interface do usuário necessária
