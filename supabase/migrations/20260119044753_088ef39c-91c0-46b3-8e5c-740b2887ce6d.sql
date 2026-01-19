
-- ==============================================
-- REBALANCEAMENTO: MÓDULOS 1 E 7
-- ==============================================

-- =============== MÓDULO 1: LEGISLAÇÃO ===============
-- Converter 4 questões de A/C para D

-- 1. "Velocidade máxima em vias locais urbanas" (A→D)
UPDATE public.curso_quiz_perguntas
SET 
  opcoes = '[{"letra": "A", "texto": "60 km/h"}, {"letra": "B", "texto": "40 km/h"}, {"letra": "C", "texto": "50 km/h"}, {"letra": "D", "texto": "30 km/h"}]'::jsonb,
  resposta_correta = 'D'
WHERE id = '30cbac36-6f4a-4c29-bc0e-51a33bdc2cee';

-- 2. "O CRLV deve ser renovado" (A→D)
UPDATE public.curso_quiz_perguntas
SET 
  opcoes = '[{"letra": "A", "texto": "A cada 5 anos"}, {"letra": "B", "texto": "A cada 2 anos"}, {"letra": "C", "texto": "Nunca expira"}, {"letra": "D", "texto": "Anualmente"}]'::jsonb,
  resposta_correta = 'D'
WHERE id = '379d96ac-af61-4ff5-a062-a2c7e834263a';

-- 3. "É proibido estacionar" (A→D)
UPDATE public.curso_quiz_perguntas
SET 
  opcoes = '[{"letra": "A", "texto": "Em vagas demarcadas"}, {"letra": "B", "texto": "Em estacionamentos pagos"}, {"letra": "C", "texto": "Em ruas com pouco movimento"}, {"letra": "D", "texto": "Em frente a garagens"}]'::jsonb,
  resposta_correta = 'D'
WHERE id = '097bc545-7e71-497c-9a0b-f3c5af626678';

-- 4. "A JARI é responsável por" (C→D)
UPDATE public.curso_quiz_perguntas
SET 
  opcoes = '[{"letra": "A", "texto": "Aplicar multas"}, {"letra": "B", "texto": "Fiscalizar rodovias"}, {"letra": "C", "texto": "Emitir CNH"}, {"letra": "D", "texto": "Julgar recursos de primeira instância contra multas"}]'::jsonb,
  resposta_correta = 'D'
WHERE id = '434728a0-0b5f-4424-a3a8-0fe6b346ef1f';

-- =============== MÓDULO 7: MEIO AMBIENTE ===============
-- Converter 4 questões de A/B para C

-- 5. "A mobilidade urbana sustentável prioriza" (A→C)
UPDATE public.curso_quiz_perguntas
SET 
  opcoes = '[{"letra": "A", "texto": "Motos e caminhões"}, {"letra": "B", "texto": "Apenas carros"}, {"letra": "C", "texto": "Transporte coletivo, bicicletas e pedestres"}, {"letra": "D", "texto": "Veículos importados"}]'::jsonb,
  resposta_correta = 'C'
WHERE id = '2071f20c-a59c-4ef9-adc1-4a90f5cfb58c';

-- 6. "O descarte correto de óleo usado" (A→C)
UPDATE public.curso_quiz_perguntas
SET 
  opcoes = '[{"letra": "A", "texto": "Jogar no ralo da pia"}, {"letra": "B", "texto": "Enterrar no quintal"}, {"letra": "C", "texto": "Levar a um posto de coleta autorizado"}, {"letra": "D", "texto": "Queimar o óleo"}]'::jsonb,
  resposta_correta = 'C'
WHERE id = '2724d69f-d6cf-41e5-9c39-70ec85ce1e41';

-- 7. "Campanhas educativas no trânsito ajudam a" (A→C)
UPDATE public.curso_quiz_perguntas
SET 
  opcoes = '[{"letra": "A", "texto": "Aumentar acidentes"}, {"letra": "B", "texto": "Vender carros"}, {"letra": "C", "texto": "Mudar comportamentos e salvar vidas"}, {"letra": "D", "texto": "Nada"}]'::jsonb,
  resposta_correta = 'C'
WHERE id = '170507df-ee38-46d6-955f-f8f3e536854d';

-- 8. "A educação para o trânsito deve começar" (B→C)
UPDATE public.curso_quiz_perguntas
SET 
  opcoes = '[{"letra": "A", "texto": "Apenas na autoescola"}, {"letra": "B", "texto": "Após os 18 anos"}, {"letra": "C", "texto": "Desde a infância, nas escolas"}, {"letra": "D", "texto": "Apenas para motoristas"}]'::jsonb,
  resposta_correta = 'C'
WHERE id = 'ed8780ad-0c39-4ea9-8b96-7f538905a854';
