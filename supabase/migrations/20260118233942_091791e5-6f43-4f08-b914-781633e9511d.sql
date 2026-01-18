-- Quiz para as 43 novas aulas com IDs reais

-- =====================================================
-- MÓDULO 3: Primeiros Socorros (aulas 9-12)
-- =====================================================

-- Aula 9: Queimaduras e Choque Elétrico (2f55efc3-40fc-4fe1-9308-cf19c8fec7fb)
INSERT INTO curso_quiz_perguntas (aula_id, ordem, pergunta, opcoes, resposta_correta, explicacao) VALUES
('2f55efc3-40fc-4fe1-9308-cf19c8fec7fb', 1, 'Em caso de queimadura, a primeira ação é:', '[{"letra":"A","texto":"Aplicar pasta de dente"},{"letra":"B","texto":"Resfriar com água corrente por 10-20 minutos"},{"letra":"C","texto":"Cobrir com algodão"},{"letra":"D","texto":"Estourar bolhas"}]', 'B', 'Resfrie a queimadura com água corrente por 10-20 minutos. Nunca use pasta de dente, manteiga ou gelo.'),
('2f55efc3-40fc-4fe1-9308-cf19c8fec7fb', 2, 'Em caso de choque elétrico, antes de socorrer deve-se:', '[{"letra":"A","texto":"Tocar na vítima imediatamente"},{"letra":"B","texto":"Desligar a fonte de energia"},{"letra":"C","texto":"Jogar água"},{"letra":"D","texto":"Esperar a vítima acordar"}]', 'B', 'Antes de tocar na vítima, desligue a fonte de energia para evitar choque no socorrista.'),
('2f55efc3-40fc-4fe1-9308-cf19c8fec7fb', 3, 'Queimaduras de 3º grau são caracterizadas por:', '[{"letra":"A","texto":"Vermelhidão leve"},{"letra":"B","texto":"Bolhas pequenas"},{"letra":"C","texto":"Destruição de todas as camadas da pele"},{"letra":"D","texto":"Apenas coceira"}]', 'C', 'Queimaduras de 3º grau destroem todas as camadas da pele, podendo atingir músculos e ossos.');

-- Aula 10: Afogamento e Asfixia (857f1b93-d184-413a-a8cd-9b4b56cadead)
INSERT INTO curso_quiz_perguntas (aula_id, ordem, pergunta, opcoes, resposta_correta, explicacao) VALUES
('857f1b93-d184-413a-a8cd-9b4b56cadead', 1, 'Em caso de engasgo em adulto consciente, a técnica indicada é:', '[{"letra":"A","texto":"Dar água"},{"letra":"B","texto":"Manobra de Heimlich"},{"letra":"C","texto":"Fazer a pessoa deitar"},{"letra":"D","texto":"Bater nas costas repetidamente"}]', 'B', 'A manobra de Heimlich (compressões abdominais) é a técnica correta para desobstrução de vias aéreas em adultos conscientes.'),
('857f1b93-d184-413a-a8cd-9b4b56cadead', 2, 'Em caso de afogamento, após retirar a vítima da água:', '[{"letra":"A","texto":"Tentar tirar água do pulmão"},{"letra":"B","texto":"Verificar respiração e iniciar RCP se necessário"},{"letra":"C","texto":"Dar comida"},{"letra":"D","texto":"Deixar a vítima de pé"}]', 'B', 'Verifique a respiração e inicie RCP se a vítima não respira. Não tente retirar água do pulmão.'),
('857f1b93-d184-413a-a8cd-9b4b56cadead', 3, 'Em bebês engasgados, a técnica correta inclui:', '[{"letra":"A","texto":"Manobra de Heimlich normal"},{"letra":"B","texto":"5 tapas nas costas + 5 compressões torácicas"},{"letra":"C","texto":"Dar água"},{"letra":"D","texto":"Sacudir o bebê"}]', 'B', 'Em bebês, alterne 5 tapas nas costas com 5 compressões torácicas até desobstruir.');

-- Aula 11: Convulsões e Desmaios (ee87e159-8983-4b53-b330-9a674ffebf7e)
INSERT INTO curso_quiz_perguntas (aula_id, ordem, pergunta, opcoes, resposta_correta, explicacao) VALUES
('ee87e159-8983-4b53-b330-9a674ffebf7e', 1, 'Durante uma convulsão, o correto é:', '[{"letra":"A","texto":"Segurar a pessoa firmemente"},{"letra":"B","texto":"Colocar algo na boca da vítima"},{"letra":"C","texto":"Afastar objetos perigosos e proteger a cabeça"},{"letra":"D","texto":"Dar água"}]', 'C', 'Proteja a cabeça da vítima e afaste objetos perigosos. Nunca coloque nada na boca.'),
('ee87e159-8983-4b53-b330-9a674ffebf7e', 2, 'Após um desmaio, a pessoa deve:', '[{"letra":"A","texto":"Levantar imediatamente"},{"letra":"B","texto":"Permanecer deitada com as pernas elevadas"},{"letra":"C","texto":"Correr"},{"letra":"D","texto":"Tomar remédio"}]', 'B', 'Mantenha a pessoa deitada com as pernas elevadas para melhorar o fluxo sanguíneo ao cérebro.'),
('ee87e159-8983-4b53-b330-9a674ffebf7e', 3, 'O desmaio pode ser causado por:', '[{"letra":"A","texto":"Apenas cansaço"},{"letra":"B","texto":"Queda de pressão, calor excessivo ou hipoglicemia"},{"letra":"C","texto":"Excesso de água"},{"letra":"D","texto":"Nenhuma causa específica"}]', 'B', 'Desmaios podem ter várias causas: hipotensão, calor, hipoglicemia, emoções fortes, entre outros.');

-- Aula 12: Kit de Primeiros Socorros (c3b2a5f2-e62e-4f67-a846-bafad0a8f7b2)
INSERT INTO curso_quiz_perguntas (aula_id, ordem, pergunta, opcoes, resposta_correta, explicacao) VALUES
('c3b2a5f2-e62e-4f67-a846-bafad0a8f7b2', 1, 'O triângulo de segurança deve ser colocado a qual distância do veículo?', '[{"letra":"A","texto":"10 metros"},{"letra":"B","texto":"30 metros ou mais"},{"letra":"C","texto":"5 metros"},{"letra":"D","texto":"Junto ao veículo"}]', 'B', 'O triângulo deve ser colocado a pelo menos 30 metros do veículo (em rodovias, pode ser maior).'),
('c3b2a5f2-e62e-4f67-a846-bafad0a8f7b2', 2, 'O extintor de incêndio veicular deve ser verificado:', '[{"letra":"A","texto":"Nunca"},{"letra":"B","texto":"A cada 5 anos"},{"letra":"C","texto":"Anualmente ou conforme validade"},{"letra":"D","texto":"Apenas quando usar"}]', 'C', 'O extintor deve ter sua validade verificada regularmente e ser substituído quando vencido.'),
('c3b2a5f2-e62e-4f67-a846-bafad0a8f7b2', 3, 'Itens recomendados para kit de primeiros socorros incluem:', '[{"letra":"A","texto":"Apenas band-aids"},{"letra":"B","texto":"Gaze, ataduras, luvas, tesoura e antisséptico"},{"letra":"C","texto":"Medicamentos variados"},{"letra":"D","texto":"Apenas água"}]', 'B', 'Um kit básico deve conter gaze, ataduras, luvas descartáveis, tesoura sem ponta e antisséptico.');

-- =====================================================
-- MÓDULO 4: Meio Ambiente e Cidadania (aulas 7-12)
-- =====================================================

-- Aula 7: Inspeção Veicular (c5ddab43-aadd-47bb-b141-b2218bafc151)
INSERT INTO curso_quiz_perguntas (aula_id, ordem, pergunta, opcoes, resposta_correta, explicacao) VALUES
('c5ddab43-aadd-47bb-b141-b2218bafc151', 1, 'A inspeção veicular verifica:', '[{"letra":"A","texto":"Apenas a pintura"},{"letra":"B","texto":"Emissão de poluentes e itens de segurança"},{"letra":"C","texto":"Apenas o motor"},{"letra":"D","texto":"O valor do veículo"}]', 'B', 'A inspeção veicular avalia níveis de emissão de poluentes e condições de segurança do veículo.'),
('c5ddab43-aadd-47bb-b141-b2218bafc151', 2, 'Veículos reprovados na inspeção:', '[{"letra":"A","texto":"Podem circular normalmente"},{"letra":"B","texto":"Devem ser regularizados para obter licenciamento"},{"letra":"C","texto":"São apreendidos permanentemente"},{"letra":"D","texto":"Não existe consequência"}]', 'B', 'Veículos reprovados devem corrigir as irregularidades e passar por nova inspeção para licenciamento.'),
('c5ddab43-aadd-47bb-b141-b2218bafc151', 3, 'A fumaça preta emitida por veículos diesel indica:', '[{"letra":"A","texto":"Bom funcionamento"},{"letra":"B","texto":"Queima incompleta de combustível e poluição"},{"letra":"C","texto":"Economia de combustível"},{"letra":"D","texto":"Motor novo"}]', 'B', 'Fumaça preta indica queima incompleta do diesel, gerando alta emissão de material particulado.');

-- Aula 8: Combustíveis Alternativos (517d5c86-ad08-45ed-8411-29dfce1c9e42)
INSERT INTO curso_quiz_perguntas (aula_id, ordem, pergunta, opcoes, resposta_correta, explicacao) VALUES
('517d5c86-ad08-45ed-8411-29dfce1c9e42', 1, 'O etanol é considerado combustível:', '[{"letra":"A","texto":"Fóssil"},{"letra":"B","texto":"Renovável"},{"letra":"C","texto":"Nuclear"},{"letra":"D","texto":"Sintético"}]', 'B', 'O etanol é um biocombustível renovável, produzido a partir da cana-de-açúcar no Brasil.'),
('517d5c86-ad08-45ed-8411-29dfce1c9e42', 2, 'Veículos elétricos emitem:', '[{"letra":"A","texto":"Muitos poluentes"},{"letra":"B","texto":"Zero emissões diretas de gases"},{"letra":"C","texto":"Apenas CO2"},{"letra":"D","texto":"Fumaça preta"}]', 'B', 'Veículos elétricos não emitem gases poluentes diretamente (emissão zero no escapamento).'),
('517d5c86-ad08-45ed-8411-29dfce1c9e42', 3, 'O GNV (Gás Natural Veicular) é:', '[{"letra":"A","texto":"Mais poluente que gasolina"},{"letra":"B","texto":"Menos poluente que gasolina e diesel"},{"letra":"C","texto":"Ilegal no Brasil"},{"letra":"D","texto":"Apenas para caminhões"}]', 'B', 'O GNV emite menos poluentes que gasolina e diesel, sendo uma alternativa mais limpa.');

-- Aula 9: Educação para o Trânsito (4bb41185-b9f9-491f-b7f4-7ca13e41a6f5)
INSERT INTO curso_quiz_perguntas (aula_id, ordem, pergunta, opcoes, resposta_correta, explicacao) VALUES
('4bb41185-b9f9-491f-b7f4-7ca13e41a6f5', 1, 'A educação para o trânsito deve começar:', '[{"letra":"A","texto":"Apenas na autoescola"},{"letra":"B","texto":"Desde a infância, nas escolas"},{"letra":"C","texto":"Após os 18 anos"},{"letra":"D","texto":"Apenas para motoristas"}]', 'B', 'O CTB determina que a educação para o trânsito seja incluída no currículo escolar desde a educação infantil.'),
('4bb41185-b9f9-491f-b7f4-7ca13e41a6f5', 2, 'A Semana Nacional de Trânsito ocorre em:', '[{"letra":"A","texto":"Janeiro"},{"letra":"B","texto":"Setembro (18 a 25)"},{"letra":"C","texto":"Dezembro"},{"letra":"D","texto":"Março"}]', 'B', 'A Semana Nacional de Trânsito ocorre de 18 a 25 de setembro, conforme o CTB.'),
('4bb41185-b9f9-491f-b7f4-7ca13e41a6f5', 3, 'Respeitar pedestres e ciclistas é um ato de:', '[{"letra":"A","texto":"Fraqueza"},{"letra":"B","texto":"Cidadania e respeito à vida"},{"letra":"C","texto":"Perda de tempo"},{"letra":"D","texto":"Obrigação apenas em faixas"}]', 'B', 'O respeito aos usuários mais vulneráveis é essencial para um trânsito seguro e cidadão.');

-- Aula 10: Mobilidade Urbana Sustentável (36b6ed7b-eceb-400e-a0f3-48cc8a9681c2)
INSERT INTO curso_quiz_perguntas (aula_id, ordem, pergunta, opcoes, resposta_correta, explicacao) VALUES
('36b6ed7b-eceb-400e-a0f3-48cc8a9681c2', 1, 'A mobilidade urbana sustentável prioriza:', '[{"letra":"A","texto":"Apenas carros"},{"letra":"B","texto":"Transporte coletivo, bicicletas e pedestres"},{"letra":"C","texto":"Motos e caminhões"},{"letra":"D","texto":"Veículos importados"}]', 'B', 'A mobilidade sustentável prioriza modais menos poluentes: transporte público, bicicleta e caminhada.'),
('36b6ed7b-eceb-400e-a0f3-48cc8a9681c2', 2, 'O uso de carona solidária (carpool) ajuda a:', '[{"letra":"A","texto":"Aumentar o trânsito"},{"letra":"B","texto":"Reduzir veículos nas ruas e poluição"},{"letra":"C","texto":"Gastar mais combustível"},{"letra":"D","texto":"Nada muda"}]', 'B', 'O compartilhamento de veículos reduz o número de carros circulando e consequentemente a poluição.'),
('36b6ed7b-eceb-400e-a0f3-48cc8a9681c2', 3, 'Ciclovias e ciclofaixas são importantes para:', '[{"letra":"A","texto":"Atrapalhar o trânsito"},{"letra":"B","texto":"Garantir segurança aos ciclistas e incentivar o uso da bicicleta"},{"letra":"C","texto":"Enfeitar a cidade"},{"letra":"D","texto":"Uso exclusivo de motos"}]', 'B', 'Infraestrutura cicloviária aumenta a segurança dos ciclistas e incentiva esse modal sustentável.');

-- Aula 11: Pedestres e Ciclistas (ee660507-5504-4eaa-85c9-ed4abfe7f41e)
INSERT INTO curso_quiz_perguntas (aula_id, ordem, pergunta, opcoes, resposta_correta, explicacao) VALUES
('ee660507-5504-4eaa-85c9-ed4abfe7f41e', 1, 'Pedestres e ciclistas são considerados:', '[{"letra":"A","texto":"Infratores"},{"letra":"B","texto":"Usuários vulneráveis do trânsito"},{"letra":"C","texto":"Sem direitos no trânsito"},{"letra":"D","texto":"Menos importantes"}]', 'B', 'O CTB reconhece pedestres e ciclistas como usuários vulneráveis que merecem proteção especial.'),
('ee660507-5504-4eaa-85c9-ed4abfe7f41e', 2, 'Ao ultrapassar um ciclista, o motorista deve manter distância de:', '[{"letra":"A","texto":"30 centímetros"},{"letra":"B","texto":"1,5 metro"},{"letra":"C","texto":"5 metros"},{"letra":"D","texto":"Não precisa manter distância"}]', 'B', 'O CTB exige distância lateral mínima de 1,5 metro ao ultrapassar ciclistas.'),
('ee660507-5504-4eaa-85c9-ed4abfe7f41e', 3, 'Na faixa de pedestres, o veículo deve:', '[{"letra":"A","texto":"Acelerar"},{"letra":"B","texto":"Parar e dar preferência ao pedestre"},{"letra":"C","texto":"Buzinar"},{"letra":"D","texto":"Desviar rapidamente"}]', 'B', 'Veículos devem parar antes da faixa de pedestres e aguardar a travessia completa.');

-- Aula 12: Campanhas de Conscientização (e5de1e42-30cf-4b75-97ff-1bd39a51f888)
INSERT INTO curso_quiz_perguntas (aula_id, ordem, pergunta, opcoes, resposta_correta, explicacao) VALUES
('e5de1e42-30cf-4b75-97ff-1bd39a51f888', 1, 'O Maio Amarelo é uma campanha sobre:', '[{"letra":"A","texto":"Vacinação"},{"letra":"B","texto":"Segurança no trânsito"},{"letra":"C","texto":"Reciclagem"},{"letra":"D","texto":"Economia"}]', 'B', 'O Maio Amarelo é um movimento internacional de conscientização para redução de mortes no trânsito.'),
('e5de1e42-30cf-4b75-97ff-1bd39a51f888', 2, 'A campanha Se beber, não dirija visa:', '[{"letra":"A","texto":"Proibir bebidas"},{"letra":"B","texto":"Conscientizar sobre os perigos de dirigir embriagado"},{"letra":"C","texto":"Vender mais bebidas"},{"letra":"D","texto":"Promover festas"}]', 'B', 'A campanha alerta sobre os riscos mortais de dirigir sob efeito de álcool.'),
('e5de1e42-30cf-4b75-97ff-1bd39a51f888', 3, 'Campanhas educativas no trânsito ajudam a:', '[{"letra":"A","texto":"Aumentar acidentes"},{"letra":"B","texto":"Mudar comportamentos e salvar vidas"},{"letra":"C","texto":"Vender carros"},{"letra":"D","texto":"Nada"}]', 'B', 'Campanhas educativas são essenciais para mudar comportamentos e reduzir acidentes.');

-- =====================================================
-- MÓDULO 5: Mecânica Básica (aulas 6-11)
-- =====================================================

-- Aula 6: Sistema Elétrico do Veículo (448a1259-f916-4605-8202-8bb88fb24a0d)
INSERT INTO curso_quiz_perguntas (aula_id, ordem, pergunta, opcoes, resposta_correta, explicacao) VALUES
('448a1259-f916-4605-8202-8bb88fb24a0d', 1, 'A bateria do veículo serve para:', '[{"letra":"A","texto":"Apenas ligar o rádio"},{"letra":"B","texto":"Fornecer energia para partida e sistemas elétricos"},{"letra":"C","texto":"Resfriar o motor"},{"letra":"D","texto":"Frear o veículo"}]', 'B', 'A bateria armazena energia elétrica para dar partida no motor e alimentar os sistemas elétricos.'),
('448a1259-f916-4605-8202-8bb88fb24a0d', 2, 'O alternador tem a função de:', '[{"letra":"A","texto":"Freiar o veículo"},{"letra":"B","texto":"Recarregar a bateria enquanto o motor funciona"},{"letra":"C","texto":"Aquecer o motor"},{"letra":"D","texto":"Trocar marchas"}]', 'B', 'O alternador gera energia elétrica enquanto o motor funciona, recarregando a bateria.'),
('448a1259-f916-4605-8202-8bb88fb24a0d', 3, 'A luz da bateria acesa no painel indica:', '[{"letra":"A","texto":"Bateria nova"},{"letra":"B","texto":"Problema no sistema de carga (alternador ou bateria)"},{"letra":"C","texto":"Tudo normal"},{"letra":"D","texto":"Excesso de carga"}]', 'B', 'A luz acesa indica problema no sistema de carga - pode ser alternador, correia ou bateria.');

-- Aula 7: Sistema de Arrefecimento (82ffa1b0-1bc2-4ccc-aba2-26261d703e17)
INSERT INTO curso_quiz_perguntas (aula_id, ordem, pergunta, opcoes, resposta_correta, explicacao) VALUES
('82ffa1b0-1bc2-4ccc-aba2-26261d703e17', 1, 'O sistema de arrefecimento serve para:', '[{"letra":"A","texto":"Aquecer o motor"},{"letra":"B","texto":"Manter a temperatura ideal do motor"},{"letra":"C","texto":"Acelerar o veículo"},{"letra":"D","texto":"Frear"}]', 'B', 'O sistema de arrefecimento mantém o motor na temperatura ideal de funcionamento (80-90°C).'),
('82ffa1b0-1bc2-4ccc-aba2-26261d703e17', 2, 'O líquido de arrefecimento deve ser verificado:', '[{"letra":"A","texto":"Nunca"},{"letra":"B","texto":"Regularmente, com motor frio"},{"letra":"C","texto":"Com motor quente"},{"letra":"D","texto":"Apenas na revisão anual"}]', 'B', 'Verifique o nível com motor frio para evitar queimaduras e leitura imprecisa.'),
('82ffa1b0-1bc2-4ccc-aba2-26261d703e17', 3, 'Se o motor superaquecer, deve-se:', '[{"letra":"A","texto":"Acelerar mais"},{"letra":"B","texto":"Parar o veículo em local seguro e aguardar esfriar"},{"letra":"C","texto":"Abrir o radiador imediatamente"},{"letra":"D","texto":"Continuar dirigindo"}]', 'B', 'Pare em local seguro e aguarde o motor esfriar. Nunca abra o radiador quente.');

-- Aula 8: Luzes do Painel - Significados (34886445-4e44-4cc6-8179-d1f0379df0b1)
INSERT INTO curso_quiz_perguntas (aula_id, ordem, pergunta, opcoes, resposta_correta, explicacao) VALUES
('34886445-4e44-4cc6-8179-d1f0379df0b1', 1, 'A luz do óleo acesa indica:', '[{"letra":"A","texto":"Óleo novo"},{"letra":"B","texto":"Pressão de óleo baixa - pare imediatamente"},{"letra":"C","texto":"Hora de abastecer"},{"letra":"D","texto":"Nada importante"}]', 'B', 'Luz do óleo acesa é emergência - pare imediatamente para evitar danos graves ao motor.'),
('34886445-4e44-4cc6-8179-d1f0379df0b1', 2, 'A luz do ABS acesa significa:', '[{"letra":"A","texto":"Freios normais"},{"letra":"B","texto":"Sistema antitravamento com falha"},{"letra":"C","texto":"Pneus novos"},{"letra":"D","texto":"Combustível baixo"}]', 'B', 'Luz do ABS acesa indica falha no sistema antitravamento - os freios convencionais funcionam, mas sem ABS.'),
('34886445-4e44-4cc6-8179-d1f0379df0b1', 3, 'A luz de temperatura vermelha indica:', '[{"letra":"A","texto":"Motor frio"},{"letra":"B","texto":"Superaquecimento - pare o veículo"},{"letra":"C","texto":"Ar-condicionado ligado"},{"letra":"D","texto":"Tudo normal"}]', 'B', 'Luz vermelha de temperatura indica superaquecimento - pare imediatamente em local seguro.');

-- Aula 9: Verificações Antes de Viajar (f346c9cf-e702-4432-96de-0aa5bc45dd69)
INSERT INTO curso_quiz_perguntas (aula_id, ordem, pergunta, opcoes, resposta_correta, explicacao) VALUES
('f346c9cf-e702-4432-96de-0aa5bc45dd69', 1, 'Antes de uma viagem longa, deve-se verificar:', '[{"letra":"A","texto":"Apenas o combustível"},{"letra":"B","texto":"Pneus, óleo, água, freios, luzes e documentos"},{"letra":"C","texto":"Apenas os documentos"},{"letra":"D","texto":"Nada, o carro é novo"}]', 'B', 'Uma verificação completa previne problemas na estrada: pneus, fluidos, freios, luzes e documentação.'),
('f346c9cf-e702-4432-96de-0aa5bc45dd69', 2, 'O estepe deve ser verificado:', '[{"letra":"A","texto":"Apenas quando furar"},{"letra":"B","texto":"Regularmente - calibragem e condições"},{"letra":"C","texto":"Nunca"},{"letra":"D","texto":"Apenas em viagens"}]', 'B', 'O estepe deve estar sempre calibrado e em boas condições para emergências.'),
('f346c9cf-e702-4432-96de-0aa5bc45dd69', 3, 'Viajar com pneus carecas:', '[{"letra":"A","texto":"É permitido"},{"letra":"B","texto":"É perigoso e infração de trânsito"},{"letra":"C","texto":"Economiza combustível"},{"letra":"D","texto":"Melhora a aderência"}]', 'B', 'Pneus carecas reduzem drasticamente a aderência e são infração de trânsito.');

-- Aula 10: Troca de Pneu - Passo a Passo (26209162-4dc6-4458-b9ed-858c603c3ccc)
INSERT INTO curso_quiz_perguntas (aula_id, ordem, pergunta, opcoes, resposta_correta, explicacao) VALUES
('26209162-4dc6-4458-b9ed-858c603c3ccc', 1, 'Antes de levantar o veículo com o macaco, deve-se:', '[{"letra":"A","texto":"Afrouxar os parafusos"},{"letra":"B","texto":"Remover os parafusos completamente"},{"letra":"C","texto":"Ligar o motor"},{"letra":"D","texto":"Acelerar"}]', 'A', 'Afrouxe os parafusos com o veículo ainda no chão, pois é mais fácil e seguro.'),
('26209162-4dc6-4458-b9ed-858c603c3ccc', 2, 'O local correto para posicionar o macaco é:', '[{"letra":"A","texto":"Qualquer lugar"},{"letra":"B","texto":"Nos pontos de apoio indicados no manual"},{"letra":"C","texto":"No para-choque"},{"letra":"D","texto":"Nas portas"}]', 'B', 'Use sempre os pontos de apoio indicados no manual para evitar danos ao veículo.'),
('26209162-4dc6-4458-b9ed-858c603c3ccc', 3, 'Após trocar o pneu, deve-se:', '[{"letra":"A","texto":"Calibrar o estepe na primeira oportunidade"},{"letra":"B","texto":"Nunca verificar a calibragem"},{"letra":"C","texto":"Trocar todos os pneus"},{"letra":"D","texto":"Vender o carro"}]', 'A', 'Verifique a calibragem do estepe o mais breve possível em um posto de combustível.');

-- Aula 11: Problemas Comuns e Diagnóstico (8942578f-55dd-4f6a-a457-321781498eac)
INSERT INTO curso_quiz_perguntas (aula_id, ordem, pergunta, opcoes, resposta_correta, explicacao) VALUES
('8942578f-55dd-4f6a-a457-321781498eac', 1, 'Volante vibrando pode indicar:', '[{"letra":"A","texto":"Motor novo"},{"letra":"B","texto":"Rodas desbalanceadas ou pneus com problema"},{"letra":"C","texto":"Bateria fraca"},{"letra":"D","texto":"Falta de combustível"}]', 'B', 'Vibração no volante geralmente indica desbalanceamento das rodas ou problemas nos pneus.'),
('8942578f-55dd-4f6a-a457-321781498eac', 2, 'Veículo puxando para um lado pode ser:', '[{"letra":"A","texto":"Normal"},{"letra":"B","texto":"Problema de alinhamento ou pneus"},{"letra":"C","texto":"Excesso de combustível"},{"letra":"D","texto":"Bateria nova"}]', 'B', 'O veículo puxar para um lado indica necessidade de alinhamento ou problemas nos pneus.'),
('8942578f-55dd-4f6a-a457-321781498eac', 3, 'Ruído de metal no freio indica:', '[{"letra":"A","texto":"Freios novos"},{"letra":"B","texto":"Pastilhas gastas - troque imediatamente"},{"letra":"C","texto":"Tudo normal"},{"letra":"D","texto":"Excesso de óleo"}]', 'B', 'Ruído metálico indica que as pastilhas estão no limite e devem ser substituídas urgentemente.');

-- =====================================================
-- MÓDULO 6: Sinalização Avançada (aulas 1-8)
-- =====================================================

-- Aula 1: Placas Especiais e Educativas (176d6a91-c9b7-420d-b85c-528b6f73ac0f)
INSERT INTO curso_quiz_perguntas (aula_id, ordem, pergunta, opcoes, resposta_correta, explicacao) VALUES
('176d6a91-c9b7-420d-b85c-528b6f73ac0f', 1, 'Placas educativas têm a função de:', '[{"letra":"A","texto":"Multar infratores"},{"letra":"B","texto":"Orientar e educar os usuários"},{"letra":"C","texto":"Indicar velocidade"},{"letra":"D","texto":"Proibir estacionamento"}]', 'B', 'Placas educativas orientam usuários sobre comportamentos adequados no trânsito.'),
('176d6a91-c9b7-420d-b85c-528b6f73ac0f', 2, 'A cor das placas educativas é:', '[{"letra":"A","texto":"Vermelha"},{"letra":"B","texto":"Branca com orla verde"},{"letra":"C","texto":"Amarela"},{"letra":"D","texto":"Azul"}]', 'B', 'Placas educativas têm fundo branco com orla e legendas verdes.'),
('176d6a91-c9b7-420d-b85c-528b6f73ac0f', 3, 'Placas de serviços auxiliares indicam:', '[{"letra":"A","texto":"Infrações"},{"letra":"B","texto":"Locais de apoio como hospitais e postos"},{"letra":"C","texto":"Limites de velocidade"},{"letra":"D","texto":"Proibições"}]', 'B', 'Essas placas indicam serviços úteis: hospitais, postos, restaurantes, hotéis, etc.');

-- Aula 2: Sinalização de Obras (3b0ac6bb-8d79-473e-99f5-31eeebc51c52)
INSERT INTO curso_quiz_perguntas (aula_id, ordem, pergunta, opcoes, resposta_correta, explicacao) VALUES
('3b0ac6bb-8d79-473e-99f5-31eeebc51c52', 1, 'A cor da sinalização de obras é:', '[{"letra":"A","texto":"Amarela"},{"letra":"B","texto":"Laranja"},{"letra":"C","texto":"Verde"},{"letra":"D","texto":"Azul"}]', 'B', 'Sinalização temporária de obras utiliza a cor laranja para maior visibilidade.'),
('3b0ac6bb-8d79-473e-99f5-31eeebc51c52', 2, 'Ao avistar sinalização de obras, deve-se:', '[{"letra":"A","texto":"Acelerar para passar rápido"},{"letra":"B","texto":"Reduzir velocidade e redobrar atenção"},{"letra":"C","texto":"Ignorar"},{"letra":"D","texto":"Parar completamente"}]', 'B', 'Reduza a velocidade e fique atento às mudanças de faixa e trabalhadores na via.'),
('3b0ac6bb-8d79-473e-99f5-31eeebc51c52', 3, 'Cones e cavaletes em obras servem para:', '[{"letra":"A","texto":"Enfeitar"},{"letra":"B","texto":"Delimitar áreas de trabalho e desvios"},{"letra":"C","texto":"Aumentar velocidade"},{"letra":"D","texto":"Nada específico"}]', 'B', 'Dispositivos de canalização orientam o fluxo e protegem a área de trabalho.');

-- Aula 3: Marcas Viárias Especiais (07d5fa3a-2259-4363-b3cf-71d60a083f20)
INSERT INTO curso_quiz_perguntas (aula_id, ordem, pergunta, opcoes, resposta_correta, explicacao) VALUES
('07d5fa3a-2259-4363-b3cf-71d60a083f20', 1, 'Linha dupla contínua amarela significa:', '[{"letra":"A","texto":"Ultrapassagem permitida"},{"letra":"B","texto":"Proibido ultrapassar em ambos os sentidos"},{"letra":"C","texto":"Estacionamento livre"},{"letra":"D","texto":"Via preferencial"}]', 'B', 'Linha dupla contínua amarela proíbe ultrapassagem nos dois sentidos.'),
('07d5fa3a-2259-4363-b3cf-71d60a083f20', 2, 'Linha branca seccionada indica:', '[{"letra":"A","texto":"Proibido mudar de faixa"},{"letra":"B","texto":"Permitido mudar de faixa com segurança"},{"letra":"C","texto":"Estacionamento proibido"},{"letra":"D","texto":"Velocidade máxima"}]', 'B', 'Linha branca seccionada permite mudança de faixa quando seguro.'),
('07d5fa3a-2259-4363-b3cf-71d60a083f20', 3, 'A pintura de solo PARE indica:', '[{"letra":"A","texto":"Reduzir velocidade"},{"letra":"B","texto":"Parada obrigatória antes de prosseguir"},{"letra":"C","texto":"Estacionar"},{"letra":"D","texto":"Acelerar"}]', 'B', 'A inscrição PARE no solo reforça a obrigatoriedade de parar antes do cruzamento.');

-- Aula 4: Dispositivos de Segurança (47b1b839-2a01-4075-89bf-b34c1f3bfb72)
INSERT INTO curso_quiz_perguntas (aula_id, ordem, pergunta, opcoes, resposta_correta, explicacao) VALUES
('47b1b839-2a01-4075-89bf-b34c1f3bfb72', 1, 'Tachas refletivas (olhos de gato) servem para:', '[{"letra":"A","texto":"Enfeitar a via"},{"letra":"B","texto":"Orientar à noite e em condições de baixa visibilidade"},{"letra":"C","texto":"Aumentar velocidade"},{"letra":"D","texto":"Indicar estacionamento"}]', 'B', 'Tachas refletivas aumentam a visibilidade das faixas à noite e em dias chuvosos.'),
('47b1b839-2a01-4075-89bf-b34c1f3bfb72', 2, 'Defensas metálicas (guard rails) protegem:', '[{"letra":"A","texto":"Contra roubo"},{"letra":"B","texto":"Contra saída de pista e colisões graves"},{"letra":"C","texto":"Contra chuva"},{"letra":"D","texto":"Contra pedestres"}]', 'B', 'Guard rails evitam que veículos saiam da pista em locais perigosos.'),
('47b1b839-2a01-4075-89bf-b34c1f3bfb72', 3, 'Lombadas eletrônicas medem:', '[{"letra":"A","texto":"Peso do veículo"},{"letra":"B","texto":"Velocidade do veículo"},{"letra":"C","texto":"Consumo de combustível"},{"letra":"D","texto":"Nível de poluição"}]', 'B', 'Lombadas eletrônicas registram a velocidade e emitem multas para infratores.');

-- Aula 5: Sinalização de Túneis e Pontes (b9227b62-bd68-42a4-9498-541de779a2ed)
INSERT INTO curso_quiz_perguntas (aula_id, ordem, pergunta, opcoes, resposta_correta, explicacao) VALUES
('b9227b62-bd68-42a4-9498-541de779a2ed', 1, 'Ao entrar em um túnel, deve-se:', '[{"letra":"A","texto":"Desligar os faróis"},{"letra":"B","texto":"Acender o farol baixo"},{"letra":"C","texto":"Acelerar"},{"letra":"D","texto":"Buzinar"}]', 'B', 'É obrigatório ligar o farol baixo ao entrar em túneis, independente do horário.'),
('b9227b62-bd68-42a4-9498-541de779a2ed', 2, 'Em túneis longos, a ultrapassagem é:', '[{"letra":"A","texto":"Sempre permitida"},{"letra":"B","texto":"Geralmente proibida (sinalização indica)"},{"letra":"C","texto":"Obrigatória"},{"letra":"D","texto":"Liberada à noite"}]', 'B', 'A maioria dos túneis proíbe ultrapassagem por questões de segurança.'),
('b9227b62-bd68-42a4-9498-541de779a2ed', 3, 'Em pontes estreitas, a preferência é de:', '[{"letra":"A","texto":"Quem vier primeiro ou conforme sinalização"},{"letra":"B","texto":"Sempre do caminhão"},{"letra":"C","texto":"Sempre do carro"},{"letra":"D","texto":"Ninguém tem preferência"}]', 'A', 'Em pontes estreitas, siga a sinalização ou dê preferência a quem já iniciou a travessia.');

-- Aula 6: Sinalização em Rodovias (da4f113e-6b51-4b8c-9e7f-786cc9f3ca2a)
INSERT INTO curso_quiz_perguntas (aula_id, ordem, pergunta, opcoes, resposta_correta, explicacao) VALUES
('da4f113e-6b51-4b8c-9e7f-786cc9f3ca2a', 1, 'Placas de quilometragem em rodovias indicam:', '[{"letra":"A","texto":"Velocidade máxima"},{"letra":"B","texto":"Distância percorrida desde o início da rodovia"},{"letra":"C","texto":"Número de faixas"},{"letra":"D","texto":"Limite de peso"}]', 'B', 'Marcos quilométricos indicam a distância desde o ponto inicial da rodovia.'),
('da4f113e-6b51-4b8c-9e7f-786cc9f3ca2a', 2, 'Placas de destino com fundo verde indicam:', '[{"letra":"A","texto":"Proibição"},{"letra":"B","texto":"Orientação de destino"},{"letra":"C","texto":"Advertência"},{"letra":"D","texto":"Regulamentação"}]', 'B', 'Placas verdes são de indicação, orientando sobre destinos e distâncias.'),
('da4f113e-6b51-4b8c-9e7f-786cc9f3ca2a', 3, 'O acostamento em rodovias serve para:', '[{"letra":"A","texto":"Ultrapassar"},{"letra":"B","texto":"Paradas de emergência"},{"letra":"C","texto":"Estacionar"},{"letra":"D","texto":"Trafegar normalmente"}]', 'B', 'O acostamento é exclusivo para emergências, não para tráfego regular.');

-- Aula 7: Sinalização Eletrônica (b28e804d-0576-4586-a591-5d332d28e953)
INSERT INTO curso_quiz_perguntas (aula_id, ordem, pergunta, opcoes, resposta_correta, explicacao) VALUES
('b28e804d-0576-4586-a591-5d332d28e953', 1, 'Painéis de mensagem variável (PMV) informam sobre:', '[{"letra":"A","texto":"Publicidade"},{"letra":"B","texto":"Condições de tráfego em tempo real"},{"letra":"C","texto":"Preços de combustível"},{"letra":"D","texto":"Notícias"}]', 'B', 'PMVs exibem alertas sobre acidentes, congestionamentos, obras e condições climáticas.'),
('b28e804d-0576-4586-a591-5d332d28e953', 2, 'Semáforos com contagem regressiva ajudam a:', '[{"letra":"A","texto":"Acelerar no amarelo"},{"letra":"B","texto":"Preparar para mudança de fase com segurança"},{"letra":"C","texto":"Ignorar o sinal"},{"letra":"D","texto":"Estacionar"}]', 'B', 'A contagem permite que o condutor se prepare para parar ou prosseguir com segurança.'),
('b28e804d-0576-4586-a591-5d332d28e953', 3, 'Radares fixos devem ser:', '[{"letra":"A","texto":"Escondidos"},{"letra":"B","texto":"Sinalizados com antecedência"},{"letra":"C","texto":"Móveis apenas"},{"letra":"D","texto":"Desligados à noite"}]', 'B', 'O CTB exige que radares fixos sejam precedidos de sinalização indicativa.');

-- Aula 8: Interpretação de Placas Complexas (6b751f99-fc9a-4461-a2b0-70a022de4d72)
INSERT INTO curso_quiz_perguntas (aula_id, ordem, pergunta, opcoes, resposta_correta, explicacao) VALUES
('6b751f99-fc9a-4461-a2b0-70a022de4d72', 1, 'Placa de proibido estacionar com placa auxiliar segunda a sexta significa:', '[{"letra":"A","texto":"Proibido sempre"},{"letra":"B","texto":"Proibido apenas de segunda a sexta"},{"letra":"C","texto":"Permitido sempre"},{"letra":"D","texto":"Proibido apenas no fim de semana"}]', 'B', 'Placas auxiliares especificam condições ou horários de validade da placa principal.'),
('6b751f99-fc9a-4461-a2b0-70a022de4d72', 2, 'Quando há conflito entre placa e agente de trânsito:', '[{"letra":"A","texto":"Siga a placa"},{"letra":"B","texto":"Obedeça ao agente de trânsito"},{"letra":"C","texto":"Pare e espere"},{"letra":"D","texto":"Escolha o que preferir"}]', 'B', 'As ordens do agente de trânsito prevalecem sobre qualquer sinalização.'),
('6b751f99-fc9a-4461-a2b0-70a022de4d72', 3, 'Placa de velocidade com placa auxiliar quando chover significa:', '[{"letra":"A","texto":"Velocidade máxima permanente"},{"letra":"B","texto":"Velocidade máxima apenas em condições de chuva"},{"letra":"C","texto":"Velocidade mínima"},{"letra":"D","texto":"Proibido em dias de chuva"}]', 'B', 'A velocidade indicada é válida especificamente para condições de pista molhada.');

-- =====================================================
-- MÓDULO 7: Situações Especiais de Direção (aulas 1-6)
-- =====================================================

-- Aula 1: Direção em Montanhas e Serras (8874082b-3e9d-48ee-8e43-eada2b902a9f)
INSERT INTO curso_quiz_perguntas (aula_id, ordem, pergunta, opcoes, resposta_correta, explicacao) VALUES
('8874082b-3e9d-48ee-8e43-eada2b902a9f', 1, 'Em descidas longas de serra, deve-se:', '[{"letra":"A","texto":"Usar apenas os freios"},{"letra":"B","texto":"Usar o freio motor (marcha reduzida)"},{"letra":"C","texto":"Colocar em ponto morto"},{"letra":"D","texto":"Desligar o motor"}]', 'B', 'O freio motor evita superaquecimento dos freios. Use marchas reduzidas em descidas longas.'),
('8874082b-3e9d-48ee-8e43-eada2b902a9f', 2, 'Em subidas íngremes, se o veículo não conseguir subir:', '[{"letra":"A","texto":"Forçar em primeira marcha"},{"letra":"B","texto":"Engatar ré e descer com cuidado"},{"letra":"C","texto":"Desligar o motor"},{"letra":"D","texto":"Acelerar ao máximo"}]', 'B', 'Se não conseguir subir, engate a ré e desça controladamente, nunca em ponto morto.'),
('8874082b-3e9d-48ee-8e43-eada2b902a9f', 3, 'Em curvas de montanha, deve-se:', '[{"letra":"A","texto":"Acelerar na curva"},{"letra":"B","texto":"Reduzir antes da curva e manter velocidade constante"},{"letra":"C","texto":"Frear durante a curva"},{"letra":"D","texto":"Ultrapassar na curva"}]', 'B', 'Reduza antes de entrar na curva e mantenha velocidade constante durante.');

-- Aula 2: Travessia de Alagamentos (4c19d14b-ade4-447a-be0d-e78292e9149e)
INSERT INTO curso_quiz_perguntas (aula_id, ordem, pergunta, opcoes, resposta_correta, explicacao) VALUES
('4c19d14b-ade4-447a-be0d-e78292e9149e', 1, 'Ao encontrar uma via alagada, o mais seguro é:', '[{"letra":"A","texto":"Atravessar em alta velocidade"},{"letra":"B","texto":"Evitar atravessar se não souber a profundidade"},{"letra":"C","texto":"Desligar o motor e empurrar"},{"letra":"D","texto":"Atravessar pelo meio"}]', 'B', 'Se não conhecer a profundidade, evite atravessar. Água pode esconder buracos e danos.'),
('4c19d14b-ade4-447a-be0d-e78292e9149e', 2, 'Se for necessário atravessar água rasa, deve-se:', '[{"letra":"A","texto":"Acelerar bastante"},{"letra":"B","texto":"Manter velocidade baixa e constante"},{"letra":"C","texto":"Parar no meio"},{"letra":"D","texto":"Desligar os faróis"}]', 'B', 'Mantenha velocidade baixa e constante para evitar que água entre no motor.'),
('4c19d14b-ade4-447a-be0d-e78292e9149e', 3, 'Após atravessar água, deve-se:', '[{"letra":"A","texto":"Acelerar imediatamente"},{"letra":"B","texto":"Testar os freios em local seguro"},{"letra":"C","texto":"Desligar o veículo"},{"letra":"D","texto":"Nada especial"}]', 'B', 'Freios molhados perdem eficiência. Teste-os levemente até secar.');

-- Aula 3: Neblina e Visibilidade Reduzida (8aae220c-ae07-4884-89c0-e0d78e825b00)
INSERT INTO curso_quiz_perguntas (aula_id, ordem, pergunta, opcoes, resposta_correta, explicacao) VALUES
('8aae220c-ae07-4884-89c0-e0d78e825b00', 1, 'Em caso de neblina, deve-se usar:', '[{"letra":"A","texto":"Farol alto"},{"letra":"B","texto":"Farol baixo e/ou farol de neblina"},{"letra":"C","texto":"Pisca-alerta"},{"letra":"D","texto":"Nenhuma luz"}]', 'B', 'Use farol baixo (o alto reflete na neblina e piora a visibilidade) e farol de neblina se disponível.'),
('8aae220c-ae07-4884-89c0-e0d78e825b00', 2, 'Em neblina densa, a velocidade deve ser:', '[{"letra":"A","texto":"Mantida normal"},{"letra":"B","texto":"Compatível com a visibilidade reduzida"},{"letra":"C","texto":"Aumentada para sair logo"},{"letra":"D","texto":"A máxima permitida"}]', 'B', 'Reduza a velocidade para poder parar dentro da distância visível.'),
('8aae220c-ae07-4884-89c0-e0d78e825b00', 3, 'Se a neblina for muito densa, o melhor é:', '[{"letra":"A","texto":"Continuar dirigindo devagar"},{"letra":"B","texto":"Parar em local seguro fora da pista"},{"letra":"C","texto":"Ligar o pisca-alerta e continuar"},{"letra":"D","texto":"Ultrapassar outros veículos"}]', 'B', 'Em neblina extrema, pare em local seguro (fora da pista) e aguarde melhorar.');

-- Aula 4: Cruzamentos e Rotatórias (8d9d380c-448c-4bb0-a9e7-846e7a50c3ec)
INSERT INTO curso_quiz_perguntas (aula_id, ordem, pergunta, opcoes, resposta_correta, explicacao) VALUES
('8d9d380c-448c-4bb0-a9e7-846e7a50c3ec', 1, 'Em rotatórias, a preferência é de quem:', '[{"letra":"A","texto":"Está entrando"},{"letra":"B","texto":"Já está circulando dentro da rotatória"},{"letra":"C","texto":"Vem pela direita"},{"letra":"D","texto":"Tem veículo maior"}]', 'B', 'Quem já está dentro da rotatória tem preferência sobre quem está entrando.'),
('8d9d380c-448c-4bb0-a9e7-846e7a50c3ec', 2, 'Em cruzamentos sem sinalização, a preferência é:', '[{"letra":"A","texto":"De quem vem pela esquerda"},{"letra":"B","texto":"De quem vem pela direita"},{"letra":"C","texto":"Do veículo maior"},{"letra":"D","texto":"De quem chegar primeiro"}]', 'B', 'Sem sinalização, a preferência é de quem vem pela direita.'),
('8d9d380c-448c-4bb0-a9e7-846e7a50c3ec', 3, 'Ao entrar em uma rotatória, deve-se sinalizar:', '[{"letra":"A","texto":"À direita"},{"letra":"B","texto":"À esquerda"},{"letra":"C","texto":"Não precisa sinalizar"},{"letra":"D","texto":"Usar pisca-alerta"}]', 'A', 'Sinalize à direita ao entrar e ao sair da rotatória.');

-- Aula 5: Reboque e Socorro Mecânico (6dadd313-dc62-41c5-aa41-1d463d4b5bce)
INSERT INTO curso_quiz_perguntas (aula_id, ordem, pergunta, opcoes, resposta_correta, explicacao) VALUES
('6dadd313-dc62-41c5-aa41-1d463d4b5bce', 1, 'Ao ser rebocado, o veículo deve:', '[{"letra":"A","texto":"Estar em ponto morto com chave na posição de ignição"},{"letra":"B","texto":"Estar com motor ligado"},{"letra":"C","texto":"Estar travado"},{"letra":"D","texto":"Ter o freio de mão puxado"}]', 'A', 'Mantenha em ponto morto para as rodas girarem e chave ligada para destravar o volante.'),
('6dadd313-dc62-41c5-aa41-1d463d4b5bce', 2, 'A velocidade máxima para reboque é de:', '[{"letra":"A","texto":"80 km/h"},{"letra":"B","texto":"50 km/h"},{"letra":"C","texto":"110 km/h"},{"letra":"D","texto":"Não há limite"}]', 'B', 'A velocidade máxima para veículos sendo rebocados é de 50 km/h.'),
('6dadd313-dc62-41c5-aa41-1d463d4b5bce', 3, 'Ao parar no acostamento por pane, deve-se:', '[{"letra":"A","texto":"Permanecer dentro do veículo"},{"letra":"B","texto":"Sair do veículo pela porta do lado do acostamento e usar triângulo"},{"letra":"C","texto":"Ficar na pista"},{"letra":"D","texto":"Não sinalizar"}]', 'B', 'Saia com segurança e coloque o triângulo a pelo menos 30 metros do veículo.');

-- Aula 6: Condução com Carga (ab8ce282-5b67-46b5-ab29-41c345f67c82)
INSERT INTO curso_quiz_perguntas (aula_id, ordem, pergunta, opcoes, resposta_correta, explicacao) VALUES
('ab8ce282-5b67-46b5-ab29-41c345f67c82', 1, 'Ao transportar carga no porta-malas, deve-se:', '[{"letra":"A","texto":"Não se preocupar com distribuição"},{"letra":"B","texto":"Distribuir o peso uniformemente"},{"letra":"C","texto":"Colocar tudo de um lado"},{"letra":"D","texto":"Exceder o peso máximo"}]', 'B', 'Distribua o peso uniformemente para manter a estabilidade do veículo.'),
('ab8ce282-5b67-46b5-ab29-41c345f67c82', 2, 'Carga mal distribuída pode causar:', '[{"letra":"A","texto":"Economia de combustível"},{"letra":"B","texto":"Perda de estabilidade e maior distância de frenagem"},{"letra":"C","texto":"Melhor aderência"},{"letra":"D","texto":"Nenhum problema"}]', 'B', 'Carga mal distribuída afeta a estabilidade, frenagem e comportamento do veículo.'),
('ab8ce282-5b67-46b5-ab29-41c345f67c82', 3, 'Objetos soltos dentro do veículo em caso de colisão:', '[{"letra":"A","texto":"Não representam risco"},{"letra":"B","texto":"Podem se tornar projéteis e causar lesões"},{"letra":"C","texto":"Ficam no lugar"},{"letra":"D","texto":"Desaparecem"}]', 'B', 'Objetos soltos podem se tornar projéteis perigosos em uma colisão ou frenagem brusca.');