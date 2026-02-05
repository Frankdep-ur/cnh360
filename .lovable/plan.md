
# Correção: Erro de Conexão ao Salvar Dados Bancários

## Diagnóstico do Problema

### Causa Raiz Identificada

Analisando os logs da Edge Function `create-instructor-recipient-pagarme`:

```
[22:05:53] Pagar.me API error - {"status":412,"message":"invalid_parameter | agencia_dv | Invalid format"}
[22:05:53] Recipient payload built - {"bankAccount":{"bank":"237","branch":"63","account":"34844","type":"checking"}}
```

**Problema**: O código envia `branch_check_digit: ""` (string vazia) para a API da Pagar.me, que **rejeita esse formato**. A API V5 da Pagar.me exige que o campo seja:
- **Completamente omitido** (não presente no JSON), OU  
- Um dígito válido (0-9)

**Código atual (linha 195):**
```typescript
branch_check_digit: agenciaDv?.replace(/\D/g, "") || ""  // ❌ Envia "" quando vazio
```

A mensagem "Erro de conexão" aparece porque o mapeamento de erros traduz qualquer erro com "agencia_dv" para uma mensagem confusa.

---

## Plano de Correção

### 1. Edge Function: Omitir campo quando vazio

**Arquivo:** `supabase/functions/create-instructor-recipient-pagarme/index.ts`

**Mudança:** Construir o payload condicionalmente, omitindo `branch_check_digit` quando estiver vazio:

```typescript
const bankAccountPayload: any = {
  holder_name: name.trim(),
  holder_type: type,
  holder_document: cleanDocument,
  bank: cleanBankCode,
  branch_number: agencia.replace(/\D/g, ""),
  account_number: conta.replace(/\D/g, ""),
  account_check_digit: contaDv || "",
  type: accountType
};

// Só incluir branch_check_digit se tiver valor
const cleanAgenciaDv = agenciaDv?.replace(/\D/g, "");
if (cleanAgenciaDv && cleanAgenciaDv.length > 0) {
  bankAccountPayload.branch_check_digit = cleanAgenciaDv;
}
```

### 2. Edge Function: Adicionar retry automático

**Arquivo:** `supabase/functions/create-instructor-recipient-pagarme/index.ts`

**Mudança:** Implementar lógica de retry para erros de conexão/timeout:

```typescript
async function callPagarmeWithRetry(url: string, options: RequestInit, maxAttempts = 3): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout
      
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeoutId);
      
      // Retry apenas em 5xx (erros de servidor)
      if (response.status >= 500 && attempt < maxAttempts) {
        logStep(`Attempt ${attempt} failed with ${response.status}, retrying...`);
        await new Promise(r => setTimeout(r, 3000)); // 3s delay
        continue;
      }
      
      return response;
    } catch (error: any) {
      lastError = error;
      if (error.name === "AbortError") {
        logStep(`Attempt ${attempt} timed out, retrying...`);
      } else {
        logStep(`Attempt ${attempt} network error: ${error.message}`);
      }
      
      if (attempt < maxAttempts) {
        await new Promise(r => setTimeout(r, 3000));
      }
    }
  }
  
  throw new Error(`Falha na conexão com Pagar.me após ${maxAttempts} tentativas. Verifique sua internet.`);
}
```

### 3. Edge Function: Melhorar mapeamento de erros

**Arquivo:** `supabase/functions/create-instructor-recipient-pagarme/index.ts`

**Mudança:** Atualizar mensagens de erro para serem mais claras:

| Erro da Pagar.me | Mensagem Atual | Nova Mensagem |
|------------------|----------------|---------------|
| `agencia_dv | Invalid format` | "Dígito da agência obrigatório..." | "Formato da agência inválido. Confira se digitou corretamente (ex: 63 ou 0063)." |
| Timeout/Abort | — | "Falha na conexão. Tente novamente em alguns segundos." |
| 5xx após retries | — | "Serviço temporariamente indisponível. Tente novamente em alguns minutos." |

### 4. Frontend: Loading spinner e retry

**Arquivo:** `src/components/instrutor/BankAccountSetup.tsx`

**Mudanças:**

1. **Botão com loading state** já implementado - verificar se funciona
2. **Adicionar botão de retry no toast de erro:**

```tsx
toast.error("Erro de conexão", {
  description: "Não foi possível conectar ao servidor. Tente novamente.",
  action: {
    label: "Tentar de novo",
    onClick: () => handleSubmit(),
  },
  duration: 10000,
});
```

3. **Validação extra de agência:**
```tsx
// Máximo 5 dígitos numéricos para agência
if (agencia && agencia.replace(/\D/g, "").length > 5) {
  errors.agencia = "Agência deve ter no máximo 5 dígitos";
}
```

---

## Seção Técnica

### Fluxo de Dados Corrigido

```text
Frontend (BankAccountSetup.tsx)
    │
    ├─ agenciaDv = "" (vazio)
    │
    ▼
Edge Function (create-instructor-recipient-pagarme)
    │
    ├─ cleanAgenciaDv = ""
    ├─ if (cleanAgenciaDv) → NÃO entra
    ├─ branch_check_digit → OMITIDO do payload
    │
    ▼
Pagar.me API V5
    │
    ├─ Não recebe branch_check_digit
    ├─ Aceita payload ✓
    │
    ▼
Sucesso!
```

### Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `supabase/functions/create-instructor-recipient-pagarme/index.ts` | Omitir `branch_check_digit` quando vazio, adicionar retry, melhorar logs |
| `src/components/instrutor/BankAccountSetup.tsx` | Adicionar retry no toast de erro, validação de 5 dígitos |

### Teste de Validação

Após implementar:
1. Cadastrar agência "63" (Bradesco) sem dígito
2. Verificar nos logs que `branch_check_digit` não aparece no payload
3. Confirmar toast verde de sucesso
4. Testar cenário de timeout (desconectar internet) e verificar retry automático
