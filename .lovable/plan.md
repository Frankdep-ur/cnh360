

# Diagnóstico: Erro de IP não autorizado na Pagar.me

## O Problema

A Pagar.me implementou uma **restrição de IP allowlist** na rota `/kyc_link`. Chamadas originadas de IPs dinâmicos (como Supabase Edge Functions, Vercel, AWS Lambda, etc.) são bloqueadas com a mensagem:

> **"IP de origem não autorizado a realizar essa operação"**

Isso acontece porque:
- A Supabase Edge Function roda em IPs dinâmicos da Deno Deploy
- A Pagar.me exige que você cadastre IPs estáticos na allowlist
- Não temos controle sobre os IPs do Supabase

## Alternativas Disponíveis

Existem 3 abordagens para resolver isso, mantendo a UX padrão Uber/iFood (tudo dentro do app):

---

### Opção 1: Capturar o QR Code na Criação do Recebedor (RECOMENDADA)

De acordo com a documentação da Pagar.me:

> "No fluxo de criação de um novo recebedor, será disponibilizado um QR Code de acesso ao webapp, que deverá ser renderizado pelo Marketplace."

A Pagar.me retorna o `kyc_details` diretamente no response da criação do recebedor, sem necessidade de chamar `/kyc_link` separadamente.

**Alterações:**
1. Modificar `create-instructor-recipient-pagarme` para capturar e salvar o `base64` do QR Code e a `url` do KYC no banco de dados
2. Criar colunas `kyc_url` e `kyc_base64` na tabela `instrutores`
3. Na UI, mostrar o botão "Verificar Identidade" que abre a URL salva

**Prós:**
- Nenhuma chamada adicional à API
- Funciona imediatamente sem IP allowlist
- O link é gerado automaticamente na criação do recebedor

**Contras:**
- O link expira em 20 minutos
- Se o instrutor não completar na hora, precisamos regenerar (só aí temos problema de IP)

---

### Opção 2: Proxy via Backend Externo com IP Estático

Configurar um pequeno serviço externo (ex: Railway, Render, VPS) com IP estático cadastrado na allowlist da Pagar.me, que atua como proxy para a chamada `/kyc_link`.

**Arquitetura:**
```text
[CNH360 App] → [Edge Function] → [Proxy Railway/VPS] → [Pagar.me API]
                                      ↓
                              (IP estático cadastrado)
```

**Prós:**
- Funciona 100% on-demand
- Controle total sobre quando gerar links
- UX perfeita igual Uber

**Contras:**
- Custo adicional (mínimo ~R$5/mês)
- Dependência de serviço externo
- Mais complexidade

---

### Opção 3: Fluxo Automático da Pagar.me (menos controle)

Deixar a Pagar.me enviar o link por e-mail automaticamente quando o recebedor atingir status `affiliation`, e apenas instruir o usuário a verificar o e-mail.

**Prós:**
- Zero alteração técnica

**Contras:**
- Perde a UX embutida
- Usuário sai do app para verificar e-mail
- Dependência de deliverability de e-mail

---

## Plano de Implementação: Opção 1 (Recomendada)

### Passo 1: Adicionar Colunas no Banco

```sql
ALTER TABLE instrutores 
ADD COLUMN kyc_url TEXT,
ADD COLUMN kyc_base64 TEXT,
ADD COLUMN kyc_link_expires_at TIMESTAMP WITH TIME ZONE;
```

### Passo 2: Atualizar a Edge Function de Criação de Recebedor

Modificar `create-instructor-recipient-pagarme/index.ts` para:
- Capturar o objeto `kyc_details` do response da Pagar.me
- Salvar `kyc_url`, `kyc_base64` e `expiration_date` no banco

### Passo 3: Atualizar a Edge Function start-kyc

Modificar `start-kyc/index.ts` para:
- Primeiro, verificar se existe `kyc_url` salvo no banco que ainda não expirou
- Se existir e for válido, retornar essa URL sem chamar a API
- Se expirou ou não existe, tentar gerar nova (se funcionar, ótimo; se der erro de IP, retornar mensagem amigável)

### Passo 4: UI com Fallback Elegante

Se não conseguir gerar link on-demand:
- Mostrar mensagem: "Por segurança, a verificação foi enviada para seu e-mail cadastrado"
- Incluir botão secundário: "Não recebi o e-mail"

---

## Seção Técnica: Detalhes da Implementação

### Estrutura do Response de Criação de Recebedor

Quando a Pagar.me retorna o recebedor criado com status `affiliation`, o objeto contém:

```json
{
  "id": "re_xxx",
  "status": "affiliation",
  "kyc_details": {
    "status": "partially_denied",
    "status_reason": "additional_documents_required"
  }
}
```

Porém, a URL do KYC precisa ser gerada via POST `/kyc_link`. A documentação sugere que o QR Code pode vir no webhook de `recipient.updated` quando atinge `affiliation`.

### Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `supabase/functions/create-instructor-recipient-pagarme/index.ts` | Tentar chamar `/kyc_link` após criar recebedor e salvar no banco |
| `supabase/functions/start-kyc/index.ts` | Verificar URL salva antes de chamar API; fallback elegante |
| `src/components/instrutor/InstructorBalanceCard.tsx` | Mostrar mensagem amigável de fallback |
| Migração SQL | Adicionar colunas `kyc_url`, `kyc_base64`, `kyc_link_expires_at` |

### Fluxo Final (UX)

```text
1. Instrutor cadastra dados bancários
   ↓
2. Sistema cria recebedor na Pagar.me
   ↓
3. Sistema tenta gerar link de KYC imediatamente (mesma sessão, mesmo IP)
   ↓
4a. Se sucesso → salva URL no banco → instrutor clica "Verificar agora" → abre KYC
   ↓
4b. Se erro de IP → exibe mensagem: "Verificação enviada ao seu e-mail"
   ↓
5. Instrutor completa KYC (via link salvo OU via e-mail)
   ↓
6. Webhook atualiza status automaticamente
```

