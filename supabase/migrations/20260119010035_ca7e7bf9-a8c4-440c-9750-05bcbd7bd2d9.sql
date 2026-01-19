-- Correção das respostas incorretas nos quizzes
-- Módulo 5: Mecânica Básica - Aulas originais com erros

-- Aula: Sistema de Freios (e29a5b6e-4bdb-4e62-912e-cca6032dd7c8)
UPDATE curso_quiz_perguntas SET resposta_correta = 'B' 
WHERE aula_id = 'e29a5b6e-4bdb-4e62-912e-cca6032dd7c8' 
AND pergunta LIKE '%fluido de freio%';

UPDATE curso_quiz_perguntas SET resposta_correta = 'B' 
WHERE aula_id = 'e29a5b6e-4bdb-4e62-912e-cca6032dd7c8' 
AND pergunta LIKE '%pedal do freio afundar%';

UPDATE curso_quiz_perguntas SET resposta_correta = 'B' 
WHERE aula_id = 'e29a5b6e-4bdb-4e62-912e-cca6032dd7c8' 
AND pergunta LIKE '%ABS evita%';

-- Aula: Sistema de Suspensão e Direção (f3a6c7d8-5ece-4f73-a23f-ddb7143ee8d9)
UPDATE curso_quiz_perguntas SET resposta_correta = 'B' 
WHERE aula_id = 'f3a6c7d8-5ece-4f73-a23f-ddb7143ee8d9' 
AND pergunta LIKE '%suspensão do veículo serve%';

UPDATE curso_quiz_perguntas SET resposta_correta = 'B' 
WHERE aula_id = 'f3a6c7d8-5ece-4f73-a23f-ddb7143ee8d9' 
AND pergunta LIKE '%Vibrações no volante%';

UPDATE curso_quiz_perguntas SET resposta_correta = 'B' 
WHERE aula_id = 'f3a6c7d8-5ece-4f73-a23f-ddb7143ee8d9' 
AND pergunta LIKE '%direção hidráulica%';

-- Aula: Pneus e Calibragem (a1b2c3d4-6fdf-4a84-b34a-eec8254ff9ea)
UPDATE curso_quiz_perguntas SET resposta_correta = 'B' 
WHERE aula_id = 'a1b2c3d4-6fdf-4a84-b34a-eec8254ff9ea' 
AND pergunta LIKE '%calibragem dos pneus%';

UPDATE curso_quiz_perguntas SET resposta_correta = 'B' 
WHERE aula_id = 'a1b2c3d4-6fdf-4a84-b34a-eec8254ff9ea' 
AND pergunta LIKE '%Pneus descalibrados%';

UPDATE curso_quiz_perguntas SET resposta_correta = 'B' 
WHERE aula_id = 'a1b2c3d4-6fdf-4a84-b34a-eec8254ff9ea' 
AND pergunta LIKE '%TWI no pneu%';

-- Aula: Funcionamento do Motor (d4e5f6a7-7faf-4b95-c45b-ffd9365aa0fb)
UPDATE curso_quiz_perguntas SET resposta_correta = 'B' 
WHERE aula_id = 'd4e5f6a7-7faf-4b95-c45b-ffd9365aa0fb' 
AND pergunta LIKE '%motor de combustão interna%';

UPDATE curso_quiz_perguntas SET resposta_correta = 'B' 
WHERE aula_id = 'd4e5f6a7-7faf-4b95-c45b-ffd9365aa0fb' 
AND pergunta LIKE '%luz de temperatura%';

-- Aula: Manutenção Preventiva (b2c3d4e5-8aba-4ca6-d56c-aae0476bb1ac)
UPDATE curso_quiz_perguntas SET resposta_correta = 'B' 
WHERE aula_id = 'b2c3d4e5-8aba-4ca6-d56c-aae0476bb1ac' 
AND pergunta LIKE '%manutenção preventiva%';

UPDATE curso_quiz_perguntas SET resposta_correta = 'B' 
WHERE aula_id = 'b2c3d4e5-8aba-4ca6-d56c-aae0476bb1ac' 
AND pergunta LIKE '%óleo do motor%';

UPDATE curso_quiz_perguntas SET resposta_correta = 'B' 
WHERE aula_id = 'b2c3d4e5-8aba-4ca6-d56c-aae0476bb1ac' 
AND pergunta LIKE '%barulhos estranhos%';

-- Módulo 1: Legislação de Trânsito - Correções
-- Aula: Introdução ao CTB (a1b2c3d4-1111-1111-1111-111111111111)
UPDATE curso_quiz_perguntas SET resposta_correta = 'B' 
WHERE aula_id = 'a1b2c3d4-1111-1111-1111-111111111111' 
AND pergunta LIKE '%definição de trânsito%';

UPDATE curso_quiz_perguntas SET resposta_correta = 'B' 
WHERE aula_id = 'a1b2c3d4-1111-1111-1111-111111111111' 
AND pergunta LIKE '%órgão máximo normativo%';

UPDATE curso_quiz_perguntas SET resposta_correta = 'B' 
WHERE aula_id = 'a1b2c3d4-1111-1111-1111-111111111111' 
AND pergunta LIKE '%ano%CTB%';

-- Aula: Normas Gerais de Circulação (b2c3d4e5-1111-1111-1111-111111111111)
UPDATE curso_quiz_perguntas SET resposta_correta = 'B' 
WHERE aula_id = 'b2c3d4e5-1111-1111-1111-111111111111' 
AND pergunta LIKE '%velocidade máxima%via local%';

UPDATE curso_quiz_perguntas SET resposta_correta = 'B' 
WHERE aula_id = 'b2c3d4e5-1111-1111-1111-111111111111' 
AND pergunta LIKE '%circulação de veículos%';

UPDATE curso_quiz_perguntas SET resposta_correta = 'B' 
WHERE aula_id = 'b2c3d4e5-1111-1111-1111-111111111111' 
AND pergunta LIKE '%ultrapassagem%';

-- Aula: Infrações e Penalidades (c3d4e5f6-1111-1111-1111-111111111111)
UPDATE curso_quiz_perguntas SET resposta_correta = 'B' 
WHERE aula_id = 'c3d4e5f6-1111-1111-1111-111111111111' 
AND pergunta LIKE '%multa gravíssima%';

UPDATE curso_quiz_perguntas SET resposta_correta = 'B' 
WHERE aula_id = 'c3d4e5f6-1111-1111-1111-111111111111' 
AND pergunta LIKE '%dirigir embriagado%';

UPDATE curso_quiz_perguntas SET resposta_correta = 'B' 
WHERE aula_id = 'c3d4e5f6-1111-1111-1111-111111111111' 
AND pergunta LIKE '%CNH suspensa%';

-- Módulo 2: Direção Defensiva - Correções
-- Aula: Conceitos de Direção Defensiva (a1b2c3d4-2222-2222-2222-222222222222)
UPDATE curso_quiz_perguntas SET resposta_correta = 'B' 
WHERE aula_id = 'a1b2c3d4-2222-2222-2222-222222222222' 
AND pergunta LIKE '%objetivo da direção defensiva%';

UPDATE curso_quiz_perguntas SET resposta_correta = 'B' 
WHERE aula_id = 'a1b2c3d4-2222-2222-2222-222222222222' 
AND pergunta LIKE '%elementos da direção defensiva%';

UPDATE curso_quiz_perguntas SET resposta_correta = 'B' 
WHERE aula_id = 'a1b2c3d4-2222-2222-2222-222222222222' 
AND pergunta LIKE '%condição adversa%';

-- Aula: Condições Adversas (b2c3d4e5-2222-2222-2222-222222222222)
UPDATE curso_quiz_perguntas SET resposta_correta = 'B' 
WHERE aula_id = 'b2c3d4e5-2222-2222-2222-222222222222' 
AND pergunta LIKE '%chuva forte%';

UPDATE curso_quiz_perguntas SET resposta_correta = 'B' 
WHERE aula_id = 'b2c3d4e5-2222-2222-2222-222222222222' 
AND pergunta LIKE '%neblina%';

UPDATE curso_quiz_perguntas SET resposta_correta = 'B' 
WHERE aula_id = 'b2c3d4e5-2222-2222-2222-222222222222' 
AND pergunta LIKE '%fadiga%';

-- Aula: Distância e Tempo de Reação (c3d4e5f6-2222-2222-2222-222222222222)
UPDATE curso_quiz_perguntas SET resposta_correta = 'B' 
WHERE aula_id = 'c3d4e5f6-2222-2222-2222-222222222222' 
AND pergunta LIKE '%distância de seguimento%';

UPDATE curso_quiz_perguntas SET resposta_correta = 'B' 
WHERE aula_id = 'c3d4e5f6-2222-2222-2222-222222222222' 
AND pergunta LIKE '%tempo de reação%';

UPDATE curso_quiz_perguntas SET resposta_correta = 'B' 
WHERE aula_id = 'c3d4e5f6-2222-2222-2222-222222222222' 
AND pergunta LIKE '%aumentar a distância%';

-- Módulo 3: Primeiros Socorros - Correções  
-- Aula: Princípios Básicos (a1b2c3d4-3333-3333-3333-333333333333)
UPDATE curso_quiz_perguntas SET resposta_correta = 'B' 
WHERE aula_id = 'a1b2c3d4-3333-3333-3333-333333333333' 
AND pergunta LIKE '%prioridade%primeiros socorros%';

UPDATE curso_quiz_perguntas SET resposta_correta = 'B' 
WHERE aula_id = 'a1b2c3d4-3333-3333-3333-333333333333' 
AND pergunta LIKE '%SAMU%';

UPDATE curso_quiz_perguntas SET resposta_correta = 'B' 
WHERE aula_id = 'a1b2c3d4-3333-3333-3333-333333333333' 
AND pergunta LIKE '%sinalizar%acidente%';

-- Aula: Hemorragias e Fraturas (b2c3d4e5-3333-3333-3333-333333333333)
UPDATE curso_quiz_perguntas SET resposta_correta = 'B' 
WHERE aula_id = 'b2c3d4e5-3333-3333-3333-333333333333' 
AND pergunta LIKE '%hemorragia%';

UPDATE curso_quiz_perguntas SET resposta_correta = 'B' 
WHERE aula_id = 'b2c3d4e5-3333-3333-3333-333333333333' 
AND pergunta LIKE '%fratura exposta%';

UPDATE curso_quiz_perguntas SET resposta_correta = 'B' 
WHERE aula_id = 'b2c3d4e5-3333-3333-3333-333333333333' 
AND pergunta LIKE '%torniquete%';

-- Módulo 4: Meio Ambiente e Cidadania - Correções
-- Aula: Poluição Veicular (a1b2c3d4-4444-4444-4444-444444444444)
UPDATE curso_quiz_perguntas SET resposta_correta = 'B' 
WHERE aula_id = 'a1b2c3d4-4444-4444-4444-444444444444' 
AND pergunta LIKE '%poluente%veículo%';

UPDATE curso_quiz_perguntas SET resposta_correta = 'B' 
WHERE aula_id = 'a1b2c3d4-4444-4444-4444-444444444444' 
AND pergunta LIKE '%reduzir emissões%';

UPDATE curso_quiz_perguntas SET resposta_correta = 'B' 
WHERE aula_id = 'a1b2c3d4-4444-4444-4444-444444444444' 
AND pergunta LIKE '%catalisador%';

-- Aula: Direção Econômica (b2c3d4e5-4444-4444-4444-444444444444)
UPDATE curso_quiz_perguntas SET resposta_correta = 'B' 
WHERE aula_id = 'b2c3d4e5-4444-4444-4444-444444444444' 
AND pergunta LIKE '%economizar combustível%';

UPDATE curso_quiz_perguntas SET resposta_correta = 'B' 
WHERE aula_id = 'b2c3d4e5-4444-4444-4444-444444444444' 
AND pergunta LIKE '%marcha lenta%';

UPDATE curso_quiz_perguntas SET resposta_correta = 'B' 
WHERE aula_id = 'b2c3d4e5-4444-4444-4444-444444444444' 
AND pergunta LIKE '%acelerações bruscas%';

-- Aula: Cidadania no Trânsito (c3d4e5f6-4444-4444-4444-444444444444)
UPDATE curso_quiz_perguntas SET resposta_correta = 'B' 
WHERE aula_id = 'c3d4e5f6-4444-4444-4444-444444444444' 
AND pergunta LIKE '%cidadania%trânsito%';

UPDATE curso_quiz_perguntas SET resposta_correta = 'B' 
WHERE aula_id = 'c3d4e5f6-4444-4444-4444-444444444444' 
AND pergunta LIKE '%respeito%pedestres%';

UPDATE curso_quiz_perguntas SET resposta_correta = 'B' 
WHERE aula_id = 'c3d4e5f6-4444-4444-4444-444444444444' 
AND pergunta LIKE '%faixa de pedestres%';