-- FASE 3: Rebalanceamento - Converter 12 respostas B para A, C ou D
-- Meta: B de 30.42% para ~25%

-- 1. Sinalização em Rodovias: acostamento serve para paradas de emergência → D
UPDATE curso_quiz_perguntas 
SET opcoes = '[
  {"letra": "A", "texto": "Ultrapassar"},
  {"letra": "B", "texto": "Estacionar"},
  {"letra": "C", "texto": "Trafegar normalmente"},
  {"letra": "D", "texto": "Paradas de emergência"}
]'::jsonb,
resposta_correta = 'D'
WHERE id = 'edc3187e-9e4c-4217-a8c2-15fc67e05bcc';

-- 2. Campanhas: Se beber não dirija → A
UPDATE curso_quiz_perguntas 
SET opcoes = '[
  {"letra": "A", "texto": "Conscientizar sobre os perigos de dirigir embriagado"},
  {"letra": "B", "texto": "Proibir bebidas"},
  {"letra": "C", "texto": "Vender mais bebidas"},
  {"letra": "D", "texto": "Promover festas"}
]'::jsonb,
resposta_correta = 'A'
WHERE id = 'efa45ddb-e412-4672-bd38-6fff9485b738';

-- 3. Infrações: limite de pontos → C
UPDATE curso_quiz_perguntas 
SET opcoes = '[
  {"letra": "A", "texto": "10 pontos"},
  {"letra": "B", "texto": "15 pontos"},
  {"letra": "C", "texto": "20 pontos ou 40 pontos conforme o caso"},
  {"letra": "D", "texto": "30 pontos"}
]'::jsonb,
resposta_correta = 'C'
WHERE id = '20926e31-576a-41af-95e0-c590f74f21ce';

-- 4. Travessia de alagamentos: testar freios → D
UPDATE curso_quiz_perguntas 
SET opcoes = '[
  {"letra": "A", "texto": "Acelerar imediatamente"},
  {"letra": "B", "texto": "Desligar o veículo"},
  {"letra": "C", "texto": "Nada especial"},
  {"letra": "D", "texto": "Testar os freios em local seguro"}
]'::jsonb,
resposta_correta = 'D'
WHERE id = 'd4abec1c-e43e-4b28-9803-6dea4b72e0a9';

-- 5. Combustíveis: etanol é renovável → A
UPDATE curso_quiz_perguntas 
SET opcoes = '[
  {"letra": "A", "texto": "Renovável"},
  {"letra": "B", "texto": "Fóssil"},
  {"letra": "C", "texto": "Nuclear"},
  {"letra": "D", "texto": "Sintético"}
]'::jsonb,
resposta_correta = 'A'
WHERE id = 'e720f910-7ea9-4ab9-9585-3ecbdb487fc7';

-- 6. Condições adversas da via: buracos, pavimento → C
UPDATE curso_quiz_perguntas 
SET opcoes = '[
  {"letra": "A", "texto": "Condutor com sono"},
  {"letra": "B", "texto": "Veículo com freios ruins"},
  {"letra": "C", "texto": "Buracos, pavimento escorregadio, curvas acentuadas"},
  {"letra": "D", "texto": "Chuva forte"}
]'::jsonb,
resposta_correta = 'C'
WHERE id = 'e74134fd-d8c4-4c3a-b999-7c6d90d4a26c';

-- 7. Poluição veicular: inspeção visa → D
UPDATE curso_quiz_perguntas 
SET opcoes = '[
  {"letra": "A", "texto": "Apenas arrecadar taxas"},
  {"letra": "B", "texto": "Apenas verificar documentação"},
  {"letra": "C", "texto": "Multar proprietários"},
  {"letra": "D", "texto": "Verificar emissões e segurança do veículo"}
]'::jsonb,
resposta_correta = 'D'
WHERE id = '3db5869a-b22d-4e42-a981-9ac6b01c6258';

-- 8. Direção noturna: alternar para farol baixo → A
UPDATE curso_quiz_perguntas 
SET opcoes = '[
  {"letra": "A", "texto": "Alternar para farol baixo"},
  {"letra": "B", "texto": "Manter o farol alto"},
  {"letra": "C", "texto": "Desligar os faróis"},
  {"letra": "D", "texto": "Piscar repetidamente"}
]'::jsonb,
resposta_correta = 'A'
WHERE id = '50c4006b-677a-4221-82da-663743716bac';

-- 9. Condições adversas do veículo → D
UPDATE curso_quiz_perguntas 
SET opcoes = '[
  {"letra": "A", "texto": "Chuva e neblina"},
  {"letra": "B", "texto": "Condutor cansado"},
  {"letra": "C", "texto": "Estrada esburacada"},
  {"letra": "D", "texto": "Pneus gastos, freios deficientes, luzes queimadas"}
]'::jsonb,
resposta_correta = 'D'
WHERE id = '642517a1-fe83-47e9-b962-7cb30be4bbf1';

-- 10. Afogamento/Asfixia: bebês engasgados → A
UPDATE curso_quiz_perguntas 
SET opcoes = '[
  {"letra": "A", "texto": "5 tapas nas costas + 5 compressões torácicas"},
  {"letra": "B", "texto": "Manobra de Heimlich normal"},
  {"letra": "C", "texto": "Dar água"},
  {"letra": "D", "texto": "Sacudir o bebê"}
]'::jsonb,
resposta_correta = 'A'
WHERE id = 'fa2dcf55-5683-4a90-8cab-d66dc63a783b';

-- 11. Aquaplanagem: pneus perdem contato → C
UPDATE curso_quiz_perguntas 
SET opcoes = '[
  {"letra": "A", "texto": "Os freios falham"},
  {"letra": "B", "texto": "O motor superaquece"},
  {"letra": "C", "texto": "Os pneus perdem contato com o asfalto por causa da água"},
  {"letra": "D", "texto": "A bateria descarrega"}
]'::jsonb,
resposta_correta = 'C'
WHERE id = '99dabc24-81ed-4515-bdf4-d1b1b0c69cb3';

-- 12. Semáforos e Gestos: obedecer ao agente → A
UPDATE curso_quiz_perguntas 
SET opcoes = '[
  {"letra": "A", "texto": "Obedecer ao agente"},
  {"letra": "B", "texto": "Obedecer ao semáforo"},
  {"letra": "C", "texto": "Parar e esperar"},
  {"letra": "D", "texto": "Buzinar para o agente"}
]'::jsonb,
resposta_correta = 'A'
WHERE id = 'aa405c8d-88ec-49df-a66c-61cbd6747cd5';