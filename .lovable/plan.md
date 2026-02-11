

# Analise Completa: O que falta para ir ao publico real

## Status de Implementacao

| Item | Status | Notas |
|------|--------|-------|
| 1. Chaves Pagar.me producao | ⏳ Pendente | Voce precisa atualizar manualmente via Lovable Cloud |
| 2. Protecao senhas vazadas | ⏳ Pendente | Requer ativacao manual no painel Lovable Cloud > Auth |
| 3. Corrigir RLS permissiva | ✅ Feito | Politica `aulas_auditoria` corrigida |
| 4. Confirmacao de email | ✅ Feito | Auto-confirm desabilitado |
| 5. Rate limiting | ✅ Feito | 5 tentativas/min por usuario nas funcoes de pagamento |
| 6. Antecipacao Pagar.me | ⏳ Pendente | Contatar relacionamento@pagar.me |
| 7. Remover console.logs | ✅ Feito | console.log silenciado em producao |
| 8. Webhook PIX | ✅ Feito | pagarme-payment-webhook criado e deployado |
| 9. Monitoramento | ⏳ Futuro | Implementar quando necessario |
| 10. Error Boundary | ✅ Feito | Componente global adicionado |

## Acoes manuais pendentes

### 1. Atualizar chaves Pagar.me (CRITICO)
No painel Lovable Cloud > Secrets, atualize:
- `PAGARME_API_KEY`: sk_test_ -> sk_live_
- `PAGARME_PUBLIC_KEY`: pk_test_ -> pk_live_
- `VITE_PAGARME_PUBLIC_KEY`: pk_test_ -> pk_live_
- `PAGARME_RECIPIENT_CNH360`: Criar novo no ambiente live

### 2. Protecao de senhas vazadas
Habilitar no painel Lovable Cloud > Auth > Password Security > "Enable leaked password protection"

### 3. Antecipacao Pagar.me
Contatar relacionamento@pagar.me para ativar antecipacao automatica D+0

### 4. Configurar webhook na Pagar.me
No painel Pagar.me, adicionar webhook apontando para:
`https://kyvtlmpkjjinhjelipvr.supabase.co/functions/v1/pagarme-payment-webhook`
Eventos: `order.paid`
