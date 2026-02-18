

# Alterar preco do instrutor Igor Gramulha para R$ 10,00

## O que sera feito

Atualizar o valor da hora do instrutor **Igor Nascimento Gramulha** (ID: `605145b0-1dd0-4ddc-80cf-fcf069f333fc`) de R$ 80,00 para **R$ 10,00** para fins de teste de pagamento.

## Detalhes tecnicos

Duas atualizacoes SQL necessarias:

1. **Tabela `instrutores`**: `UPDATE instrutores SET preco_hora = 10.00 WHERE id = '605145b0-1dd0-4ddc-80cf-fcf069f333fc'`
2. **Tabela `instrutores_publico_cache`**: `UPDATE instrutores_publico_cache SET preco_hora = 10.00 WHERE id = '605145b0-1dd0-4ddc-80cf-fcf069f333fc'`

A segunda atualizacao garante que o valor apareca corretamente na busca de instrutores pelo aluno. O trigger `sync_instrutor_cache` tambem sera disparado pela primeira query, mas a atualizacao explicita do cache garante consistencia imediata.

