

# Correção: Bug na Lógica do Banner KYC

## Problema Identificado

Na análise do `InstructorBalanceCard.tsx`, encontrei um bug lógico:

```typescript
// Linha 295-299 - BUG
const showKycBannerInitial = !recipientStatus && 
  hasRecipient && 
  !loading && 
  balance &&
  recipientStatus !== "refused";  // Quando recipientStatus é null, isso SEMPRE retorna true
```

O problema: quando `recipientStatus` é `null` (ainda não carregou da API), a condição `recipientStatus !== "refused"` é sempre `true`, fazendo o banner de verificação KYC aparecer mesmo quando o `localKycStatus` já está como `refused`.

---

## Dados Verificados - Frank vs Lucas

| Campo | Frank Alexandre | Lucas Felipe |
|-------|-----------------|--------------|
| Recipient ID | `re_cmkx1ob1cy0mz0l9tjhxp6lcf` | `re_cmla3cmxv2i8o0l9tfom1sp7h` |
| KYC Status | `approved` | `refused` |
| CPF | `447.908.628-52` | `473.547.278-90` |

O Frank está corretamente configurado com status `approved`.

---

## Correção Proposta

### Arquivo: `src/components/instrutor/InstructorBalanceCard.tsx`

**Mudança nas linhas 293-309:**

```typescript
// CORREÇÃO: Verificar também localKycStatus
const showKycBannerInitial = !recipientStatus && 
  hasRecipient && 
  !loading && 
  balance &&
  localKycStatus !== "refused" &&  // ADICIONAR
  localKycStatus !== "approved";   // ADICIONAR - também não mostrar se já aprovado

// Já está corrigido:
const showKycBannerBeforeBalance = hasRecipient && 
  !recipientStatus && 
  !balance &&
  !loading &&
  localKycStatus !== "refused";
// ADICIONAR também:
//  && localKycStatus !== "approved"
```

### Lógica Corrigida

```text
localKycStatus == "approved"
    └─ NÃO mostrar banner (já verificado)

localKycStatus == "refused"
    └─ NÃO mostrar banner de KYC
    └─ MOSTRAR botão "Recadastrar dados bancários"

localKycStatus == null ou outros
    └─ MOSTRAR banner de verificação KYC
```

---

## Seção Técnica

### Alterações Específicas

| Linha | De | Para |
|-------|-----|------|
| 295-299 | Não verifica `localKycStatus` em `showKycBannerInitial` | Adicionar `localKycStatus !== "refused" && localKycStatus !== "approved"` |
| 305-309 | Não verifica se já está aprovado | Adicionar `localKycStatus !== "approved"` |

### Resumo

- Frank Alexandre: **OK** - status `approved`, pode fazer saques
- Lucas Felipe: **RECUSADO** - precisa recadastrar dados bancários
- Bug no código: Banner de KYC aparecia mesmo quando status local era `refused`

