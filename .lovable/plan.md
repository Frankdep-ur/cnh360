
# Plano: Remover Twilio e Migrar para SendPulse

## Fase 1: Limpeza Completa do Twilio

### 1.1 Reescrever Edge Function `send-whatsapp-notification`
Substituir todo o conteudo de `supabase/functions/send-whatsapp-notification/index.ts`:
- Remover referencias a `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_NUMBER`
- Adicionar comentario de migracao no topo
- Criar estrutura preparada para SendPulse (temporariamente desabilitada ate configurar credenciais)

```text
Arquivo: supabase/functions/send-whatsapp-notification/index.ts

Antes: Usa Twilio API para enviar WhatsApp
Depois: Estrutura pronta para SendPulse, com log indicando que esta pendente de configuracao
```

### 1.2 Atualizar `check-payment-status-pagarme`
O arquivo `supabase/functions/check-payment-status-pagarme/index.ts` continua chamando a Edge Function `send-whatsapp-notification` normalmente - nao precisa mudar, pois a interface (payload) sera mantida.

### 1.3 Limpar documentacao antiga
Atualizar `.lovable/plan.md` com informacoes sobre SendPulse ao inves de Twilio.

### 1.4 Remover Secrets do Twilio
Solicitar remocao dos secrets:
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_WHATSAPP_NUMBER`

## Fase 2: Preparar Integracao SendPulse

### 2.1 Secrets necessarios para SendPulse
Apos voce criar a conta no SendPulse e conectar o WhatsApp Business:
- `SENDPULSE_API_USER_ID` - ID do usuario da API
- `SENDPULSE_API_SECRET` - Secret da API
- `SENDPULSE_WHATSAPP_BOT_ID` - ID do bot WhatsApp configurado

### 2.2 Nova implementacao da Edge Function
A Edge Function `send-whatsapp-notification` sera atualizada para:
1. Autenticar na API SendPulse (OAuth2)
2. Enviar mensagem WhatsApp usando a API de bots
3. Manter o mesmo payload de entrada (compatibilidade com `check-payment-status-pagarme`)

---

## Estrutura Final

```text
supabase/functions/send-whatsapp-notification/
  index.ts  <- Migrado para SendPulse

Secrets removidos:
  - TWILIO_ACCOUNT_SID
  - TWILIO_AUTH_TOKEN
  - TWILIO_WHATSAPP_NUMBER

Novos secrets (a adicionar):
  - SENDPULSE_API_USER_ID
  - SENDPULSE_API_SECRET
  - SENDPULSE_WHATSAPP_BOT_ID
```

---

## Proximo Passo Apos Aprovacao

1. Vou reescrever a Edge Function sem Twilio
2. Vou limpar a documentacao `.lovable/plan.md`
3. Vou solicitar a remocao dos 3 secrets do Twilio
4. Vou criar a estrutura inicial para SendPulse
5. Voce cria a conta no SendPulse, conecta o WhatsApp, e me passa as credenciais

---

## Secao Tecnica

### API SendPulse - Fluxo de Autenticacao

```text
POST https://api.sendpulse.com/oauth/access_token
Content-Type: application/json

{
  "grant_type": "client_credentials",
  "client_id": "SENDPULSE_API_USER_ID",
  "client_secret": "SENDPULSE_API_SECRET"
}
```

### API SendPulse - Enviar Mensagem WhatsApp

```text
POST https://api.sendpulse.com/whatsapp/contacts/sendByPhone
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "bot_id": "SENDPULSE_WHATSAPP_BOT_ID",
  "phone": "+5518981288372",
  "message": {
    "type": "text",
    "text": {
      "body": "Mensagem aqui..."
    }
  }
}
```

### Comparacao Twilio vs SendPulse

| Aspecto | Twilio | SendPulse |
|---------|--------|-----------|
| Sandbox | Requer ativacao manual por usuario | Nao tem sandbox, usa numero real |
| Setup | Complexo, precisa de join code | Conecta WhatsApp Business direto |
| Custo | Trial limitado | Plano gratuito ate 10k contatos |
| API | REST simples | REST com OAuth2 |
