
-- ==============================================
-- REBALANCEAMENTO: MÓDULO 5 (SITUAÇÕES ESPECIAIS)
-- Meta: Converter 3 questões de A→C/D para equilibrar
-- ==============================================

-- 1. "Carga mal distribuída pode causar" (A→C)
-- Reorganizar opções: A↔C
UPDATE public.curso_quiz_perguntas
SET 
  opcoes = '[{"letra": "A", "texto": "Melhor aderência"}, {"letra": "B", "texto": "Economia de combustível"}, {"letra": "C", "texto": "Perda de estabilidade e maior distância de frenagem"}, {"letra": "D", "texto": "Nenhum problema"}]'::jsonb,
  resposta_correta = 'C'
WHERE id = '07a3b0c9-0f88-477c-88dc-79beec9b316b';

-- 2. "Se for necessário atravessar água rasa" (A→D)
-- Reorganizar opções: A↔D
UPDATE public.curso_quiz_perguntas
SET 
  opcoes = '[{"letra": "A", "texto": "Desligar os faróis"}, {"letra": "B", "texto": "Acelerar bastante"}, {"letra": "C", "texto": "Parar no meio"}, {"letra": "D", "texto": "Manter velocidade baixa e constante"}]'::jsonb,
  resposta_correta = 'D'
WHERE id = '169dc5f0-f4f9-48f0-bfc2-c007fc2db578';

-- 3. "Em subidas íngremes, se não conseguir subir" (A→D)
-- Reorganizar opções: A↔D
UPDATE public.curso_quiz_perguntas
SET 
  opcoes = '[{"letra": "A", "texto": "Acelerar ao máximo"}, {"letra": "B", "texto": "Forçar em primeira marcha"}, {"letra": "C", "texto": "Desligar o motor"}, {"letra": "D", "texto": "Engatar ré e descer com cuidado"}]'::jsonb,
  resposta_correta = 'D'
WHERE id = '5303cee0-d678-4d70-b454-50218cbea2a1';

-- 4. "Ao encontrar via alagada" (A→C)
-- Reorganizar opções: A↔C
UPDATE public.curso_quiz_perguntas
SET 
  opcoes = '[{"letra": "A", "texto": "Desligar o motor e empurrar"}, {"letra": "B", "texto": "Atravessar em alta velocidade"}, {"letra": "C", "texto": "Evitar atravessar se não souber a profundidade"}, {"letra": "D", "texto": "Atravessar pelo meio"}]'::jsonb,
  resposta_correta = 'C'
WHERE id = '2e7ecfdb-f63e-420d-83f9-4430c6d56cc4';
