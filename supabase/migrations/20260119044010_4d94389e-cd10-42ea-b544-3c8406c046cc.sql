-- ==============================================
-- CORREÇÃO COMPLETA: 11 ERROS IDENTIFICADOS
-- ==============================================

-- FASE 1: Correção de 7 Respostas Erradas
-- ----------------------------------------

-- 1. Módulo 4: "A direção hidráulica facilita" - A→B
UPDATE public.curso_quiz_perguntas
SET resposta_correta = 'B'
WHERE id = '95c62f4e-a7f9-4c9f-85e4-1f96c6ba58d6';

-- 2. Módulo 7: "Veículos contribuem para poluição" - A→B
UPDATE public.curso_quiz_perguntas
SET resposta_correta = 'B'
WHERE id = 'dab78c70-2d1f-4d3f-bfcd-521ae541dadb';

-- 3. Módulo 7: "Poluição sonora pode provocar" - Reformular completamente
UPDATE public.curso_quiz_perguntas
SET 
  pergunta = 'Quais são os principais efeitos da poluição sonora causada pelo trânsito na saúde humana?',
  opcoes = '[{"letra": "A", "texto": "Estresse, irritabilidade e perda auditiva progressiva"}, {"letra": "B", "texto": "Economia de combustível e maior velocidade"}, {"letra": "C", "texto": "Melhora na concentração dos motoristas"}, {"letra": "D", "texto": "Nenhum efeito significativo na saúde"}]'::jsonb,
  resposta_correta = 'A',
  explicacao = 'A poluição sonora do trânsito causa sérios danos à saúde, incluindo estresse crônico, irritabilidade, distúrbios do sono e perda auditiva progressiva. Estudos mostram que exposição prolongada a ruídos acima de 85 decibéis pode causar danos irreversíveis à audição.'
WHERE id = 'a5805603-df57-450a-8e40-fc568c78fbd2';

-- 4. Módulo 7: "O escapamento deve" - D→B
UPDATE public.curso_quiz_perguntas
SET resposta_correta = 'B'
WHERE id = '9459745e-3945-40aa-af05-b7ad82cf01b2';

-- 5. Módulo 7: "Em caso de conflito" - A→B
UPDATE public.curso_quiz_perguntas
SET resposta_correta = 'B'
WHERE id = '28528843-4c99-4417-ba8b-19731488b5b8';

-- 6. Módulo 7: "Vagas reservadas para PcD" - A→B
UPDATE public.curso_quiz_perguntas
SET resposta_correta = 'B'
WHERE id = '8b098d06-1392-4b82-be0c-2a9075f450f4';

-- 7. Módulo 7: "Pessoa com deficiência atravessando" - D→B
UPDATE public.curso_quiz_perguntas
SET resposta_correta = 'B'
WHERE id = 'c4a584be-6fbd-4299-a030-74901772de18';

-- FASE 2: Correção de Formatação de Opções (4 questões)
-- -----------------------------------------------------

-- 8. Curvas de montanha - normalizar formato
UPDATE public.curso_quiz_perguntas
SET opcoes = '[{"letra": "A", "texto": "Acelerar para ganhar impulso na subida"}, {"letra": "B", "texto": "Reduzir a marcha e usar freio motor nas descidas"}, {"letra": "C", "texto": "Manter velocidade constante em qualquer situação"}, {"letra": "D", "texto": "Buzinar continuamente nas curvas"}]'::jsonb
WHERE id = 'b98661a2-ced4-4e83-8a2a-4d3c0d9559bc';

-- 9. Após atravessar água - normalizar formato
UPDATE public.curso_quiz_perguntas
SET opcoes = '[{"letra": "A", "texto": "Acelerar imediatamente para secar os freios"}, {"letra": "B", "texto": "Testar os freios suavemente em local seguro"}, {"letra": "C", "texto": "Continuar normalmente sem verificação"}, {"letra": "D", "texto": "Desligar o veículo por 10 minutos"}]'::jsonb
WHERE id = 'd4abec1c-e43e-4b28-9803-6dea4b72e0a9';

-- 10. Neblina - normalizar formato
UPDATE public.curso_quiz_perguntas
SET opcoes = '[{"letra": "A", "texto": "Usar farol alto para melhor visibilidade"}, {"letra": "B", "texto": "Reduzir velocidade e usar farol baixo ou de neblina"}, {"letra": "C", "texto": "Manter velocidade normal com pisca-alerta"}, {"letra": "D", "texto": "Parar no acostamento sem sinalização"}]'::jsonb
WHERE id = '65579e0d-8233-4df9-a982-5352ae4217e8';

-- 11. Verificar e corrigir questão de reboque se existir com formato incorreto
UPDATE public.curso_quiz_perguntas
SET opcoes = '[{"letra": "A", "texto": "Acelerar rapidamente para manter tensão"}, {"letra": "B", "texto": "Manter distância segura e velocidade moderada"}, {"letra": "C", "texto": "Frear bruscamente quando necessário"}, {"letra": "D", "texto": "Ignorar o peso adicional do reboque"}]'::jsonb
WHERE id = 'b51cf91d-5250-4082-b890-443e1c653038';