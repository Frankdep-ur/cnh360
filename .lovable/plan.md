

# Plano: Corrigir Validação e Exibição do Campo Data de Nascimento

## Problema Identificado

O campo "Data de Nascimento" existe no formulário, mas quando está vazio:
1. O erro é lançado como exceção genérica (`return "Informe a data de nascimento"`)
2. Não há destaque visual no campo (borda vermelha)
3. Não há mensagem de erro abaixo do campo

Diferente dos outros campos que usam o objeto `fieldErrors` para feedback visual específico.

## Solução

Modificar a validação para tratar o campo de data de nascimento da mesma forma que os outros campos.

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/components/instrutor/BankAccountSetup.tsx` | Adicionar validação visual para birthdate |

## Implementacao

### 1. Adicionar "birthdate" ao interface FieldErrors (linha ~48)

```typescript
interface FieldErrors {
  documentNumber?: string;
  agencia?: string;
  conta?: string;
  contaDv?: string;
  holderName?: string;
  email?: string;
  bankCode?: string;
  birthdate?: string;  // ← Adicionar
}
```

### 2. Modificar validateForm para usar fieldErrors (linhas 180-186)

**Antes:**
```typescript
// Validar campos obrigatórios para pessoa física
if (!birthdate) {
  return "Informe a data de nascimento";
}
```

**Depois:**
```typescript
// Validar campos obrigatórios para pessoa física
if (!birthdate) {
  errors.birthdate = "Informe a data de nascimento";
}

// Validar idade mínima (18 anos)
if (birthdate) {
  const birth = new Date(birthdate);
  const today = new Date();
  const age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (age < 18 || (age === 18 && monthDiff < 0)) {
    errors.birthdate = "Você deve ter pelo menos 18 anos";
  }
}
```

### 3. Adicionar destaque visual e mensagem de erro no Input (linhas 479-490)

**Depois:**
```tsx
{holderType === "individual" && (
  <div className="space-y-2">
    <Label>Data de Nascimento *</Label>
    <Input
      type="date"
      value={birthdate}
      onChange={(e) => {
        setBirthdate(e.target.value);
        clearFieldError("birthdate");  // ← Adicionar
      }}
      max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
      className={fieldErrors.birthdate ? "border-destructive focus-visible:ring-destructive" : ""}
    />
    {fieldErrors.birthdate && (
      <p className="text-xs text-destructive flex items-center gap-1">
        <AlertTriangle className="w-3 h-3" />
        {fieldErrors.birthdate}
      </p>
    )}
    <p className="text-xs text-muted-foreground">Você deve ter pelo menos 18 anos</p>
  </div>
)}
```

### 4. Remover o return antecipado de endereço

Também ajustar a validação de endereço para seguir o mesmo padrão:

```typescript
if (!hasAddress) {
  errors.address = "Complete seu cadastro primeiro";
  // Em vez de: return "Complete seu endereço...";
}
```

## Fluxo Corrigido

```text
┌─────────────────────────────────────────┐
│ Usuário abre formulário de dados        │
│ bancários sem preencher data nascimento │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│ Clica em "Salvar dados bancários"       │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│ Validação detecta campo vazio           │
│ → Adiciona ao fieldErrors.birthdate     │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│ Campo recebe borda VERMELHA             │
│ Mensagem: "Informe a data de nascimento"│
└─────────────────────────────────────────┘
```

## Benefícios

1. **Feedback visual claro** - Borda vermelha no campo vazio
2. **Mensagem específica** - "Informe a data de nascimento" abaixo do campo
3. **Validação de idade** - Verifica se tem pelo menos 18 anos
4. **Limpa erro ao digitar** - Remove destaque vermelho quando usuário corrige
5. **Consistência** - Mesmo padrão dos outros campos do formulário

