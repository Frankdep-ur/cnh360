

# Plano: Limpar Notificacoes de Aulas Nao Pagas

## Resumo do Problema
Existem **33 notificacoes** no banco de dados associadas a aulas que nunca foram pagas ou que ja foram deletadas. Isso polui a lista de notificacoes dos instrutores.

---

## Tipos de Notificacoes Encontradas

| Tipo | Quantidade Aprox. | Descricao |
|------|-------------------|-----------|
| `nova_aula` | 6+ | Solicitacoes de aula que nunca foram pagas |
| `instrutor_a_caminho` | 10+ | Notificacoes de aulas invalidas |
| `aula_confirmada` | 2+ | Confirmacoes de aulas sem pagamento |
| `aula_recusada` | 8+ | Recusas de aulas sem pagamento |

---

## Solucao

Executar uma migracao SQL para deletar todas as notificacoes que:
1. Tem um `reference_id` (referencia a uma aula)
2. A aula associada **nao existe** OU **nao foi paga** (`payment_confirmed = false/NULL`)

---

## SQL de Limpeza

```sql
-- Deletar notificacoes de aulas que nao foram pagas ou nao existem
DELETE FROM notifications
WHERE id IN (
  SELECT n.id
  FROM notifications n
  LEFT JOIN aulas a ON n.reference_id = a.id
  WHERE n.reference_id IS NOT NULL 
    AND (
      a.id IS NULL  -- Aula foi deletada
      OR a.payment_confirmed = false  -- Pagamento nao confirmado
      OR a.payment_confirmed IS NULL  -- Pagamento nunca iniciado
    )
);
```

---

## Resultado Esperado

- **33 notificacoes removidas** dos instrutores
- Lista de notificacoes limpa e precisa
- Somente aulas legitimas (pagas) terao notificacoes

---

## Checklist de Implementacao

- [ ] Executar migracao SQL para deletar notificacoes orfas
- [ ] Verificar que as notificacoes foram removidas
- [ ] Confirmar que notificacoes legitimas permanecem

