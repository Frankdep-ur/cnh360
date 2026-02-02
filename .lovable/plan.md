

# Plano: KYC In-App Completo (Sem WhatsApp)

## Situação Atual

**O que já está funcionando:**
- Webhook configurado na Pagar.me (`recipient.created`, `recipient.updated`, etc.)
- Edge Function `pagarme-kyc-webhook` recebendo eventos e atualizando `kyc_status`
- Banco de dados com coluna `kyc_status` na tabela `instrutores`
- UI mostrando status de verificação

**O problema:**
- A geração do link KYC (`/kyc_link`) da Pagar.me exige IP fixo
- Edge Functions usam IPs dinâmicos = erro "IP de origem não autorizado"
- Código atual redireciona para WhatsApp como fallback

---

## Solução Proposta

Como a Pagar.me envia eventos `recipient.updated` quando o status muda, vamos usar uma abordagem diferente: **verificação automática via status do recebedor**.

### Fluxo Técnico:

```text
1. Instrutor cadastra dados bancários
         ↓
2. Pagar.me cria recipient (status: "affiliation")
         ↓
3. Pagar.me AUTOMATICAMENTE solicita documentos/selfie
         ↓
4. Pagar.me envia webhook recipient.updated
         ↓
5. Nosso webhook atualiza kyc_status
         ↓
6. UI reflete automaticamente (approved = saque liberado)
```

### O que a Pagar.me faz automaticamente:
- Quando um recebedor é criado, a própria Pagar.me envia email/SMS ao instrutor com instruções de verificação
- O instrutor recebe o link diretamente da Pagar.me
- Não precisamos gerar o link manualmente!

---

## Implementação

### 1. Atualizar Edge Function `get-kyc-link-pagarme`

Remover todo fallback de WhatsApp e informar que a verificação é automática:

```typescript
// Quando der erro de IP, retornar mensagem informativa
if (errorDeIP) {
  return {
    success: false,
    automaticVerification: true,
    message: "A Pagar.me enviou um link de verificação para seu email/celular. 
              Verifique sua caixa de entrada.",
    recipientStatus: recipientStatus
  };
}
```

### 2. Atualizar UI - InstructorBalanceCard.tsx

Remover código de WhatsApp e mostrar instruções claras:

```typescript
// Remover:
if (data?.needsManualVerification) {
  window.open(`https://wa.me/...`); // REMOVER
}

// Adicionar:
if (data?.automaticVerification) {
  toast({
    title: "Verificação Automática",
    description: "A Pagar.me enviou o link para seu email. Verifique sua caixa de entrada.",
  });
}
```

### 3. Atualizar UI - InstrutorGanhos.tsx

Mesmo ajuste - remover WhatsApp e usar mensagem informativa.

### 4. Expandir Webhook para Mais Eventos

Garantir que `recipient.updated` capture todas as mudanças de status:

```typescript
// Já implementado, mas vamos adicionar logging melhorado
if (eventType === "recipient.updated") {
  // status: active, affiliation, refused, suspended
  // Mapear para: approved, in_review, refused
}
```

### 5. Adicionar Polling Opcional

Para casos onde o webhook não chegou ainda, permitir refresh manual:

```typescript
// Botão "Atualizar Status" que consulta a Pagar.me
// e atualiza o kyc_status no banco
```

---

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `supabase/functions/get-kyc-link-pagarme/index.ts` | Remover WhatsApp, retornar `automaticVerification: true` |
| `src/components/instrutor/InstructorBalanceCard.tsx` | Remover WhatsApp, mostrar toast informativo |
| `src/pages/instrutor/InstrutorGanhos.tsx` | Remover WhatsApp, atualizar mensagens |
| `supabase/functions/pagarme-kyc-webhook/index.ts` | Melhorar logging para debug |

---

## Fluxo Final para o Instrutor

1. Instrutor configura dados bancários
2. Sistema mostra: "Conta em análise - Verifique seu email para completar a verificação"
3. Instrutor recebe email/SMS da Pagar.me com link
4. Instrutor completa verificação
5. Pagar.me envia webhook para nosso endpoint
6. UI atualiza automaticamente para "Conta Ativa"
7. Saque liberado!

---

## Seção Técnica

### Eventos de Webhook Configurados
- `recipient.created` - Novo recebedor criado
- `recipient.updated` - Status alterado (inclui mudanças KYC)
- `recipient.deleted` - Recebedor excluído
- `bank_account.created/updated/deleted` - Mudanças bancárias
- `anticipation.*` - Eventos de antecipação

### Mapeamento de Status
| Pagar.me Status | Nosso kyc_status | Ação |
|-----------------|------------------|------|
| `active` | `approved` | Libera saques |
| `affiliation` | `in_review` | Aguardando verificação |
| `refused` | `refused` | Bloqueia saques |
| `suspended` | `refused` | Bloqueia saques |

### Nota Importante
A Pagar.me pode demorar alguns minutos para enviar o webhook após a mudança de status. O botão "Atualizar Status" permite consulta manual quando necessário.

