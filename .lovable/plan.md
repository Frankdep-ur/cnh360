

# Traduzir mensagem de erro de senha fraca no cadastro

## Problema

Quando o usuario tenta se cadastrar com uma senha fraca, o erro vindo do backend e exibido sem traducao. A mensagem aparece em ingles ou de forma generica ("Password should be at least...").

## Solucao

Adicionar uma verificacao especifica para erros de senha fraca no bloco de tratamento de erros do signup em `src/pages/Auth.tsx`, similar ao que ja existe para "already registered".

## Alteracao

### `src/pages/Auth.tsx` (linhas 204-217)

Adicionar um `else if` para capturar mensagens relacionadas a senha fraca (ex: "weak", "password") e exibir uma mensagem traduzida:

```
if (error.message.includes("already registered")) {
  // ... ja existe
} else if (error.message.toLowerCase().includes("weak") || error.message.toLowerCase().includes("password should")) {
  toast({
    variant: "destructive",
    title: "Senha fraca",
    description: "Use uma senha com no minimo 6 caracteres, incluindo letras e numeros.",
  });
} else {
  toast({
    variant: "destructive",
    title: "Erro ao criar conta",
    description: error.message,
  });
}
```

Apenas uma linha de codigo extra no arquivo Auth.tsx, sem impacto em outros arquivos.

