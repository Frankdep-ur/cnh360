
# Plano: Corrigir Verificação do Split/Marketplace Pagar.me

## Contexto

A equipe da Pagar.me confirmou que o **Split/Marketplace está habilitado** na conta. Porém, a função de verificação (`check-pagarme-split-enabled`) está retornando `enabled: false` incorretamente.

### Análise do Problema

**Logs atuais:**
```
Step 1: List recipients → status: 200 ✅ (passou!)
Step 2: Create test response → status: 412, message: "invalid_parameter | agencia_dv | Invalid format"
```

**Interpretação errada:** O código trata TODO status 412 como "permissão negada", mas na verdade:
- `invalid_parameter | agencia_dv` = erro de **validação de dados** (Split FUNCIONA!)
- `action_forbidden` / `not allowed` = erro de **permissão** (Split desabilitado)

O passo 1 passou com status 200 (listou recebedores com sucesso), o que já indica que o Split está funcionando. O erro no passo 2 é apenas porque o payload de teste tem dados bancários inválidos.

---

## Correções Necessárias

### 1. Atualizar Edge Function `check-pagarme-split-enabled`

**Mudanças:**
- Não tratar status 412 como bloqueio automático
- Analisar o **conteúdo** da mensagem de erro, não apenas o status HTTP
- Se a mensagem contém `invalid_parameter`, `invalid format`, etc → Split está OK
- Apenas bloquear se a mensagem contiver `action_forbidden`, `not allowed`, `company it not allowed`

**Nova lógica:**
```text
┌─────────────────────────────────────────────────────────┐
│                    VERIFICAÇÃO SPLIT                     │
├─────────────────────────────────────────────────────────┤
│ 1. Listar recebedores (GET /recipients)                 │
│    └─ Status 200 → Split provavelmente OK               │
│    └─ Status 412 + "action_forbidden" → Split OFF       │
│                                                          │
│ 2. Tentar criar recebedor de teste (POST /recipients)   │
│    └─ Status 400/422 + erro validação → Split OK        │
│    └─ Status 412 + "invalid_parameter" → Split OK       │
│    └─ Status 412 + "action_forbidden" → Split OFF       │
└─────────────────────────────────────────────────────────┘
```

### 2. Simplificar Payload de Teste

Usar dados bancários mais realistas para evitar erros de formato:
- branch_check_digit: remover ou deixar vazio corretamente
- Usar formato válido esperado pela API

---

## Impacto

Após esta correção:
- O formulário de cadastro bancário do instrutor (`BankAccountSetup`) vai funcionar
- Instrutores poderão configurar suas contas bancárias para receber pagamentos
- O Split 50/50 entre plataforma e instrutor funcionará corretamente

---

## Arquivos a Modificar

| Arquivo | Ação |
|---------|------|
| `supabase/functions/check-pagarme-split-enabled/index.ts` | Corrigir lógica de detecção |

---

## Seção Técnica

### Código Atual (Problemático)
```javascript
const isCreationBlocked = 
  createResponse.status === 412 ||  // ← ERRO: trata TODO 412 como bloqueio
  createErrorMessage.includes("action_forbidden") ||
  // ...
```

### Código Corrigido
```javascript
// Verificar se é erro de PERMISSÃO (Split desabilitado)
const isPermissionError = 
  createErrorMessage.includes("action_forbidden") ||
  createErrorMessage.includes("not allowed to create") ||
  createErrorMessage.includes("company it not allowed") ||
  createErrorMessage.includes("is not allowed") ||
  errorDetails.includes("action_forbidden") ||
  errorDetails.includes("not allowed");

// Verificar se é erro de VALIDAÇÃO (Split funciona, dados inválidos)
const isValidationError =
  createErrorMessage.includes("invalid_parameter") ||
  createErrorMessage.includes("invalid format") ||
  createErrorMessage.includes("invalid") ||
  createErrorMessage.includes("required") ||
  createErrorMessage.includes("must be");

// Se é erro de validação, Split está OK!
if (isValidationError && !isPermissionError) {
  return { enabled: true, reason: "validation_error_confirms_access" };
}

// Se é erro de permissão, Split não está habilitado
if (isPermissionError) {
  return { enabled: false, reason: "permission_denied" };
}
```

### Estratégia Alternativa (Mais Simples)
Se o passo 1 (listar recebedores) retornar status 200, considerar Split habilitado imediatamente, sem necessidade do passo 2:

```javascript
if (listResponse.status === 200) {
  return { enabled: true, reason: "list_recipients_ok" };
}
```

---

## Estimativa de Tempo

- Desenvolvimento: 5 minutos
- Teste e validação: 2 minutos
- **Total: ~7 minutos**
