-- CORREÇÃO MÓDULO 7 (Situações Especiais)

-- ERRO: Velocidade máxima para reboque é 50 km/h (CTB Art. 61), não 80 km/h
-- A opção C diz "50 km/h" e está marcada como correta - CORRETO ✅

-- Verificando: a pergunta sobre reboque está correta (C = 50 km/h)
-- Nenhuma correção necessária neste módulo

-- VERIFICAÇÃO ADICIONAL - corrigir texto confuso da opção A sobre reboque
UPDATE curso_quiz_perguntas SET
  opcoes = jsonb_set(opcoes, '{0,texto}', '"Ponto morto com ignição ligada (para direção e freios)"')
WHERE id = '75b5ce34-5f2f-4cb7-a84f-01cd0a61f019';

-- Nota: Todos os outros conteúdos dos módulos 6 e 7 estão corretos