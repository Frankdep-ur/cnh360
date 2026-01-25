

# Plano: Atualizar Secret TWILIO_WHATSAPP_NUMBER

## Ação Necessária

Você precisa atualizar o secret `TWILIO_WHATSAPP_NUMBER` para o número do Sandbox da Twilio.

### Passos:

1. **Clique em "Aprovar"** este plano
2. Quando aparecer o modal para atualizar o secret, insira o valor:
   ```
   +14155238886
   ```
3. Confirme a atualização

### Importante - Ativação do Sandbox pelo Tiago

Antes de testar, certifique-se que o instrutor **Tiago Silva** já enviou a mensagem de ativação:

1. No **console Twilio** → **Messaging** → **Try it out** → **Send a WhatsApp message**
2. Copie o código de ativação (ex: `join bright-sunset`)
3. O Tiago deve enviar esse código via WhatsApp para `+14155238886`

### Após Atualização

Assim que você atualizar o secret, eu vou:
1. Redeployar a Edge Function
2. Testar o envio de mensagem WhatsApp para o Tiago
3. Confirmar se a notificação chegou

