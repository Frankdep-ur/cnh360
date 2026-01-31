
# Plano: Correção do Saldo do Instrutor - Problema de Captura de Pagamento

## Diagnóstico Completo

### O Que Está Acontecendo

O saldo do instrutor Frank Alexandre está zerado porque **o pagamento nunca foi capturado** na Pagar.me. A aula foi concluída (`status: concluida`), mas a função `capture-payment-pagarme` falhou silenciosamente.

### Logs Encontrados

```text
✅ Releasing payment for aula: 5c91677f-cd4b-425e-a772-b25ee5d00e6e transaction: or_oz7rNVdTeGtB8r8R
✅ Lesson workflow: validar_qr completed for aula 5c91677f-cd4b-425e-a772-b25ee5d00e6e
❌ Nenhum log de capture-payment-pagarme encontrado
❌ Nenhum registro na tabela pagamentos para este instrutor
```

### Causa Raiz

A Edge Function `capture-payment-pagarme` **requer autenticação JWT** (`verify_jwt = true`), mas está sendo invocada de dentro do `lesson-workflow` usando `supabase.functions.invoke()` que **NÃO passa o header Authorization** do usuário:

```typescript
// lesson-workflow linha 771-773
await supabase.functions.invoke("capture-payment-pagarme", {
  body: { aulaId: aula_id }
  // ❌ Falta Authorization header!
});
```

A função `capture-payment-pagarme` então falha com "Usuário não autenticado", mas o erro é capturado silenciosamente no try/catch (linha 804-807).

---

## Solução Proposta

Modificar a `capture-payment-pagarme` para aceitar chamadas internas (server-to-server) sem JWT de usuário, usando apenas a service role key para validação.

### Abordagem 1: Aceitar Chamadas Internas

A função vai verificar se a chamada vem de outra Edge Function (via header especial ou service role) e permitir a execução:

```typescript
// Verificar se é chamada interna (de outra Edge Function)
const authHeader = req.headers.get("Authorization");
let user: any = null;
let isInternalCall = false;

if (authHeader) {
  const token = authHeader.replace("Bearer ", "");
  
  // Verifica se é service role key (chamada interna)
  if (token === supabaseServiceKey) {
    isInternalCall = true;
    logStep("Internal call detected (service role)");
  } else {
    // Verifica se é token de usuário
    const { data: userData } = await supabaseAuth.auth.getUser(token);
    user = userData?.user;
  }
}

// Se não é chamada interna e não tem usuário autenticado, rejeita
if (!isInternalCall && !user) {
  throw new Error("Usuário não autenticado");
}

// Se é chamada interna, busca instrutor da aula para validar
if (isInternalCall) {
  // Usa os dados da aula para determinar o instrutor
  // A permissão já foi validada pelo lesson-workflow
}
```

### Abordagem 2 (Mais Simples): Desativar JWT Verification

Alterar a configuração para `verify_jwt = false` e fazer a validação manualmente:

- Se vem de chamada interna → aceitar (verificar apenas que aulaId existe)
- Se vem de chamada externa → verificar se é o instrutor da aula

---

## Arquivos a Modificar

### 1. `supabase/functions/capture-payment-pagarme/index.ts`

Atualizar para suportar chamadas internas sem JWT de usuário:

```typescript
serve(async (req) => {
  // ... CORS handling
  
  try {
    const pagarmeApiKey = Deno.env.get("PAGARME_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization");
    let isInternalCall = false;
    let userId: string | null = null;

    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      
      // Tenta autenticar como usuário
      const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);
      const { data: userData, error: userError } = await supabaseAuth.auth.getUser(token);
      
      if (!userError && userData.user) {
        userId = userData.user.id;
        logStep("User authenticated", { userId });
      } else {
        // Chamada interna (lesson-workflow usa service role)
        isInternalCall = true;
        logStep("Internal call detected");
      }
    } else {
      // Sem header = chamada interna
      isInternalCall = true;
      logStep("No auth header - internal call");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { aulaId } = await req.json();
    
    // Get lesson data
    const { data: aulaData, error: aulaError } = await supabase
      .from("aulas")
      .select("*, instrutores!inner(user_id)")
      .eq("id", aulaId)
      .single();

    if (aulaError || !aulaData) {
      throw new Error("Aula não encontrada");
    }

    // Se não é chamada interna, verificar se é o instrutor
    if (!isInternalCall && userId !== aulaData.instrutores.user_id) {
      throw new Error("Apenas o instrutor pode capturar o pagamento");
    }
    
    // ... resto da lógica de captura
  }
});
```

### 2. `supabase/config.toml`

Mudar para permitir chamadas sem JWT (a validação será feita manualmente):

```toml
[functions.capture-payment-pagarme]
verify_jwt = false
```

---

## Fluxo Corrigido

```text
[lesson-workflow]                    [capture-payment-pagarme]
     |                                        |
     |--invoke (sem auth header)------------->|
     |                                        |--detecta chamada interna
     |                                        |--valida aulaId existe
     |                                        |--busca transaction_id
     |                                        |--captura no Pagar.me
     |                                        |--insere em pagamentos
     |                                        |
     |<--success-------------------------------|
```

---

## Validação Adicional Necessária

Após a correção, será necessário:

1. **Reprocessar a aula pendente**: A aula `5c91677f-cd4b-425e-a772-b25ee5d00e6e` já está concluída mas sem pagamento capturado. Será necessário chamar manualmente a captura ou criar uma função de reconciliação.

2. **Verificar status na Pagar.me**: O pedido `or_oz7rNVdTeGtB8r8R` pode estar:
   - `pending` → precisa capturar
   - `paid` → já foi pago (improvável)
   - `canceled` → foi cancelado por timeout

---

## Resumo das Mudanças

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `capture-payment-pagarme/index.ts` | **MODIFICAR** | Aceitar chamadas internas sem JWT |
| `config.toml` | **MODIFICAR** | Mudar `verify_jwt = false` para capture-payment-pagarme |

---

## Seção Técnica

### Por Que o Erro Ficou Silencioso

O `lesson-workflow` tem um try/catch que não propaga o erro:

```typescript
} catch (paymentError) {
  console.error("Payment capture error:", paymentError);
  // Don't fail the request, but log the error
}
```

Mas o erro nunca chegou a ser logado porque a falha ocorreu **antes** de entrar na função (JWT validation no nível de infra).

### Dados do Instrutor

- **Nome**: Frank Alexandre
- **Instrutor ID**: `2cf27a10-3034-431a-bb92-89b08f90adf5`
- **Pagar.me Recipient**: `re_cmkx1ob1cy0mz0l9tjhxp6lcf`
- **Status**: `affiliation` (conta em processo de ativação)

### Dados da Aula

- **Aula ID**: `5c91677f-cd4b-425e-a772-b25ee5d00e6e`
- **Valor**: R$ 9,03
- **Transaction ID**: `or_oz7rNVdTeGtB8r8R`
- **Status**: `concluida` ✅
- **Pagamento**: NÃO CAPTURADO ❌
