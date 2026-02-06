

# Correção: "Acesso Negado" no Link de Verificação KYC

## Problema

Quando a Cleia clica em "Verificar identidade agora", o sistema retorna um link KYC antigo que foi invalidado pela Pagar.me. Isso acontece porque:

1. O link foi gerado quando o status era `registration`
2. A Pagar.me mudou o status para `affiliation` (em análise)
3. Ao mudar de etapa, a Pagar.me invalida o token anterior
4. Nosso sistema continua usando o link cacheado, que agora retorna "acesso negado"

## Solucao

### Arquivo: `supabase/functions/start-kyc/index.ts`

Adicionar uma verificacao que detecta mudanca de status do recebedor e invalida o cache automaticamente. Quando o status do recebedor na API da Pagar.me for diferente do que era quando o link foi gerado, forcar a geracao de um novo link.

**Mudancas especificas:**

1. **Salvar o status do recebedor junto com o link cacheado** - Ao gerar um novo link, salvar tambem o `recipient_status` corrente no banco (novo campo ou reutilizar logica existente)

2. **Invalidar cache quando status muda** - Antes de usar o link cacheado, verificar se o `recipientStatus` atual (da API) e o mesmo de quando o link foi gerado. Se diferente, ignorar o cache e gerar novo link

3. **Fallback: Se o link falhar com 403, gerar novo automaticamente** - Adicionar tratamento para o caso em que a Pagar.me retorna 403 no link KYC, limpando o cache e tentando novamente

### Abordagem simplificada (preferida)

Em vez de adicionar complexidade com campos extras, a solucao mais direta e: **nunca usar cache quando o status do recebedor e `affiliation`**. Nesse status, a Pagar.me pode estar processando etapas internas que invalidam tokens anteriores.

A logica na secao de cache ficara:

```text
SE tem link cacheado E nao expirou:
  SE recipientStatus == "affiliation":
    -> NAO usar cache, gerar novo link
    -> Limpar link cacheado do banco
  SENAO:
    -> Usar link cacheado normalmente
```

### Tambem limpar o cache no banco

Quando detectar que o link cacheado e invalido, limpar os campos `kyc_url`, `kyc_base64` e `kyc_link_expires_at` no banco para evitar reusar o link quebrado.

## Secao Tecnica

### Arquivo a modificar

| Arquivo | Mudanca |
|---------|---------|
| `supabase/functions/start-kyc/index.ts` | Invalidar cache quando `recipientStatus === "affiliation"` e gerar novo link |

### Logica atualizada (linhas ~197-234)

Antes de usar o cache, adicionar verificacao:

```text
// Check if recipient status changed to affiliation
// In affiliation status, Pagar.me may have invalidated previous tokens
if (recipientStatus === "affiliation") {
  -> Log: "Status is affiliation, invalidating cached KYC URL"
  -> Limpar kyc_url, kyc_base64, kyc_link_expires_at no banco
  -> Pular cache e ir direto para gerar novo link
}
```

### Tratamento de erro 403

Apos chamar o endpoint `kyc_link` da Pagar.me, se receber status 403:
- Verificar se a mensagem contem "acesso negado" ou similar
- Retornar mensagem amigavel: "A verificacao esta sendo processada pela instituicao financeira. Aguarde alguns minutos e tente novamente."
- Isso cobre o caso em que a Pagar.me temporariamente bloqueia a geracao de novos links durante o processamento

### Fluxo corrigido

```text
Usuario clica "Verificar identidade"
  |
  v
start-kyc Edge Function
  |
  v
Consulta status do recebedor na Pagar.me API
  |
  +-- Status = "affiliation"?
  |     |
  |     +-- SIM: Limpar cache -> Gerar NOVO link
  |     |         |
  |     |         +-- 403? -> "Verificacao em processamento, aguarde"
  |     |         +-- 200? -> Retornar novo link
  |     |
  |     +-- NAO: Usar cache se valido, senao gerar novo
  |
  v
Retornar link para o frontend
```

