
# Plano de Correção de Segurança

## Problemas Identificados (3 itens)

### 1. XSS no Conteudo do Curso (warn)
O arquivo `AulaConteudo.tsx` usa `dangerouslySetInnerHTML` sem sanitização. Vamos adicionar o DOMPurify (já instalado como dependência) para sanitizar o HTML antes de renderizar.

**Arquivo:** `src/pages/aluno/AulaConteudo.tsx`
- Importar DOMPurify
- Envolver todo o HTML gerado pelas regex em `DOMPurify.sanitize()` com tags e atributos permitidos

### 2. Quiz RLS - Finding desatualizado (error)
A política `"Block direct access to quiz questions"` já está ativa. O finding `rls_curso_tables` está desatualizado e será removido do tracker.

### 3. Security Definer View (error - linter do banco)
A view `curso_quiz_perguntas_publico` foi criada com owner `postgres`, o que a torna uma Security Definer view. Isso significa que queries na view ignoram as políticas RLS do usuário que faz a query.

**Correção via migração:**
- Recriar a view com `SECURITY INVOKER` para que respeite as permissões do usuário que consulta

---

## Detalhes Técnicos

### AulaConteudo.tsx - Sanitização XSS
```typescript
import DOMPurify from 'dompurify';

// Na renderização:
const sanitizedHtml = DOMPurify.sanitize(
  aula.conteudo_texto
    .replace(/* regex existentes */),
  {
    ALLOWED_TAGS: ['h1','h2','h3','p','strong','li','ul','ol','table','tr','td','th','div'],
    ALLOWED_ATTR: ['class']
  }
);
```

### Migração SQL - Corrigir Security Definer View
```sql
DROP VIEW IF EXISTS public.curso_quiz_perguntas_publico;
CREATE VIEW public.curso_quiz_perguntas_publico
  WITH (security_invoker = true) AS
  SELECT id, aula_id, ordem, pergunta, opcoes, created_at
  FROM public.curso_quiz_perguntas;
GRANT SELECT ON public.curso_quiz_perguntas_publico TO authenticated;
```

### Atualizar Security Tracker
- Deletar `rls_curso_tables` (já corrigido)
- Deletar `xss_aula_conteudo` (após fix)
- Deletar `SUPA_security_definer_view` (após fix)
- Ignorar `webhook_no_signature` (a pedido do usuário, para depois)
