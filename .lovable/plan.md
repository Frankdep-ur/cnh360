
# Plano: Filtrar Aulas Nao Pagas para Instrutor

## Resumo do Problema
Atualmente, quando um aluno inicia o processo de agendamento, a aula e criada no banco de dados **antes** do pagamento ser concluido. Isso faz com que aulas nao pagas aparecam no dashboard do instrutor, o que e confuso e problematico.

---

## Fluxo Atual (Problematico)

```text
Aluno clica "Pagar"
       │
       ▼
Aula criada no banco ──────► Aparece para instrutor
(status: pendente)           (mesmo sem pagamento!)
       │
       ▼
Aluno completa pagamento
       │
       ▼
payment_confirmed = true
```

---

## Fluxo Corrigido

```text
Aluno clica "Pagar"
       │
       ▼
Aula criada no banco
(status: pendente)
payment_confirmed: false      ──────► NAO aparece para instrutor
       │
       ▼
Aluno completa pagamento
       │
       ▼
payment_confirmed = true      ──────► Aparece para instrutor
```

---

## Arquivo a Modificar

| Arquivo | Modificacao |
|---------|-------------|
| `src/hooks/useAulasPendentes.ts` | Adicionar filtro `payment_confirmed = true` |

---

## Mudanca Tecnica

### Linhas 73-89 - Adicionar filtro de pagamento confirmado

**Codigo atual:**
```typescript
const { data: aulasData, error: aulasError } = await supabase
  .from("aulas")
  .select(`
    id,
    aluno_id,
    data_hora,
    duracao_minutos,
    ponto_encontro,
    valor,
    usa_carro_aluno,
    status,
    created_at,
    transaction_id
  `)
  .eq("instrutor_id", instrutorData.id)
  .in("status", ["pendente", "confirmada"])
  .order("data_hora", { ascending: true });
```

**Codigo corrigido:**
```typescript
const { data: aulasData, error: aulasError } = await supabase
  .from("aulas")
  .select(`
    id,
    aluno_id,
    data_hora,
    duracao_minutos,
    ponto_encontro,
    valor,
    usa_carro_aluno,
    status,
    created_at,
    transaction_id,
    payment_confirmed
  `)
  .eq("instrutor_id", instrutorData.id)
  .in("status", ["pendente", "confirmada"])
  .eq("payment_confirmed", true)  // NOVA LINHA: So aulas pagas
  .order("data_hora", { ascending: true });
```

---

## Logica de Negocio

### Criterios para aparecer no Dashboard do Instrutor:
1. A aula deve ter `payment_confirmed = true` (pagamento confirmado)
2. O status deve ser `pendente` (aguardando aceite) ou `confirmada` (aceita pelo instrutor)

### Por que isso funciona:
- Quando o aluno inicia o pagamento, a aula e criada com `payment_confirmed = false`
- Quando o pagamento e concluido (via webhook ou polling), `payment_confirmed` vira `true`
- Somente depois disso a aula aparece para o instrutor

---

## Impacto nos Componentes

### Remocao da Aula de Demonstracao (Opcional)

Com a correcao, se nao houver aulas pagas pendentes, o instrutor vera uma lista vazia. O sistema ja tem uma aula de demonstracao que aparece nesse caso, entao nao precisa de mudanca adicional.

### Validacao de Pagamento no Aceitar

A funcao `aceitarAula` (linha 145-152) ja tem verificacao de `transaction_id`, mas com a nova filtragem, todas as aulas que chegam para aceite ja terao pagamento confirmado, tornando essa verificacao redundante (mas vale manter como seguranca adicional).

---

## Verificacao de Seguranca

### Ponto importante:
Com essa mudanca, o instrutor **nunca** vera aulas sem pagamento. Isso e importante porque:
- Protege o instrutor de aceitar aulas que nao foram pagas
- Garante que so aulas legitimas aparecam
- Evita confusao e reclamacoes

---

## Checklist de Implementacao

- [ ] Adicionar `payment_confirmed` ao SELECT da query
- [ ] Adicionar filtro `.eq("payment_confirmed", true)`
- [ ] Testar que aulas nao pagas nao aparecem
- [ ] Testar que aulas pagas aparecem normalmente
- [ ] Verificar que aulas confirmadas continuam visiveis
