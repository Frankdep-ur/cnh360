

# Plano: Limpar Recipients Recusados dos Instrutores

## Status Atual

| Instrutor | Recipient ID | Status |
|-----------|-------------|--------|
| Lucas Felipe Fagundes Tamaio | `re_cmkwzjtkr8l6x0k9tefzqy2sh` | ❌ refused |
| Frank Alexandre | `re_cmkwzwh308baq0m9tepw1f8j1` | ⚠️ provável refused |

## Resultado do Teste de Pagamento

✅ **O PIX funcionou!** A correção implementada está funcionando:
- Sistema detectou recipient `refused`
- Prosseguiu sem split (100% vai para plataforma)
- Pagamento gerou QR Code normalmente

## Ação Necessária

Limpar o campo `pagarme_recipient_id` dos dois instrutores no banco de dados para permitir que eles recadastrem seus dados bancários.

## Comando SQL

```sql
UPDATE instrutores 
SET pagarme_recipient_id = NULL, updated_at = now()
WHERE id IN (
  'a9b56ebf-4830-4104-924e-e987dbe7abce',
  '2cf27a10-3034-431a-bb92-89b08f90adf5'
);
```

## Impacto

- Os instrutores poderão acessar o formulário de "Configurar Conta Bancária" novamente
- Ao recadastrar, um novo recipient será criado na Pagar.me
- Até o recadastro, pagamentos continuam funcionando (sem split)

## Próximos Passos (para os instrutores)

1. Acessar perfil → "Configurar Conta Bancária"
2. Preencher dados bancários corretos
3. Garantir que o documento (CPF) confere com o titular da conta
4. Sistema criará novo recipient na Pagar.me

## Tempo Estimado

Menos de 1 minuto para executar.

