
-- ==============================================
-- CORREÇÃO: 4 QUESTÕES COM FORMATO INCORRETO
-- ==============================================

-- 1. "A placa do veículo no padrão Mercosul possui"
UPDATE public.curso_quiz_perguntas
SET 
  opcoes = '[{"letra": "A", "texto": "3 letras, 1 número, 1 letra e 2 números"}, {"letra": "B", "texto": "4 letras e 3 números"}, {"letra": "C", "texto": "2 letras e 5 números"}, {"letra": "D", "texto": "5 letras e 2 números"}]'::jsonb,
  resposta_correta = 'A'
WHERE id = '2be24045-e0ef-411e-ae4f-fb354e67378c';

-- 2. "Quem tem direito à indenização do seguro obrigatório"
UPDATE public.curso_quiz_perguntas
SET 
  opcoes = '[{"letra": "A", "texto": "Apenas o condutor do veículo"}, {"letra": "B", "texto": "Apenas pedestres"}, {"letra": "C", "texto": "Todas as vítimas: pedestres, passageiros e condutores"}, {"letra": "D", "texto": "Somente quem tem seguro facultativo"}]'::jsonb,
  resposta_correta = 'C'
WHERE id = '75750eaf-7430-4999-8338-37db2cecc208';

-- 3. "O seguro facultativo é"
UPDATE public.curso_quiz_perguntas
SET 
  opcoes = '[{"letra": "A", "texto": "Obrigatório por lei"}, {"letra": "B", "texto": "Gratuito para todos"}, {"letra": "C", "texto": "Opcional, com coberturas adicionais como roubo e colisão"}, {"letra": "D", "texto": "Válido apenas para carros novos"}]'::jsonb,
  resposta_correta = 'C'
WHERE id = 'f34446c7-2a25-434c-a29c-e513d3fb92f5';

-- 4. "Ao comprar um veículo usado, o novo proprietário deve transferir em até"
UPDATE public.curso_quiz_perguntas
SET 
  opcoes = '[{"letra": "A", "texto": "15 dias"}, {"letra": "B", "texto": "60 dias"}, {"letra": "C", "texto": "30 dias"}, {"letra": "D", "texto": "90 dias"}]'::jsonb,
  resposta_correta = 'C'
WHERE id = 'fa4519e5-0783-4761-985f-bf178baff562';
