

# Redirecionar Usuarios Autenticados sem Onboarding Completo

## Problema

Quando alguem faz login pelo Google, o redirect volta para a pagina inicial (`/`). A pagina inicial (Index.tsx) nao verifica se o usuario ja completou o onboarding. Resultado: o usuario fica "preso" na landing page sem ser direcionado para escolher seu perfil (aluno, instrutor ou autoescola).

## Solucao

Adicionar logica no **Index.tsx** para detectar usuarios autenticados e redirecioná-los automaticamente:

1. Se ja tem perfil completo (existe em `alunos`, `instrutores` ou `autoescolas`) → redireciona para o dashboard correspondente
2. Se esta autenticado mas NAO tem perfil → redireciona para `/auth` para escolher o tipo de perfil e completar o onboarding

## Alteracoes

### Arquivo: `src/pages/Index.tsx`

Adicionar um `useEffect` que roda quando `user` existe e `authLoading` termina:

```text
useEffect (user autenticado detectado)
  ├── Consulta tabela alunos → se existe → navega /aluno
  ├── Consulta tabela instrutores → se existe → navega /instrutor
  ├── Consulta tabela autoescolas → se existe → navega /autoescola
  └── Nenhum perfil encontrado → navega /auth (selecionar tipo)
```

- Enquanto verifica, mostra o loading atual (ja existe o `showContent` com delay)
- A verificacao so roda uma vez ao carregar a pagina

### Detalhes tecnicos

- Importar `supabase` do client
- Adicionar estado `checkingProfile` para evitar flash da landing page
- Usar `.maybeSingle()` para consultas seguras
- Manter a landing page visivel apenas para usuarios nao autenticados

Isso resolve o caso da Mariana e de qualquer outro usuario que entrar via Google e nao completar o cadastro.

