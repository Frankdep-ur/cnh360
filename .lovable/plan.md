
# Plano: Atualizar Secrets Z-API

## Objetivo

Corrigir os secrets `ZAPI_INSTANCE_ID` e `ZAPI_TOKEN` que estão incorretos, causando o erro "your client-token is not configured".

---

## Ação Necessária

### Passo 1: Obter valores do Dashboard Z-API

No seu dashboard Z-API (https://admin.z-api.io), localize:

1. **Instance ID** - O identificador único da instância "CNH360 Teste"
   - Geralmente está na URL quando você clica na instância
   - Formato: sequência alfanumérica (ex: `3D5F7A2B1C9E8D4F`)

2. **Token** - O token de segurança para autenticação
   - Está na seção "Configurações" ou "Token" da instância
   - Formato: sequência alfanumérica longa

---

### Passo 2: Atualizar Secrets no Projeto

Usarei a ferramenta de adicionar secrets para solicitar os novos valores:

| Secret | Descrição |
|--------|-----------|
| `ZAPI_INSTANCE_ID` | ID da instância CNH360 Teste |
| `ZAPI_TOKEN` | Token de integração |

---

### Passo 3: Testar Novamente

Após atualizar os secrets:
1. Chamar a Edge Function `send-whatsapp-notification`
2. Verificar se a mensagem chega no WhatsApp do instrutor Tiago Silva

---

## Onde Encontrar no Dashboard Z-API

```text
Dashboard Z-API
    ↓
Instâncias → CNH360 Teste
    ↓
┌─────────────────────────────────┐
│ Instance ID: XXXXXXXX           │  ← Copiar este valor
│ Token: YYYYYYYY                 │  ← Copiar este valor
└─────────────────────────────────┘
```

---

## Resultado Esperado

Após a atualização:
- A chamada à API Z-API retornará sucesso
- O instrutor receberá a notificação WhatsApp
- Os logs mostrarão "Mensagem enviada via Z-API"
