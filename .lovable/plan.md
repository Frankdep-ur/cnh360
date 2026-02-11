

## Corrigir Sistema de Avaliações - Tornar Real e Funcional

### Problema Identificado

As avaliacoes estao sendo salvas na tabela `avaliacoes` (2 registros existentes, ambos nota 5), porem a atualizacao de `nota_media` e `total_avaliacoes` na tabela `instrutores` **falha silenciosamente** porque:

- A RLS do `instrutores` so permite UPDATE quando `auth.uid() = user_id` (apenas o proprio instrutor)
- Quem envia a avaliacao e o **aluno**, que nao tem permissao para atualizar a tabela do instrutor
- Resultado: `nota_media = 5.00` mas `total_avaliacoes = 0` (inconsistente)

### Solucao

Criar um **database trigger** que atualiza automaticamente `nota_media` e `total_avaliacoes` do instrutor sempre que uma avaliacao e inserida. Isso elimina a dependencia de RLS e garante consistencia.

### Detalhes Tecnicos

**1. Migracao SQL - Criar funcao e trigger**

```sql
CREATE OR REPLACE FUNCTION public.update_instrutor_rating_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.instrutores
  SET
    nota_media = (
      SELECT ROUND(AVG(nota)::numeric, 2)
      FROM public.avaliacoes
      WHERE instrutor_id = NEW.instrutor_id
    ),
    total_avaliacoes = (
      SELECT COUNT(*)
      FROM public.avaliacoes
      WHERE instrutor_id = NEW.instrutor_id
    )
  WHERE id = NEW.instrutor_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_instrutor_rating
AFTER INSERT ON public.avaliacoes
FOR EACH ROW
EXECUTE FUNCTION public.update_instrutor_rating_stats();
```

A funcao usa `SECURITY DEFINER` para executar com permissoes elevadas, contornando a RLS.

**2. Corrigir dados existentes** (na mesma migracao)

```sql
UPDATE public.instrutores i
SET
  nota_media = sub.avg_nota,
  total_avaliacoes = sub.count_avaliacoes
FROM (
  SELECT instrutor_id, ROUND(AVG(nota)::numeric, 2) as avg_nota, COUNT(*) as count_avaliacoes
  FROM public.avaliacoes
  GROUP BY instrutor_id
) sub
WHERE i.id = sub.instrutor_id;
```

Isso corrige o instrutor que ja tem 2 avaliacoes mas mostra `total_avaliacoes = 0`.

**3. Simplificar o hook `useAulaRating.ts`**

Remover o bloco de codigo que faz UPDATE manual na tabela `instrutores` apos inserir a avaliacao (linhas 127-145), pois o trigger agora cuida disso automaticamente.

### Resultado

- Avaliacoes do aluno serao refletidas imediatamente no perfil do instrutor
- `nota_media` e `total_avaliacoes` sempre consistentes
- Dados existentes corrigidos (2 avaliacoes, nota media 5.0, total 2)
