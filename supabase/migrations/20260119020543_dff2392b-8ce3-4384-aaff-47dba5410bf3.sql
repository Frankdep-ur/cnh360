
-- CORREÇÃO: Pergunta sobre SAMU tinha opções incompatíveis com a pergunta
-- A pergunta pede "o que informar" mas as opções são números de telefone

UPDATE curso_quiz_perguntas 
SET 
  opcoes = '[
    {"letra": "A", "texto": "Localização exata, número de vítimas e estado delas"},
    {"letra": "B", "texto": "Apenas o endereço"},
    {"letra": "C", "texto": "Nome do culpado"},
    {"letra": "D", "texto": "Placa do veículo apenas"}
  ]'::jsonb,
  explicacao = 'Ao ligar para o SAMU (192), informe: localização exata, número de vítimas, condição aparente delas e se há riscos no local (incêndio, vazamento, etc.).'
WHERE id = '0c69a93b-29ef-4e53-a639-06f33bae3dd4';
