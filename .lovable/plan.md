
# Plano: Limpeza de Todas as Aulas do Sistema

## Objetivo
Limpar todas as aulas e dados relacionados no banco de dados para reiniciar o sistema com a nova implementação anti-fraude.

## Dados Encontrados para Limpeza

| Tabela | Registros | Descrição |
|--------|-----------|-----------|
| `aulas` | 1 | Aula confirmada entre Lucas e Milena |
| `mensagens_aula` | 5 | Mensagens de chat da aula |
| `aulas_auditoria` | 0 | Nenhum registro |
| `validacoes_gps` | 0 | Nenhum registro |
| `localizacao_tempo_real` | 1 | Registro de localização |
| `notifications` | 5 | Notificações relacionadas |

## Ordem de Execução (respeitando foreign keys)

A limpeza será feita na ordem correta para evitar erros de constraint:

1. **Deletar `aulas_auditoria`** - Referencia `aulas`
2. **Deletar `mensagens_aula`** - Referencia `aulas`
3. **Deletar `validacoes_gps`** - Referencia `aulas`
4. **Deletar `localizacao_tempo_real`** - Registros órfãos
5. **Deletar `notifications`** - Limpar notificações de aula
6. **Deletar `aulas`** - Tabela principal

## SQL a Executar

```sql
-- 1. Limpar auditoria
DELETE FROM aulas_auditoria;

-- 2. Limpar mensagens de chat das aulas
DELETE FROM mensagens_aula;

-- 3. Limpar validações GPS
DELETE FROM validacoes_gps;

-- 4. Limpar localização em tempo real
DELETE FROM localizacao_tempo_real;

-- 5. Limpar notificações relacionadas a aulas
DELETE FROM notifications 
WHERE type IN ('aula_confirmada', 'aula_recusada', 'aula_solicitada', 
               'instrutor_a_caminho', 'em_rota', 'chegou', 
               'aula_iniciada', 'aula_concluida', 'chat_message');

-- 6. Limpar todas as aulas
DELETE FROM aulas;
```

## Resultado Esperado

Após a limpeza:
- Painel do instrutor: Vazio, sem aulas pendentes ou confirmadas
- Painel do aluno: Vazio, sem próximas aulas
- Sistema pronto para testar o novo fluxo anti-fraude completo

## Próximos Passos Após Limpeza

1. Criar uma nova aula de teste via painel do aluno
2. Completar pagamento (confirmar payment_confirmed = true)
3. Testar fluxo completo: Em Rota → Cheguei → Confirmar Chegada → Iniciar → Cronômetro → Finalizar → QR Code → Scan → Pagamento
