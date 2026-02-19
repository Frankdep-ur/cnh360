

# Corrigir redirecionamento apos criar conta

## Problema

A confirmacao de email esta ativada no backend. Quando o usuario clica em "Criar conta", o sistema envia um email de confirmacao e **nao** autentica o usuario imediatamente. Por isso, o `useEffect` que faz o redirecionamento nunca dispara (ele depende de `user` estar preenchido).

O toast diz "Redirecionando para o cadastro..." mas nada acontece, porque o usuario precisa confirmar o email primeiro.

## Solucao

Desabilitar a confirmacao de email (auto-confirm) para que o usuario seja autenticado imediatamente apos o signup, permitindo o redirecionamento automatico para o onboarding.

## Alteracoes

### 1. Configurar auto-confirm no backend

Usar a ferramenta `configure-auth` para habilitar auto-confirm de email signups. Isso fara com que o `signUp` retorne uma sessao valida imediatamente, sem necessidade de clicar em link no email.

### 2. Melhorar tratamento de rate-limit no Auth.tsx

Adicionar tratamento para o erro 429 que aparece quando o usuario tenta criar conta varias vezes seguidas. Exibir uma mensagem clara como "Aguarde alguns segundos antes de tentar novamente."

### 3. Adicionar fallback de redirecionamento no handleSubmit

Alem de depender do `useEffect`, adicionar um redirecionamento direto no `handleSubmit` apos o signup bem-sucedido, usando um pequeno delay para aguardar o estado de auth atualizar. Isso garante que, mesmo se o `useEffect` falhar por timing, o usuario sera redirecionado.

```text
Fluxo atual (quebrado):
  Criar conta -> Email enviado -> Nada acontece na tela

Fluxo corrigido:
  Criar conta -> Auto-confirm -> Sessao criada -> useEffect detecta user -> Redireciona para onboarding
```

## Detalhes tecnicos

| Arquivo | Mudanca |
|---------|---------|
| Backend (configure-auth) | Habilitar auto-confirm email |
| `src/pages/Auth.tsx` | Adicionar tratamento de erro 429 e fallback de redirect no handleSubmit |

