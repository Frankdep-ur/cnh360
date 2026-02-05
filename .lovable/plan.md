
# Corrigir Validação de Dígito da Agência Bancária

## Problema Identificado

O instrutor **Lucas Felipe** está recebendo erro ao cadastrar conta bancária do Bradesco porque o **dígito verificador da agência não foi preenchido**.

| Dados Informados | Valor |
|------------------|-------|
| Banco | 237 - Bradesco |
| Agência | 63 (sem dígito) |
| Conta | 34844-9 |
| CPF | 473.547.278-90 |

O erro da API Pagar.me: `invalid_parameter | agencia_dv | Invalid format`

## Causa Raiz

O campo "Dígito" da agência **existe no formulário mas não é obrigatório** - não tem validação nem indicador visual (*). O instrutor deixou vazio, e bancos como **Bradesco, Santander, Banco do Brasil** exigem esse dígito.

## Solução

Tornar o campo de dígito da agência **obrigatório para bancos que exigem**, com validação visual e mensagem de erro clara.

```text
ANTES:
┌─────────────────────────────────────┐
│  Agência *        │  Dígito         │  <- Sem asterisco
│  [63         ]    │  [   ]          │  <- Usuário deixa vazio
└─────────────────────────────────────┘

DEPOIS:
┌─────────────────────────────────────┐
│  Agência *        │  Dígito *       │  <- Com asterisco
│  [63         ]    │  [   ] ⚠️      │  <- Validação visual
└─────────────────────────────────────┘
⚠️ Informe o dígito da agência (obrigatório para Bradesco)
```

## Seção Técnica

### Arquivo: `src/components/instrutor/BankAccountSetup.tsx`

#### 1. Criar lista de bancos que exigem dígito de agência

```typescript
// Bancos que EXIGEM dígito verificador de agência
const BANKS_REQUIRING_AGENCY_DV = [
  "001", // Banco do Brasil
  "033", // Santander
  "237", // Bradesco
  "341", // Itaú
  "422", // Safra
];
```

#### 2. Adicionar validação condicional no `validateForm()`

Verificar se o banco selecionado exige dígito e, se sim, validar que foi preenchido:

```typescript
// Verificar se banco exige dígito de agência
if (BANKS_REQUIRING_AGENCY_DV.includes(bankCode) && !agenciaDv) {
  const bankName = SUPPORTED_BANKS.find(b => b.code === bankCode)?.name || bankCode;
  errors.agencia = `O ${bankName} exige o dígito verificador da agência`;
}
```

#### 3. Atualizar o label do campo dígito da agência

Adicionar "*" condicional quando o banco exige:

```tsx
<Label>
  Dígito {BANKS_REQUIRING_AGENCY_DV.includes(bankCode) && "*"}
</Label>
```

#### 4. Adicionar estilo de erro ao campo

Aplicar classe de erro quando houver problema de validação:

```tsx
<Input
  value={agenciaDv}
  onChange={(e) => {
    setAgenciaDv(e.target.value.replace(/\D/g, ""));
    clearFieldError("agencia"); // Limpar erro ao digitar
  }}
  placeholder="0"
  maxLength={1}
  className={fieldErrors.agencia && !agenciaDv ? "border-destructive" : ""}
/>
```

#### 5. Adicionar mensagem de ajuda dinâmica

Mostrar dica contextual sobre o formato esperado:

```tsx
{BANKS_REQUIRING_AGENCY_DV.includes(bankCode) && !agenciaDv && (
  <p className="text-xs text-muted-foreground mt-1">
    📋 Ex: Agência 0063-<strong>9</strong> → Dígito é "9"
  </p>
)}
```

### Arquivo: `supabase/functions/create-instructor-recipient-pagarme/index.ts`

#### 6. Melhorar mensagem de erro específica para `agencia_dv`

Adicionar mapeamento mais amigável:

```typescript
const errorMappings = {
  // ... existentes ...
  "agencia_dv": "Dígito da agência obrigatório para este banco. Confira no seu cartão (ex: 0063-9).",
};
```

## Resultado Esperado

- Campo "Dígito" da agência marcado como obrigatório (*) para bancos que exigem
- Validação visual com borda vermelha quando vazio
- Mensagem de erro clara explicando o formato esperado
- O instrutor Lucas Felipe conseguirá cadastrar informando o dígito completo da agência
