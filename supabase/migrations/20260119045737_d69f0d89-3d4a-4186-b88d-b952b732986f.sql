
-- ==============================================
-- ADIÇÃO DE 12 QUESTÕES PARA AULAS COM < 3
-- ==============================================

-- Primeiro, buscar os IDs das aulas afetadas e inserir questões

-- 1. CTB: Conceitos e Definições (+2 questões)
INSERT INTO public.curso_quiz_perguntas (aula_id, pergunta, opcoes, resposta_correta, explicacao, ordem)
SELECT 
  ca.id,
  'O que é considerado "via" segundo o CTB?',
  '[{"letra": "A", "texto": "Apenas rodovias federais"}, {"letra": "B", "texto": "Superfície por onde transitam veículos, pessoas e animais"}, {"letra": "C", "texto": "Somente ruas pavimentadas"}, {"letra": "D", "texto": "Estradas com pedágio"}]'::jsonb,
  'B',
  'Segundo o CTB, via é a superfície por onde transitam veículos, pessoas e animais, compreendendo a pista, a calçada, o acostamento, ilha e canteiro central.',
  10
FROM public.curso_aulas ca
JOIN public.curso_modulos cm ON ca.modulo_id = cm.id
WHERE cm.titulo ILIKE '%Legislação%' AND ca.titulo ILIKE '%CTB%Conceitos%'
ON CONFLICT (aula_id, pergunta) DO NOTHING;

INSERT INTO public.curso_quiz_perguntas (aula_id, pergunta, opcoes, resposta_correta, explicacao, ordem)
SELECT 
  ca.id,
  'Qual é a definição de "veículo automotor" no CTB?',
  '[{"letra": "A", "texto": "Qualquer veículo com rodas"}, {"letra": "B", "texto": "Veículo movido apenas por combustível"}, {"letra": "C", "texto": "Veículo de transporte coletivo"}, {"letra": "D", "texto": "Veículo a motor de propulsão que circule por seus próprios meios"}]'::jsonb,
  'D',
  'Veículo automotor é todo veículo a motor de propulsão que circule por seus próprios meios, e que serve normalmente para o transporte viário de pessoas e coisas.',
  11
FROM public.curso_aulas ca
JOIN public.curso_modulos cm ON ca.modulo_id = cm.id
WHERE cm.titulo ILIKE '%Legislação%' AND ca.titulo ILIKE '%CTB%Conceitos%'
ON CONFLICT (aula_id, pergunta) DO NOTHING;

-- 2. Sistema Nacional de Trânsito (+2 questões)
INSERT INTO public.curso_quiz_perguntas (aula_id, pergunta, opcoes, resposta_correta, explicacao, ordem)
SELECT 
  ca.id,
  'Quem é o órgão máximo normativo do Sistema Nacional de Trânsito?',
  '[{"letra": "A", "texto": "CONTRAN - Conselho Nacional de Trânsito"}, {"letra": "B", "texto": "DENATRAN"}, {"letra": "C", "texto": "DETRAN estadual"}, {"letra": "D", "texto": "Polícia Rodoviária Federal"}]'::jsonb,
  'A',
  'O CONTRAN é o órgão máximo normativo e consultivo do SNT, responsável por estabelecer as normas regulamentares do CTB.',
  10
FROM public.curso_aulas ca
JOIN public.curso_modulos cm ON ca.modulo_id = cm.id
WHERE cm.titulo ILIKE '%Legislação%' AND ca.titulo ILIKE '%Sistema Nacional%'
ON CONFLICT (aula_id, pergunta) DO NOTHING;

INSERT INTO public.curso_quiz_perguntas (aula_id, pergunta, opcoes, resposta_correta, explicacao, ordem)
SELECT 
  ca.id,
  'Os DETRANs são órgãos de que nível no Sistema Nacional de Trânsito?',
  '[{"letra": "A", "texto": "Federal"}, {"letra": "B", "texto": "Municipal"}, {"letra": "C", "texto": "Estadual e do Distrito Federal"}, {"letra": "D", "texto": "Internacional"}]'::jsonb,
  'C',
  'Os DETRANs são órgãos executivos de trânsito em nível estadual e do Distrito Federal, responsáveis pelo registro e licenciamento de veículos e habilitação de condutores.',
  11
FROM public.curso_aulas ca
JOIN public.curso_modulos cm ON ca.modulo_id = cm.id
WHERE cm.titulo ILIKE '%Legislação%' AND ca.titulo ILIKE '%Sistema Nacional%'
ON CONFLICT (aula_id, pergunta) DO NOTHING;

-- 3. Normas Gerais de Circulação (+2 questões)
INSERT INTO public.curso_quiz_perguntas (aula_id, pergunta, opcoes, resposta_correta, explicacao, ordem)
SELECT 
  ca.id,
  'Em vias urbanas sem sinalização, qual a velocidade máxima em vias locais?',
  '[{"letra": "A", "texto": "60 km/h"}, {"letra": "B", "texto": "40 km/h"}, {"letra": "C", "texto": "80 km/h"}, {"letra": "D", "texto": "30 km/h"}]'::jsonb,
  'D',
  'Em vias urbanas sem regulamentação, a velocidade máxima é: 80 km/h em vias de trânsito rápido, 60 km/h em vias arteriais, 40 km/h em vias coletoras e 30 km/h em vias locais.',
  10
FROM public.curso_aulas ca
JOIN public.curso_modulos cm ON ca.modulo_id = cm.id
WHERE cm.titulo ILIKE '%Legislação%' AND ca.titulo ILIKE '%Normas Gerais%Circulação%'
ON CONFLICT (aula_id, pergunta) DO NOTHING;

INSERT INTO public.curso_quiz_perguntas (aula_id, pergunta, opcoes, resposta_correta, explicacao, ordem)
SELECT 
  ca.id,
  'Ao mudar de faixa de trânsito, o condutor deve:',
  '[{"letra": "A", "texto": "Acelerar rapidamente"}, {"letra": "B", "texto": "Sinalizar com antecedência e verificar os retrovisores"}, {"letra": "C", "texto": "Buzinar para alertar"}, {"letra": "D", "texto": "Frear bruscamente"}]'::jsonb,
  'B',
  'Toda mudança de direção ou faixa deve ser feita com sinalização prévia (seta) e verificação dos espelhos retrovisores para garantir segurança.',
  11
FROM public.curso_aulas ca
JOIN public.curso_modulos cm ON ca.modulo_id = cm.id
WHERE cm.titulo ILIKE '%Legislação%' AND ca.titulo ILIKE '%Normas Gerais%Circulação%'
ON CONFLICT (aula_id, pergunta) DO NOTHING;

-- 4. Sinalização Horizontal e Vertical (+2 questões)
INSERT INTO public.curso_quiz_perguntas (aula_id, pergunta, opcoes, resposta_correta, explicacao, ordem)
SELECT 
  ca.id,
  'A linha contínua amarela no centro da via indica:',
  '[{"letra": "A", "texto": "Proibição de ultrapassagem"}, {"letra": "B", "texto": "Área de estacionamento"}, {"letra": "C", "texto": "Pista exclusiva para ônibus"}, {"letra": "D", "texto": "Faixa de pedestres"}]'::jsonb,
  'A',
  'A linha contínua amarela indica proibição de ultrapassagem, separando fluxos opostos de tráfego. É proibido cruzá-la.',
  10
FROM public.curso_aulas ca
JOIN public.curso_modulos cm ON ca.modulo_id = cm.id
WHERE cm.titulo ILIKE '%Legislação%' AND ca.titulo ILIKE '%Sinalização Horizontal%'
ON CONFLICT (aula_id, pergunta) DO NOTHING;

INSERT INTO public.curso_quiz_perguntas (aula_id, pergunta, opcoes, resposta_correta, explicacao, ordem)
SELECT 
  ca.id,
  'Placas de fundo azul são geralmente placas de:',
  '[{"letra": "A", "texto": "Regulamentação"}, {"letra": "B", "texto": "Advertência"}, {"letra": "C", "texto": "Indicação de serviços ou informação"}, {"letra": "D", "texto": "Obras"}]'::jsonb,
  'C',
  'Placas de indicação têm fundo azul ou verde e orientam os condutores sobre destinos, serviços auxiliares e distâncias.',
  11
FROM public.curso_aulas ca
JOIN public.curso_modulos cm ON ca.modulo_id = cm.id
WHERE cm.titulo ILIKE '%Legislação%' AND ca.titulo ILIKE '%Sinalização Horizontal%'
ON CONFLICT (aula_id, pergunta) DO NOTHING;

-- 5. Placas de Regulamentação (+1 questão)
INSERT INTO public.curso_quiz_perguntas (aula_id, pergunta, opcoes, resposta_correta, explicacao, ordem)
SELECT 
  ca.id,
  'A placa R-1 (Parada Obrigatória) exige que o condutor:',
  '[{"letra": "A", "texto": "Reduza a velocidade"}, {"letra": "B", "texto": "Buzine antes de passar"}, {"letra": "C", "texto": "Acenda os faróis"}, {"letra": "D", "texto": "Pare completamente o veículo antes de prosseguir"}]'::jsonb,
  'D',
  'A placa R-1 (PARE) exige parada obrigatória total do veículo. O condutor deve parar, verificar se há condições seguras e só então prosseguir.',
  10
FROM public.curso_aulas ca
JOIN public.curso_modulos cm ON ca.modulo_id = cm.id
WHERE cm.titulo ILIKE '%Legislação%' AND ca.titulo ILIKE '%Placas de Regulamentação%'
ON CONFLICT (aula_id, pergunta) DO NOTHING;

-- 6. Condução Econômica - Eco-driving (+1 questão)
INSERT INTO public.curso_quiz_perguntas (aula_id, pergunta, opcoes, resposta_correta, explicacao, ordem)
SELECT 
  ca.id,
  'Para economizar combustível e reduzir emissões, o condutor deve evitar:',
  '[{"letra": "A", "texto": "Manter velocidade constante"}, {"letra": "B", "texto": "Acelerações e frenagens bruscas"}, {"letra": "C", "texto": "Usar marchas adequadas"}, {"letra": "D", "texto": "Verificar a pressão dos pneus"}]'::jsonb,
  'B',
  'Acelerações e frenagens bruscas aumentam significativamente o consumo de combustível. A condução suave e antecipada economiza até 25% de combustível.',
  10
FROM public.curso_aulas ca
JOIN public.curso_modulos cm ON ca.modulo_id = cm.id
WHERE cm.titulo ILIKE '%Direção Defensiva%' AND ca.titulo ILIKE '%Condução Econômica%'
ON CONFLICT (aula_id, pergunta) DO NOTHING;

-- 7. Sistema de Arrefecimento (+1 questão)
INSERT INTO public.curso_quiz_perguntas (aula_id, pergunta, opcoes, resposta_correta, explicacao, ordem)
SELECT 
  ca.id,
  'O termostato do sistema de arrefecimento tem a função de:',
  '[{"letra": "A", "texto": "Resfriar o óleo do motor"}, {"letra": "B", "texto": "Medir a temperatura externa"}, {"letra": "C", "texto": "Regular a temperatura do motor controlando o fluxo de líquido"}, {"letra": "D", "texto": "Lubrificar o radiador"}]'::jsonb,
  'C',
  'O termostato regula a temperatura do motor, permanecendo fechado quando o motor está frio e abrindo quando atinge a temperatura ideal para permitir a circulação do líquido de arrefecimento.',
  10
FROM public.curso_aulas ca
JOIN public.curso_modulos cm ON ca.modulo_id = cm.id
WHERE cm.titulo ILIKE '%Mecânica%' AND ca.titulo ILIKE '%Arrefecimento%'
ON CONFLICT (aula_id, pergunta) DO NOTHING;

-- 8. Kit de Primeiros Socorros (+1 questão)
INSERT INTO public.curso_quiz_perguntas (aula_id, pergunta, opcoes, resposta_correta, explicacao, ordem)
SELECT 
  ca.id,
  'O triângulo de segurança deve ser posicionado a pelo menos quantos metros do veículo?',
  '[{"letra": "A", "texto": "30 metros"}, {"letra": "B", "texto": "10 metros"}, {"letra": "C", "texto": "5 metros"}, {"letra": "D", "texto": "50 metros"}]'::jsonb,
  'A',
  'O triângulo de segurança deve ser colocado a pelo menos 30 metros do veículo, podendo ser maior em rodovias de alta velocidade, para alertar outros condutores com antecedência.',
  10
FROM public.curso_aulas ca
JOIN public.curso_modulos cm ON ca.modulo_id = cm.id
WHERE cm.titulo ILIKE '%Primeiros Socorros%' AND ca.titulo ILIKE '%Kit%'
ON CONFLICT (aula_id, pergunta) DO NOTHING;
