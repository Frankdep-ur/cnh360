-- Balanceamento das respostas corretas - Swap B <-> A, B <-> C, B <-> D
-- A coluna 'opcoes' é JSONB array com {letra, texto}

-- ============================================
-- MÓDULO 1: 21B -> converter 6 para A, 5 para C, 5 para D (restam 5B)
-- ============================================

-- Swap B <-> A (6 perguntas)
UPDATE curso_quiz_perguntas SET
  opcoes = jsonb_set(
    jsonb_set(opcoes, '{0,texto}', to_jsonb((opcoes->1->>'texto')::text)),
    '{1,texto}', to_jsonb((opcoes->0->>'texto')::text)
  ),
  resposta_correta = 'A'
WHERE id IN (
  '04c0a94e-4a20-47e8-91b4-2f55f0350cac',
  '0535883d-40ab-4775-9ddd-d8088636e1f9',
  '097bc545-7e71-497c-9a0b-f3c5af626678',
  '0eb11c00-21c8-42af-ba6b-428415c25aa1',
  '1a3ea05f-0ea0-4415-ae12-1e3239126a73',
  '379d96ac-af61-4ff5-a062-a2c7e834263a'
);

-- Swap B <-> D (5 perguntas)
UPDATE curso_quiz_perguntas SET
  opcoes = jsonb_set(
    jsonb_set(opcoes, '{3,texto}', to_jsonb((opcoes->1->>'texto')::text)),
    '{1,texto}', to_jsonb((opcoes->3->>'texto')::text)
  ),
  resposta_correta = 'D'
WHERE id IN (
  '434728a0-0b5f-4424-a3a8-0fe6b346ef1f',
  '54b8e0ee-76ce-4eab-9c0c-42d9146bcf45',
  '55f25765-798b-4e2d-8d86-8a2f366b427f',
  '5b041743-8a33-4a9c-b82c-6b4268bb2dac',
  '6759b956-8ece-4c42-b6af-9d0831a5ea9f'
);

-- ============================================
-- MÓDULO 2: 17B -> converter 5 para A, 4 para D (restam ~8B, já tem 15C)
-- ============================================

UPDATE curso_quiz_perguntas SET
  opcoes = jsonb_set(
    jsonb_set(opcoes, '{0,texto}', to_jsonb((opcoes->1->>'texto')::text)),
    '{1,texto}', to_jsonb((opcoes->0->>'texto')::text)
  ),
  resposta_correta = 'A'
WHERE id IN (
  '1cfec004-5a43-4366-9166-4295b0cdb71f',
  '284ca4df-e1e1-4bb7-9a6f-6eeb2b845e31',
  '29448408-d9fe-4083-af28-c2c6911d62ab',
  '2ad11b28-cc59-4e71-a7ae-f1f6fa29bdd7',
  '2ca6fee6-42f6-4c7b-aba5-8a3d02d76fb9'
);

UPDATE curso_quiz_perguntas SET
  opcoes = jsonb_set(
    jsonb_set(opcoes, '{3,texto}', to_jsonb((opcoes->1->>'texto')::text)),
    '{1,texto}', to_jsonb((opcoes->3->>'texto')::text)
  ),
  resposta_correta = 'D'
WHERE id IN (
  '35d5aeac-17af-4d62-917d-a76e6a9093c7',
  '3afd0ab3-67d6-40e9-b6d8-e8fa0dd5b749',
  '3e3dc2b0-bc25-4389-8e1f-4a1a5dc0dd5c',
  '45f8e18d-c3b2-4a11-b89c-3c6f9b8f7a22'
);

-- ============================================
-- MÓDULO 3: 18B -> converter 5 para A, 5 para C, 4 para D (restam 4B)
-- ============================================

-- Obter IDs do módulo 3 para swap
UPDATE curso_quiz_perguntas SET
  opcoes = jsonb_set(
    jsonb_set(opcoes, '{0,texto}', to_jsonb((opcoes->1->>'texto')::text)),
    '{1,texto}', to_jsonb((opcoes->0->>'texto')::text)
  ),
  resposta_correta = 'A'
WHERE aula_id IN (SELECT id FROM curso_aulas WHERE modulo_id = (SELECT id FROM curso_modulos WHERE ordem = 3))
  AND resposta_correta = 'B'
  AND id IN (
    SELECT id FROM curso_quiz_perguntas 
    WHERE aula_id IN (SELECT id FROM curso_aulas WHERE modulo_id = (SELECT id FROM curso_modulos WHERE ordem = 3))
    AND resposta_correta = 'B'
    ORDER BY id LIMIT 5
  );

UPDATE curso_quiz_perguntas SET
  opcoes = jsonb_set(
    jsonb_set(opcoes, '{2,texto}', to_jsonb((opcoes->1->>'texto')::text)),
    '{1,texto}', to_jsonb((opcoes->2->>'texto')::text)
  ),
  resposta_correta = 'C'
WHERE aula_id IN (SELECT id FROM curso_aulas WHERE modulo_id = (SELECT id FROM curso_modulos WHERE ordem = 3))
  AND resposta_correta = 'B'
  AND id IN (
    SELECT id FROM curso_quiz_perguntas 
    WHERE aula_id IN (SELECT id FROM curso_aulas WHERE modulo_id = (SELECT id FROM curso_modulos WHERE ordem = 3))
    AND resposta_correta = 'B'
    ORDER BY id LIMIT 5
  );

UPDATE curso_quiz_perguntas SET
  opcoes = jsonb_set(
    jsonb_set(opcoes, '{3,texto}', to_jsonb((opcoes->1->>'texto')::text)),
    '{1,texto}', to_jsonb((opcoes->3->>'texto')::text)
  ),
  resposta_correta = 'D'
WHERE aula_id IN (SELECT id FROM curso_aulas WHERE modulo_id = (SELECT id FROM curso_modulos WHERE ordem = 3))
  AND resposta_correta = 'B'
  AND id IN (
    SELECT id FROM curso_quiz_perguntas 
    WHERE aula_id IN (SELECT id FROM curso_aulas WHERE modulo_id = (SELECT id FROM curso_modulos WHERE ordem = 3))
    AND resposta_correta = 'B'
    ORDER BY id LIMIT 4
  );

-- ============================================
-- MÓDULO 4: 25B -> converter 7 para A, 6 para C, 6 para D (restam 6B)
-- ============================================

UPDATE curso_quiz_perguntas SET
  opcoes = jsonb_set(
    jsonb_set(opcoes, '{0,texto}', to_jsonb((opcoes->1->>'texto')::text)),
    '{1,texto}', to_jsonb((opcoes->0->>'texto')::text)
  ),
  resposta_correta = 'A'
WHERE aula_id IN (SELECT id FROM curso_aulas WHERE modulo_id = (SELECT id FROM curso_modulos WHERE ordem = 4))
  AND resposta_correta = 'B'
  AND id IN (
    SELECT id FROM curso_quiz_perguntas 
    WHERE aula_id IN (SELECT id FROM curso_aulas WHERE modulo_id = (SELECT id FROM curso_modulos WHERE ordem = 4))
    AND resposta_correta = 'B'
    ORDER BY id LIMIT 7
  );

UPDATE curso_quiz_perguntas SET
  opcoes = jsonb_set(
    jsonb_set(opcoes, '{2,texto}', to_jsonb((opcoes->1->>'texto')::text)),
    '{1,texto}', to_jsonb((opcoes->2->>'texto')::text)
  ),
  resposta_correta = 'C'
WHERE aula_id IN (SELECT id FROM curso_aulas WHERE modulo_id = (SELECT id FROM curso_modulos WHERE ordem = 4))
  AND resposta_correta = 'B'
  AND id IN (
    SELECT id FROM curso_quiz_perguntas 
    WHERE aula_id IN (SELECT id FROM curso_aulas WHERE modulo_id = (SELECT id FROM curso_modulos WHERE ordem = 4))
    AND resposta_correta = 'B'
    ORDER BY id LIMIT 6
  );

UPDATE curso_quiz_perguntas SET
  opcoes = jsonb_set(
    jsonb_set(opcoes, '{3,texto}', to_jsonb((opcoes->1->>'texto')::text)),
    '{1,texto}', to_jsonb((opcoes->3->>'texto')::text)
  ),
  resposta_correta = 'D'
WHERE aula_id IN (SELECT id FROM curso_aulas WHERE modulo_id = (SELECT id FROM curso_modulos WHERE ordem = 4))
  AND resposta_correta = 'B'
  AND id IN (
    SELECT id FROM curso_quiz_perguntas 
    WHERE aula_id IN (SELECT id FROM curso_aulas WHERE modulo_id = (SELECT id FROM curso_modulos WHERE ordem = 4))
    AND resposta_correta = 'B'
    ORDER BY id LIMIT 6
  );

-- ============================================
-- MÓDULO 5: 19B -> converter 6 para A, 5 para C, 5 para D (restam 3B)
-- ============================================

UPDATE curso_quiz_perguntas SET
  opcoes = jsonb_set(
    jsonb_set(opcoes, '{0,texto}', to_jsonb((opcoes->1->>'texto')::text)),
    '{1,texto}', to_jsonb((opcoes->0->>'texto')::text)
  ),
  resposta_correta = 'A'
WHERE aula_id IN (SELECT id FROM curso_aulas WHERE modulo_id = (SELECT id FROM curso_modulos WHERE ordem = 5))
  AND resposta_correta = 'B'
  AND id IN (
    SELECT id FROM curso_quiz_perguntas 
    WHERE aula_id IN (SELECT id FROM curso_aulas WHERE modulo_id = (SELECT id FROM curso_modulos WHERE ordem = 5))
    AND resposta_correta = 'B'
    ORDER BY id LIMIT 6
  );

UPDATE curso_quiz_perguntas SET
  opcoes = jsonb_set(
    jsonb_set(opcoes, '{2,texto}', to_jsonb((opcoes->1->>'texto')::text)),
    '{1,texto}', to_jsonb((opcoes->2->>'texto')::text)
  ),
  resposta_correta = 'C'
WHERE aula_id IN (SELECT id FROM curso_aulas WHERE modulo_id = (SELECT id FROM curso_modulos WHERE ordem = 5))
  AND resposta_correta = 'B'
  AND id IN (
    SELECT id FROM curso_quiz_perguntas 
    WHERE aula_id IN (SELECT id FROM curso_aulas WHERE modulo_id = (SELECT id FROM curso_modulos WHERE ordem = 5))
    AND resposta_correta = 'B'
    ORDER BY id LIMIT 5
  );

UPDATE curso_quiz_perguntas SET
  opcoes = jsonb_set(
    jsonb_set(opcoes, '{3,texto}', to_jsonb((opcoes->1->>'texto')::text)),
    '{1,texto}', to_jsonb((opcoes->3->>'texto')::text)
  ),
  resposta_correta = 'D'
WHERE aula_id IN (SELECT id FROM curso_aulas WHERE modulo_id = (SELECT id FROM curso_modulos WHERE ordem = 5))
  AND resposta_correta = 'B'
  AND id IN (
    SELECT id FROM curso_quiz_perguntas 
    WHERE aula_id IN (SELECT id FROM curso_aulas WHERE modulo_id = (SELECT id FROM curso_modulos WHERE ordem = 5))
    AND resposta_correta = 'B'
    ORDER BY id LIMIT 5
  );

-- ============================================
-- MÓDULO 6: 23B -> converter 6 para A, 6 para C, 5 para D (restam 6B)
-- ============================================

UPDATE curso_quiz_perguntas SET
  opcoes = jsonb_set(
    jsonb_set(opcoes, '{0,texto}', to_jsonb((opcoes->1->>'texto')::text)),
    '{1,texto}', to_jsonb((opcoes->0->>'texto')::text)
  ),
  resposta_correta = 'A'
WHERE aula_id IN (SELECT id FROM curso_aulas WHERE modulo_id = (SELECT id FROM curso_modulos WHERE ordem = 6))
  AND resposta_correta = 'B'
  AND id IN (
    SELECT id FROM curso_quiz_perguntas 
    WHERE aula_id IN (SELECT id FROM curso_aulas WHERE modulo_id = (SELECT id FROM curso_modulos WHERE ordem = 6))
    AND resposta_correta = 'B'
    ORDER BY id LIMIT 6
  );

UPDATE curso_quiz_perguntas SET
  opcoes = jsonb_set(
    jsonb_set(opcoes, '{2,texto}', to_jsonb((opcoes->1->>'texto')::text)),
    '{1,texto}', to_jsonb((opcoes->2->>'texto')::text)
  ),
  resposta_correta = 'C'
WHERE aula_id IN (SELECT id FROM curso_aulas WHERE modulo_id = (SELECT id FROM curso_modulos WHERE ordem = 6))
  AND resposta_correta = 'B'
  AND id IN (
    SELECT id FROM curso_quiz_perguntas 
    WHERE aula_id IN (SELECT id FROM curso_aulas WHERE modulo_id = (SELECT id FROM curso_modulos WHERE ordem = 6))
    AND resposta_correta = 'B'
    ORDER BY id LIMIT 6
  );

UPDATE curso_quiz_perguntas SET
  opcoes = jsonb_set(
    jsonb_set(opcoes, '{3,texto}', to_jsonb((opcoes->1->>'texto')::text)),
    '{1,texto}', to_jsonb((opcoes->3->>'texto')::text)
  ),
  resposta_correta = 'D'
WHERE aula_id IN (SELECT id FROM curso_aulas WHERE modulo_id = (SELECT id FROM curso_modulos WHERE ordem = 6))
  AND resposta_correta = 'B'
  AND id IN (
    SELECT id FROM curso_quiz_perguntas 
    WHERE aula_id IN (SELECT id FROM curso_aulas WHERE modulo_id = (SELECT id FROM curso_modulos WHERE ordem = 6))
    AND resposta_correta = 'B'
    ORDER BY id LIMIT 5
  );

-- ============================================
-- MÓDULO 7: 16B -> converter 5 para A, 4 para C, 4 para D (restam 3B)
-- ============================================

UPDATE curso_quiz_perguntas SET
  opcoes = jsonb_set(
    jsonb_set(opcoes, '{0,texto}', to_jsonb((opcoes->1->>'texto')::text)),
    '{1,texto}', to_jsonb((opcoes->0->>'texto')::text)
  ),
  resposta_correta = 'A'
WHERE aula_id IN (SELECT id FROM curso_aulas WHERE modulo_id = (SELECT id FROM curso_modulos WHERE ordem = 7))
  AND resposta_correta = 'B'
  AND id IN (
    SELECT id FROM curso_quiz_perguntas 
    WHERE aula_id IN (SELECT id FROM curso_aulas WHERE modulo_id = (SELECT id FROM curso_modulos WHERE ordem = 7))
    AND resposta_correta = 'B'
    ORDER BY id LIMIT 5
  );

UPDATE curso_quiz_perguntas SET
  opcoes = jsonb_set(
    jsonb_set(opcoes, '{2,texto}', to_jsonb((opcoes->1->>'texto')::text)),
    '{1,texto}', to_jsonb((opcoes->2->>'texto')::text)
  ),
  resposta_correta = 'C'
WHERE aula_id IN (SELECT id FROM curso_aulas WHERE modulo_id = (SELECT id FROM curso_modulos WHERE ordem = 7))
  AND resposta_correta = 'B'
  AND id IN (
    SELECT id FROM curso_quiz_perguntas 
    WHERE aula_id IN (SELECT id FROM curso_aulas WHERE modulo_id = (SELECT id FROM curso_modulos WHERE ordem = 7))
    AND resposta_correta = 'B'
    ORDER BY id LIMIT 4
  );

UPDATE curso_quiz_perguntas SET
  opcoes = jsonb_set(
    jsonb_set(opcoes, '{3,texto}', to_jsonb((opcoes->1->>'texto')::text)),
    '{1,texto}', to_jsonb((opcoes->3->>'texto')::text)
  ),
  resposta_correta = 'D'
WHERE aula_id IN (SELECT id FROM curso_aulas WHERE modulo_id = (SELECT id FROM curso_modulos WHERE ordem = 7))
  AND resposta_correta = 'B'
  AND id IN (
    SELECT id FROM curso_quiz_perguntas 
    WHERE aula_id IN (SELECT id FROM curso_aulas WHERE modulo_id = (SELECT id FROM curso_modulos WHERE ordem = 7))
    AND resposta_correta = 'B'
    ORDER BY id LIMIT 4
  );