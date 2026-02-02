

# Plano: Integração Automática de Prova de Vida (KYC) Pagar.me

## Diagnóstico do Problema

O instrutor **Frank Alexandre** tem um recebedor criado na Pagar.me (`re_cmkx1ob1cy0mz0l9tjhxp6lcf`), mas está em status `affiliation` (aguardando aprovação).

### Por que ele não consegue sacar?

Segundo a documentação da Pagar.me V5, o processo de credenciamento de recebedores inclui uma **Prova de Vida (KYC)** obrigatória:

1. Recebedor transaciona normalmente mesmo sem aprovação final
2. Porém, **só pode sacar saldo após status `active`**
3. Para ativar, precisa passar por **biometria facial** via webapp

### Fluxo atual exigido pela Pagar.me

```text
Recebedor Criado → status: registration
        │
        ▼
Análise Automática → status: affiliation + kyc_details: partially_denied
        │
        ▼
[PASSO FALTANDO] Marketplace gera link de KYC via API
        │
        ▼
Instrutor acessa link e faz prova de vida (selfie + docs)
        │
        ▼
Aprovado → status: active → PODE SACAR
```

---

## Solução Proposta: Automatizar a Geração do Link KYC

### O que será criado

Implementar uma Edge Function que:
1. Consulta o status do recebedor na Pagar.me
2. Se status for `affiliation`, gera link de KYC via `POST /recipients/{id}/kyc_link`
3. Retorna o link para o instrutor acessar e fazer a prova de vida

### Onde será exibido no app

Na seção de **Saldo/Ganhos** do dashboard do instrutor, quando o status do recebedor não for `active`:

- Mostrar um banner informativo: "Complete sua verificação de identidade para liberar saques"
- Botão: "Verificar Identidade Agora" → abre o link de KYC

---

## Arquivos a Serem Criados/Modificados

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `supabase/functions/get-kyc-link-pagarme/index.ts` | **CRIAR** | Nova Edge Function para gerar link de KYC |
| `src/components/instrutor/InstructorBalanceCard.tsx` | **MODIFICAR** | Adicionar botão de verificação KYC quando necessário |
| `supabase/config.toml` | **MODIFICAR** | Registrar nova função com `verify_jwt = true` |

---

## Interface do Usuário

### Quando recebedor está em `affiliation`:

```text
┌────────────────────────────────────────────────────────────────┐
│  💼 Saldo                                        [🔄 Atualizar] │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ⏳ Sua conta está em processo de ativação                     │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  🔒 Complete a Verificação de Identidade                 │ │
│  │                                                          │ │
│  │  Para liberar seus saques, você precisa confirmar sua    │ │
│  │  identidade através de uma selfie rápida.                │ │
│  │                                                          │ │
│  │  [ 📸 Verificar Identidade Agora ]                       │ │
│  │          (botão verde)                                   │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌─────────────────────┐  ┌─────────────────────┐             │
│  │ A receber (pendente)│  │ Já transferido      │             │
│  │     R$ 55,00        │  │     R$ 0,00         │             │
│  └─────────────────────┘  └─────────────────────┘             │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## Seção Técnica

### Edge Function: get-kyc-link-pagarme

```typescript
// Endpoint: POST /recipients/{id}/kyc_link
const kycResponse = await fetch(
  `https://api.pagar.me/core/v5/recipients/${recipientId}/kyc_link`,
  {
    method: "POST",
    headers: {
      "Authorization": `Basic ${btoa(pagarmeApiKey + ":")}`,
      "Content-Type": "application/json",
    },
  }
);

// Response:
// {
//   "base64": "BJ1B51JK2B51KJ2B5=",  // QR Code em base64
//   "url": "www.pagar.me/kyc/14214214215",  // Link direto
//   "expiration_date": "2024-02-10T20:35:46.046Z"  // Expira em 20 min
// }
```

### Lógica no InstructorBalanceCard

```typescript
// Quando recipientStatus === "affiliation" e kyc_details.status === "partially_denied"
const handleVerifyIdentity = async () => {
  setLoadingKyc(true);
  const { data } = await supabase.functions.invoke("get-kyc-link-pagarme");
  
  if (data?.url) {
    // Abre o link de KYC em nova aba
    window.open(`https://${data.url}`, "_blank");
  }
  setLoadingKyc(false);
};
```

### Fluxo Completo

```text
1. Instrutor abre dashboard
2. Sistema consulta saldo + status do recebedor
3. Se status = "affiliation":
   → Mostra banner de KYC pendente
   → Botão "Verificar Identidade"
4. Instrutor clica no botão
5. Sistema chama get-kyc-link-pagarme
6. API Pagar.me retorna URL do webapp
7. Instrutor é redirecionado para webapp
8. Instrutor faz selfie + validação de documento
9. Pagar.me analisa (automático, poucos minutos)
10. Webhook atualiza status para "active"
11. Instrutor pode sacar!
```

### Observações Importantes

1. **Link expira em 20 minutos** - se expirar, gerar novo
2. **Não precisa de ação do suporte** - todo processo é automatizado
3. **Recebedor já transaciona** - apenas saque é bloqueado
4. **Prova de vida é simples** - selfie + confirmação de dados

---

## Resumo Executivo para o Usuário

O que precisa ser feito para o **Frank Alexandre sacar**:

1. ✅ Ele já tem conta bancária cadastrada
2. ⏳ Conta está em "afiliação" (aguardando prova de vida)
3. 🔧 Implementar botão no app que gera link de KYC
4. 📸 Frank acessa o link e faz selfie
5. ✅ Pagar.me aprova em poucos minutos
6. 💰 Frank pode sacar!

**Tempo de implementação**: ~30 minutos de código + aprovação automática da Pagar.me

