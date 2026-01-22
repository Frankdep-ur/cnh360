
# Plano: Verificação Prévia de Split/Marketplace no BankAccountSetup

## Objetivo

Detectar **antes** do usuário preencher o formulário se a funcionalidade de Split/Marketplace está habilitada na conta Pagar.me, mostrando uma mensagem clara se não estiver.

## Estratégia

A Pagar.me não oferece um endpoint específico para verificar se o Split está habilitado. Porém, podemos fazer uma **requisição de teste** (dry-run) ou verificar a configuração da conta através do endpoint de listar recebedores ou verificar as configurações da empresa.

A melhor abordagem é criar uma **Edge Function dedicada** que tenta uma operação simples e detecta o erro `action_forbidden`.

## Arquivos a Criar/Modificar

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `supabase/functions/check-pagarme-split-enabled/index.ts` | **Criar** | Nova Edge Function que verifica se Split está habilitado |
| `supabase/config.toml` | Modificar | Adicionar configuração da nova função |
| `src/components/instrutor/BankAccountSetup.tsx` | Modificar | Adicionar verificação ao abrir o modal |

## Implementação

### 1. Nova Edge Function: `check-pagarme-split-enabled`

Cria uma Edge Function que verifica se o Split/Marketplace está habilitado tentando listar recebedores ou verificando as configurações da conta:

```typescript
// supabase/functions/check-pagarme-split-enabled/index.ts
serve(async (req) => {
  // ... CORS handling ...
  
  try {
    const pagarmeApiKey = Deno.env.get("PAGARME_API_KEY");
    
    // Tentar listar recebedores - endpoint simples que falha se Split não estiver habilitado
    const response = await fetch("https://api.pagar.me/core/v5/recipients?page=1&size=1", {
      method: "GET",
      headers: {
        "Authorization": `Basic ${btoa(pagarmeApiKey + ":")}`,
      },
    });
    
    const data = await response.json();
    
    // Se retornar 412 ou erro de "action_forbidden", Split não está habilitado
    if (!response.ok) {
      const isDisabled = data.message?.includes("action_forbidden") || 
                         data.message?.includes("not allowed") ||
                         response.status === 412;
      
      return new Response(JSON.stringify({
        enabled: false,
        reason: isDisabled ? "split_not_enabled" : "api_error"
      }), { headers: corsHeaders });
    }
    
    return new Response(JSON.stringify({
      enabled: true
    }), { headers: corsHeaders });
    
  } catch (error) {
    return new Response(JSON.stringify({
      enabled: false,
      reason: "connection_error"
    }), { headers: corsHeaders, status: 500 });
  }
});
```

### 2. Atualizar config.toml

```toml
[functions.check-pagarme-split-enabled]
verify_jwt = false
```

### 3. Modificar BankAccountSetup.tsx

Adicionar estado e verificação ao carregar o componente:

```typescript
// Novos estados
const [splitEnabled, setSplitEnabled] = useState<boolean | null>(null);
const [checkingSplit, setCheckingSplit] = useState(true);

// Verificar Split ao abrir modal
useEffect(() => {
  if (open) {
    checkSplitEnabled();
    loadUserData();
    // ...
  }
}, [open]);

const checkSplitEnabled = async () => {
  setCheckingSplit(true);
  try {
    const { data, error } = await supabase.functions.invoke("check-pagarme-split-enabled");
    
    if (error) {
      console.error("Erro ao verificar Split:", error);
      setSplitEnabled(null); // Indeterminado
    } else {
      setSplitEnabled(data?.enabled ?? false);
    }
  } catch {
    setSplitEnabled(null);
  } finally {
    setCheckingSplit(false);
  }
};
```

### 4. UI de Bloqueio quando Split Desabilitado

Exibir alerta no início do modal se Split não estiver habilitado:

```tsx
{/* Verificação de Split */}
{checkingSplit && (
  <div className="p-4 bg-muted/50 rounded-lg flex items-center gap-3">
    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
    <span className="text-sm text-muted-foreground">Verificando configuração...</span>
  </div>
)}

{splitEnabled === false && !checkingSplit && (
  <div className="p-4 bg-destructive/10 border border-destructive/40 rounded-lg">
    <div className="flex items-start gap-3">
      <AlertTriangle className="w-6 h-6 text-destructive mt-0.5 flex-shrink-0" />
      <div>
        <p className="font-semibold text-destructive">Sistema em Configuração</p>
        <p className="text-sm text-destructive/80 mt-1">
          A funcionalidade de recebimentos ainda não está habilitada. 
          Entre em contato com o suporte do CNH360 para ativar.
        </p>
        <Button variant="outline" size="sm" className="mt-3" onClick={onClose}>
          Fechar
        </Button>
      </div>
    </div>
  </div>
)}

{/* Resto do formulário só aparece se Split estiver OK */}
{splitEnabled !== false && !checkingSplit && (
  // ... formulário atual ...
)}
```

## Fluxo de Usuário

```text
┌─────────────────────────────────────────────────────────────┐
│ Usuário clica em "Configurar Conta Bancária"                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Modal abre → "Verificando configuração..." (loading)        │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────────┐
│  Split HABILITADO       │     │  Split NÃO habilitado       │
│  → Mostra formulário    │     │  → Mostra alerta vermelho   │
│    normalmente          │     │    "Sistema em Configuração" │
└─────────────────────────┘     └─────────────────────────────┘
```

## Benefícios

1. **UX Melhorada**: Usuário não perde tempo preenchendo formulário para só então ver erro
2. **Mensagem Clara**: Explica o problema de forma amigável em português
3. **Ação Definida**: Indica que deve contatar o suporte
4. **Performance**: Verificação rápida (1 request simples) ao abrir o modal
