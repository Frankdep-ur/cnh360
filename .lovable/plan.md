

# Plano: Corrigir Autenticação do Cleanup Job

## Problema
A Edge Function `cleanup-abandoned-lessons` está retornando 401 mesmo quando chamada pelo cron job com a anon key correta.

## Solução
Simplificar a validação para ser mais robusta e adicionar logs de debug.

## Arquivo a Modificar

| Arquivo | Mudança |
|---------|---------|
| `supabase/functions/cleanup-abandoned-lessons/index.ts` | Melhorar validação de auth header |

## Mudança Proposta

Atualizar a função `validateRequest` para:
1. Fazer comparação case-insensitive do header
2. Adicionar logs para debug
3. Aceitar também o header `apikey` que o Supabase usa

```typescript
function validateRequest(req: Request): boolean {
  // Log all headers for debugging
  console.log("Request headers received");
  
  // Check for edge secret header (internal calls)
  const edgeSecret = Deno.env.get("EDGE_FUNCTION_SECRET");
  const providedSecret = req.headers.get("x-edge-secret");
  if (edgeSecret && providedSecret === edgeSecret) {
    console.log("Validated via edge secret");
    return true;
  }
  
  // Check for apikey header (Supabase standard)
  const apiKey = req.headers.get("apikey");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  
  if (apiKey && (apiKey === anonKey || apiKey === serviceKey)) {
    console.log("Validated via apikey header");
    return true;
  }
  
  // Check for Authorization header (cron job calls)
  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
  if (authHeader) {
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (token === anonKey || token === serviceKey) {
      console.log("Validated via Authorization header");
      return true;
    }
  }
  
  console.log("No valid authentication found");
  return false;
}
```

## Resultado Esperado
- Cron job executa com sucesso a cada 10 minutos
- Aulas abandonadas são limpas automaticamente
- Logs mostram "Validated via Authorization header" quando cron roda

