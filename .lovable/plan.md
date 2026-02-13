

# Correcao: Quiz nao aparece nas aulas

## Problema Identificado

A causa raiz e um conflito entre duas correcoes de seguranca aplicadas anteriormente:

1. A politica RLS `"Block direct access to quiz questions"` bloqueia **todo** SELECT na tabela `curso_quiz_perguntas` com `USING (false)`
2. A view `curso_quiz_perguntas_publico` foi recriada com `security_invoker = true`, o que faz com que ela respeite as politicas RLS do usuario

Resultado: quando a view tenta ler a tabela base, a RLS bloqueia a leitura, retornando 0 perguntas. O frontend interpreta isso como "aula sem quiz" e marca a aula como concluida automaticamente.

**Todas as 84 aulas possuem quiz no banco de dados** -- o problema e apenas de acesso.

## Solucao

### 1. Ajustar a politica RLS para permitir leitura via view

Substituir a politica `"Block direct access to quiz questions"` por uma que permita leitura autenticada, ja que a view ja filtra as colunas sensiveis (exclui `resposta_correta`):

```sql
DROP POLICY IF EXISTS "Block direct access to quiz questions" ON public.curso_quiz_perguntas;
CREATE POLICY "Authenticated can read quiz questions"
  ON public.curso_quiz_perguntas
  FOR SELECT
  TO authenticated
  USING (true);
```

Isso e seguro porque:
- A view `curso_quiz_perguntas_publico` ja exclui a coluna `resposta_correta`
- A validacao do quiz acontece server-side na Edge Function `validate-quiz` (que usa service role)
- Usuarios anonimos continuam sem acesso (apenas `authenticated`)

### 2. Remover o fallback de "sem quiz" no frontend

Alterar `AulaConteudo.tsx` para que, quando `quiz.length === 0`, mostre uma mensagem de carregamento/erro em vez de marcar como concluida:

- Trocar o icone de CheckCircle por AlertCircle
- Texto: "Erro ao carregar quiz. Tente novamente."
- Botao para recarregar em vez de ir para proxima aula

Isso impede que qualquer falha de rede ou RLS permita pular o quiz.

## Detalhes Tecnicos

**Migracao SQL:**
```sql
DROP POLICY IF EXISTS "Block direct access to quiz questions" 
  ON public.curso_quiz_perguntas;

CREATE POLICY "Authenticated can read quiz questions"
  ON public.curso_quiz_perguntas
  FOR SELECT
  TO authenticated
  USING (true);
```

**AulaConteudo.tsx** (linhas 502-512): Substituir o bloco `quiz.length === 0` por mensagem de erro com botao de retry, impedindo que o aluno avance sem completar o quiz.

