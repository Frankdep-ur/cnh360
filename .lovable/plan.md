

# Diagnóstico: Por que o Saldo do Frank é Zero na Pagar.me

## O que Aconteceu

| Evento | Data/Hora | Status |
|--------|-----------|--------|
| Pagamento PIX realizado | 31/01/2026 21:09 | ✅ Pago |
| Status do recebedor Frank | 31/01/2026 21:09 | ❌ `affiliation` (em análise) |
| KYC Frank aprovado (status → active) | **03/02/2026 18:16** | ✅ Aprovado |

**Problema identificado**: O pagamento foi processado **3 dias antes** da conta do instrutor ser aprovada!

## Por que isso aconteceu

O código de split tem uma verificação de segurança (linhas 107-108 do `create-pix-payment-pagarme`):

```typescript
// Only include in split if recipient is active
instructorRecipientValid = recipientInfo.status === "active";
```

No momento do pagamento (31/01), o status era `affiliation`, então:
- `instructorRecipientValid = false`
- Split **NÃO foi aplicado**
- 100% do valor (R$ 9,03) foi para a conta da CNH360
- R$ 0,00 foi para a conta do Frank

## Consequência

- **Banco de dados local**: Mostra R$ 4,52 para o instrutor (cálculo teórico)
- **Pagar.me real**: R$ 0,00 na conta do Frank (split não executado)

O dinheiro está na **sua conta** (CNH360), não na conta do instrutor.

---

## Soluções

### Opção 1: Transferência Manual (Recomendada)
Você precisa fazer uma transferência manual de R$ 4,52 da conta CNH360 para o Frank:

1. Acessar o dashboard da Pagar.me
2. Ir em "Transferências"
3. Criar transferência de R$ 4,52 para o recebedor `re_cmkx1ob1cy0mz0l9tjhxp6lcf` (Frank)

### Opção 2: PIX Direto
Alternativamente, fazer um PIX diretamente para a conta bancária do Frank e marcar o pagamento como "compensado manualmente" no sistema.

---

## Prevenção Futura

### Correção no Código

O sistema deveria **impedir** que um aluno solicite aula de um instrutor que ainda não tem conta `active`. Vou implementar uma validação:

**Arquivo**: `src/pages/aluno/AgendarAula.tsx` (ou onde a aula é agendada)

```typescript
// Antes de permitir pagamento, verificar se instrutor tem conta ativa
const { data: instrutor } = await supabase
  .from("instrutores")
  .select("pagarme_recipient_id, kyc_status")
  .eq("id", instructorId)
  .single();

if (!instrutor?.pagarme_recipient_id || instrutor.kyc_status !== "approved") {
  toast.error("Este instrutor ainda não finalizou o cadastro bancário");
  return;
}
```

### Alertas Adicionais

1. **Card de Instrutor**: Mostrar badge "Verificação pendente" se `kyc_status !== "approved"`
2. **Página de Perfil do Instrutor**: Bloquear agendamento se conta não ativa

---

## Sobre o Prazo PIX vs Cartão

Você está **100% correto**: PIX é instantâneo e não tem D+14/D+30.

O que aconteceu aqui foi diferente - o split **não foi executado** porque a conta não estava ativa. O dinheiro chegou instantaneamente sim, mas foi 100% para a plataforma.

Se o split tivesse sido aplicado corretamente, o valor estaria disponível imediatamente na conta do instrutor.

---

## Resumo das Ações

| Ação | Responsável | Tipo |
|------|-------------|------|
| Transferir R$ 4,52 para Frank | Você (via dashboard Pagar.me) | Manual |
| Validar conta ativa antes de permitir aula | Código | Prevenção |
| Exibir badge de verificação pendente | Código | UX |

---

## Seção Técnica

### Causa Raiz
A lógica de fallback (linhas 205-208 do `create-pix-payment-pagarme`) foi acionada:

```typescript
} else {
  // No split - 100% goes to platform (instructor not configured or refused)
  logStep("No split - instructor recipient not valid or missing");
}
```

### Timeline Detalhada

```text
31/01 19:02 - Aula criada (PIX gerado)
31/01 19:05 - PIX pago pelo aluno
31/01 21:09 - Pagamento registrado no banco local
           → Split check: recipientStatus = "affiliation" ≠ "active"
           → Split NÃO aplicado
           → 100% → CNH360

03/02 18:16 - KYC aprovado (status → "active")
           → Tarde demais, pagamento já processado

05/02 03:40 - Consulta de saldo
           → Pagar.me retorna: available=0, waiting_funds=0
           → Sistema faz fallback para pagamentos locais: R$ 4,52
```

### Arquivos a Modificar (Prevenção)

| Arquivo | Alteração |
|---------|-----------|
| `src/pages/aluno/AgendarAula.tsx` | Validar `kyc_status === "approved"` antes de permitir aula |
| `src/components/cards/InstructorCard.tsx` | Exibir badge "Verificação pendente" |
| `src/pages/aluno/InstrutorPerfil.tsx` | Bloquear botão de agendar se conta não ativa |

