-- FASE 1: Correções de Conteúdo (8 erros críticos)

-- 1. Módulo 1 - "Estacionamento e Parada" - Distância de esquinas: C→B
UPDATE curso_quiz_perguntas 
SET resposta_correta = 'B'
WHERE aula_id IN (SELECT id FROM curso_aulas WHERE titulo = 'Estacionamento e Parada')
AND pergunta LIKE '%esquina%' AND resposta_correta = 'C';

-- 2. Módulo 7 - "Poluição Veicular e Meio Ambiente" - Contribuição para poluição: A→B
UPDATE curso_quiz_perguntas 
SET resposta_correta = 'B'
WHERE aula_id IN (SELECT id FROM curso_aulas WHERE titulo = 'Poluição Veicular e Meio Ambiente')
AND pergunta LIKE '%contribui para a poluição%' AND resposta_correta = 'A';

-- 3. Módulo 7 - "Ruídos e Poluição Sonora" - Escapamento: D→B
UPDATE curso_quiz_perguntas 
SET resposta_correta = 'B'
WHERE aula_id IN (SELECT id FROM curso_aulas WHERE titulo = 'Ruídos e Poluição Sonora')
AND pergunta LIKE '%escapamento adulterado%' AND resposta_correta = 'D';

-- 4. Módulo 7 - "Relações Interpessoais no Trânsito" - Conflito: A→B
UPDATE curso_quiz_perguntas 
SET resposta_correta = 'B'
WHERE aula_id IN (SELECT id FROM curso_aulas WHERE titulo = 'Relações Interpessoais no Trânsito')
AND pergunta LIKE '%situação de conflito%' AND resposta_correta = 'A';

-- 5. Módulo 7 - "Relações Interpessoais no Trânsito" - Road rage: D→B
UPDATE curso_quiz_perguntas 
SET resposta_correta = 'B'
WHERE aula_id IN (SELECT id FROM curso_aulas WHERE titulo = 'Relações Interpessoais no Trânsito')
AND pergunta LIKE '%road rage%' AND resposta_correta = 'D';

-- 6. Módulo 7 - "Inclusão de PcD no Trânsito" - Vagas reservadas: A→B
UPDATE curso_quiz_perguntas 
SET resposta_correta = 'B'
WHERE aula_id IN (SELECT id FROM curso_aulas WHERE titulo = 'Inclusão de PcD no Trânsito')
AND pergunta LIKE '%vagas reservadas%' AND resposta_correta = 'A';

-- 7. Módulo 7 - "Inclusão de PcD no Trânsito" - Pessoa atravessando: D→B
UPDATE curso_quiz_perguntas 
SET resposta_correta = 'B'
WHERE aula_id IN (SELECT id FROM curso_aulas WHERE titulo = 'Inclusão de PcD no Trânsito')
AND pergunta LIKE '%pessoa com deficiência atravessando%' AND resposta_correta = 'D';

-- 8. Reformular pergunta problemática sobre poluição sonora (opções malformadas)
UPDATE curso_quiz_perguntas 
SET 
  pergunta = 'Qual é o principal efeito da poluição sonora causada pelo trânsito na saúde humana?',
  opcoes = '["A) Melhora da concentração", "B) Estresse e problemas auditivos", "C) Aumento da produtividade", "D) Fortalecimento do sistema imunológico"]'::jsonb,
  resposta_correta = 'B',
  explicacao = 'A poluição sonora do trânsito causa estresse, distúrbios do sono e problemas auditivos, sendo um sério problema de saúde pública.'
WHERE aula_id IN (SELECT id FROM curso_aulas WHERE titulo = 'Ruídos e Poluição Sonora')
AND pergunta LIKE '%buzina excessiva%';

-- FASE 2: Rebalanceamento de Padrões BBB

-- "DPVAT e Seguros Obrigatórios" - Quebrar padrão BBB
UPDATE curso_quiz_perguntas 
SET 
  opcoes = '["A) Manter distância de segurança", "B) Ultrapassar pela direita", "C) Buzinar insistentemente", "D) Ignorar sinalização"]'::jsonb,
  resposta_correta = 'A'
WHERE aula_id IN (SELECT id FROM curso_aulas WHERE titulo = 'DPVAT e Seguros Obrigatórios')
AND ordem = 2;

UPDATE curso_quiz_perguntas 
SET 
  opcoes = '["A) Ignorar o acidente", "B) Fugir do local", "C) Acionar socorro e proteger vítimas", "D) Filmar para redes sociais"]'::jsonb,
  resposta_correta = 'C'
WHERE aula_id IN (SELECT id FROM curso_aulas WHERE titulo = 'DPVAT e Seguros Obrigatórios')
AND ordem = 3;

-- "Registro e Licenciamento" - Quebrar padrão BBB
UPDATE curso_quiz_perguntas 
SET 
  opcoes = '["A) Ignorar a exigência", "B) Circular sem documento", "C) Portar o CRLV atualizado", "D) Usar documento vencido"]'::jsonb,
  resposta_correta = 'C'
WHERE aula_id IN (SELECT id FROM curso_aulas WHERE titulo = 'Registro e Licenciamento de Veículos')
AND ordem = 2;

UPDATE curso_quiz_perguntas 
SET 
  opcoes = '["A) Realizar a transferência em 30 dias", "B) Manter em nome do antigo dono", "C) Circular sem registro", "D) Ignorar a legislação"]'::jsonb,
  resposta_correta = 'A'
WHERE aula_id IN (SELECT id FROM curso_aulas WHERE titulo = 'Registro e Licenciamento de Veículos')
AND ordem = 3;

-- FASE 3: Rebalancear Módulo 5 - Converter 4 questões específicas para B

-- Questão 1: Direção em Montanhas (D→B)
UPDATE curso_quiz_perguntas 
SET 
  opcoes = '["A) Acelerar nas curvas", "B) Reduzir velocidade e usar marcha adequada", "C) Manter velocidade constante", "D) Buzinar continuamente"]'::jsonb,
  resposta_correta = 'B'
WHERE id = 'b98661a2-ced4-4e83-8a2a-4d3c0d9559bc';

-- Questão 2: Travessia de Alagamentos (D→B)
UPDATE curso_quiz_perguntas 
SET 
  opcoes = '["A) Acelerar imediatamente", "B) Testar os freios com leves toques", "C) Ignorar e continuar normalmente", "D) Desligar o motor"]'::jsonb,
  resposta_correta = 'B'
WHERE id = 'd4abec1c-e43e-4b28-9803-6dea4b72e0a9';

-- Questão 3: Neblina (C→B)
UPDATE curso_quiz_perguntas 
SET 
  opcoes = '["A) Farol alto", "B) Farol baixo ou de neblina", "C) Pisca-alerta", "D) Nenhuma iluminação"]'::jsonb,
  resposta_correta = 'B'
WHERE id = '65579e0d-8233-4df9-a982-5352ae4217e8';

-- Questão 4: Condução com Carga (D→B)
UPDATE curso_quiz_perguntas 
SET 
  opcoes = '["A) Ignorar o peso extra", "B) Verificar distribuição e fixação da carga", "C) Acelerar para compensar", "D) Reduzir calibragem dos pneus"]'::jsonb,
  resposta_correta = 'B'
WHERE id = 'b51cf91d-5250-4082-b890-443e1c653038';