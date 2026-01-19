-- CORREÇÃO DE ERROS NAS PERGUNTAS DO QUIZ

-- 1. ERRO GRAVE: Suspensão serve para "Absorver impactos", não "Aumentar velocidade"
UPDATE curso_quiz_perguntas SET
  resposta_correta = 'B'
WHERE id = '2fd6cec1-9fd1-4cc2-a2db-bddd84fa7e6b';

-- 2. ERRO: Hemorragia arterial é "Vermelho vivo e em jatos", não "Espesso e preto"
UPDATE curso_quiz_perguntas SET
  resposta_correta = 'B'
WHERE id = '84d2415f-ecb3-4413-aba1-4290419246a5';

-- 3. ERRO GRAVE: Deixar de prestar socorro é CRIME (CTB Art. 304), não "Permitido"
UPDATE curso_quiz_perguntas SET
  resposta_correta = 'B'
WHERE id = 'c8eaf3a9-0376-4451-a16a-057239d890aa';

-- 4. ERRO: Primeira coisa a verificar é "Se está respirando e consciente", não "Se está sangrando"
UPDATE curso_quiz_perguntas SET
  resposta_correta = 'B'
WHERE id = 'b1f49d10-4acf-4be2-8e24-773ceb1d9481';

-- 5. ERRO: Vítima só deve ser removida "Houver risco iminente", não "Sempre imediatamente"
UPDATE curso_quiz_perguntas SET
  resposta_correta = 'B'
WHERE id = 'adb47e18-0f97-4817-b7d4-d9a4eaa3bf12';

-- 6. ERRO: Ao esperar socorro deve-se "Manter a calma", não "Sair do local"
UPDATE curso_quiz_perguntas SET
  resposta_correta = 'B'
WHERE id = '26f3fbcd-590a-41fd-bc3a-33866cab6cd3';

-- 7. ERRO: Ao avaliar vítima deve-se evitar "Movê-la desnecessariamente", não "Verificar respiração"
UPDATE curso_quiz_perguntas SET
  resposta_correta = 'B'
WHERE id = '778acfd0-9e85-451f-baa2-5925bd4e7a8d';

-- 8. ERRO: Limite de álcool é ZERO para condutores (Lei Seca), opção A diz 0,2 mg/L - corrigir texto
UPDATE curso_quiz_perguntas SET
  opcoes = jsonb_set(opcoes, '{1,texto}', '"Zero (tolerância zero)"'),
  resposta_correta = 'B'
WHERE id = 'b4df86b7-e8f5-4eb3-91b8-60ad3d24b297';

-- 9. ERRO: Placas de advertência são QUADRADAS em diagonal (losango), não retangulares
UPDATE curso_quiz_perguntas SET
  resposta_correta = 'B'
WHERE id = 'ca0f521e-bb37-4397-a0b3-c20607c021e5';

-- 10. ERRO: Placas de advertência são AMARELAS, não brancas
UPDATE curso_quiz_perguntas SET
  resposta_correta = 'B'
WHERE id = 'd4435421-de08-4b0f-8423-65a3c244853c';

-- 11. ERRO: Na ausência do triângulo usa-se "Galhos, pedras", não "Acender faróis altos"
UPDATE curso_quiz_perguntas SET
  resposta_correta = 'B'
WHERE id = 'b7441bd2-9097-4dba-b94d-f2746327536d';

-- 12. ERRO: Pergunta mal formulada "Sinais de fratura incluem:" com opções de ações
-- Corrigir pergunta para fazer sentido
UPDATE curso_quiz_perguntas SET
  pergunta = 'Em caso de suspeita de fratura, o socorrista deve:'
WHERE id = '8d97ebfc-3c5b-4172-8dd3-da13902253a4';