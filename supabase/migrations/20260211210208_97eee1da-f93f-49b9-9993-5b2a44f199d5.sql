
-- 1. Create trigger function to auto-update instructor rating stats
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Create trigger on avaliacoes table
CREATE TRIGGER trigger_update_instrutor_rating
AFTER INSERT ON public.avaliacoes
FOR EACH ROW
EXECUTE FUNCTION public.update_instrutor_rating_stats();

-- 3. Fix existing inconsistent data
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
