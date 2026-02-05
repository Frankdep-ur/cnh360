

# Plano de Finalização: KYC com WebView Full-Screen + Botão de Saque

## Resumo das Alterações

Com base na confirmação de que o teste KYC funcionou e a restrição de IP foi removida, vou finalizar a feature com melhorias na UX e adicionar o botão de saque no card de saldo.

---

## 1. Remoção do Botão de Teste KYC

**Arquivo:** `src/pages/instrutor/InstrutorDashboard.tsx`

Remover completamente o card temporário de teste (linhas 575-613):
- Remover o estado `testingKyc` e `kycTestResult`
- Remover a função `handleTestKyc`
- Remover o card com badge "DEV"

---

## 2. Melhorias no Botão "Verificar identidade agora"

**Arquivo:** `src/components/instrutor/InstructorBalanceCard.tsx`

### 2.1 Abertura em WebView Full-Screen (Mobile)
- Ao sucesso, abrir `kyc_url` em nova aba/WebView
- Mostrar loading spinner no botão enquanto abre

### 2.2 Controle de Timeout (20 minutos)
- Armazenar `expiration_date` retornado pela API
- Se o usuário clicar no botão após expirar, exibir toast: "Link expirado. Gerando novo link..."
- Gerar novo link automaticamente

### 2.3 Badge Verde para KYC Aprovado
- Quando `recipientStatus === "active"`, esconder o banner de verificação
- Exibir badge verde "Identidade verificada ✓" no lugar

### 2.4 Mensagem de Erro Atualizada
```typescript
toast({
  variant: "destructive",
  title: "Erro ao gerar link",
  description: "Erro ao gerar link de verificação. Tente novamente ou contate suporte via WhatsApp: wa.me/5518981288372"
});
```

---

## 3. Adicionar Botão de Saque no Card de Saldo

**Arquivo:** `src/components/instrutor/InstructorBalanceCard.tsx`

Atualmente o botão "Sacar" só existe na página de Ganhos. Vou adicionar ao card de saldo:

```text
┌─────────────────────────────────────┐
│  💰 Saldo                      🔄   │
│                                     │
│  Disponível para saque              │
│  R$ 1.037,00                        │
│                                     │
│  ┌────────────┐ ┌────────────┐      │
│  │ A receber  │ │ Transferido│      │
│  │ R$ 403,00  │ │ R$ 2.000   │      │
│  └────────────┘ └────────────┘      │
│                                     │
│  [       💸 Sacar Saldo       ]     │  ← NOVO BOTÃO
│                                     │
│  Atualizado às 14:30                │
└─────────────────────────────────────┘
```

Dependências:
- Importar e integrar `WithdrawModal`
- Passar `availableBalance` para o modal
- Bloquear saque se KYC não aprovado (exibir tooltip)

---

## 4. Melhorias na Edge Function start-kyc

**Arquivo:** `supabase/functions/start-kyc/index.ts`

Adicionar log final de sucesso:
```typescript
console.log(`KYC link gerado com sucesso para recipient_id: ${recipientId}`);
```

Já existe log similar, apenas confirmar que está padronizado.

---

## Seção Técnica

### Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/pages/instrutor/InstrutorDashboard.tsx` | Remover card de teste KYC e estados relacionados |
| `src/components/instrutor/InstructorBalanceCard.tsx` | Adicionar badge "verificado", botão de saque, controle de expiração, mensagem de erro com WhatsApp |
| `supabase/functions/start-kyc/index.ts` | Confirmar log final padronizado |

### Estados do KYC

| Status Gateway | Status Local | UI |
|----------------|--------------|-----|
| `registration` | `not_started` | Banner "Verificar identidade" |
| `affiliation` | `in_review` | Banner "Verificação em análise" |
| `active` | `approved` | Badge verde "Identidade verificada ✓" |
| `refused` | `refused` | Banner vermelho + botão "Recadastrar" |

### Fluxo do Botão de Saque

```text
1. Usuário clica "Sacar"
   ↓
2. Verificar se recipientStatus === "active"
   ↓
   2a. Se NÃO → toast: "Complete a verificação de identidade primeiro"
   ↓
   2b. Se SIM → Abrir WithdrawModal com saldo disponível
   ↓
3. Confirmar saque → Chamar request-manual-transfer-pagarme
   ↓
4. Sucesso → "Saque processado! Dinheiro na conta em até 1 dia útil."
```

### Importações a Adicionar (InstructorBalanceCard)

```typescript
import { WithdrawModal } from "@/components/instrutor/WithdrawModal";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
```

