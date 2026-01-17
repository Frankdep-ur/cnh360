-- Corrigir ordem das opções para A, B, C, D e redistribuir respostas corretas
-- Módulo: Mecânica Básica (vou variar as respostas entre A, B, C, D)

-- Questão 1: Motor - resposta correta vai para A
UPDATE public.curso_quiz_perguntas 
SET opcoes = '[{"letra": "A", "texto": "Transformar energia química do combustível em energia mecânica"}, {"letra": "B", "texto": "Transformar energia elétrica em movimento"}, {"letra": "C", "texto": "Transformar água em combustível"}, {"letra": "D", "texto": "Transformar ar em eletricidade"}]'::jsonb,
    resposta_correta = 'A'
WHERE pergunta LIKE '%função principal do motor%';

-- Questão 2: Arrefecimento - resposta correta vai para C
UPDATE public.curso_quiz_perguntas 
SET opcoes = '[{"letra": "A", "texto": "Aquecer o motor rapidamente"}, {"letra": "B", "texto": "Aumentar a velocidade do veículo"}, {"letra": "C", "texto": "Manter a temperatura ideal do motor"}, {"letra": "D", "texto": "Reduzir o consumo de combustível"}]'::jsonb,
    resposta_correta = 'C'
WHERE pergunta LIKE '%sistema de arrefecimento%';

-- Questão 3: Óleo - resposta correta vai para D
UPDATE public.curso_quiz_perguntas 
SET opcoes = '[{"letra": "A", "texto": "A cada 100 km"}, {"letra": "B", "texto": "A cada 1.000 km"}, {"letra": "C", "texto": "A cada 20.000 km"}, {"letra": "D", "texto": "Conforme manual do veículo (geralmente 5.000 a 10.000 km)"}]'::jsonb,
    resposta_correta = 'D'
WHERE pergunta LIKE '%troca de óleo%';

-- Questão 4: Pneu careca - resposta correta vai para A
UPDATE public.curso_quiz_perguntas 
SET opcoes = '[{"letra": "A", "texto": "Perda de aderência e risco de aquaplanagem"}, {"letra": "B", "texto": "Maior economia de combustível"}, {"letra": "C", "texto": "Melhor desempenho em curvas"}, {"letra": "D", "texto": "Aumento da vida útil do pneu"}]'::jsonb,
    resposta_correta = 'A'
WHERE pergunta LIKE '%pneu careca%';

-- Questão 5: Luz bateria - resposta correta vai para B
UPDATE public.curso_quiz_perguntas 
SET opcoes = '[{"letra": "A", "texto": "Baixo nível de combustível"}, {"letra": "B", "texto": "Problema no sistema de carga da bateria"}, {"letra": "C", "texto": "Pneu furado"}, {"letra": "D", "texto": "Freios desgastados"}]'::jsonb,
    resposta_correta = 'B'
WHERE pergunta LIKE '%luz da bateria%';

-- Módulo: Primeiros Socorros

-- Questão 1: Vítima inconsciente - resposta correta vai para C
UPDATE public.curso_quiz_perguntas 
SET opcoes = '[{"letra": "A", "texto": "Dar água para a vítima"}, {"letra": "B", "texto": "Movimentar a vítima imediatamente"}, {"letra": "C", "texto": "Verificar se há respiração e pulso"}, {"letra": "D", "texto": "Aplicar torniquete"}]'::jsonb,
    resposta_correta = 'C'
WHERE pergunta LIKE '%vítima inconsciente%';

-- Questão 2: Hemorragia - resposta correta vai para A
UPDATE public.curso_quiz_perguntas 
SET opcoes = '[{"letra": "A", "texto": "Fazer compressão direta no local do sangramento"}, {"letra": "B", "texto": "Lavar o ferimento com água corrente"}, {"letra": "C", "texto": "Aplicar gelo diretamente"}, {"letra": "D", "texto": "Ignorar e aguardar socorro"}]'::jsonb,
    resposta_correta = 'A'
WHERE pergunta LIKE '%hemorragia%';

-- Questão 3: Fratura - resposta correta vai para D
UPDATE public.curso_quiz_perguntas 
SET opcoes = '[{"letra": "A", "texto": "Tentar colocar o osso no lugar"}, {"letra": "B", "texto": "Massagear a área afetada"}, {"letra": "C", "texto": "Movimentar o membro para verificar"}, {"letra": "D", "texto": "Imobilizar o membro e aguardar socorro"}]'::jsonb,
    resposta_correta = 'D'
WHERE pergunta LIKE '%fratura%';

-- Questão 4: SAMU - resposta correta vai para B
UPDATE public.curso_quiz_perguntas 
SET opcoes = '[{"letra": "A", "texto": "190"}, {"letra": "B", "texto": "192"}, {"letra": "C", "texto": "193"}, {"letra": "D", "texto": "191"}]'::jsonb,
    resposta_correta = 'B'
WHERE pergunta LIKE '%SAMU%';

-- Questão 5: Queimadura - resposta correta vai para C
UPDATE public.curso_quiz_perguntas 
SET opcoes = '[{"letra": "A", "texto": "Aplicar pasta de dente"}, {"letra": "B", "texto": "Estourar as bolhas"}, {"letra": "C", "texto": "Resfriar com água corrente"}, {"letra": "D", "texto": "Aplicar manteiga"}]'::jsonb,
    resposta_correta = 'C'
WHERE pergunta LIKE '%queimadura%';

-- Módulo: Meio Ambiente

-- Questão 1: Efeito estufa - resposta correta vai para A
UPDATE public.curso_quiz_perguntas 
SET opcoes = '[{"letra": "A", "texto": "CO2 (dióxido de carbono)"}, {"letra": "B", "texto": "Oxigênio"}, {"letra": "C", "texto": "Nitrogênio"}, {"letra": "D", "texto": "Hélio"}]'::jsonb,
    resposta_correta = 'A'
WHERE pergunta LIKE '%efeito estufa%';

-- Questão 2: Direção econômica - resposta correta vai para D
UPDATE public.curso_quiz_perguntas 
SET opcoes = '[{"letra": "A", "texto": "Dirigir sempre em alta velocidade"}, {"letra": "B", "texto": "Acelerar e frear bruscamente"}, {"letra": "C", "texto": "Manter o ar-condicionado sempre ligado"}, {"letra": "D", "texto": "Manter velocidade constante e evitar acelerações bruscas"}]'::jsonb,
    resposta_correta = 'D'
WHERE pergunta LIKE '%direção econômica%' OR pergunta LIKE '%reduzir consumo de combustível%';

-- Questão 3: Descarte óleo - resposta correta vai para B
UPDATE public.curso_quiz_perguntas 
SET opcoes = '[{"letra": "A", "texto": "Jogar no ralo da pia"}, {"letra": "B", "texto": "Levar a um posto de coleta autorizado"}, {"letra": "C", "texto": "Enterrar no quintal"}, {"letra": "D", "texto": "Queimar o óleo"}]'::jsonb,
    resposta_correta = 'B'
WHERE pergunta LIKE '%óleo usado%' OR pergunta LIKE '%descarte de óleo%';

-- Questão 4: Catalisador - resposta correta vai para C
UPDATE public.curso_quiz_perguntas 
SET opcoes = '[{"letra": "A", "texto": "Aumentar a potência do motor"}, {"letra": "B", "texto": "Reduzir o consumo de combustível"}, {"letra": "C", "texto": "Reduzir a emissão de gases poluentes"}, {"letra": "D", "texto": "Melhorar o som do escapamento"}]'::jsonb,
    resposta_correta = 'C'
WHERE pergunta LIKE '%catalisador%';

-- Questão 5: Poluição sonora - resposta correta vai para A
UPDATE public.curso_quiz_perguntas 
SET opcoes = '[{"letra": "A", "texto": "Buzinar excessivamente"}, {"letra": "B", "texto": "Manter o veículo em bom estado"}, {"letra": "C", "texto": "Usar pneus adequados"}, {"letra": "D", "texto": "Fazer manutenção preventiva"}]'::jsonb,
    resposta_correta = 'A'
WHERE pergunta LIKE '%poluição sonora%';

-- Módulo: Legislação de Trânsito

-- Questão 1: Velocidade via urbana - resposta correta vai para C
UPDATE public.curso_quiz_perguntas 
SET opcoes = '[{"letra": "A", "texto": "40 km/h"}, {"letra": "B", "texto": "50 km/h"}, {"letra": "C", "texto": "60 km/h"}, {"letra": "D", "texto": "80 km/h"}]'::jsonb,
    resposta_correta = 'C'
WHERE pergunta LIKE '%velocidade máxima%via urbana%' OR pergunta LIKE '%via urbana%velocidade%';

-- Questão 2: Infração gravíssima - resposta correta vai para A
UPDATE public.curso_quiz_perguntas 
SET opcoes = '[{"letra": "A", "texto": "Dirigir sob influência de álcool"}, {"letra": "B", "texto": "Estacionar em local proibido"}, {"letra": "C", "texto": "Não usar o cinto de segurança"}, {"letra": "D", "texto": "Ultrapassar o limite de velocidade em 10%"}]'::jsonb,
    resposta_correta = 'A'
WHERE pergunta LIKE '%infração gravíssima%';

-- Questão 3: CNH provisória - resposta correta vai para B
UPDATE public.curso_quiz_perguntas 
SET opcoes = '[{"letra": "A", "texto": "6 meses"}, {"letra": "B", "texto": "1 ano"}, {"letra": "C", "texto": "2 anos"}, {"letra": "D", "texto": "5 anos"}]'::jsonb,
    resposta_correta = 'B'
WHERE pergunta LIKE '%CNH provisória%' OR pergunta LIKE '%permissão para dirigir%';

-- Questão 4: Faixa de pedestres - resposta correta vai para D
UPDATE public.curso_quiz_perguntas 
SET opcoes = '[{"letra": "A", "texto": "Buzinar para o pedestre"}, {"letra": "B", "texto": "Acelerar para passar antes"}, {"letra": "C", "texto": "Desviar do pedestre"}, {"letra": "D", "texto": "Parar e dar preferência ao pedestre"}]'::jsonb,
    resposta_correta = 'D'
WHERE pergunta LIKE '%faixa de pedestres%';

-- Questão 5: Documentos obrigatórios - resposta correta vai para C
UPDATE public.curso_quiz_perguntas 
SET opcoes = '[{"letra": "A", "texto": "Apenas a CNH"}, {"letra": "B", "texto": "Apenas o CRLV"}, {"letra": "C", "texto": "CNH e CRLV"}, {"letra": "D", "texto": "Apenas o RG"}]'::jsonb,
    resposta_correta = 'C'
WHERE pergunta LIKE '%documentos obrigatórios%';

-- Módulo: Direção Defensiva

-- Questão 1: Distância segurança - resposta correta vai para D
UPDATE public.curso_quiz_perguntas 
SET opcoes = '[{"letra": "A", "texto": "1 segundo"}, {"letra": "B", "texto": "1,5 segundos"}, {"letra": "C", "texto": "0,5 segundo"}, {"letra": "D", "texto": "2 segundos ou mais"}]'::jsonb,
    resposta_correta = 'D'
WHERE pergunta LIKE '%distância de segurança%' OR pergunta LIKE '%distância segura%';

-- Questão 2: Aquaplanagem - resposta correta vai para A
UPDATE public.curso_quiz_perguntas 
SET opcoes = '[{"letra": "A", "texto": "Reduzir a velocidade gradualmente"}, {"letra": "B", "texto": "Frear bruscamente"}, {"letra": "C", "texto": "Acelerar para sair da poça"}, {"letra": "D", "texto": "Virar o volante rapidamente"}]'::jsonb,
    resposta_correta = 'A'
WHERE pergunta LIKE '%aquaplanagem%';

-- Questão 3: Ponto cego - resposta correta vai para B
UPDATE public.curso_quiz_perguntas 
SET opcoes = '[{"letra": "A", "texto": "Confiar apenas nos retrovisores"}, {"letra": "B", "texto": "Olhar diretamente para os lados antes de mudar de faixa"}, {"letra": "C", "texto": "Mudar de faixa rapidamente"}, {"letra": "D", "texto": "Ignorar o ponto cego"}]'::jsonb,
    resposta_correta = 'B'
WHERE pergunta LIKE '%ponto cego%';

-- Questão 4: Fadiga - resposta correta vai para C
UPDATE public.curso_quiz_perguntas 
SET opcoes = '[{"letra": "A", "texto": "Tomar café e continuar"}, {"letra": "B", "texto": "Aumentar o volume do rádio"}, {"letra": "C", "texto": "Parar em local seguro e descansar"}, {"letra": "D", "texto": "Abrir a janela e continuar"}]'::jsonb,
    resposta_correta = 'C'
WHERE pergunta LIKE '%fadiga%' OR pergunta LIKE '%sono ao volante%';

-- Questão 5: Ultrapassagem - resposta correta vai para A
UPDATE public.curso_quiz_perguntas 
SET opcoes = '[{"letra": "A", "texto": "Verificar se há espaço suficiente e sinalizar"}, {"letra": "B", "texto": "Ultrapassar pela direita"}, {"letra": "C", "texto": "Ultrapassar em curvas"}, {"letra": "D", "texto": "Buzinar e ultrapassar"}]'::jsonb,
    resposta_correta = 'A'
WHERE pergunta LIKE '%ultrapassagem%';