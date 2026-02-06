

# Correcao dos 4 Problemas Encontrados

## Problema 1 (CRITICO): capture-payment-pagarme nao verifica KYC

Nas linhas 182-184 e 246-248 do `capture-payment-pagarme`, o split e hardcoded como 50/50 sem verificar o `kyc_status` do instrutor. Isso significa que se uma order Pagar.me for paga/autorizada para um instrutor com status `refused`, ele receberia 50% indevidamente.

**A secao sem `transaction_id` (linhas 103-113) ja esta correta** — ela busca `kyc_status` e aplica o split condicionalmente. O problema e apenas nas duas outras secoes que lidam com orders existentes na Pagar.me.

**Correcao**: Adicionar busca de `kyc_status` antes de calcular o split nas linhas 181 e 245. Aplicar a mesma logica: 50/50 se `approved`, 100% plataforma caso contrario.

---

## Problema 2 (Menor): Push notification e placeholder

A funcao `send-push-notification` nao envia notificacoes push reais. Na linha 118, ela apenas faz `console.log("Would send to endpoint:")` e incrementa `sentCount` sem enviar nada de fato.

**Correcao**: Como nao ha `VAPID_PRIVATE_KEY` configurada e a implementacao real exigiria uma biblioteca web-push (nao disponivel nativamente no Deno), a abordagem sera simplificar a funcao para focar no que ela ja faz corretamente: salvar a notificacao no banco de dados. Remover o codigo morto do loop de subscriptions e o placeholder VAPID, deixando claro que a funcao salva notificacoes in-app. Push real pode ser adicionado futuramente quando configurado.

---

## Problema 3 (Menor): Funcao KYC redundante

`get-kyc-link-pagarme` e `start-kyc` fazem a mesma coisa: geram link KYC na Pagar.me. Porem:
- `start-kyc` tem cache de 20 minutos, tratamento de status `refused`/`suspended`/`affiliation`, retry logic, e logging detalhado
- `get-kyc-link-pagarme` e uma versao simplificada sem essas melhorias

O `InstrutorGanhos.tsx` ainda chama `get-kyc-link-pagarme`, enquanto o `InstructorBalanceCard.tsx` ja usa `start-kyc`.

**Correcao**: Atualizar `InstrutorGanhos.tsx` para chamar `start-kyc` ao inves de `get-kyc-link-pagarme`, adaptando o tratamento de resposta (os campos retornados sao diferentes: `kyc_url` vs `url`, `status` vs `alreadyActive`). Depois, deletar a funcao `get-kyc-link-pagarme` e remover sua entrada do `config.toml`.

---

## Problema 4 (Menor): fetch() direto no check-payment-status-pagarme

Na linha 126-136 do `check-payment-status-pagarme`, a chamada para `send-whatsapp-notification` usa `fetch()` direto ao inves de `supabase.functions.invoke()`. Embora funcione, nao segue o padrao recomendado.

**Correcao**: Substituir o `fetch()` por `supabase.functions.invoke("send-whatsapp-notification", { body: whatsappPayload })`.

---

## Secao Tecnica

### Arquivo: `supabase/functions/capture-payment-pagarme/index.ts`

Duas secoes precisam de correcao:

**Secao 1 — Order ja paga (linhas 181-198):**
```text
// ANTES (linha 182-184):
const valorBruto = Number(aulaData.valor);
const taxaPlataforma = valorBruto * 0.50;
const valorInstrutor = valorBruto - taxaPlataforma;

// DEPOIS:
const { data: instrutorKyc } = await supabase
  .from("instrutores")
  .select("kyc_status")
  .eq("id", aulaData.instrutor_id)
  .single();

const kycApproved = instrutorKyc?.kyc_status === "approved";
const valorBruto = Number(aulaData.valor);
const taxaPlataforma = kycApproved ? valorBruto * 0.50 : valorBruto;
const valorInstrutor = kycApproved ? valorBruto * 0.50 : 0;
```

**Secao 2 — Captura nova (linhas 245-248):**
Mesma logica: buscar `kyc_status` antes de calcular split.

### Arquivo: `supabase/functions/send-push-notification/index.ts`

Simplificar removendo o codigo morto do loop de subscriptions e VAPID placeholder. Manter apenas a logica de salvar notificacao no banco.

### Arquivo: `src/pages/instrutor/InstrutorGanhos.tsx`

Trocar chamada de `get-kyc-link-pagarme` para `start-kyc` e adaptar o tratamento de resposta:
```text
// ANTES:
supabase.functions.invoke("get-kyc-link-pagarme")
// data.url, data.alreadyActive, data.automaticVerification

// DEPOIS:
supabase.functions.invoke("start-kyc")
// data.kyc_url, data.status === "already_active", data.error === "kyc_processing"
```

### Arquivo: `supabase/functions/get-kyc-link-pagarme/index.ts`

Deletar esta funcao inteira.

### Arquivo: `supabase/config.toml`

Remover a entrada `[functions.get-kyc-link-pagarme]`.

### Arquivo: `supabase/functions/check-payment-status-pagarme/index.ts`

Substituir `fetch()` direto por `supabase.functions.invoke()`:
```text
// ANTES (linhas 126-136):
const response = await fetch(
  `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-whatsapp-notification`,
  { method: "POST", headers: {...}, body: JSON.stringify(whatsappPayload) }
);

// DEPOIS:
const { data: whatsappResult, error: whatsappError } = await supabase.functions.invoke(
  "send-whatsapp-notification",
  { body: whatsappPayload }
);
```

### Resumo de arquivos

| Arquivo | Mudanca |
|---------|---------|
| `capture-payment-pagarme/index.ts` | Adicionar verificacao KYC nas 2 secoes com split hardcoded |
| `send-push-notification/index.ts` | Simplificar removendo placeholder VAPID e loop morto |
| `InstrutorGanhos.tsx` | Trocar `get-kyc-link-pagarme` por `start-kyc` |
| `get-kyc-link-pagarme/index.ts` | Deletar funcao redundante |
| `config.toml` | Remover entrada da funcao deletada |
| `check-payment-status-pagarme/index.ts` | Trocar fetch() por supabase.functions.invoke() |

