-- Balanceamento final dos módulos 1, 2 e 5
-- Módulo 1: C=24 -> reduzir para ~13, aumentar B e D
-- Módulo 2: D=3 -> aumentar para ~11
-- Módulo 5: A=18 -> reduzir para ~8, aumentar B, C, D

-- ============================================
-- MÓDULO 1: Reduzir C (24->13), aumentar B e D
-- Converter 6 C para B, 5 C para D
-- ============================================

-- Swap C <-> B (6 perguntas)
UPDATE curso_quiz_perguntas SET
  opcoes = jsonb_set(
    jsonb_set(opcoes, '{1,texto}', to_jsonb((opcoes->2->>'texto')::text)),
    '{2,texto}', to_jsonb((opcoes->1->>'texto')::text)
  ),
  resposta_correta = 'B'
WHERE aula_id IN (SELECT id FROM curso_aulas WHERE modulo_id = (SELECT id FROM curso_modulos WHERE ordem = 1))
  AND resposta_correta = 'C'
  AND id IN (
    SELECT id FROM curso_quiz_perguntas 
    WHERE aula_id IN (SELECT id FROM curso_aulas WHERE modulo_id = (SELECT id FROM curso_modulos WHERE ordem = 1))
    AND resposta_correta = 'C'
    ORDER BY id LIMIT 6
  );

-- Swap C <-> D (5 perguntas)
UPDATE curso_quiz_perguntas SET
  opcoes = jsonb_set(
    jsonb_set(opcoes, '{3,texto}', to_jsonb((opcoes->2->>'texto')::text)),
    '{2,texto}', to_jsonb((opcoes->3->>'texto')::text)
  ),
  resposta_correta = 'D'
WHERE aula_id IN (SELECT id FROM curso_aulas WHERE modulo_id = (SELECT id FROM curso_modulos WHERE ordem = 1))
  AND resposta_correta = 'C'
  AND id IN (
    SELECT id FROM curso_quiz_perguntas 
    WHERE aula_id IN (SELECT id FROM curso_aulas WHERE modulo_id = (SELECT id FROM curso_modulos WHERE ordem = 1))
    AND resposta_correta = 'C'
    ORDER BY id LIMIT 5
  );

-- ============================================
-- MÓDULO 2: Aumentar D (3->11), reduzir B e C
-- Converter 4 B para D, 4 C para D
-- ============================================

-- Swap B <-> D (4 perguntas)
UPDATE curso_quiz_perguntas SET
  opcoes = jsonb_set(
    jsonb_set(opcoes, '{3,texto}', to_jsonb((opcoes->1->>'texto')::text)),
    '{1,texto}', to_jsonb((opcoes->3->>'texto')::text)
  ),
  resposta_correta = 'D'
WHERE aula_id IN (SELECT id FROM curso_aulas WHERE modulo_id = (SELECT id FROM curso_modulos WHERE ordem = 2))
  AND resposta_correta = 'B'
  AND id IN (
    SELECT id FROM curso_quiz_perguntas 
    WHERE aula_id IN (SELECT id FROM curso_aulas WHERE modulo_id = (SELECT id FROM curso_modulos WHERE ordem = 2))
    AND resposta_correta = 'B'
    ORDER BY id LIMIT 4
  );

-- Swap C <-> D (4 perguntas)
UPDATE curso_quiz_perguntas SET
  opcoes = jsonb_set(
    jsonb_set(opcoes, '{3,texto}', to_jsonb((opcoes->2->>'texto')::text)),
    '{2,texto}', to_jsonb((opcoes->3->>'texto')::text)
  ),
  resposta_correta = 'D'
WHERE aula_id IN (SELECT id FROM curso_aulas WHERE modulo_id = (SELECT id FROM curso_modulos WHERE ordem = 2))
  AND resposta_correta = 'C'
  AND id IN (
    SELECT id FROM curso_quiz_perguntas 
    WHERE aula_id IN (SELECT id FROM curso_aulas WHERE modulo_id = (SELECT id FROM curso_modulos WHERE ordem = 2))
    AND resposta_correta = 'C'
    ORDER BY id LIMIT 4
  );

-- ============================================
-- MÓDULO 5: Reduzir A (18->8), aumentar B, C, D
-- Converter 4 A para B, 3 A para C, 3 A para D
-- ============================================

-- Swap A <-> B (4 perguntas)
UPDATE curso_quiz_perguntas SET
  opcoes = jsonb_set(
    jsonb_set(opcoes, '{1,texto}', to_jsonb((opcoes->0->>'texto')::text)),
    '{0,texto}', to_jsonb((opcoes->1->>'texto')::text)
  ),
  resposta_correta = 'B'
WHERE aula_id IN (SELECT id FROM curso_aulas WHERE modulo_id = (SELECT id FROM curso_modulos WHERE ordem = 5))
  AND resposta_correta = 'A'
  AND id IN (
    SELECT id FROM curso_quiz_perguntas 
    WHERE aula_id IN (SELECT id FROM curso_aulas WHERE modulo_id = (SELECT id FROM curso_modulos WHERE ordem = 5))
    AND resposta_correta = 'A'
    ORDER BY id LIMIT 4
  );

-- Swap A <-> C (3 perguntas)
UPDATE curso_quiz_perguntas SET
  opcoes = jsonb_set(
    jsonb_set(opcoes, '{2,texto}', to_jsonb((opcoes->0->>'texto')::text)),
    '{0,texto}', to_jsonb((opcoes->2->>'texto')::text)
  ),
  resposta_correta = 'C'
WHERE aula_id IN (SELECT id FROM curso_aulas WHERE modulo_id = (SELECT id FROM curso_modulos WHERE ordem = 5))
  AND resposta_correta = 'A'
  AND id IN (
    SELECT id FROM curso_quiz_perguntas 
    WHERE aula_id IN (SELECT id FROM curso_aulas WHERE modulo_id = (SELECT id FROM curso_modulos WHERE ordem = 5))
    AND resposta_correta = 'A'
    ORDER BY id LIMIT 3
  );

-- Swap A <-> D (3 perguntas)
UPDATE curso_quiz_perguntas SET
  opcoes = jsonb_set(
    jsonb_set(opcoes, '{3,texto}', to_jsonb((opcoes->0->>'texto')::text)),
    '{0,texto}', to_jsonb((opcoes->3->>'texto')::text)
  ),
  resposta_correta = 'D'
WHERE aula_id IN (SELECT id FROM curso_aulas WHERE modulo_id = (SELECT id FROM curso_modulos WHERE ordem = 5))
  AND resposta_correta = 'A'
  AND id IN (
    SELECT id FROM curso_quiz_perguntas 
    WHERE aula_id IN (SELECT id FROM curso_aulas WHERE modulo_id = (SELECT id FROM curso_modulos WHERE ordem = 5))
    AND resposta_correta = 'A'
    ORDER BY id LIMIT 3
  );