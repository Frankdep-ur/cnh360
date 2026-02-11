

# Teste do WhatsApp Z-API para Cleia Santos

## Situacao atual

A Edge Function `send-whatsapp-notification` esta protegida corretamente -- ela so aceita chamadas internas via service role key. Isso impede teste direto via curl externo (retornou 401 como esperado).

## Solucao: Criar Edge Function de teste temporaria

Criar uma funcao `test-whatsapp` que:
- Aceita uma chamada autenticada (usuario logado)
- Internamente usa o Supabase client com service role key para invocar `send-whatsapp-notification`
- Envia uma mensagem de teste para Cleia Santos
- Sera removida apos o teste

### Payload de teste

| Campo | Valor |
|-------|-------|
| Aluno | Teste Auditoria CNH360 |
| Instrutor | Cleia Santos |
| Telefone | (18) 99613-8262 |
| Data/Hora | 12/02/2026 10:00 |
| Duracao | 50 min |
| Local | Rua Teste, 123 - Centro |
| Valor | R$ 10,00 |
| Categoria | Categoria B |

## Secao Tecnica

### Arquivo a criar

`supabase/functions/test-whatsapp/index.ts`

- Funcao temporaria para teste
- Usa `createClient(url, serviceRoleKey)` para chamar `send-whatsapp-notification` internamente
- Dados da Cleia Santos hardcoded (instrutor_id: `1c8b7ace-c167-481f-ae06-986f00cb8d6f`, phone: `(18) 99613-8262`)
- Retorna o resultado da Z-API (sucesso ou erro)

### Config

Adicionar em `supabase/config.toml`:
```text
[functions.test-whatsapp]
verify_jwt = false
```

### Apos o teste

Remover a funcao `test-whatsapp` completamente (arquivo + config) para nao deixar superficie de ataque em producao.

### Fluxo do teste

```text
1. Criar funcao test-whatsapp
2. Deploy automatico
3. Chamar via curl
4. Verificar se Cleia recebeu no WhatsApp
5. Checar logs da Z-API
6. Remover funcao de teste
```
