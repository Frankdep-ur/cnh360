

# Resolver erro persistente de "senha fraca" no cadastro

## Problema

O backend de autenticacao possui uma verificacao chamada **Pwned Passwords** que bloqueia senhas encontradas em vazamentos de dados conhecidos (ex: "123456", "senha123", "abc123"). Mesmo com a verificacao de senha forte desativada, essa checagem continua ativa e rejeita senhas comuns, retornando erro 422 com mensagem de "weak password".

## Solucao

Duas alteracoes:

### 1. Desabilitar a checagem de senhas vazadas no backend
- Usar a ferramenta de configuracao de autenticacao para desabilitar o **Pwned Passwords check** (hibp_enabled = false)
- Manter o comprimento minimo de 6 caracteres (exigencia do sistema)
- Com isso, qualquer senha com 6+ caracteres sera aceita

### 2. Melhorar o tratamento de erro no frontend (`src/pages/Auth.tsx`)
- Manter o bloco de traducao de erro de senha como fallback de seguranca
- Alterar a mensagem para ser mais simples e direta: "A senha precisa ter no minimo 6 caracteres"
- Assim, se por qualquer motivo o backend ainda rejeitar, o usuario recebe uma orientacao clara em portugues

## Detalhes tecnicos

### Configuracao de Auth
- `min_password_length`: 6
- `password_requirements`: nenhum (sem exigencia de letras/numeros/simbolos)
- `hibp_enabled`: false (desativa checagem de senhas vazadas)

### `src/pages/Auth.tsx` (linha 211-216)
Simplificar a mensagem do else if existente:
```
} else if (error.message.toLowerCase().includes("weak") || error.message.toLowerCase().includes("password")) {
  toast({
    variant: "destructive",
    title: "Senha nao aceita",
    description: "A senha precisa ter no minimo 6 caracteres.",
  });
}
```

Isso garante que o cadastro funcione com qualquer senha de 6+ caracteres sem bloqueios.
