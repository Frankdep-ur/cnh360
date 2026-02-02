

# Plano: Corrigir Mensagem de Status para Verificação de Identidade

## Problema Identificado

A mensagem **"Sua conta está em processo de ativação. Os ganhos serão liberados em até 48 horas."** está incorreta e causa confusão. Ela vem da Edge Function `get-instructor-balance-pagarme`.

O correto é informar que o instrutor precisa **completar a verificação de identidade (selfie)** para liberar os saques.

---

## Arquivos a Modificar

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `supabase/functions/get-instructor-balance-pagarme/index.ts` | **MODIFICAR** | Atualizar mensagem para status `affiliation` |
| `src/pages/instrutor/InstrutorGanhos.tsx` | **MODIFICAR** | Adicionar botão de verificação KYC no Alert |

---

## Mudanças Detalhadas

### 1. Edge Function: get-instructor-balance-pagarme

**Linha 160-161 - Mensagem atual:**
```typescript
if (recipientStatus === "affiliation") {
  message = "Sua conta está em processo de ativação. Os ganhos serão liberados em até 48 horas.";
}
```

**Nova mensagem:**
```typescript
if (recipientStatus === "affiliation") {
  message = "Para liberar seus saques, é necessário concluir a verificação de identidade (selfie).";
}
```

---

### 2. Página InstrutorGanhos.tsx

Atualmente o Alert (linhas 174-194) mostra apenas a mensagem de texto. Vamos adicionar um botão para o instrutor ir direto para a verificação:

**Interface atualizada:**

```text
┌──────────────────────────────────────────────────────────────┐
│  📸  Para liberar seus saques, é necessário concluir a      │
│      verificação de identidade (selfie).                    │
│                                                              │
│      [ Verificar Identidade Agora ]                         │
└──────────────────────────────────────────────────────────────┘
```

**Código a adicionar:**
- Importar `Camera`, `ExternalLink`, `Loader2` do lucide-react
- Adicionar estado `loadingKyc` 
- Copiar função `handleVerifyIdentity` do InstructorBalanceCard
- Adicionar botão verde dentro do Alert quando status = `affiliation`

---

## Fluxo Visual Atualizado

```text
Instrutor abre "Meus Ganhos"
        │
        ▼
┌─────────────────────────────────┐
│ Se recipientStatus = affiliation│
└─────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────────┐
│  🟢 Alert Verde com:                         │
│  "Para liberar seus saques, é necessário     │
│   concluir a verificação de identidade."     │
│                                              │
│  [📸 Verificar Identidade Agora]             │
└──────────────────────────────────────────────┘
        │
        ▼
Instrutor clica → Abre link Pagar.me → Faz selfie
        │
        ▼
Status muda para "active" → Saques liberados!
```

---

## Seção Técnica

### Mudança na Edge Function (linha 160-161)

```typescript
// ANTES
if (recipientStatus === "affiliation") {
  message = "Sua conta está em processo de ativação. Os ganhos serão liberados em até 48 horas.";
}

// DEPOIS
if (recipientStatus === "affiliation") {
  message = "Para liberar seus saques, é necessário concluir a verificação de identidade (selfie).";
}
```

### Mudança no InstrutorGanhos.tsx

```typescript
// Adicionar imports
import { Camera, ExternalLink, Loader2 } from "lucide-react";

// Adicionar estado
const [loadingKyc, setLoadingKyc] = useState(false);

// Adicionar função
const handleVerifyIdentity = async () => {
  setLoadingKyc(true);
  try {
    const { data } = await supabase.functions.invoke("get-kyc-link-pagarme");
    if (data?.url) {
      const fullUrl = data.url.startsWith("http") ? data.url : `https://${data.url}`;
      window.open(fullUrl, "_blank");
    }
  } finally {
    setLoadingKyc(false);
  }
};

// Modificar o Alert para incluir botão
{recipientStatus === "affiliation" && (
  <Alert className="border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20">
    <Camera className="w-4 h-4 text-emerald-600" />
    <AlertDescription className="text-emerald-700 dark:text-emerald-300">
      <div className="flex flex-col gap-3">
        <span>{statusMessage}</span>
        <Button
          onClick={handleVerifyIdentity}
          disabled={loadingKyc}
          size="sm"
          className="bg-emerald-600 hover:bg-emerald-700 text-white w-fit"
        >
          {loadingKyc ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Gerando link...</>
          ) : (
            <><Camera className="w-4 h-4 mr-2" /> Verificar Identidade Agora</>
          )}
        </Button>
      </div>
    </AlertDescription>
  </Alert>
)}
```

---

## Resultado Final

| Antes | Depois |
|-------|--------|
| ⏳ "Sua conta está em processo de ativação. Os ganhos serão liberados em até 48 horas." | 📸 "Para liberar seus saques, é necessário concluir a verificação de identidade (selfie)." + **[Botão Verde]** |

Isso resolve:
- ✅ Confusão sobre o que o instrutor precisa fazer
- ✅ Conflito de informação 
- ✅ Suporte desnecessário (instrutor sabe exatamente o que fazer)

