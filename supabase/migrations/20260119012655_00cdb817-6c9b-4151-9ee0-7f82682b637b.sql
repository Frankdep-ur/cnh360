-- CORREÇÕES ADICIONAIS - Módulos 2, 4 e 5

-- ============================================
-- MÓDULO 4 (Meio Ambiente)
-- ============================================

-- ERRO: Inspeção veicular visa "Verificar emissões e segurança", não "Multar proprietários"
UPDATE curso_quiz_perguntas SET
  resposta_correta = 'B'
WHERE id = '3db5869a-b22d-4e42-a981-9ac6b01c6258';

-- ERRO: Ser cidadão no trânsito = "Respeitar direitos e deveres", não "Impor-se sobre os outros"
UPDATE curso_quiz_perguntas SET
  resposta_correta = 'B'
WHERE id = '3e876c26-1697-4461-a8b0-5a554d7d17e9';

-- ERRO: Baterias contêm "Substâncias tóxicas como chumbo e ácido", não "Nada perigoso"
UPDATE curso_quiz_perguntas SET
  resposta_correta = 'B'
WHERE id = '3eaea4df-4ba0-4af0-9aa7-35a7372bb99a';

-- ============================================
-- MÓDULO 5 (Mecânica Básica)
-- ============================================

-- ERRO: Manutenção preventiva deve ser feita "Periodicamente, conforme o manual", não "Apenas quando quebrar"
UPDATE curso_quiz_perguntas SET
  resposta_correta = 'A'
WHERE id = '0130acf8-7b93-4306-9eac-0eb4ec7acd6e';

-- ERRO: Luz de temperatura indica "Superaquecimento do motor", não "Que está frio"
UPDATE curso_quiz_perguntas SET
  resposta_correta = 'A'
WHERE id = '28dffb5e-bf91-4018-bbba-26e1c89db925';

-- ERRO: Motor combustão transforma "Energia química em mecânica", não "Energia elétrica em movimento"
UPDATE curso_quiz_perguntas SET
  resposta_correta = 'B'
WHERE id = '4c25de79-3571-4dfc-90a4-82fa55ffb106';

-- ============================================
-- MÓDULO 2 (Direção Defensiva)
-- ============================================

-- ERRO: Aquaplanagem = "Pneus perdem contato com solo devido à água", não "Motor superaquece"
UPDATE curso_quiz_perguntas SET
  resposta_correta = 'B'
WHERE id = '054320a3-e34c-4bb0-aa6b-9dc64347e5e9';

-- ERRO: Direção responsável = "Respeitar leis e outros usuários", não "Dirigir rápido"
UPDATE curso_quiz_perguntas SET
  resposta_correta = 'B'
WHERE id = '2ff2a8fc-76d0-4e78-95fa-1fe806b81ecf';