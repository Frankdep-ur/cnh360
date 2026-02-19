

# Adicionar data e horário na mensagem WhatsApp do PIX

## Resumo

A mensagem WhatsApp enviada ao instrutor apos confirmacao de pagamento PIX vai passar a incluir o dia e horario da aula agendada, para que o instrutor saiba imediatamente quando sera a aula.

## Alteracao

Apenas 1 arquivo: **`supabase/functions/pagarme-payment-webhook/index.ts`**

### 1. Adicionar `data_hora` ao SELECT (linha 51)

```text
ANTES:
.select("id, status, payment_confirmed, aluno_id, instrutor_id, valor, duracao_minutos")

DEPOIS:
.select("id, status, payment_confirmed, aluno_id, instrutor_id, valor, duracao_minutos, data_hora")
```

### 2. Formatar a data em portugues brasileiro

Adicionar formatacao antes do envio da mensagem:

```text
const dataFormatada = new Date(aula.data_hora).toLocaleString("pt-BR", {
  weekday: "long",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Sao_Paulo",
});
```

Exemplo de saida: `segunda-feira, 24/02/2026, 14:30`

### 3. Atualizar a mensagem WhatsApp

```text
ANTES:
🚀 *Parabéns! Você tem uma nova aula confirmada!*

Seu aluno acabou de pagar via PIX.

👤 {nome}
⏱ {duracao} min
💰 R$ {valor}

💬 Envie um "Oi" agora mesmo e alinhe local e horário.

👉 Clique aqui para abrir o chat:
https://cnh360.com/instrutor/chat

DEPOIS:
🚀 *Parabéns! Você tem uma nova aula confirmada!*

Seu aluno acabou de pagar via PIX.

👤 {nome}
📅 {data formatada em pt-BR}
⏱ {duracao} min
💰 R$ {valor}

💬 Envie um "Oi" agora mesmo e confirme o ponto de encontro.

👉 Clique aqui para abrir o chat:
https://cnh360.com/instrutor/chat
```

O texto "alinhe local e horário" muda para "confirme o ponto de encontro" ja que o horario agora esta na mensagem.

## Detalhes tecnicos

- O campo `data_hora` ja existe na tabela `aulas` (tipo `timestamp with time zone`)
- A formatacao usa `toLocaleString` nativo do Deno com timezone `America/Sao_Paulo`
- Nenhuma alteracao de banco de dados necessaria
- A Edge Function sera reimplantada automaticamente
