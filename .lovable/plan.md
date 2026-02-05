

# Correção: Dica de Agência + Botão de Verificação KYC

## Problemas Identificados

### Problema 1: Dica da agência confusa

| Situação | O que aparece |
|----------|---------------|
| No cartão do banco | Agência: **63** |
| Na dica do app | Agência 0**0063**-9 |

O exemplo mostra zeros à esquerda que não aparecem no cartão do banco, confundindo o usuário.

### Problema 2: Botão de verificação KYC não aparece

O instrutor Lucas Felipe tem dados bancários configurados (`pagarme_recipient_id` existe) mas o botão de verificação de identidade **não aparece automaticamente** porque:

1. O banner de KYC só é exibido quando existe `recipientStatus` ou quando o usuário já clicou em "Consultar saldo"
2. O instrutor precisa primeiro clicar em "Consultar saldo" para o status ser carregado
3. A condição `showKycBannerInitial` exige que `balance` exista, mas o saldo só carrega após clique manual

O fluxo atual:
```text
┌─────────────────────────────────────┐
│  Card de Saldo                      │
│  [Consultar saldo] <- precisa clicar│
│                                     │
│  (nenhum banner de KYC visível)     │
└─────────────────────────────────────┘
```

Fluxo corrigido:
```text
┌─────────────────────────────────────┐
│  Card de Saldo                      │
│  ⚠️ Verificação pendente            │
│  [🔍 Verificar identidade agora]    │  <- visível sempre
│                                     │
│  [Consultar saldo]                  │
└─────────────────────────────────────┘
```

## Seção Técnica

### Arquivo 1: `src/components/instrutor/BankAccountSetup.tsx`

**Mudança**: Corrigir a dica para usar formato realista (sem zeros à esquerda)

Antes:
```tsx
📋 Ex: Agência 0063-<strong>9</strong> → Dígito é "9"
```

Depois:
```tsx
📋 Ex: Agência 63-<strong>9</strong> → Dígito é "9"
```

**Local**: Linha 603-605

### Arquivo 2: `src/components/instrutor/InstructorBalanceCard.tsx`

**Mudança 1**: Chamar `fetchBalance()` automaticamente ao montar o componente quando `hasRecipient` é true

Adicionar `useEffect` para carregar saldo automaticamente:
```tsx
useEffect(() => {
  if (hasRecipient) {
    fetchBalance();
  }
}, [hasRecipient]);
```

**Mudança 2**: Mostrar banner de KYC ANTES de carregar saldo, quando instrutor tem recipient configurado mas não tem status ativo

Adicionar nova condição para exibir o banner de verificação imediatamente:
```tsx
// Show KYC banner when instructor has bank data but hasn't verified yet
const showKycBannerBeforeBalance = hasRecipient && !balance && !loading && !error;
```

E renderizar este banner logo após o header, antes do botão "Consultar saldo":
```tsx
{showKycBannerBeforeBalance && (
  <div className="mb-4 p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 ...">
    <div className="flex items-start gap-3">
      <Camera className="w-5 h-5" />
      <div>
        <h4>Complete sua verificação</h4>
        <p>Verifique sua identidade para liberar os saques.</p>
        <Button onClick={handleVerifyIdentity}>
          Verificar identidade agora
        </Button>
      </div>
    </div>
  </div>
)}
```

### Arquivo 3: `supabase/functions/create-instructor-recipient-pagarme/index.ts`

**Mudança**: Melhorar mensagem de erro para dígito de agência

Atualizar o mapeamento de erros para ser mais claro:
```typescript
"agencia_dv": "Dígito da agência obrigatório. Ex: Agência 63-9 → Dígito é '9'",
```

## Resultado Esperado

1. A dica da agência mostrará o formato correto sem zeros confusos
2. O banner de verificação de identidade aparecerá imediatamente para instrutores com dados bancários configurados
3. O saldo será carregado automaticamente ao abrir o perfil
4. O instrutor Lucas Felipe conseguirá clicar e abrir o link de verificação

