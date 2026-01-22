

# Plano: Corrigir Verificação de Split com Payload Completo

## Problema

A verificação atual envia um payload incompleto (sem dados bancários), e a Pagar.me retorna erro 400/422 por validação. O código interpreta isso como "Split habilitado", mas quando o instrutor envia dados **completos**, a Pagar.me faz a verificação de permissão e retorna 412 "action_forbidden".

## Solução

Enviar um payload **completo** com dados bancários fictícios para forçar a Pagar.me a verificar permissões antes de aceitar o cadastro real.

## Arquivo a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `supabase/functions/check-pagarme-split-enabled/index.ts` | Enviar payload completo com bank_account de teste |

## Implementação

### Modificar o payload de teste (linhas 80-85)

**Antes:**
```typescript
const testPayload = {
  name: "TEST_VALIDATION_CHECK",
  document: "00000000000",
  type: "individual",
  code: `test-check-${Date.now()}`,
};
```

**Depois:**
```typescript
const testPayload = {
  code: `test-split-check-${Date.now()}`,
  register_information: {
    type: "individual",
    document: "00000000191", // CPF válido de teste
    name: "TESTE SPLIT CHECK",
    email: "teste@teste.com",
    birthdate: "1990-01-01",
    monthly_income: 300000,
    professional_occupation: "teste",
    phone_numbers: [
      { ddd: "11", number: "999999999", type: "mobile" }
    ],
    address: {
      street: "Rua Teste",
      street_number: "100",
      complementary: "N/A",
      neighborhood: "Centro",
      city: "São Paulo",
      state: "SP",
      zip_code: "01310100",
      reference_point: "N/A"
    }
  },
  default_bank_account: {
    holder_name: "TESTE SPLIT CHECK",
    holder_type: "individual",
    holder_document: "00000000191",
    bank: "001", // Banco do Brasil
    branch_number: "0001",
    branch_check_digit: "",
    account_number: "12345",
    account_check_digit: "6",
    type: "checking"
  },
  transfer_settings: {
    transfer_enabled: true,
    transfer_interval: "daily",
    transfer_day: 0
  }
};
```

### Atualizar a lógica de detecção de erro (linhas 106-124)

```typescript
// Verificar se a criação foi bloqueada por falta de permissão
const createErrorMessage = (createData.message || "").toLowerCase();
const errorDetails = JSON.stringify(createData.errors || []).toLowerCase();

const isCreationBlocked = 
  createResponse.status === 412 ||
  createErrorMessage.includes("action_forbidden") ||
  createErrorMessage.includes("not allowed to create") ||
  createErrorMessage.includes("company it not allowed") ||
  createErrorMessage.includes("is not allowed") ||
  errorDetails.includes("action_forbidden") ||
  errorDetails.includes("not allowed");

if (isCreationBlocked) {
  logStep("Split NOT enabled - creation blocked by permissions", { 
    status: createResponse.status,
    message: createData.message,
    errors: createData.errors
  });
  return new Response(
    JSON.stringify({
      enabled: false,
      reason: "creation_not_allowed",
      message: "A funcionalidade de recebedores não está habilitada na conta Pagar.me. Entre em contato com o suporte para ativar o Split/Marketplace."
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
  );
}
```

### Ajustar a verificação de sucesso (linhas 126-141)

```typescript
// Se chegou aqui com erro de validação de dados (CPF inválido, conta inválida, etc)
// significa que a permissão passou e o endpoint está acessível
if (createResponse.status === 400 || createResponse.status === 422) {
  // Verificar se é erro de validação e não de permissão
  const hasValidationErrors = createData.errors?.some((e: any) => {
    const msg = (e.message || "").toLowerCase();
    return msg.includes("invalid") || 
           msg.includes("required") || 
           msg.includes("must be") ||
           msg.includes("already exists");
  });
  
  if (hasValidationErrors) {
    logStep("Split/Marketplace is ENABLED - validation errors confirm access");
    return new Response(
      JSON.stringify({
        enabled: true,
        reason: "ok",
        message: "Sistema de pagamentos configurado corretamente"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  }
}
```

## Fluxo Corrigido

```text
┌────────────────────────────────────────────────────────────┐
│ Instrutor abre configuração de conta bancária              │
└────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────────┐
│ check-pagarme-split-enabled envia payload COMPLETO         │
│ (com dados bancários fictícios do Banco do Brasil)         │
└────────────────────────────────────────────────────────────┘
                         │
           ┌─────────────┴─────────────┐
           ▼                           ▼
┌─────────────────────────┐ ┌─────────────────────────────────┐
│ Pagar.me retorna 412    │ │ Pagar.me retorna 400/422        │
│ "action_forbidden"      │ │ "CPF inválido" / "conta existe" │
└─────────────────────────┘ └─────────────────────────────────┘
           │                           │
           ▼                           ▼
┌─────────────────────────┐ ┌─────────────────────────────────┐
│ Mostra: "Sistema em     │ │ Mostra formulário normalmente   │
│ Configuração - Contate  │ │ (Split está habilitado!)        │
│ o suporte"              │ │                                 │
└─────────────────────────┘ └─────────────────────────────────┘
```

## Benefícios

1. **Detecção correta**: Envia payload idêntico ao real, forçando verificação de permissão
2. **UX melhorada**: Instrutor não preenche formulário para só depois ver erro
3. **Mensagem clara**: Indica exatamente o problema e ação necessária
4. **Sem falsos positivos**: Diferencia erro de validação (bom) de erro de permissão (bloqueante)

## Próximo Passo (Opção B - Habilitar Split)

Se após essa correção o modal mostrar "Sistema em Configuração":

1. Acesse o dashboard Pagar.me: https://dashboard.pagar.me
2. Vá em **Configurações → Marketplace/Split**
3. Solicite a ativação da funcionalidade de recebedores
4. Aguarde aprovação da Pagar.me (geralmente 1-3 dias úteis)

