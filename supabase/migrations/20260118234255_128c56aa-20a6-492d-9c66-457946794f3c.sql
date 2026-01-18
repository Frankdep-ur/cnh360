-- Quiz para Módulo 1: Legislação de Trânsito (aulas 13-20) e Módulo 2: Direção Defensiva (aulas 11-15)
-- Estas aulas já tinham seus IDs corretos na primeira migração

-- =====================================================
-- MÓDULO 1: Legislação de Trânsito (aulas 13-20)
-- =====================================================

-- Aula 13: Documentos Obrigatórios do Veículo (77177a15-625c-498b-931e-6e994db117c2)
INSERT INTO curso_quiz_perguntas (aula_id, ordem, pergunta, opcoes, resposta_correta, explicacao) VALUES
('77177a15-625c-498b-931e-6e994db117c2', 1, 'Qual documento comprova a propriedade do veículo?', '[{"letra":"A","texto":"CNH"},{"letra":"B","texto":"CRV (Certificado de Registro de Veículo)"},{"letra":"C","texto":"CRLV"},{"letra":"D","texto":"DPVAT"}]', 'B', 'O CRV é o documento que comprova a propriedade do veículo, enquanto o CRLV autoriza sua circulação.'),
('77177a15-625c-498b-931e-6e994db117c2', 2, 'O CRLV deve ser renovado:', '[{"letra":"A","texto":"A cada 5 anos"},{"letra":"B","texto":"Anualmente"},{"letra":"C","texto":"A cada 2 anos"},{"letra":"D","texto":"Nunca expira"}]', 'B', 'O CRLV (Certificado de Registro e Licenciamento de Veículo) deve ser renovado anualmente.'),
('77177a15-625c-498b-931e-6e994db117c2', 3, 'Circular sem o CRLV é infração:', '[{"letra":"A","texto":"Leve"},{"letra":"B","texto":"Média"},{"letra":"C","texto":"Grave"},{"letra":"D","texto":"Gravíssima"}]', 'C', 'Conduzir veículo sem portar o CRLV é infração grave com retenção do veículo.');

-- Aula 14: Documentos Obrigatórios do Condutor (af82f558-e19e-40df-b11d-b2c5bfa3c2a8)
INSERT INTO curso_quiz_perguntas (aula_id, ordem, pergunta, opcoes, resposta_correta, explicacao) VALUES
('af82f558-e19e-40df-b11d-b2c5bfa3c2a8', 1, 'Qual documento habilita uma pessoa a conduzir veículos?', '[{"letra":"A","texto":"RG"},{"letra":"B","texto":"CPF"},{"letra":"C","texto":"CNH"},{"letra":"D","texto":"CRLV"}]', 'C', 'A CNH (Carteira Nacional de Habilitação) é o documento que autoriza a condução de veículos.'),
('af82f558-e19e-40df-b11d-b2c5bfa3c2a8', 2, 'Dirigir com CNH vencida há mais de 30 dias é:', '[{"letra":"A","texto":"Permitido"},{"letra":"B","texto":"Infração leve"},{"letra":"C","texto":"Infração gravíssima"},{"letra":"D","texto":"Infração média"}]', 'C', 'Dirigir com CNH vencida há mais de 30 dias é infração gravíssima.'),
('af82f558-e19e-40df-b11d-b2c5bfa3c2a8', 3, 'A CNH digital tem a mesma validade da física?', '[{"letra":"A","texto":"Não, vale menos"},{"letra":"B","texto":"Sim, tem a mesma validade"},{"letra":"C","texto":"Não é aceita"},{"letra":"D","texto":"Só vale em alguns estados"}]', 'B', 'A CNH digital, disponível no app Carteira Digital de Trânsito, tem a mesma validade jurídica da versão impressa.');

-- Aula 15: Categorias de CNH (592084a2-fed7-4568-b601-702a1999a37c)
INSERT INTO curso_quiz_perguntas (aula_id, ordem, pergunta, opcoes, resposta_correta, explicacao) VALUES
('592084a2-fed7-4568-b601-702a1999a37c', 1, 'A categoria B permite conduzir veículos de até:', '[{"letra":"A","texto":"2.500 kg"},{"letra":"B","texto":"3.500 kg"},{"letra":"C","texto":"4.500 kg"},{"letra":"D","texto":"5.000 kg"}]', 'B', 'A categoria B permite conduzir veículos de até 3.500 kg e lotação máxima de 8 passageiros.'),
('592084a2-fed7-4568-b601-702a1999a37c', 2, 'Para conduzir motocicletas, qual categoria é necessária?', '[{"letra":"A","texto":"Categoria B"},{"letra":"B","texto":"Categoria C"},{"letra":"C","texto":"Categoria A"},{"letra":"D","texto":"Categoria D"}]', 'C', 'A categoria A autoriza a condução de veículos de duas ou três rodas (motocicletas, motonetas, triciclos).'),
('592084a2-fed7-4568-b601-702a1999a37c', 3, 'A categoria E permite conduzir:', '[{"letra":"A","texto":"Apenas carros"},{"letra":"B","texto":"Apenas motos"},{"letra":"C","texto":"Combinações de veículos com reboque acima de 6.000 kg"},{"letra":"D","texto":"Ônibus"}]', 'C', 'A categoria E autoriza conduzir combinações de veículos com unidade tratora nas categorias B, C ou D e reboque acima de 6.000 kg.');

-- Aula 16: PPD e ACC - Regras Especiais (beca1feb-6f98-4b91-8431-219c0e508687)
INSERT INTO curso_quiz_perguntas (aula_id, ordem, pergunta, opcoes, resposta_correta, explicacao) VALUES
('beca1feb-6f98-4b91-8431-219c0e508687', 1, 'O período de PPD (Permissão para Dirigir) dura:', '[{"letra":"A","texto":"6 meses"},{"letra":"B","texto":"1 ano"},{"letra":"C","texto":"2 anos"},{"letra":"D","texto":"3 anos"}]', 'B', 'A PPD tem validade de 1 ano. Se o condutor não cometer infrações graves ou gravíssimas, obtém a CNH definitiva.'),
('beca1feb-6f98-4b91-8431-219c0e508687', 2, 'O condutor com ACC pode dirigir veículos de até:', '[{"letra":"A","texto":"50 cilindradas"},{"letra":"B","texto":"125 cilindradas"},{"letra":"C","texto":"150 cilindradas"},{"letra":"D","texto":"250 cilindradas"}]', 'A', 'A ACC autoriza conduzir ciclomotores de até 50 cilindradas.'),
('beca1feb-6f98-4b91-8431-219c0e508687', 3, 'Se o condutor com PPD cometer infração grave, o que acontece?', '[{"letra":"A","texto":"Nada"},{"letra":"B","texto":"Apenas multa"},{"letra":"C","texto":"Cancelamento da permissão"},{"letra":"D","texto":"Suspensão por 1 mês"}]', 'C', 'O condutor que cometer infração grave ou gravíssima durante o período de PPD terá sua permissão cancelada.');

-- Aula 17: Crimes de Trânsito (b665cbbf-d8d2-4f5c-84ef-3f6d6690a058)
INSERT INTO curso_quiz_perguntas (aula_id, ordem, pergunta, opcoes, resposta_correta, explicacao) VALUES
('b665cbbf-d8d2-4f5c-84ef-3f6d6690a058', 1, 'Homicídio culposo no trânsito pode resultar em pena de:', '[{"letra":"A","texto":"Apenas multa"},{"letra":"B","texto":"Detenção de 2 a 4 anos"},{"letra":"C","texto":"Advertência"},{"letra":"D","texto":"Suspensão do direito de dirigir apenas"}]', 'B', 'O homicídio culposo no trânsito é crime previsto no CTB com pena de detenção de 2 a 4 anos e suspensão da habilitação.'),
('b665cbbf-d8d2-4f5c-84ef-3f6d6690a058', 2, 'Participar de racha (corrida não autorizada) é:', '[{"letra":"A","texto":"Infração administrativa"},{"letra":"B","texto":"Crime de trânsito"},{"letra":"C","texto":"Permitido em rodovias"},{"letra":"D","texto":"Contravenção penal"}]', 'B', 'Participar de corrida, disputa ou competição não autorizada é crime de trânsito com pena de detenção.'),
('b665cbbf-d8d2-4f5c-84ef-3f6d6690a058', 3, 'Dirigir sob efeito de álcool é considerado:', '[{"letra":"A","texto":"Infração leve"},{"letra":"B","texto":"Infração média"},{"letra":"C","texto":"Crime de trânsito"},{"letra":"D","texto":"Apenas advertência"}]', 'C', 'Conduzir veículo com concentração de álcool igual ou superior a 0,6 g/L de sangue é crime (Lei Seca).');

-- Aula 18: Recursos contra Multas (fd89c355-d4b9-41e7-a63e-7adf71cab6d5)
INSERT INTO curso_quiz_perguntas (aula_id, ordem, pergunta, opcoes, resposta_correta, explicacao) VALUES
('fd89c355-d4b9-41e7-a63e-7adf71cab6d5', 1, 'O prazo para apresentar defesa prévia contra uma multa é de:', '[{"letra":"A","texto":"15 dias"},{"letra":"B","texto":"30 dias"},{"letra":"C","texto":"45 dias"},{"letra":"D","texto":"60 dias"}]', 'B', 'O prazo para apresentar defesa prévia é de 30 dias a contar da notificação.'),
('fd89c355-d4b9-41e7-a63e-7adf71cab6d5', 2, 'A JARI é responsável por:', '[{"letra":"A","texto":"Aplicar multas"},{"letra":"B","texto":"Julgar recursos de multas em primeira instância"},{"letra":"C","texto":"Emitir CNH"},{"letra":"D","texto":"Fiscalizar veículos"}]', 'B', 'A JARI (Junta Administrativa de Recursos de Infrações) julga recursos em primeira instância administrativa.'),
('fd89c355-d4b9-41e7-a63e-7adf71cab6d5', 3, 'Após a JARI, qual é a próxima instância de recurso?', '[{"letra":"A","texto":"Não há mais recurso"},{"letra":"B","texto":"CETRAN ou CONTRANDIFE"},{"letra":"C","texto":"Prefeitura"},{"letra":"D","texto":"Polícia"}]', 'B', 'Após a JARI, cabe recurso ao CETRAN (estadual) ou CONTRANDIFE (DF) em segunda instância.');

-- Aula 19: DPVAT e Seguros Obrigatórios (05b8f552-9ea7-4365-ac86-60001f2a922c)
INSERT INTO curso_quiz_perguntas (aula_id, ordem, pergunta, opcoes, resposta_correta, explicacao) VALUES
('05b8f552-9ea7-4365-ac86-60001f2a922c', 1, 'O seguro obrigatório cobre:', '[{"letra":"A","texto":"Apenas danos ao veículo"},{"letra":"B","texto":"Vítimas de acidentes de trânsito"},{"letra":"C","texto":"Apenas o condutor"},{"letra":"D","texto":"Roubo do veículo"}]', 'B', 'O seguro obrigatório cobre vítimas de acidentes de trânsito, independente de culpa.'),
('05b8f552-9ea7-4365-ac86-60001f2a922c', 2, 'Quem tem direito à indenização do seguro obrigatório?', '[{"letra":"A","texto":"Apenas o motorista"},{"letra":"B","texto":"Pedestres, passageiros e condutores vítimas"},{"letra":"C","texto":"Apenas pedestres"},{"letra":"D","texto":"Apenas passageiros"}]', 'B', 'Todas as vítimas de acidentes de trânsito têm direito: pedestres, passageiros e condutores.'),
('05b8f552-9ea7-4365-ac86-60001f2a922c', 3, 'O seguro facultativo é:', '[{"letra":"A","texto":"Obrigatório por lei"},{"letra":"B","texto":"Opcional, contratado pelo proprietário"},{"letra":"C","texto":"Pago junto com o IPVA"},{"letra":"D","texto":"Gratuito"}]', 'B', 'O seguro facultativo é opcional e oferece coberturas adicionais como roubo, colisão e terceiros.');

-- Aula 20: Registro e Licenciamento de Veículos (8c269d7c-213e-4d46-8449-2ef091a6f97b)
INSERT INTO curso_quiz_perguntas (aula_id, ordem, pergunta, opcoes, resposta_correta, explicacao) VALUES
('8c269d7c-213e-4d46-8449-2ef091a6f97b', 1, 'O registro do veículo é feito no:', '[{"letra":"A","texto":"CONTRAN"},{"letra":"B","texto":"DETRAN"},{"letra":"C","texto":"PRF"},{"letra":"D","texto":"SENATRAN"}]', 'B', 'O registro de veículos é realizado no DETRAN do estado onde o proprietário é domiciliado.'),
('8c269d7c-213e-4d46-8449-2ef091a6f97b', 2, 'Ao comprar um veículo usado, o novo proprietário deve transferir em até:', '[{"letra":"A","texto":"15 dias"},{"letra":"B","texto":"30 dias"},{"letra":"C","texto":"60 dias"},{"letra":"D","texto":"90 dias"}]', 'B', 'O prazo para transferência de propriedade de veículo é de 30 dias após a aquisição.'),
('8c269d7c-213e-4d46-8449-2ef091a6f97b', 3, 'A placa do veículo no padrão Mercosul possui:', '[{"letra":"A","texto":"3 letras e 3 números"},{"letra":"B","texto":"4 letras e 3 números"},{"letra":"C","texto":"3 letras, 1 número, 1 letra e 2 números"},{"letra":"D","texto":"5 letras e 2 números"}]', 'C', 'A placa Mercosul segue o formato: 3 letras + 1 número + 1 letra + 2 números (ex: ABC1D23).');

-- =====================================================
-- MÓDULO 2: Direção Defensiva (aulas 11-15)
-- =====================================================

-- Aula 11: Aquaplanagem e Hidroplanagem (92241d8d-8d9f-4db1-89a8-052670f2b2aa)
INSERT INTO curso_quiz_perguntas (aula_id, ordem, pergunta, opcoes, resposta_correta, explicacao) VALUES
('92241d8d-8d9f-4db1-89a8-052670f2b2aa', 1, 'A aquaplanagem ocorre quando:', '[{"letra":"A","texto":"Os freios falham"},{"letra":"B","texto":"Os pneus perdem contato com o asfalto por causa da água"},{"letra":"C","texto":"O motor superaquece"},{"letra":"D","texto":"A bateria descarrega"}]', 'B', 'A aquaplanagem acontece quando uma lâmina de água se forma entre os pneus e o pavimento, causando perda de aderência.'),
('92241d8d-8d9f-4db1-89a8-052670f2b2aa', 2, 'Para evitar aquaplanagem, deve-se:', '[{"letra":"A","texto":"Acelerar mais"},{"letra":"B","texto":"Reduzir a velocidade e manter pneus calibrados"},{"letra":"C","texto":"Frear bruscamente"},{"letra":"D","texto":"Virar o volante rapidamente"}]', 'B', 'Velocidade reduzida e pneus em bom estado com calibragem correta são essenciais para evitar aquaplanagem.'),
('92241d8d-8d9f-4db1-89a8-052670f2b2aa', 3, 'Se ocorrer aquaplanagem, o correto é:', '[{"letra":"A","texto":"Frear imediatamente"},{"letra":"B","texto":"Acelerar para sair da água"},{"letra":"C","texto":"Tirar o pé do acelerador e manter o volante firme"},{"letra":"D","texto":"Virar bruscamente"}]', 'C', 'Deve-se tirar o pé do acelerador gradualmente e manter o volante firme até recuperar a aderência.');

-- Aula 12: Condução Econômica (Eco-driving) (5e0314aa-3534-46f9-b2b9-42b60d4f80a5)
INSERT INTO curso_quiz_perguntas (aula_id, ordem, pergunta, opcoes, resposta_correta, explicacao) VALUES
('5e0314aa-3534-46f9-b2b9-42b60d4f80a5', 1, 'A condução econômica ajuda a:', '[{"letra":"A","texto":"Aumentar o consumo de combustível"},{"letra":"B","texto":"Reduzir consumo e emissão de poluentes"},{"letra":"C","texto":"Desgastar mais os pneus"},{"letra":"D","texto":"Danificar o motor"}]', 'B', 'O eco-driving reduz o consumo de combustível em até 25% e diminui a emissão de gases poluentes.'),
('5e0314aa-3534-46f9-b2b9-42b60d4f80a5', 2, 'Para economizar combustível, deve-se:', '[{"letra":"A","texto":"Acelerar bruscamente"},{"letra":"B","texto":"Manter rotação alta"},{"letra":"C","texto":"Antecipar situações e frear suavemente"},{"letra":"D","texto":"Usar ar-condicionado sempre"}]', 'C', 'Antecipar situações, manter velocidade constante e evitar frenagens bruscas economizam combustível.'),
('5e0314aa-3534-46f9-b2b9-42b60d4f80a5', 3, 'Pneus descalibrados causam:', '[{"letra":"A","texto":"Economia de combustível"},{"letra":"B","texto":"Melhor aderência"},{"letra":"C","texto":"Maior consumo e desgaste irregular"},{"letra":"D","texto":"Nenhum efeito"}]', 'C', 'Pneus com pressão incorreta aumentam o consumo de combustível e causam desgaste irregular.');

-- Aula 13: Direção em Rodovias (9be77dd7-ed1f-4adf-82e9-8d84f88a1821)
INSERT INTO curso_quiz_perguntas (aula_id, ordem, pergunta, opcoes, resposta_correta, explicacao) VALUES
('9be77dd7-ed1f-4adf-82e9-8d84f88a1821', 1, 'Em rodovias de pista dupla, a ultrapassagem deve ser feita:', '[{"letra":"A","texto":"Pela direita"},{"letra":"B","texto":"Pela esquerda"},{"letra":"C","texto":"Por qualquer lado"},{"letra":"D","texto":"Pelo acostamento"}]', 'B', 'A ultrapassagem deve sempre ser feita pela esquerda, exceto quando o veículo à frente sinalizou conversão à esquerda.'),
('9be77dd7-ed1f-4adf-82e9-8d84f88a1821', 2, 'O uso do farol baixo em rodovias é:', '[{"letra":"A","texto":"Opcional"},{"letra":"B","texto":"Obrigatório dia e noite"},{"letra":"C","texto":"Apenas à noite"},{"letra":"D","texto":"Proibido de dia"}]', 'B', 'O uso de farol baixo em rodovias é obrigatório 24 horas por dia (Lei 13.290/2016).'),
('9be77dd7-ed1f-4adf-82e9-8d84f88a1821', 3, 'A distância de seguimento em rodovias deve ser:', '[{"letra":"A","texto":"Menor que em vias urbanas"},{"letra":"B","texto":"Maior, devido à velocidade mais alta"},{"letra":"C","texto":"Igual em qualquer via"},{"letra":"D","texto":"Não importa a distância"}]', 'B', 'Em rodovias, a distância de seguimento deve ser maior pois as velocidades são mais altas.');

-- Aula 14: Direção Noturna (6b33c0aa-bc5b-4376-893a-86081cf49c9f)
INSERT INTO curso_quiz_perguntas (aula_id, ordem, pergunta, opcoes, resposta_correta, explicacao) VALUES
('6b33c0aa-bc5b-4376-893a-86081cf49c9f', 1, 'À noite, a visibilidade do condutor é reduzida em aproximadamente:', '[{"letra":"A","texto":"20%"},{"letra":"B","texto":"50%"},{"letra":"C","texto":"70%"},{"letra":"D","texto":"90%"}]', 'C', 'A visibilidade noturna é reduzida em cerca de 70%, exigindo maior atenção e velocidade compatível.'),
('6b33c0aa-bc5b-4376-893a-86081cf49c9f', 2, 'Ao cruzar com outro veículo à noite, deve-se:', '[{"letra":"A","texto":"Manter o farol alto"},{"letra":"B","texto":"Alternar para farol baixo"},{"letra":"C","texto":"Desligar os faróis"},{"letra":"D","texto":"Piscar repetidamente"}]', 'B', 'Ao cruzar com outro veículo, deve-se usar farol baixo para não ofuscar o condutor que vem em sentido contrário.'),
('6b33c0aa-bc5b-4376-893a-86081cf49c9f', 3, 'Se ofuscado por outro veículo, o correto é:', '[{"letra":"A","texto":"Olhar diretamente para os faróis"},{"letra":"B","texto":"Desviar o olhar para a margem direita da via"},{"letra":"C","texto":"Fechar os olhos"},{"letra":"D","texto":"Parar imediatamente"}]', 'B', 'Desvie o olhar para a margem direita da via até que o veículo passe, evitando perda momentânea de visão.');

-- Aula 15: Transporte de Cargas e Passageiros (996a1878-830f-4b67-98b0-ffea2080863b)
INSERT INTO curso_quiz_perguntas (aula_id, ordem, pergunta, opcoes, resposta_correta, explicacao) VALUES
('996a1878-830f-4b67-98b0-ffea2080863b', 1, 'O excesso de carga no veículo:', '[{"letra":"A","texto":"Melhora a estabilidade"},{"letra":"B","texto":"Prejudica frenagem e aumenta consumo"},{"letra":"C","texto":"Não afeta o veículo"},{"letra":"D","texto":"Economiza combustível"}]', 'B', 'O excesso de peso aumenta a distância de frenagem, desgasta componentes e eleva o consumo de combustível.'),
('996a1878-830f-4b67-98b0-ffea2080863b', 2, 'Transportar passageiros em número superior ao permitido é infração:', '[{"letra":"A","texto":"Leve"},{"letra":"B","texto":"Média"},{"letra":"C","texto":"Grave"},{"letra":"D","texto":"Gravíssima"}]', 'C', 'Transportar passageiros em quantidade superior à capacidade é infração grave.'),
('996a1878-830f-4b67-98b0-ffea2080863b', 3, 'Crianças menores de 10 anos devem ser transportadas:', '[{"letra":"A","texto":"No banco dianteiro"},{"letra":"B","texto":"No banco traseiro com dispositivo de retenção"},{"letra":"C","texto":"Em qualquer lugar"},{"letra":"D","texto":"Apenas em veículos grandes"}]', 'B', 'Crianças menores de 10 anos devem ser transportadas no banco traseiro com dispositivo de retenção adequado.');