

# Limpeza da Conta de Teste - Frank Alexandre

## Estado Atual

| Tipo | Quantidade | Detalhes |
|------|------------|----------|
| Pagamentos | 1 | R$ 9,03 (instrutor: R$ 4,52) - status: aprovado |
| Aulas | 4 | 1 concluída, 1 cancelada, 1 em_rota, 1 pendente |

## O que será removido

### 1. Tabela `pagamentos`
```sql
DELETE FROM pagamentos 
WHERE instrutor_id = '2cf27a10-3034-431a-bb92-89b08f90adf5';
```
- Remove 1 registro de pagamento de teste

### 2. Tabela `aulas`
```sql
DELETE FROM aulas 
WHERE instrutor_id = '2cf27a10-3034-431a-bb92-89b08f90adf5';
```
- Remove 4 aulas de teste

### 3. Resetar contadores do instrutor (opcional)
```sql
UPDATE instrutores 
SET total_aulas = 0, 
    nota_media = NULL, 
    total_avaliacoes = 0
WHERE id = '2cf27a10-3034-431a-bb92-89b08f90adf5';
```
- Zera estatísticas para teste limpo

## O que será mantido

| Campo | Valor | Motivo |
|-------|-------|--------|
| `pagarme_recipient_id` | `re_cmkx1ob1cy0mz0l9tjhxp6lcf` | Conta bancária configurada |
| `kyc_status` | `approved` | Verificação já aprovada |
| Dados do perfil | Todos | Cadastro completo |

## Resultado Final

Conta do Frank Alexandre pronta para novo teste:
- Sem pagamentos pendentes no banco local
- Sem aulas anteriores
- Conta Pagar.me ativa e verificada
- Pronto para receber novo agendamento e split 50/50

## Observação sobre Pagar.me

O saldo na **API da Pagar.me** (R$ 0,00) já está zerado - não há transferência a fazer lá. A limpeza é apenas nos dados locais do banco de dados.

## Seção Técnica

### Ordem de execução das queries

1. **Primeiro**: Deletar pagamentos (tem FK para aulas)
2. **Segundo**: Deletar aulas
3. **Terceiro**: Resetar contadores do instrutor

### IDs envolvidos

| Entidade | ID |
|----------|-----|
| Instrutor Frank | `2cf27a10-3034-431a-bb92-89b08f90adf5` |
| User ID | `501d72a3-fbeb-45a7-b7c3-d81e299d4c11` |
| Pagamento | `6a2eae9a-a6fc-4f80-9119-43c8883f748c` |
| Aula concluída | `5c91677f-cd4b-425e-a772-b25ee5d00e6e` |
| Aula cancelada | `34db0deb-059e-4b9f-8cb4-05827c1dcee7` |
| Aula em_rota | `12253018-1fb6-4e7e-967e-5aedf0ff6057` |
| Aula pendente | `d91ae82c-3964-478a-bbef-995faa2a0707` |

