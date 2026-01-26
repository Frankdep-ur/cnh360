
# Plano: Integrar Z-API para Notificações WhatsApp

## Visão Geral

Substituir a integração SendPulse (nunca configurada) pela Z-API para enviar notificações WhatsApp automáticas ao instrutor quando o pagamento de uma aula for confirmado.

## Arquitetura Atual

```text
Pagamento Confirmado (Pagar.me)
        ↓
check-payment-status-pagarme (Edge Function)
        ↓
send-whatsapp-notification (Edge Function) ← MODIFICAR AQUI
        ↓
WhatsApp → Instrutor
```

O fluxo já está 100% implementado - só preciso trocar o provedor de SendPulse para Z-API.

---

## Fase 1: Adicionar Secrets da Z-API

Criar 2 novos secrets no projeto:

| Secret | Descrição |
|--------|-----------|
| `ZAPI_INSTANCE_ID` | ID da instância "CNH360 Teste" |
| `ZAPI_TOKEN` | Token de integração da instância |

Você precisará fornecer esses valores do seu dashboard Z-API.

---

## Fase 2: Reescrever Edge Function

Arquivo: `supabase/functions/send-whatsapp-notification/index.ts`

### Mudanças:

1. **Remover** todo código SendPulse (OAuth2, getSendPulseAccessToken, sendWhatsAppViaSendPulse)
2. **Adicionar** função `sendWhatsAppViaZAPI` usando a API REST da Z-API
3. **Atualizar** comentário no topo do arquivo
4. **Manter** o mesmo payload de entrada (compatibilidade com `check-payment-status-pagarme`)

### API Z-API - Enviar Texto

```text
POST https://api.z-api.io/instances/{ZAPI_INSTANCE_ID}/token/{ZAPI_TOKEN}/send-text
Content-Type: application/json

{
  "phone": "5518981288372",
  "message": "Pagamento confirmado! 🎉\n..."
}
```

### Mensagem Formatada

```text
🎉 *Pagamento confirmado!*

👤 *Aluno:* João Silva
📚 *Aula:* Categoria B - 50 min prática
📅 *Data/Hora:* segunda-feira, 27/01/2026, 14:00
📍 *Local:* Rua das Flores, 123
💰 *Valor pago:* R$ 120.00

💬 Acesse o chat no app para falar com o aluno:
https://cnh360.lovable.app/aluno/chat/[aulaId]

Bora ensinar! 🚗
```

---

## Fase 3: Atualizar Documentação

Arquivo: `.lovable/plan.md`

Atualizar para refletir a mudança de SendPulse para Z-API.

---

## Fase 4: Deploy e Teste

1. Fazer deploy da Edge Function atualizada
2. Testar chamando a função com dados reais do instrutor Tiago Silva
3. Verificar se a mensagem chegou no WhatsApp dele

---

## Estrutura Final

```text
Secrets:
  ✓ ZAPI_INSTANCE_ID (novo)
  ✓ ZAPI_TOKEN (novo)

Edge Function:
  ✓ send-whatsapp-notification → Usando Z-API

Arquivos modificados:
  - supabase/functions/send-whatsapp-notification/index.ts
  - .lovable/plan.md
```

---

## Comparação SendPulse vs Z-API

| Aspecto | SendPulse | Z-API |
|---------|-----------|-------|
| Autenticação | OAuth2 (2 chamadas) | Token direto na URL |
| Endpoint | Complexo | Simples e direto |
| Suporte BR | Internacional | Brasileiro 🇧🇷 |
| Setup | Requer bot WhatsApp | Conecta direto |

---

## Próximos Passos Após Aprovação

1. Você me fornece o `ZAPI_INSTANCE_ID` e `ZAPI_TOKEN`
2. Eu adiciono os secrets no projeto
3. Eu reescrevo a Edge Function para usar Z-API
4. Eu atualizo a documentação
5. Testamos o envio para o instrutor Tiago Silva
