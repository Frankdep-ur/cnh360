

# Adicionar campos WhatsApp e Cidade no cadastro do Instrutor

## Resumo

Adicionar dois novos campos obrigatorios no Step 1 (Dados Pessoais) do onboarding do instrutor:
1. **WhatsApp** - numero de telefone com mascara brasileira (DDD + numero)
2. **Cidade** - campo de texto livre para a cidade do instrutor

Atualmente o Step 1 tem apenas Nome e CPF. A cidade ja e capturada no Step 2 via CEP, mas o usuario quer que ela tambem apareca explicitamente no inicio.

## Alteracoes

### 1. `src/lib/validations.ts`
- Atualizar `instrutorStep1Schema` para incluir os campos `whatsapp` (usando o `phoneSchema` ja existente) e `cidade` (string obrigatoria, min 2 caracteres)

### 2. `src/pages/onboarding/InstrutorOnboarding.tsx`

**Novos estados:**
- `whatsapp` - string para o numero de telefone
- Reutilizar o estado `city` ja existente, preenchido no Step 1

**Tipo FormErrors:**
- Adicionar `whatsapp?: string` e `city?: string`

**Step 1 - UI:**
- Adicionar campo WhatsApp com mascara `(00) 00000-0000` abaixo do CPF
- Adicionar campo Cidade abaixo do WhatsApp
- Icone de telefone (Phone) do lucide-react

**Validacao (validateStep):**
- Step 1: incluir `whatsapp` e `cidade` na validacao via schema

**canProceed():**
- Step 1: adicionar verificacao de `whatsapp.length >= 14` e `city.length > 1`

**Salvamento no banco (handleNext):**
- No update do `profiles`, incluir `phone: whatsapp.replace(/\D/g, "")` junto com os dados ja salvos
- A cidade ja e salva no profile; sera preenchida no Step 1 e tambem atualizada no Step 2 se o CEP for de outra cidade

### 3. Formato do telefone

Mascara brasileira: `(XX) XXXXX-XXXX`
- Funcao `formatPhone` para aplicar mascara automaticamente
- Validacao minima de 14 caracteres (com mascara) = 10 digitos

## Fluxo resultante do Step 1

```text
+----------------------------------+
|  Seja um instrutor!              |
|  Aumente sua renda...            |
|                                  |
|  [Nome completo        ]         |
|  [CPF: 000.000.000-00  ]         |
|  [WhatsApp: (00) 00000-0000]     |
|  [Cidade               ]         |
|                                  |
|  [ Continuar >>> ]               |
+----------------------------------+
```

## Detalhes tecnicos

- O campo `phone` ja existe na tabela `profiles` (tipo text, nullable) - nao precisa de migracao
- O campo `cidade` ja existe na tabela `profiles` - nao precisa de migracao
- O `phoneSchema` ja existe em `validations.ts` e sera reutilizado
- A cidade preenchida no Step 1 sera usada como valor inicial no Step 2 (endereco), mantendo consistencia

