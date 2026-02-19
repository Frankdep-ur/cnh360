

# Criar Edge Function temporaria test-whatsapp

## Resumo

Criar uma Edge Function temporaria `test-whatsapp` que envia uma mensagem de teste para Frank Alexandre (18997427195) usando o novo formato com dados ficticios de aula. Apos confirmar que funciona, a funcao sera removida.

## Implementacao

### 1. Criar `supabase/functions/test-whatsapp/index.ts`

A funcao vai:
- Chamar diretamente a funcao `sendWhatsAppViaZAPI` com o telefone do Frank
- Usar dados ficticios de aula (data amanha as 14:00, 50 min, R$ 120.00)
- Formatar a data em pt-BR com timezone America/Sao_Paulo
- Enviar a mensagem no formato identico ao webhook de PIX

Dados ficticios:
- Aluno: "Maria Silva (TESTE)"
- Data: amanha as 14:00
- Duracao: 50 min
- Valor: R$ 120.00
- Telefone: 18997427195

### 2. Adicionar ao `supabase/config.toml`

```text
[functions.test-whatsapp]
verify_jwt = false
```

### 3. Mensagem enviada

```text
🚀 *Parabéns! Você tem uma nova aula confirmada!*

Seu aluno acabou de pagar via PIX.

👤 Maria Silva (TESTE)
📅 {data de amanha formatada}
⏱ 50 min
💰 R$ 120.00

💬 Envie um "Oi" agora mesmo e confirme o ponto de encontro.

👉 Clique aqui para abrir o chat:
https://cnh360.com/instrutor/chat
```

### 4. Apos o teste

Remover a funcao `test-whatsapp` e sua entrada no config.toml.

## Detalhes tecnicos

- A funcao usa as mesmas credenciais Z-API (ZAPI_INSTANCE_ID, ZAPI_TOKEN, ZAPI_CLIENT_TOKEN) ja configuradas nos secrets
- Nao requer autenticacao (verify_jwt = false) para facilitar o teste
- Sera chamada via curl/invoke imediatamente apos o deploy
- A funcao e autonoma -- nao depende de `send-whatsapp-notification`, faz a chamada Z-API diretamente

