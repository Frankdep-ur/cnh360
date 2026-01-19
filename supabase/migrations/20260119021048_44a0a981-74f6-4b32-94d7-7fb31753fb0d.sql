-- FASE 1: Correções de conteúdo em "Pneus e Calibragem"

-- 1. Calibragem deve ser verificada SEMANALMENTE (não anualmente)
UPDATE curso_quiz_perguntas 
SET resposta_correta = 'B'
WHERE id = '7bbf9fc2-7ab5-47a0-9d32-2039133c5d6c';

-- 2. Pneus descalibrados causam DESGASTE IRREGULAR (não melhor aderência)
UPDATE curso_quiz_perguntas 
SET resposta_correta = 'B'
WHERE id = '530548e0-4727-433d-86f6-7983de215e64';

-- FASE 2: Rebalanceamento de aulas com padrões previsíveis (DDD → DCA e BBB → BCA)

-- Distância de Segurança: DDD → DCA
-- Pergunta "A regra dos 2 segundos" → mudar para C
UPDATE curso_quiz_perguntas 
SET opcoes = '[
  {"letra": "A", "texto": "Calcular velocidade"},
  {"letra": "B", "texto": "Medir distância de frenagem"},
  {"letra": "C", "texto": "Calcular distância segura do veículo da frente"},
  {"letra": "D", "texto": "Determinar tempo de reação"}
]'::jsonb,
resposta_correta = 'C'
WHERE id = '349d3e97-d9af-48b4-8084-64a029be3945';

-- Pergunta "Em condições adversas" → mudar para A
UPDATE curso_quiz_perguntas 
SET opcoes = '[
  {"letra": "A", "texto": "Aumentar"},
  {"letra": "B", "texto": "Diminuir"},
  {"letra": "C", "texto": "Permanecer igual"},
  {"letra": "D", "texto": "Não importa"}
]'::jsonb,
resposta_correta = 'A'
WHERE id = '98813cc5-81dd-41ff-abd0-f88dbe123047';

-- Placas de Advertência: BBB → BCA
-- Pergunta "cor de fundo" → mudar para A (amarela é A)
UPDATE curso_quiz_perguntas 
SET opcoes = '[
  {"letra": "A", "texto": "Amarela"},
  {"letra": "B", "texto": "Vermelha"},
  {"letra": "C", "texto": "Azul"},
  {"letra": "D", "texto": "Verde"}
]'::jsonb,
resposta_correta = 'A'
WHERE id = 'd4435421-de08-4b0f-8423-65a3c244853c';

-- Pergunta "forma geométrica" → mudar para C (losango é quadrado apoiado no vértice)
UPDATE curso_quiz_perguntas 
SET opcoes = '[
  {"letra": "A", "texto": "Circular"},
  {"letra": "B", "texto": "Retangular"},
  {"letra": "C", "texto": "Losango (quadrado apoiado no vértice)"},
  {"letra": "D", "texto": "Triangular"}
]'::jsonb,
resposta_correta = 'C'
WHERE id = 'ca0f521e-bb37-4397-a0b3-c20607c021e5';

-- Recursos contra Multas: DDD → DCA
-- Pergunta "prazo defesa prévia" → mudar para A
UPDATE curso_quiz_perguntas 
SET opcoes = '[
  {"letra": "A", "texto": "15 dias após notificação da autuação"},
  {"letra": "B", "texto": "5 dias"},
  {"letra": "C", "texto": "30 dias"},
  {"letra": "D", "texto": "45 dias"}
]'::jsonb,
resposta_correta = 'A'
WHERE id = '54b8e0ee-76ce-4eab-9c0c-42d9146bcf45';

-- Pergunta "JARI é responsável por" → mudar para C
UPDATE curso_quiz_perguntas 
SET opcoes = '[
  {"letra": "A", "texto": "Aplicar multas"},
  {"letra": "B", "texto": "Fiscalizar rodovias"},
  {"letra": "C", "texto": "Julgar recursos de primeira instância contra multas"},
  {"letra": "D", "texto": "Emitir CNH"}
]'::jsonb,
resposta_correta = 'C'
WHERE id = '434728a0-0b5f-4424-a3a8-0fe6b346ef1f';