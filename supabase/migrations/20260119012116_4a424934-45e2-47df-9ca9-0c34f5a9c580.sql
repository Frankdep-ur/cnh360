-- Remover perguntas duplicadas (manter rn=1, deletar rn=2)
DELETE FROM curso_quiz_perguntas
WHERE id IN (
  '1db14b7f-3abb-42ac-bff3-dec336b8fd72',  -- O sistema de arrefecimento (duplicata)
  'd523827e-23dd-4641-8fbc-cbb4303f1035',  -- O triângulo de segurança (duplicata)
  '5057473c-5113-4db7-9c69-4bda767ca58e',  -- Pneus descalibrados (duplicata)
  '8fa00be9-c883-4611-a687-7888aee7e36c'   -- Cor das placas de regulamentação (duplicata)
);

-- Adicionar constraint para prevenir futuras duplicatas
ALTER TABLE curso_quiz_perguntas 
ADD CONSTRAINT unique_pergunta_por_aula UNIQUE (aula_id, pergunta);