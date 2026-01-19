
-- Reordenação dos módulos para fluxo pedagógico ideal
-- Nova ordem: Legislação → Sinalização → Defensiva → Mecânica → Situações Especiais → Primeiros Socorros → Meio Ambiente

-- 1. Legislação de Trânsito (mantém ordem 1)
UPDATE curso_modulos SET ordem = 1 WHERE titulo = 'Legislação de Trânsito';

-- 2. Sinalização Avançada (era 6, agora 2)
UPDATE curso_modulos SET ordem = 2 WHERE titulo = 'Sinalização Avançada';

-- 3. Direção Defensiva (era 2, agora 3)
UPDATE curso_modulos SET ordem = 3 WHERE titulo = 'Direção Defensiva';

-- 4. Mecânica Básica (era 5, agora 4)
UPDATE curso_modulos SET ordem = 4 WHERE titulo = 'Mecânica Básica';

-- 5. Situações Especiais de Direção (era 7, agora 5)
UPDATE curso_modulos SET ordem = 5 WHERE titulo = 'Situações Especiais de Direção';

-- 6. Primeiros Socorros (era 3, agora 6)
UPDATE curso_modulos SET ordem = 6 WHERE titulo = 'Primeiros Socorros';

-- 7. Meio Ambiente e Cidadania (era 4, agora 7)
UPDATE curso_modulos SET ordem = 7 WHERE titulo = 'Meio Ambiente e Cidadania';
