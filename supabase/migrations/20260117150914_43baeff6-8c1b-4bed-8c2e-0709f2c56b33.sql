-- Redistribuir respostas corretas para equilibrar entre A, B, C, D
-- Atualmente 74.8% são B, vamos redistribuir para ~25% cada

-- Grupo 1: Mover de B para A (aproximadamente 22 questões)
-- Mecânica Básica - primeiras 4 questões para A
UPDATE curso_quiz_perguntas 
SET opcoes = jsonb_build_array(opcoes->1, opcoes->0, opcoes->2, opcoes->3),
    resposta_correta = 'A'
WHERE resposta_correta = 'B' 
AND aula_id IN (
  SELECT ca.id FROM curso_aulas ca 
  JOIN curso_modulos cm ON ca.modulo_id = cm.id 
  WHERE cm.titulo ILIKE '%Mecânica%'
)
AND ordem IN (1, 2, 3, 4);

-- Grupo 2: Mover de B para C (aproximadamente 22 questões)
-- Mecânica Básica - questões 5-8 para C
UPDATE curso_quiz_perguntas 
SET opcoes = jsonb_build_array(opcoes->0, opcoes->2, opcoes->1, opcoes->3),
    resposta_correta = 'C'
WHERE resposta_correta = 'B' 
AND aula_id IN (
  SELECT ca.id FROM curso_aulas ca 
  JOIN curso_modulos cm ON ca.modulo_id = cm.id 
  WHERE cm.titulo ILIKE '%Mecânica%'
)
AND ordem IN (5, 6, 7, 8);

-- Grupo 3: Mover de B para D (aproximadamente 22 questões)
-- Mecânica Básica - questões 9-12 para D
UPDATE curso_quiz_perguntas 
SET opcoes = jsonb_build_array(opcoes->0, opcoes->3, opcoes->2, opcoes->1),
    resposta_correta = 'D'
WHERE resposta_correta = 'B' 
AND aula_id IN (
  SELECT ca.id FROM curso_aulas ca 
  JOIN curso_modulos cm ON ca.modulo_id = cm.id 
  WHERE cm.titulo ILIKE '%Mecânica%'
)
AND ordem IN (9, 10, 11, 12);

-- Primeiros Socorros - redistribuir
-- Questões ímpares para A
UPDATE curso_quiz_perguntas 
SET opcoes = jsonb_build_array(opcoes->1, opcoes->0, opcoes->2, opcoes->3),
    resposta_correta = 'A'
WHERE resposta_correta = 'B' 
AND aula_id IN (
  SELECT ca.id FROM curso_aulas ca 
  JOIN curso_modulos cm ON ca.modulo_id = cm.id 
  WHERE cm.titulo ILIKE '%Primeiros Socorros%'
)
AND MOD(ordem, 4) = 1;

-- Questões pares divisíveis por 4 para C
UPDATE curso_quiz_perguntas 
SET opcoes = jsonb_build_array(opcoes->0, opcoes->2, opcoes->1, opcoes->3),
    resposta_correta = 'C'
WHERE resposta_correta = 'B' 
AND aula_id IN (
  SELECT ca.id FROM curso_aulas ca 
  JOIN curso_modulos cm ON ca.modulo_id = cm.id 
  WHERE cm.titulo ILIKE '%Primeiros Socorros%'
)
AND MOD(ordem, 4) = 0;

-- Questões ordem % 4 = 3 para D
UPDATE curso_quiz_perguntas 
SET opcoes = jsonb_build_array(opcoes->0, opcoes->3, opcoes->2, opcoes->1),
    resposta_correta = 'D'
WHERE resposta_correta = 'B' 
AND aula_id IN (
  SELECT ca.id FROM curso_aulas ca 
  JOIN curso_modulos cm ON ca.modulo_id = cm.id 
  WHERE cm.titulo ILIKE '%Primeiros Socorros%'
)
AND MOD(ordem, 4) = 3;

-- Meio Ambiente - redistribuir
UPDATE curso_quiz_perguntas 
SET opcoes = jsonb_build_array(opcoes->1, opcoes->0, opcoes->2, opcoes->3),
    resposta_correta = 'A'
WHERE resposta_correta = 'B' 
AND aula_id IN (
  SELECT ca.id FROM curso_aulas ca 
  JOIN curso_modulos cm ON ca.modulo_id = cm.id 
  WHERE cm.titulo ILIKE '%Meio Ambiente%'
)
AND MOD(ordem, 4) = 1;

UPDATE curso_quiz_perguntas 
SET opcoes = jsonb_build_array(opcoes->0, opcoes->2, opcoes->1, opcoes->3),
    resposta_correta = 'C'
WHERE resposta_correta = 'B' 
AND aula_id IN (
  SELECT ca.id FROM curso_aulas ca 
  JOIN curso_modulos cm ON ca.modulo_id = cm.id 
  WHERE cm.titulo ILIKE '%Meio Ambiente%'
)
AND MOD(ordem, 4) = 0;

UPDATE curso_quiz_perguntas 
SET opcoes = jsonb_build_array(opcoes->0, opcoes->3, opcoes->2, opcoes->1),
    resposta_correta = 'D'
WHERE resposta_correta = 'B' 
AND aula_id IN (
  SELECT ca.id FROM curso_aulas ca 
  JOIN curso_modulos cm ON ca.modulo_id = cm.id 
  WHERE cm.titulo ILIKE '%Meio Ambiente%'
)
AND MOD(ordem, 4) = 3;

-- Legislação de Trânsito - redistribuir as que são B
UPDATE curso_quiz_perguntas 
SET opcoes = jsonb_build_array(opcoes->1, opcoes->0, opcoes->2, opcoes->3),
    resposta_correta = 'A'
WHERE resposta_correta = 'B' 
AND aula_id IN (
  SELECT ca.id FROM curso_aulas ca 
  JOIN curso_modulos cm ON ca.modulo_id = cm.id 
  WHERE cm.titulo ILIKE '%Legislação%'
)
AND MOD(ordem, 3) = 1;

UPDATE curso_quiz_perguntas 
SET opcoes = jsonb_build_array(opcoes->0, opcoes->2, opcoes->1, opcoes->3),
    resposta_correta = 'C'
WHERE resposta_correta = 'B' 
AND aula_id IN (
  SELECT ca.id FROM curso_aulas ca 
  JOIN curso_modulos cm ON ca.modulo_id = cm.id 
  WHERE cm.titulo ILIKE '%Legislação%'
)
AND MOD(ordem, 3) = 0;

-- Direção Defensiva - redistribuir
UPDATE curso_quiz_perguntas 
SET opcoes = jsonb_build_array(opcoes->1, opcoes->0, opcoes->2, opcoes->3),
    resposta_correta = 'A'
WHERE resposta_correta = 'B' 
AND aula_id IN (
  SELECT ca.id FROM curso_aulas ca 
  JOIN curso_modulos cm ON ca.modulo_id = cm.id 
  WHERE cm.titulo ILIKE '%Direção Defensiva%'
)
AND MOD(ordem, 3) = 1;

UPDATE curso_quiz_perguntas 
SET opcoes = jsonb_build_array(opcoes->0, opcoes->2, opcoes->1, opcoes->3),
    resposta_correta = 'C'
WHERE resposta_correta = 'B' 
AND aula_id IN (
  SELECT ca.id FROM curso_aulas ca 
  JOIN curso_modulos cm ON ca.modulo_id = cm.id 
  WHERE cm.titulo ILIKE '%Direção Defensiva%'
)
AND MOD(ordem, 3) = 0;