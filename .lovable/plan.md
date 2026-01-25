# CNH360 - Plano de Integração WhatsApp

## Status Atual: SendPulse (Ativo)

**Data da migração:** 25/01/2026  
**Provedor anterior:** Twilio (removido)  
**Provedor atual:** SendPulse WhatsApp Business API

---

## Configuração SendPulse

### Secrets Necessários

| Secret | Descrição | Status |
|--------|-----------|--------|
| `SENDPULSE_API_USER_ID` | ID do usuário da API SendPulse | ⏳ Pendente |
| `SENDPULSE_API_SECRET` | Secret da API SendPulse | ⏳ Pendente |
| `SENDPULSE_WHATSAPP_BOT_ID` | ID do bot WhatsApp configurado | ⏳ Pendente |

### Como Configurar

1. Criar conta em https://sendpulse.com
2. Acessar **Chatbots > WhatsApp**
3. Conectar número WhatsApp Business (requer verificação Meta)
4. Copiar credenciais da API em **Configurações > API**
5. Adicionar os 3 secrets no projeto

---

## Arquitetura da Notificação

```
Pagamento Confirmado (Pagar.me)
        ↓
check-payment-status-pagarme
        ↓
send-whatsapp-notification (Edge Function)
        ↓
SendPulse API (OAuth2 + REST)
        ↓
WhatsApp Business → Instrutor
```

### Fluxo Técnico

1. `check-payment-status-pagarme` detecta pagamento `succeeded`
2. Chama `send-whatsapp-notification` com payload da aula
3. Edge Function autentica via OAuth2 no SendPulse
4. Envia mensagem formatada para o instrutor

---

## API SendPulse - Referência

### Autenticação (OAuth2)

```http
POST https://api.sendpulse.com/oauth/access_token
Content-Type: application/json

{
  "grant_type": "client_credentials",
  "client_id": "{SENDPULSE_API_USER_ID}",
  "client_secret": "{SENDPULSE_API_SECRET}"
}
```

### Enviar Mensagem WhatsApp

```http
POST https://api.sendpulse.com/whatsapp/contacts/sendByPhone
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "bot_id": "{SENDPULSE_WHATSAPP_BOT_ID}",
  "phone": "+5518981288372",
  "message": {
    "type": "text",
    "text": {
      "body": "Mensagem aqui..."
    }
  }
}
```

---

## Histórico de Mudanças

| Data | Ação |
|------|------|
| 25/01/2026 | Removido Twilio completamente |
| 25/01/2026 | Migrado para SendPulse |
| 25/01/2026 | Secrets Twilio deletados |

---

## Próximos Passos

- [ ] Criar conta SendPulse
- [ ] Conectar WhatsApp Business
- [ ] Adicionar secrets no projeto
- [ ] Testar envio de notificação
- [ ] Validar em produção
