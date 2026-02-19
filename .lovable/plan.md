

# Atualizar mensagem WhatsApp de aula confirmada via PIX

## Resumo

Alterar a mensagem enviada ao instrutor via WhatsApp quando um pagamento PIX e confirmado. A mensagem atual e generica; a nova versao sera mais envolvente e incluira link direto para o chat.

## Alteracao

Apenas 1 arquivo precisa ser editado:

**`supabase/functions/pagarme-payment-webhook/index.ts`** (linha ~126)

Substituir a string da mensagem atual pela nova estrutura:

```text
ANTES:
🎉 *Nova aula confirmada via PIX!*

👤 Aluno: {nome}
⏱ Duração: {duracao} min
💰 Valor: R$ {valor}

Acesse o app para ver os detalhes.

DEPOIS:
🚀 *Parabéns! Você tem uma nova aula confirmada!*

Seu aluno acabou de pagar via PIX.

👤 {nome}
⏱ {duracao} min
💰 R$ {valor}

💬 Envie um "Oi" agora mesmo e alinhe local e horário.

👉 Clique aqui para abrir o chat:
https://cnh360.com/instrutor/chat
```

## Detalhes tecnicos

A mensagem e enviada na Edge Function `pagarme-payment-webhook` via chamada a `send-whatsapp-notification`. A unica mudanca e a string template na linha 126. Nenhuma outra alteracao de codigo ou banco de dados e necessaria. A Edge Function sera reimplantada automaticamente.

