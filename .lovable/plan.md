

# Adicionar "Entrar com Google" em Todas as Telas de Autenticacao

## Problema Identificado

| Tela | Rota | Botao Google |
|------|------|--------------|
| Pagina principal de auth | `/auth` | Aparece |
| Apos clicar "Sou Aluno" | `/auth?type=aluno` | NAO aparece |
| Apos clicar "Sou Instrutor" | `/auth?type=instrutor` | NAO aparece |
| Apos clicar "Sou Autoescola" | `/auth?type=autoescola` | NAO aparece |

Quando o usuario vem da pagina inicial (Index.tsx) e clica em "Sou Aluno", ele vai para `/auth?type=aluno`, que pula a tela com o botao do Google e mostra diretamente o formulario.

## Solucao

Adicionar o botao "Entrar com Google" tambem na tela do formulario (step === "form"), mantendo a mesma aparencia destacada.

## Mudancas no Layout

```text
ANTES (step = form):
┌─────────────────────────────────────┐
│  [Badge: Aluno]                     │
│  Entre na sua conta                 │
│                                     │
│  [Email input]                      │
│  [Senha input]                      │
│  [Botao Entrar]                     │
│  Esqueceu sua senha?                │
└─────────────────────────────────────┘

DEPOIS (step = form):
┌─────────────────────────────────────┐
│  [Badge: Aluno]                     │
│  Entre na sua conta                 │
│                                     │
│  [G] Continuar com Google           │  <-- NOVO
│  Rapido e seguro                    │  <-- NOVO
│  ────── ou ──────                   │  <-- NOVO
│                                     │
│  [Email input]                      │
│  [Senha input]                      │
│  [Botao Entrar]                     │
│  Esqueceu sua senha?                │
└─────────────────────────────────────┘
```

## Secao Tecnica

### Arquivo: `src/pages/Auth.tsx`

1. **Extrair o componente do botao Google para um componente reutilizavel**
   - Criar uma funcao `GoogleSignInButton` dentro do arquivo para evitar duplicacao de codigo

2. **Adicionar o botao na tela do formulario (linhas 623-712)**
   - Inserir antes do formulario de email/senha
   - Manter os mesmos estilos: fundo branco, sombra, borda colorida, icone com cores oficiais

3. **Adicionar o separador visual**
   - Linha horizontal com texto "ou entre com email"

### Codigo proposto para o componente reutilizavel:

```tsx
const GoogleSignInButton = () => (
  <div className="mb-6">
    <Button
      type="button"
      size="xl"
      className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-primary shadow-md hover:shadow-lg transition-all duration-200"
      disabled={googleLoading || loading}
      onClick={handleGoogleSignIn}
    >
      {googleLoading ? "Conectando..." : (
        <>
          <GoogleIcon />
          Continuar com Google
        </>
      )}
    </Button>
    <p className="text-xs text-muted-foreground text-center mt-2">
      Rapido e seguro
    </p>
    <div className="relative my-4">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-border"></div>
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-background px-4 text-muted-foreground">
          ou entre com email
        </span>
      </div>
    </div>
  </div>
);
```

### Onde inserir:

1. **Na tela select-type (ja existe)**: Linhas 361-408 - manter como esta
2. **Na tela form (ADICIONAR)**: Inserir apos o titulo "Entre na sua conta" (linha 621) e antes do formulario (linha 624)

## Resultado Esperado

- Botao "Continuar com Google" visivel em TODAS as telas de autenticacao
- Mesmo estilo visual em todas as telas (destacado, com sombra, cores oficiais do Google)
- Codigo organizado sem duplicacao (usando componente reutilizavel)
- Experiencia de usuario consistente independente do fluxo de entrada

