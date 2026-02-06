

# Correcao do Erro 401 na Confirmacao de Inicio de Aula

## Problema Identificado

Quando o aluno clica em "Confirmar inicio da aula", o sistema retorna "Edge Function returned a non-2xx status code". A analise dos logs HTTP revelou que as 3 tentativas do aluno retornaram **HTTP 401** (nao autorizado), enquanto as chamadas do instrutor (`em_rota` e `cheguei`) funcionaram normalmente com HTTP 200.

### Causa raiz

A configuracao `verify_jwt = true` no `config.toml` para a funcao `lesson-workflow` faz com que o gateway do Supabase valide o token JWT **antes** de executar o codigo da funcao. Quando o token do aluno esta expirado ou "stale" (comum em celulares onde o app fica aberto em segundo plano), o gateway rejeita a requisicao com 401 sem sequer executar o codigo da funcao. Por isso nao ha nenhum log de processamento - a funcao nunca chegou a rodar.

A funcao ja possui sua propria verificacao de autenticacao interna (linhas 59-77 do codigo), tornando o `verify_jwt = true` redundante e problematico.

### Evidencia dos logs HTTP

```text
20:32:06 - POST lesson-workflow -> 200 (em_rota - instrutor)
20:32:17 - POST lesson-workflow -> 200 (cheguei - instrutor)  
20:32:23 - POST lesson-workflow -> 401 (confirmar_inicio_aluno - ALUNO FALHOU)
20:32:27 - POST lesson-workflow -> 401 (retry - ALUNO FALHOU)
20:32:42 - POST lesson-workflow -> 401 (retry - ALUNO FALHOU)
```

---

## Plano de Correcao

### 1. Remover validacao JWT duplicada (config.toml)

Alterar `verify_jwt = false` para `lesson-workflow` no `supabase/config.toml`. A funcao ja valida o JWT internamente e retorna mensagens de erro especificas. Isso e consistente com outras funcoes senssiveis como `capture-payment-pagarme` que tambem usam `verify_jwt = false`.

### 2. Adicionar refresh de sessao no hook (useLessonWorkflow.ts)

Antes de chamar a funcao, forcar um refresh da sessao do Supabase para garantir que o token JWT esta atualizado. Isso previne problemas com tokens expirados em sessoes longas (celular em segundo plano).

### 3. Melhorar tratamento de erros (useLessonWorkflow.ts)

Atualmente, quando a funcao retorna um erro HTTP, o Supabase client mostra a mensagem generica "Edge Function returned a non-2xx status code". Precisamos:
- Extrair a mensagem real de erro do corpo da resposta
- Mostrar mensagens amigaveis ao usuario
- Adicionar retry automatico para erros 401 com refresh de token

### 4. Adicionar logs na funcao (lesson-workflow/index.ts)

Adicionar logs no inicio da funcao para facilitar debug em caso de falhas futuras na autenticacao.

---

## Secao Tecnica

### Arquivos a modificar

| Arquivo | Mudanca |
|---------|---------|
| `supabase/config.toml` | Alterar `verify_jwt = false` para lesson-workflow |
| `src/hooks/useLessonWorkflow.ts` | Adicionar refresh de sessao, retry com backoff, extração de erro real |
| `supabase/functions/lesson-workflow/index.ts` | Adicionar logs de entrada para debug |

### Mudanca no config.toml

```text
[functions.lesson-workflow]
verify_jwt = false    # Auth validada internamente pela funcao
```

### Mudanca no useLessonWorkflow.ts

```text
const executeAction = async (aulaId, action, qrData, gpsData) => {
  // 1. Refresh session antes de chamar a funcao
  await supabase.auth.refreshSession();
  
  // 2. Chamar funcao
  const { data, error } = await supabase.functions.invoke('lesson-workflow', {...});
  
  // 3. Se 401, tentar refresh + retry uma vez
  if (error && error.message.includes('non-2xx')) {
    // Tentar extrair erro real do context
    // Retry com sessao atualizada
  }
  
  // 4. Mostrar mensagem real ao usuario
}
```

### Logs adicionais na Edge Function

Adicionar log no inicio da funcao para registrar:
- Action recebida
- User ID autenticado
- Aula ID

Isso garante que mesmo em caso de falha, teremos informacao no log para diagnostico.

### Resultado esperado

- Aluno consegue confirmar inicio da aula sem erro
- Token expirado e renovado automaticamente antes da chamada
- Mensagens de erro reais exibidas ao inves de mensagens genericas
- Logs completos para debug futuro

