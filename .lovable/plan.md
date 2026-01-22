
# Plano: Corrigir Fluxo de Carregamento de Instrutores e Token Expirado

## Problema Identificado

Quando o token JWT expira, as requisições ao banco de dados falham com erro `PGRST303 - JWT expired`. O sistema não força o re-login adequadamente, deixando o usuário em estado inconsistente onde a interface parece funcionar mas os dados não carregam.

## Causa Raiz

1. **useAuth.tsx**: O listener de auth não força logout quando o token não pode ser renovado
2. **Política RLS de veículos**: Exige `authenticated` mas a página de busca deveria funcionar publicamente
3. **BuscarInstrutores.tsx**: Não trata erros de autenticação ao buscar veículos

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/hooks/useAuth.tsx` | Detectar token expirado e forçar logout automático |
| `supabase/migrations` | Adicionar política de leitura pública para veículos de instrutores ativos |
| `src/pages/aluno/BuscarInstrutores.tsx` | Adicionar tratamento de erro para requisições com JWT expirado |

## Implementação

### 1. Melhorar Hook de Autenticação

**Arquivo**: `src/hooks/useAuth.tsx`

Adicionar interceptador para erros de JWT:

```typescript
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      console.log('Auth event:', event);
      
      if (event === 'TOKEN_REFRESHED') {
        console.log('Token renovado com sucesso');
        setSession(session);
        setUser(session?.user ?? null);
      }
      
      // Limpar sessão inválida
      if (event === 'SIGNED_OUT' || !session) {
        setSession(null);
        setUser(null);
        // Limpar storage local
        localStorage.removeItem('supabase.auth.token');
      } else {
        setSession(session);
        setUser(session?.user ?? null);
      }
      setLoading(false);
    }
  );

  // Verificar sessão ao iniciar
  supabase.auth.getSession().then(async ({ data: { session }, error }) => {
    if (error) {
      console.error('Erro ao recuperar sessão:', error);
      // Token inválido - forçar logout limpo
      await supabase.auth.signOut({ scope: 'local' });
      setSession(null);
      setUser(null);
    } else if (session) {
      // Validar se o token ainda é válido
      const { error: validateError } = await supabase.auth.getUser();
      if (validateError) {
        console.error('Token inválido, fazendo logout:', validateError);
        await supabase.auth.signOut({ scope: 'local' });
        setSession(null);
        setUser(null);
      } else {
        setSession(session);
        setUser(session?.user ?? null);
      }
    }
    setLoading(false);
  });

  return () => subscription.unsubscribe();
}, []);
```

### 2. Adicionar Política Pública para Veículos

**Tipo**: Migração SQL

Criar nova política permitindo leitura pública de veículos ativos de instrutores ativos:

```sql
-- Permitir leitura pública de veículos de instrutores ativos (para busca)
CREATE POLICY "Public can view active instructor vehicles"
  ON public.veiculos FOR SELECT
  TO anon, authenticated
  USING (
    ativo = true 
    AND EXISTS (
      SELECT 1 FROM instrutores i 
      WHERE i.id = veiculos.instrutor_id 
      AND i.ativo = true
    )
  );
```

### 3. Adicionar Tratamento de Erro em BuscarInstrutores

**Arquivo**: `src/pages/aluno/BuscarInstrutores.tsx`

Wrapper para requisições que podem falhar por JWT:

```typescript
async function fetchInstructorsWithVehicles(): Promise<InstructorData[]> {
  try {
    // Fetch from cache (público)
    const { data: cacheData, error: cacheError } = await supabase
      .from("instrutores_publico_cache")
      .select("*")
      .eq("ativo", true);

    if (cacheError) {
      // Se for erro de JWT, tentar limpar sessão
      if (cacheError.message?.includes('JWT') || cacheError.code === 'PGRST303') {
        console.warn('Sessão expirada, limpando...');
        await supabase.auth.signOut({ scope: 'local' });
      }
      console.error("Error fetching instructors:", cacheError);
      return [];
    }

    // ... resto do código
  } catch (error) {
    console.error("Unexpected error:", error);
    return [];
  }
}
```

## Fluxo Corrigido

```text
┌─────────────────────────────────────────────────────────────────┐
│ Usuário acessa /aluno/buscar com JWT expirado                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ useAuth.getSession() detecta token inválido                    │
└─────────────────────────────────────────────────────────────────┘
                              │
           ┌──────────────────┴────────────────────┐
           ▼                                       ▼
┌──────────────────────────┐         ┌─────────────────────────────┐
│ Token pode ser renovado  │         │ Token não pode ser renovado │
│ → Continua normalmente   │         │ → signOut({ scope: 'local'})│
└──────────────────────────┘         └─────────────────────────────┘
                                                   │
                                                   ▼
                                     ┌─────────────────────────────┐
                                     │ Limpa localStorage + state  │
                                     │ Redireciona para /auth      │
                                     └─────────────────────────────┘
```

## Resumo das Mudanças

1. **useAuth.tsx**: Validar token ao iniciar e forçar logout local quando expirado
2. **Migração RLS**: Permitir busca pública de veículos (remover requisito de autenticação)
3. **BuscarInstrutores.tsx**: Tratar erros de JWT graciosamente

## Benefícios

- Usuários com token expirado serão redirecionados automaticamente para login
- Página de busca funciona mesmo sem autenticação (como deveria)
- Menos requisições falhando silenciosamente
- Melhor UX para usuários retornando após tempo inativo
