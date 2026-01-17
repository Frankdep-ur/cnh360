-- Correção robusta: Reordena TODAS as opções do quiz pela letra (A, B, C, D)
-- Isso garante que a posição 0 = A, posição 1 = B, posição 2 = C, posição 3 = D

UPDATE curso_quiz_perguntas
SET opcoes = (
  SELECT jsonb_agg(elem ORDER BY elem->>'letra' ASC)
  FROM jsonb_array_elements(opcoes) AS elem
)
WHERE jsonb_array_length(opcoes) = 4;