

# Adicionar campos WhatsApp e Cidade no cadastro do Aluno

## Situacao atual

O Step 1 do onboarding do aluno coleta apenas:
- Nome completo
- CPF

Nao ha campo de WhatsApp nem Cidade no cadastro. Esses dados so podem ser preenchidos depois, editando o perfil.

## Solucao

Adicionar dois campos obrigatorios no Step 1 do onboarding do aluno, seguindo o mesmo padrao ja implementado no cadastro do instrutor.

## Alteracoes

### 1. `src/lib/validations.ts`
- Atualizar `alunoStep1Schema` para incluir `whatsapp` (usando `phoneSchema`) e `cidade` (min 2 caracteres)

### 2. `src/pages/onboarding/AlunoOnboarding.tsx`

**Novos estados:**
- `whatsapp` (string) para o numero de telefone
- `city` (string) para a cidade

**Tipo FormErrors:**
- Adicionar `whatsapp?: string` e `city?: string`

**Imports:**
- Adicionar `Phone` e `MapPin` do lucide-react

**Step 1 - UI:**
- Adicionar campo WhatsApp com mascara `(00) 00000-0000` abaixo do CPF
- Adicionar campo Cidade abaixo do WhatsApp

**Funcao `formatPhone`:**
- Adicionar funcao de mascara de telefone (mesma usada no instrutor)

**Validacao (`validateStep1`):**
- Incluir `whatsapp` e `cidade` no parse do schema

**`canProceed()`:**
- Step 1: adicionar `whatsapp.length >= 14 && city.length > 1`

**Salvamento (`saveToDatabase`):**
- No update do `profiles`, incluir `phone: whatsapp.replace(/\D/g, "")` e `cidade: city.trim()`

## Fluxo resultante do Step 1

```text
+----------------------------------+
|  Comece sua jornada!             |
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

- Os campos `phone` e `cidade` ja existem na tabela `profiles` -- nenhuma migracao necessaria
- O `phoneSchema` ja existe em `validations.ts` e sera reutilizado
- O padrao e identico ao que foi feito no onboarding do instrutor
