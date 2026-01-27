
# Atualizar Preço dos Instrutores de Teste para R$10

## Instrutores Identificados

| Nome | ID | Preço Atual |
|------|-----|-------------|
| Lucas Felipe Fagundes Tamaio | `a9b56ebf-4830-4104-924e-e987dbe7abce` | R$ 20,00 |
| Frank Alexandre | `2cf27a10-3034-431a-bb92-89b08f90adf5` | R$ 80,00 |

## Alteração

Atualizar o campo `preco_hora` para **R$ 10,00** em ambos os registros na tabela `instrutores`.

## Comando SQL

```sql
UPDATE instrutores 
SET preco_hora = 10.00 
WHERE id IN (
  'a9b56ebf-4830-4104-924e-e987dbe7abce',
  '2cf27a10-3034-431a-bb92-89b08f90adf5'
);
```

## Impacto

- Novas aulas agendadas com esses instrutores terão valor de R$ 10,00/hora
- O cache público (`instrutores_publico_cache`) será atualizado automaticamente via trigger
- Permite testar o fluxo de pagamento com valor baixo em produção/teste

## Tempo Estimado

Menos de 1 minuto para executar.
