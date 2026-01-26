

# Plano: Corrigir Link para Chat do Instrutor

## Objetivo

Alterar o deep link na mensagem WhatsApp para redirecionar o instrutor diretamente para a página de chat dele, permitindo que:
- Se ele já estiver logado → abre o chat direto
- Se não estiver logado → vai para login, e após autenticar, redireciona automaticamente para o chat

---

## Como Funciona o Fluxo

```text
┌─────────────────────────────────────────────────────────────────────┐
│  Instrutor clica no link da mensagem WhatsApp                       │
│  https://cnh360.com/instrutor/a-caminho/{aulaId}                    │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │  Está logado?       │
                    └─────────┬───────────┘
                              │
            ┌─────────────────┴─────────────────┐
            │                                   │
            ▼                                   ▼
       ┌────────────┐                    ┌─────────────────┐
       │    SIM     │                    │       NÃO       │
       └─────┬──────┘                    └────────┬────────┘
             │                                    │
             ▼                                    ▼
    ┌─────────────────────┐             ┌───────────────────────────┐
    │ Abre página         │             │ Redireciona para /auth    │
    │ InstrutorACaminho   │             │ com from: /instrutor/...  │
    │ com chat integrado  │             └───────────┬───────────────┘
    └─────────────────────┘                         │
                                                    ▼
                                           ┌────────────────────┐
                                           │ Após login/cadastro│
                                           │ volta pro chat     │
                                           └────────────────────┘
```

---

## Alteração Necessária

### Arquivo: `supabase/functions/send-whatsapp-notification/index.ts`

**Linha atual:**
```typescript
const chatDeepLink = `https://cnh360.com/aluno/chat/${payload.aulaId}`;
```

**Nova linha:**
```typescript
const chatDeepLink = `https://cnh360.com/instrutor/a-caminho/${payload.aulaId}`;
```

---

## Também Ajustar o Texto da Mensagem

O texto "falar com o aluno" deve refletir a ação do instrutor:

**Antes:**
```
💬 Acesse o chat no app para falar com o aluno:
```

**Depois:**
```
💬 Acesse o app para ver detalhes e falar com o aluno:
```

---

## Resultado Final da Mensagem

```
🎉 *Pagamento confirmado!*

👤 *Aluno:* João Silva
📚 *Aula:* B - 50 min prática
📅 *Data/Hora:* terça-feira, 27/01/2026, 11:00
📍 *Local:* Praça Central
💰 *Valor pago:* R$ 80.00

💬 Acesse o app para ver detalhes e falar com o aluno:
https://cnh360.com/instrutor/a-caminho/abc123

Bora ensinar! 🚗
```

---

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `supabase/functions/send-whatsapp-notification/index.ts` | Trocar rota de `/aluno/chat/` para `/instrutor/a-caminho/` |

