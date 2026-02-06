-- Corrigir split 80/20 -> 50/50 no pagamento histórico (dezembro/2025)
UPDATE public.pagamentos 
SET taxa_plataforma = 40.00, valor_instrutor = 40.00, updated_at = now()
WHERE id = '106f20a1-46ca-4ff7-aec0-3090e98418ae';

-- Criar pagamento retroativo para aula a5886922 (Lucas - refused, 100% plataforma)
INSERT INTO public.pagamentos (aula_id, aluno_id, instrutor_id, valor_bruto, taxa_plataforma, valor_instrutor, metodo, status, pago_em)
SELECT 
  a.id, a.aluno_id, a.instrutor_id, 
  a.valor,
  a.valor,    -- 100% plataforma (instrutor refused)
  0.00,       -- 0% instrutor
  'pix', 'aprovado', a.aula_fim
FROM public.aulas a 
WHERE a.id = 'a5886922-3c43-41d5-bded-ff8396f25f1f'
AND NOT EXISTS (
  SELECT 1 FROM public.pagamentos p WHERE p.aula_id = a.id
);