
-- CORREÇÃO CRÍTICA: Respostas erradas nos quizzes
-- Estas 7 perguntas estavam com a resposta correta apontando para a alternativa ERRADA

-- 1. CTB: Definição de trânsito - resposta correta é B (não A)
UPDATE curso_quiz_perguntas 
SET resposta_correta = 'B'
WHERE id = 'b9b0e172-6412-4fcc-a375-d5af3ec1200f';

-- 2. SNT: Órgão máximo normativo - resposta correta é B (CONTRAN, não DETRAN)
UPDATE curso_quiz_perguntas 
SET resposta_correta = 'B'
WHERE id = 'c6c13852-f223-4991-badc-4a3b57025869';

-- 3. Direção Defensiva: Definição - resposta correta é B (prever riscos, não agressivamente)
UPDATE curso_quiz_perguntas 
SET resposta_correta = 'B'
WHERE id = '61838a30-c391-4f6f-ad7e-a12d14b48862';

-- 4. Condições adversas do CONDUTOR - resposta correta é B (fadiga/sono, não chuva/neblina)
UPDATE curso_quiz_perguntas 
SET resposta_correta = 'B'
WHERE id = 'c5824910-c1c7-4071-9a5d-cf91f7c40345';

-- 5. Condições adversas da VIA - resposta correta é B (buracos, não condutor com sono)
UPDATE curso_quiz_perguntas 
SET resposta_correta = 'B'
WHERE id = 'e74134fd-d8c4-4c3a-b999-7c6d90d4a26c';

-- 6. Condições adversas do VEÍCULO - resposta correta é B (pneus gastos, não chuva)
UPDATE curso_quiz_perguntas 
SET resposta_correta = 'B'
WHERE id = '642517a1-fe83-47e9-b962-7cb30be4bbf1';

-- 7. Vibrações no volante - resposta correta é B (problema no balanceamento, não normal)
UPDATE curso_quiz_perguntas 
SET resposta_correta = 'B'
WHERE id = '6d9acebf-6945-40a8-a9c6-482471a1cbb0';
