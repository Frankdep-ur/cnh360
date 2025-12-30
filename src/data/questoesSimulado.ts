export interface QuestaoSimulado {
  id: number;
  categoria: string;
  pergunta: string;
  opcoes: string[];
  respostaCorreta: number;
  explicacao: string;
  baseLegal?: string; // Referência ao CTB, Contran ou Detran
}

export const questoesSimulado: QuestaoSimulado[] = [
  // LEGISLAÇÃO DE TRÂNSITO (30 questões)
  {
    id: 1,
    categoria: "Legislação de Trânsito",
    pergunta: "Qual é a velocidade máxima permitida em vias locais urbanas?",
    opcoes: ["30 km/h", "40 km/h", "60 km/h", "80 km/h"],
    respostaCorreta: 1,
    explicacao: "Conforme o CTB, a velocidade máxima em vias locais é de 30 km/h, salvo sinalização em contrário.",
    baseLegal: "Art. 61, I, b do CTB"
  },
  {
    id: 2,
    categoria: "Legislação de Trânsito",
    pergunta: "O que significa CNH?",
    opcoes: ["Carteira Nacional de Habilitação", "Certificado Nacional de Habilitação", "Código Nacional de Habilitação", "Controle Nacional de Habilitação"],
    respostaCorreta: 0,
    explicacao: "CNH significa Carteira Nacional de Habilitação, documento que autoriza o cidadão a conduzir veículos.",
    baseLegal: "Art. 140 do CTB"
  },
  {
    id: 3,
    categoria: "Legislação de Trânsito",
    pergunta: "Qual a penalidade para dirigir sob efeito de álcool?",
    opcoes: ["Multa leve", "Multa média", "Multa grave", "Multa gravíssima com suspensão do direito de dirigir"],
    respostaCorreta: 3,
    explicacao: "Dirigir sob influência de álcool é infração gravíssima, com multa multiplicada por 10 e suspensão do direito de dirigir.",
    baseLegal: "Art. 165 do CTB"
  },
  {
    id: 4,
    categoria: "Legislação de Trânsito",
    pergunta: "Quantos pontos na CNH levam à suspensão do direito de dirigir?",
    opcoes: ["10 pontos", "15 pontos", "20 pontos", "40 pontos"],
    respostaCorreta: 2,
    explicacao: "O condutor que atingir 20 pontos em 12 meses terá sua CNH suspensa, conforme o CTB.",
    baseLegal: "Art. 261, §1º do CTB"
  },
  {
    id: 5,
    categoria: "Legislação de Trânsito",
    pergunta: "Qual a idade mínima para obter a CNH categoria B?",
    opcoes: ["16 anos", "18 anos", "21 anos", "25 anos"],
    respostaCorreta: 1,
    explicacao: "A idade mínima para obter a CNH é 18 anos completos.",
    baseLegal: "Art. 140, I do CTB"
  },
  {
    id: 6,
    categoria: "Legislação de Trânsito",
    pergunta: "O que é PPD?",
    opcoes: ["Permissão Provisória para Dirigir", "Primeiro Passo para Dirigir", "Programa de Prática de Direção", "Permissão Permanente de Direção"],
    respostaCorreta: 0,
    explicacao: "PPD é a Permissão Provisória para Dirigir, válida por 12 meses antes da CNH definitiva.",
    baseLegal: "Art. 148, §3º do CTB"
  },
  {
    id: 7,
    categoria: "Legislação de Trânsito",
    pergunta: "Qual documento é obrigatório portar ao dirigir?",
    opcoes: ["Apenas RG", "Apenas CNH", "CNH e documento do veículo", "Apenas comprovante de residência"],
    respostaCorreta: 2,
    explicacao: "O condutor deve portar a CNH e o CRLV (documento do veículo) ou documento digital equivalente.",
    baseLegal: "Art. 159 do CTB"
  },
  {
    id: 8,
    categoria: "Legislação de Trânsito",
    pergunta: "Qual a velocidade máxima em rodovias de pista dupla?",
    opcoes: ["80 km/h", "100 km/h", "110 km/h", "120 km/h"],
    respostaCorreta: 2,
    explicacao: "A velocidade máxima em rodovias de pista dupla é de 110 km/h para automóveis e camionetas.",
    baseLegal: "Art. 61, I, a do CTB"
  },
  {
    id: 9,
    categoria: "Legislação de Trânsito",
    pergunta: "O uso do cinto de segurança é obrigatório para:",
    opcoes: ["Apenas o motorista", "Motorista e passageiro da frente", "Todos os ocupantes do veículo", "Apenas em rodovias"],
    respostaCorreta: 2,
    explicacao: "O uso do cinto de segurança é obrigatório para todos os ocupantes do veículo.",
    baseLegal: "Art. 65 do CTB"
  },
  {
    id: 10,
    categoria: "Legislação de Trânsito",
    pergunta: "Qual a validade da CNH para condutores com menos de 50 anos?",
    opcoes: ["5 anos", "10 anos", "15 anos", "Vitalícia"],
    respostaCorreta: 1,
    explicacao: "A CNH tem validade de 10 anos para condutores com menos de 50 anos de idade.",
    baseLegal: "Art. 147, §2º do CTB"
  },
  {
    id: 11,
    categoria: "Legislação de Trânsito",
    pergunta: "É permitido ultrapassar pela direita?",
    opcoes: ["Sempre", "Nunca", "Apenas em vias de mão única com mais de uma faixa", "Apenas em rodovias"],
    respostaCorreta: 2,
    explicacao: "A ultrapassagem pela direita é permitida em vias de mão única com mais de uma faixa de mesmo sentido.",
    baseLegal: "Art. 29, IX do CTB"
  },
  {
    id: 12,
    categoria: "Legislação de Trânsito",
    pergunta: "O que significa RENACH?",
    opcoes: ["Registro Nacional de Carteiras de Habilitação", "Rede Nacional de Condutores Habilitados", "Regulamento Nacional de Habilitação", "Registro de Novos Condutores"],
    respostaCorreta: 0,
    explicacao: "RENACH é o Registro Nacional de Carteiras de Habilitação.",
    baseLegal: "Resolução CONTRAN 168/04"
  },
  {
    id: 13,
    categoria: "Legislação de Trânsito",
    pergunta: "Qual a penalidade por estacionar em local proibido?",
    opcoes: ["Advertência", "Multa leve", "Multa média", "Multa grave"],
    respostaCorreta: 2,
    explicacao: "Estacionar em local proibido é infração média, sujeita a multa.",
    baseLegal: "Art. 181 do CTB"
  },
  {
    id: 14,
    categoria: "Legislação de Trânsito",
    pergunta: "O que é infração de trânsito?",
    opcoes: ["Qualquer ato do condutor", "Inobservância de norma do CTB", "Apenas acidentes", "Dirigir devagar"],
    respostaCorreta: 1,
    explicacao: "Infração de trânsito é a inobservância de qualquer preceito do CTB ou legislação complementar.",
    baseLegal: "Art. 161 do CTB"
  },
  {
    id: 15,
    categoria: "Legislação de Trânsito",
    pergunta: "Quantos pontos vale uma infração gravíssima?",
    opcoes: ["3 pontos", "4 pontos", "5 pontos", "7 pontos"],
    respostaCorreta: 3,
    explicacao: "Infrações gravíssimas computam 7 pontos na CNH do condutor.",
    baseLegal: "Art. 259 do CTB"
  },
  {
    id: 16,
    categoria: "Legislação de Trânsito",
    pergunta: "É obrigatório usar farol baixo durante o dia em rodovias?",
    opcoes: ["Sim, sempre", "Não, nunca", "Apenas com neblina", "Apenas à noite"],
    respostaCorreta: 0,
    explicacao: "O uso do farol baixo é obrigatório em rodovias, mesmo durante o dia.",
    baseLegal: "Art. 40 do CTB"
  },
  {
    id: 17,
    categoria: "Legislação de Trânsito",
    pergunta: "Qual a velocidade máxima em vias arteriais?",
    opcoes: ["40 km/h", "50 km/h", "60 km/h", "80 km/h"],
    respostaCorreta: 2,
    explicacao: "A velocidade máxima em vias arteriais é de 60 km/h, salvo sinalização.",
    baseLegal: "Art. 61, I, c do CTB"
  },
  {
    id: 18,
    categoria: "Legislação de Trânsito",
    pergunta: "O que é DPVAT?",
    opcoes: ["Seguro obrigatório", "Imposto veicular", "Taxa de licenciamento", "Multa de trânsito"],
    respostaCorreta: 0,
    explicacao: "DPVAT era o seguro obrigatório de danos pessoais causados por veículos automotores.",
    baseLegal: "Lei 6.194/74"
  },
  {
    id: 19,
    categoria: "Legislação de Trânsito",
    pergunta: "Crianças menores de 10 anos devem ocupar qual posição no veículo?",
    opcoes: ["Banco da frente", "Banco traseiro", "Qualquer banco", "No colo de adulto"],
    respostaCorreta: 1,
    explicacao: "Crianças menores de 10 anos devem ser transportadas no banco traseiro, em dispositivo adequado.",
    baseLegal: "Art. 64 do CTB"
  },
  {
    id: 20,
    categoria: "Legislação de Trânsito",
    pergunta: "É permitido dirigir utilizando fones de ouvido?",
    opcoes: ["Sim, sempre", "Não, é proibido", "Apenas em um ouvido", "Apenas mãos livres"],
    respostaCorreta: 1,
    explicacao: "É proibido dirigir usando fones de ouvido conectados a aparelho sonoro.",
    baseLegal: "Art. 252, VI do CTB"
  },
  {
    id: 21,
    categoria: "Legislação de Trânsito",
    pergunta: "O que acontece se o condutor se recusar ao teste do bafômetro?",
    opcoes: ["Nada", "Advertência", "Mesmas penalidades de quem está embriagado", "Apenas multa leve"],
    respostaCorreta: 2,
    explicacao: "A recusa ao teste do bafômetro implica nas mesmas penalidades previstas para embriaguez ao volante.",
    baseLegal: "Art. 165-A do CTB"
  },
  {
    id: 22,
    categoria: "Legislação de Trânsito",
    pergunta: "Qual categoria de CNH permite dirigir motocicletas?",
    opcoes: ["Categoria A", "Categoria B", "Categoria C", "Categoria D"],
    respostaCorreta: 0,
    explicacao: "A categoria A da CNH habilita o condutor a dirigir motocicletas.",
    baseLegal: "Art. 143, I do CTB"
  },
  {
    id: 23,
    categoria: "Legislação de Trânsito",
    pergunta: "É permitido estacionar em esquinas?",
    opcoes: ["Sim", "Não, deve manter 5 metros de distância", "Apenas com sinalização", "Apenas à noite"],
    respostaCorreta: 1,
    explicacao: "É proibido estacionar a menos de 5 metros do bordo do alinhamento da esquina.",
    baseLegal: "Art. 181, VIII do CTB"
  },
  {
    id: 24,
    categoria: "Legislação de Trânsito",
    pergunta: "O que significa a sigla CTB?",
    opcoes: ["Código de Trânsito Brasileiro", "Controle de Tráfego Brasileiro", "Central de Trânsito do Brasil", "Código Total Brasileiro"],
    respostaCorreta: 0,
    explicacao: "CTB significa Código de Trânsito Brasileiro, a lei que regulamenta o trânsito no país.",
    baseLegal: "Lei 9.503/97"
  },
  {
    id: 25,
    categoria: "Legislação de Trânsito",
    pergunta: "Qual a distância mínima para estacionar de hidrantes?",
    opcoes: ["3 metros", "5 metros", "7 metros", "10 metros"],
    respostaCorreta: 1,
    explicacao: "É proibido estacionar a menos de 5 metros de hidrantes de incêndio.",
    baseLegal: "Art. 181, XI do CTB"
  },
  {
    id: 26,
    categoria: "Legislação de Trânsito",
    pergunta: "Dirigir sem CNH é infração de qual natureza?",
    opcoes: ["Leve", "Média", "Grave", "Gravíssima"],
    respostaCorreta: 3,
    explicacao: "Dirigir sem possuir CNH é infração gravíssima.",
    baseLegal: "Art. 162, I do CTB"
  },
  {
    id: 27,
    categoria: "Legislação de Trânsito",
    pergunta: "É obrigatório acionar a seta ao mudar de faixa?",
    opcoes: ["Não", "Apenas em rodovias", "Sim, sempre", "Apenas com trânsito intenso"],
    respostaCorreta: 2,
    explicacao: "O uso da seta é obrigatório sempre que houver mudança de direção ou faixa.",
    baseLegal: "Art. 35 do CTB"
  },
  {
    id: 28,
    categoria: "Legislação de Trânsito",
    pergunta: "Qual a punição por dirigir com CNH vencida há mais de 30 dias?",
    opcoes: ["Nenhuma", "Advertência", "Multa grave", "Multa gravíssima"],
    respostaCorreta: 2,
    explicacao: "Dirigir com CNH vencida há mais de 30 dias é infração grave.",
    baseLegal: "Art. 162, V do CTB"
  },
  {
    id: 29,
    categoria: "Legislação de Trânsito",
    pergunta: "Quem tem prioridade em uma rotatória?",
    opcoes: ["Quem está entrando", "Quem já está circulando", "Veículos maiores", "Ninguém"],
    respostaCorreta: 1,
    explicacao: "Quem já está circulando na rotatória tem preferência de passagem.",
    baseLegal: "Art. 29, III do CTB"
  },
  {
    id: 30,
    categoria: "Legislação de Trânsito",
    pergunta: "É permitido transportar passageiros na carroceria de caminhonete?",
    opcoes: ["Sim, sempre", "Não, é proibido em áreas urbanas", "Apenas adultos", "Apenas em estradas"],
    respostaCorreta: 1,
    explicacao: "É proibido transportar pessoas na carroceria de caminhonetes em vias urbanas e rodovias.",
    baseLegal: "Art. 230, II do CTB"
  },

  // DIREÇÃO DEFENSIVA (25 questões)
  {
    id: 31,
    categoria: "Direção Defensiva",
    pergunta: "O que é direção defensiva?",
    opcoes: ["Dirigir rápido", "Dirigir de forma a prevenir acidentes", "Dirigir apenas em rodovias", "Defender-se de outros motoristas"],
    respostaCorreta: 1,
    explicacao: "Direção defensiva é a forma de dirigir que permite reconhecer e evitar situações de risco.",
    baseLegal: "Resolução CONTRAN 168/04, Anexo II"
  },
  {
    id: 32,
    categoria: "Direção Defensiva",
    pergunta: "Qual o intervalo de tempo recomendado para manter distância segura do veículo da frente em condições normais?",
    opcoes: ["1 segundo", "2 segundos", "5 segundos", "10 segundos"],
    respostaCorreta: 1,
    explicacao: "A regra dos 2 segundos garante distância segura em condições normais de pista.",
    baseLegal: "Manual DENATRAN de Direção Defensiva"
  },
  {
    id: 33,
    categoria: "Direção Defensiva",
    pergunta: "Em pista molhada, o que deve aumentar?",
    opcoes: ["A velocidade", "A distância de seguimento", "O uso de buzina", "O som do rádio"],
    respostaCorreta: 1,
    explicacao: "Em pista molhada, a distância de seguimento deve aumentar devido à maior distância de frenagem.",
    baseLegal: "Manual DENATRAN de Direção Defensiva"
  },
  {
    id: 34,
    categoria: "Direção Defensiva",
    pergunta: "O que é aquaplanagem?",
    opcoes: ["Dirigir na água", "Perda de aderência por camada de água entre pneu e pista", "Tipo de freio", "Manobra evasiva"],
    respostaCorreta: 1,
    explicacao: "Aquaplanagem ocorre quando uma camada de água se forma entre o pneu e o pavimento, causando perda de controle.",
    baseLegal: "Manual DENATRAN de Direção Defensiva"
  },
  {
    id: 35,
    categoria: "Direção Defensiva",
    pergunta: "O que significa o termo 'ponto cego'?",
    opcoes: ["Área não visível pelos retrovisores", "Cruzamento sem semáforo", "Curva fechada", "Pista sem iluminação"],
    respostaCorreta: 0,
    explicacao: "Ponto cego é a área ao redor do veículo que não é visível pelos espelhos retrovisores.",
    baseLegal: "Manual DENATRAN de Direção Defensiva"
  },
  {
    id: 36,
    categoria: "Direção Defensiva",
    pergunta: "Qual a principal causa de acidentes de trânsito?",
    opcoes: ["Problemas mecânicos", "Condições da via", "Falha humana", "Condições climáticas"],
    respostaCorreta: 2,
    explicacao: "A falha humana é responsável por cerca de 90% dos acidentes de trânsito.",
    baseLegal: "Estatísticas DENATRAN"
  },
  {
    id: 37,
    categoria: "Direção Defensiva",
    pergunta: "O que fazer ao se deparar com neblina?",
    opcoes: ["Acelerar para sair rápido", "Reduzir velocidade e usar farol baixo", "Parar imediatamente", "Usar farol alto"],
    respostaCorreta: 1,
    explicacao: "Em neblina, deve-se reduzir a velocidade e usar farol baixo para melhor visibilidade.",
    baseLegal: "Art. 40, §1º do CTB"
  },
  {
    id: 38,
    categoria: "Direção Defensiva",
    pergunta: "Qual elemento não faz parte da direção defensiva?",
    opcoes: ["Conhecimento", "Atenção", "Agressividade", "Previsão"],
    respostaCorreta: 2,
    explicacao: "Os elementos da direção defensiva são: conhecimento, atenção, previsão, habilidade e ação. Agressividade é o oposto.",
    baseLegal: "Resolução CONTRAN 168/04, Anexo II"
  },
  {
    id: 39,
    categoria: "Direção Defensiva",
    pergunta: "O que é tempo de reação?",
    opcoes: ["Tempo para frear", "Tempo entre perceber e agir", "Tempo de viagem", "Velocidade do veículo"],
    respostaCorreta: 1,
    explicacao: "Tempo de reação é o intervalo entre perceber uma situação de risco e iniciar uma ação.",
    baseLegal: "Manual DENATRAN de Direção Defensiva"
  },
  {
    id: 40,
    categoria: "Direção Defensiva",
    pergunta: "Dirigir com sono é:",
    opcoes: ["Permitido", "Recomendado à noite", "Muito perigoso", "Normal"],
    respostaCorreta: 2,
    explicacao: "Dirigir com sono é extremamente perigoso, pois reduz reflexos e pode causar o cochilo ao volante.",
    baseLegal: "Manual DENATRAN de Direção Defensiva"
  },
  {
    id: 41,
    categoria: "Direção Defensiva",
    pergunta: "O que deve fazer antes de iniciar uma ultrapassagem?",
    opcoes: ["Buzinar", "Verificar se há espaço e sinalizar", "Acelerar imediatamente", "Piscar os faróis"],
    respostaCorreta: 1,
    explicacao: "Antes de ultrapassar, deve-se verificar se há espaço suficiente e sinalizar a intenção.",
    baseLegal: "Art. 29, X do CTB"
  },
  {
    id: 42,
    categoria: "Direção Defensiva",
    pergunta: "O que é condição adversa?",
    opcoes: ["Pista bem conservada", "Qualquer fator que aumenta o risco de acidente", "Trânsito livre", "Veículo novo"],
    respostaCorreta: 1,
    explicacao: "Condições adversas são fatores que aumentam o risco, como chuva, neblina, pista ruim, etc.",
    baseLegal: "Resolução CONTRAN 168/04, Anexo II"
  },
  {
    id: 43,
    categoria: "Direção Defensiva",
    pergunta: "Qual atitude é correta ao ser ultrapassado?",
    opcoes: ["Acelerar", "Manter velocidade e facilitar", "Buzinar", "Fechar o veículo"],
    respostaCorreta: 1,
    explicacao: "Ao ser ultrapassado, deve-se manter a velocidade ou reduzir para facilitar a manobra.",
    baseLegal: "Art. 29, X, b do CTB"
  },
  {
    id: 44,
    categoria: "Direção Defensiva",
    pergunta: "O estresse ao dirigir:",
    opcoes: ["Melhora os reflexos", "Prejudica a atenção", "Não afeta a direção", "É necessário"],
    respostaCorreta: 1,
    explicacao: "O estresse prejudica a concentração e pode levar a decisões impulsivas no trânsito.",
    baseLegal: "Manual DENATRAN de Direção Defensiva"
  },
  {
    id: 45,
    categoria: "Direção Defensiva",
    pergunta: "O que fazer se os freios falharem?",
    opcoes: ["Saltar do veículo", "Usar o freio de mão gradualmente e reduzir marchas", "Acelerar", "Desligar o motor imediatamente"],
    respostaCorreta: 1,
    explicacao: "Se os freios falharem, deve-se usar o freio de mão gradualmente e reduzir as marchas progressivamente.",
    baseLegal: "Manual DENATRAN de Direção Defensiva"
  },
  {
    id: 46,
    categoria: "Direção Defensiva",
    pergunta: "Qual a atitude correta em cruzamentos sem sinalização?",
    opcoes: ["Passar rapidamente", "Dar preferência a quem vem da direita", "Buzinar e passar", "Parar sempre"],
    respostaCorreta: 1,
    explicacao: "Em cruzamentos sem sinalização, a preferência é de quem vem pela direita.",
    baseLegal: "Art. 29, III, c do CTB"
  },
  {
    id: 47,
    categoria: "Direção Defensiva",
    pergunta: "O uso do celular ao dirigir:",
    opcoes: ["É permitido", "É proibido e perigoso", "É permitido com fone", "Depende da situação"],
    respostaCorreta: 1,
    explicacao: "O uso de celular ao dirigir é proibido por lei e extremamente perigoso.",
    baseLegal: "Art. 252, VI do CTB"
  },
  {
    id: 48,
    categoria: "Direção Defensiva",
    pergunta: "Em uma emergência, qual a primeira ação?",
    opcoes: ["Buzinar", "Manter a calma", "Acelerar", "Fechar os olhos"],
    respostaCorreta: 1,
    explicacao: "Em emergências, manter a calma é essencial para tomar decisões corretas.",
    baseLegal: "Manual DENATRAN de Direção Defensiva"
  },
  {
    id: 49,
    categoria: "Direção Defensiva",
    pergunta: "O que é fading dos freios?",
    opcoes: ["Freio novo", "Perda de eficiência por superaquecimento", "Tipo de freio", "Regulagem dos freios"],
    respostaCorreta: 1,
    explicacao: "Fading é a perda de eficiência dos freios devido ao superaquecimento.",
    baseLegal: "Manual DENATRAN de Direção Defensiva"
  },
  {
    id: 50,
    categoria: "Direção Defensiva",
    pergunta: "Em descidas longas, o que fazer?",
    opcoes: ["Usar só o freio", "Usar o freio motor (marchas reduzidas)", "Colocar em ponto morto", "Acelerar"],
    respostaCorreta: 1,
    explicacao: "Em descidas longas, deve-se usar o freio motor para evitar o superaquecimento dos freios.",
    baseLegal: "Manual DENATRAN de Direção Defensiva"
  },
  {
    id: 51,
    categoria: "Direção Defensiva",
    pergunta: "O que são os retrovisores internos?",
    opcoes: ["Enfeites", "Equipamentos de segurança obrigatórios", "Opcionais", "Acessórios"],
    respostaCorreta: 1,
    explicacao: "Os retrovisores são equipamentos de segurança obrigatórios que ampliam o campo de visão.",
    baseLegal: "Art. 105, I do CTB"
  },
  {
    id: 52,
    categoria: "Direção Defensiva",
    pergunta: "Qual comportamento indica direção agressiva?",
    opcoes: ["Respeitar a sinalização", "Fazer ultrapassagens forçadas", "Manter distância segura", "Usar a seta"],
    respostaCorreta: 1,
    explicacao: "Ultrapassagens forçadas são comportamentos típicos de direção agressiva.",
    baseLegal: "Manual DENATRAN de Direção Defensiva"
  },
  {
    id: 53,
    categoria: "Direção Defensiva",
    pergunta: "O que fazer ao avistar pedestres próximos à via?",
    opcoes: ["Manter velocidade", "Reduzir velocidade e ficar atento", "Buzinar para afastá-los", "Acelerar"],
    respostaCorreta: 1,
    explicacao: "Ao avistar pedestres, deve-se reduzir a velocidade e manter atenção redobrada.",
    baseLegal: "Art. 29, §2º do CTB"
  },
  {
    id: 54,
    categoria: "Direção Defensiva",
    pergunta: "O álcool afeta a direção porque:",
    opcoes: ["Melhora os reflexos", "Diminui os reflexos e o julgamento", "Não afeta", "Deixa mais atento"],
    respostaCorreta: 1,
    explicacao: "O álcool diminui os reflexos, prejudica o julgamento e a coordenação motora.",
    baseLegal: "Art. 165 do CTB"
  },
  {
    id: 55,
    categoria: "Direção Defensiva",
    pergunta: "O que é evasão?",
    opcoes: ["Fuga de blitz", "Manobra para evitar colisão", "Tipo de multa", "Estacionamento"],
    respostaCorreta: 1,
    explicacao: "Evasão é a manobra de emergência realizada para evitar uma colisão iminente.",
    baseLegal: "Manual DENATRAN de Direção Defensiva"
  },

  // PRIMEIROS SOCORROS (20 questões)
  {
    id: 56,
    categoria: "Primeiros Socorros",
    pergunta: "Qual o primeiro passo ao chegar em um acidente?",
    opcoes: ["Remover as vítimas", "Sinalizar o local e garantir segurança", "Chamar a polícia", "Fotografar"],
    respostaCorreta: 1,
    explicacao: "O primeiro passo é sinalizar o local para evitar novos acidentes e garantir a segurança.",
    baseLegal: "Art. 176 do CTB"
  },
  {
    id: 57,
    categoria: "Primeiros Socorros",
    pergunta: "Qual número do SAMU?",
    opcoes: ["190", "191", "192", "193"],
    respostaCorreta: 2,
    explicacao: "O SAMU (Serviço de Atendimento Móvel de Urgência) atende pelo 192.",
    baseLegal: "Portaria MS 1.010/2012"
  },
  {
    id: 58,
    categoria: "Primeiros Socorros",
    pergunta: "Deve-se remover o capacete de um motociclista acidentado?",
    opcoes: ["Sim, sempre", "Não, exceto se ele não estiver respirando", "Depende do horário", "Só médicos podem"],
    respostaCorreta: 1,
    explicacao: "O capacete só deve ser removido se a vítima não estiver respirando, para permitir socorro.",
    baseLegal: "Protocolo SAMU"
  },
  {
    id: 59,
    categoria: "Primeiros Socorros",
    pergunta: "O que fazer em caso de hemorragia?",
    opcoes: ["Lavar com água", "Aplicar pressão no local", "Aplicar torniquete sempre", "Não fazer nada"],
    respostaCorreta: 1,
    explicacao: "Em hemorragias, deve-se aplicar pressão direta sobre o ferimento com pano limpo.",
    baseLegal: "Protocolo SAMU"
  },
  {
    id: 60,
    categoria: "Primeiros Socorros",
    pergunta: "Qual a posição correta para vítima inconsciente que respira?",
    opcoes: ["De barriga para cima", "Posição lateral de segurança", "Sentada", "De pé"],
    respostaCorreta: 1,
    explicacao: "A posição lateral de segurança previne engasgos em vítimas inconscientes que respiram.",
    baseLegal: "Protocolo SAMU"
  },
  {
    id: 61,
    categoria: "Primeiros Socorros",
    pergunta: "O que NÃO fazer em caso de fratura?",
    opcoes: ["Imobilizar", "Tentar colocar o osso no lugar", "Chamar socorro", "Manter a vítima calma"],
    respostaCorreta: 1,
    explicacao: "Nunca se deve tentar colocar um osso fraturado no lugar. Imobilize e aguarde socorro.",
    baseLegal: "Protocolo SAMU"
  },
  {
    id: 62,
    categoria: "Primeiros Socorros",
    pergunta: "O que é PCR?",
    opcoes: ["Problema Cardíaco Regular", "Parada Cardiorrespiratória", "Pressão Cardíaca Reduzida", "Pulso Cardíaco Rápido"],
    respostaCorreta: 1,
    explicacao: "PCR significa Parada Cardiorrespiratória, situação grave que requer RCP imediata.",
    baseLegal: "Protocolo SAMU"
  },
  {
    id: 63,
    categoria: "Primeiros Socorros",
    pergunta: "Qual o número do Corpo de Bombeiros?",
    opcoes: ["190", "191", "192", "193"],
    respostaCorreta: 3,
    explicacao: "O Corpo de Bombeiros atende pelo número 193.",
    baseLegal: "Lei 10.446/02"
  },
  {
    id: 64,
    categoria: "Primeiros Socorros",
    pergunta: "Em queimaduras, o que fazer primeiro?",
    opcoes: ["Aplicar manteiga", "Resfriar com água corrente", "Estourar bolhas", "Aplicar pasta de dente"],
    respostaCorreta: 1,
    explicacao: "Em queimaduras, deve-se resfriar o local com água corrente por vários minutos.",
    baseLegal: "Protocolo SAMU"
  },
  {
    id: 65,
    categoria: "Primeiros Socorros",
    pergunta: "O que verificar primeiro em uma vítima de acidente?",
    opcoes: ["Documentos", "Se está consciente e respirando", "Se tem celular", "A marca do carro"],
    respostaCorreta: 1,
    explicacao: "O primeiro passo é verificar se a vítima está consciente e respirando.",
    baseLegal: "Protocolo SAMU"
  },
  {
    id: 66,
    categoria: "Primeiros Socorros",
    pergunta: "Em caso de engasgo, o que fazer?",
    opcoes: ["Dar água", "Aplicar a manobra de Heimlich", "Colocar deitado", "Fazer cócegas"],
    respostaCorreta: 1,
    explicacao: "A manobra de Heimlich é indicada para desobstruir as vias aéreas em engasgos.",
    baseLegal: "Protocolo SAMU"
  },
  {
    id: 67,
    categoria: "Primeiros Socorros",
    pergunta: "O que significa RCP?",
    opcoes: ["Reanimação Cardiopulmonar", "Respiração Controlada Profunda", "Recuperação Cardíaca Preventiva", "Regulação de Pressão"],
    respostaCorreta: 0,
    explicacao: "RCP é a Reanimação Cardiopulmonar, técnica de emergência para parada cardíaca.",
    baseLegal: "Protocolo SAMU"
  },
  {
    id: 68,
    categoria: "Primeiros Socorros",
    pergunta: "Deve-se movimentar uma vítima com suspeita de lesão na coluna?",
    opcoes: ["Sim, para local seguro", "Não, manter imóvel", "Depende da situação", "Sim, para verificar"],
    respostaCorreta: 1,
    explicacao: "Vítimas com suspeita de lesão na coluna não devem ser movidas, exceto em risco iminente.",
    baseLegal: "Protocolo SAMU"
  },
  {
    id: 69,
    categoria: "Primeiros Socorros",
    pergunta: "Quantas compressões torácicas por minuto na RCP?",
    opcoes: ["60", "80", "100 a 120", "150"],
    respostaCorreta: 2,
    explicacao: "A RCP deve ser feita com 100 a 120 compressões por minuto.",
    baseLegal: "American Heart Association / Protocolo SAMU"
  },
  {
    id: 70,
    categoria: "Primeiros Socorros",
    pergunta: "O que fazer se a vítima estiver em pé e desmaiar?",
    opcoes: ["Deixar cair", "Ampará-la para evitar quedas", "Sacudir", "Jogar água"],
    respostaCorreta: 1,
    explicacao: "Deve-se amparar a vítima para evitar que ela se machuque na queda.",
    baseLegal: "Protocolo SAMU"
  },
  {
    id: 71,
    categoria: "Primeiros Socorros",
    pergunta: "O que é estado de choque?",
    opcoes: ["Susto intenso", "Falha circulatória grave", "Eletricidade no corpo", "Dor forte"],
    respostaCorreta: 1,
    explicacao: "Estado de choque é uma falha circulatória grave que pode levar à morte se não tratada.",
    baseLegal: "Protocolo SAMU"
  },
  {
    id: 72,
    categoria: "Primeiros Socorros",
    pergunta: "Qual item deve estar no kit de primeiros socorros do veículo?",
    opcoes: ["Extintor", "Triângulo", "Nenhum é obrigatório", "Luvas descartáveis"],
    respostaCorreta: 2,
    explicacao: "Atualmente, kit de primeiros socorros não é mais obrigatório em veículos particulares.",
    baseLegal: "Resolução CONTRAN 36/98 (revogada)"
  },
  {
    id: 73,
    categoria: "Primeiros Socorros",
    pergunta: "O que fazer em caso de convulsão?",
    opcoes: ["Segurar a língua", "Proteger a cabeça e afastar objetos", "Dar água", "Sacudir a pessoa"],
    respostaCorreta: 1,
    explicacao: "Em convulsões, deve-se proteger a cabeça da vítima e afastar objetos que possam machucar.",
    baseLegal: "Protocolo SAMU"
  },
  {
    id: 74,
    categoria: "Primeiros Socorros",
    pergunta: "Qual número da Polícia Militar?",
    opcoes: ["190", "191", "192", "193"],
    respostaCorreta: 0,
    explicacao: "A Polícia Militar atende pelo número 190.",
    baseLegal: "Lei 10.446/02"
  },
  {
    id: 75,
    categoria: "Primeiros Socorros",
    pergunta: "Em caso de afogamento, o que fazer primeiro?",
    opcoes: ["Dar água", "Retirar a pessoa da água com segurança", "Esperar ela sair sozinha", "Pular na água imediatamente"],
    respostaCorreta: 1,
    explicacao: "Deve-se retirar a pessoa da água com segurança, sem se colocar em risco.",
    baseLegal: "Protocolo SAMU"
  },

  // SINALIZAÇÃO DE TRÂNSITO (25 questões)
  {
    id: 76,
    categoria: "Sinalização de Trânsito",
    pergunta: "O que indica a placa circular vermelha com fundo branco?",
    opcoes: ["Advertência", "Regulamentação", "Indicação", "Obras"],
    respostaCorreta: 1,
    explicacao: "Placas circulares vermelhas com fundo branco são de regulamentação (proibição ou restrição).",
    baseLegal: "Anexo II do CTB"
  },
  {
    id: 77,
    categoria: "Sinalização de Trânsito",
    pergunta: "Qual a cor predominante das placas de advertência?",
    opcoes: ["Vermelha", "Amarela", "Verde", "Azul"],
    respostaCorreta: 1,
    explicacao: "Placas de advertência têm fundo amarelo e formato de losango.",
    baseLegal: "Anexo II do CTB"
  },
  {
    id: 78,
    categoria: "Sinalização de Trânsito",
    pergunta: "O que significa a faixa contínua amarela no centro da pista?",
    opcoes: ["Pode ultrapassar", "Proibido ultrapassar", "Estacionamento", "Área escolar"],
    respostaCorreta: 1,
    explicacao: "Faixa contínua amarela indica proibição de ultrapassagem.",
    baseLegal: "Anexo II do CTB"
  },
  {
    id: 79,
    categoria: "Sinalização de Trânsito",
    pergunta: "Qual a ordem de prioridade no trânsito?",
    opcoes: ["Sinalização, agente, regra geral", "Agente, sinalização, regra geral", "Regra geral, sinalização, agente", "Não há ordem"],
    respostaCorreta: 1,
    explicacao: "A ordem de prioridade é: agente de trânsito, sinalização e regras gerais.",
    baseLegal: "Art. 88 do CTB"
  },
  {
    id: 80,
    categoria: "Sinalização de Trânsito",
    pergunta: "O que indica a placa R-1 (PARE)?",
    opcoes: ["Reduza a velocidade", "Parada obrigatória", "Dê preferência", "Proibido parar"],
    respostaCorreta: 1,
    explicacao: "A placa R-1 indica parada obrigatória antes de entrar na via preferencial.",
    baseLegal: "Anexo II do CTB"
  },
  {
    id: 81,
    categoria: "Sinalização de Trânsito",
    pergunta: "As placas de indicação são de qual cor?",
    opcoes: ["Amarela", "Vermelha", "Verde ou azul", "Branca"],
    respostaCorreta: 2,
    explicacao: "Placas de indicação são verdes (destinos) ou azuis (serviços e atrativos turísticos).",
    baseLegal: "Anexo II do CTB"
  },
  {
    id: 82,
    categoria: "Sinalização de Trânsito",
    pergunta: "O que significa semáforo amarelo?",
    opcoes: ["Avance", "Pare", "Atenção, semáforo vai fechar", "Preferência"],
    respostaCorreta: 2,
    explicacao: "O amarelo indica atenção: o semáforo vai mudar para vermelho.",
    baseLegal: "Art. 41, §1º do CTB"
  },
  {
    id: 83,
    categoria: "Sinalização de Trânsito",
    pergunta: "Qual placa indica velocidade máxima permitida?",
    opcoes: ["Triangular amarela", "Circular vermelha com número", "Quadrada verde", "Octogonal vermelha"],
    respostaCorreta: 1,
    explicacao: "A placa de velocidade máxima é circular, com borda vermelha e número no centro.",
    baseLegal: "Anexo II do CTB"
  },
  {
    id: 84,
    categoria: "Sinalização de Trânsito",
    pergunta: "O que indica a faixa tracejada branca?",
    opcoes: ["Proibido mudar de faixa", "Permitido mudar de faixa", "Área de estacionamento", "Pista exclusiva de ônibus"],
    respostaCorreta: 1,
    explicacao: "Faixa tracejada branca indica que é permitido mudar de faixa.",
    baseLegal: "Anexo II do CTB"
  },
  {
    id: 85,
    categoria: "Sinalização de Trânsito",
    pergunta: "Qual o formato das placas de advertência?",
    opcoes: ["Circular", "Quadrado", "Losango", "Triangular"],
    respostaCorreta: 2,
    explicacao: "Placas de advertência têm formato de losango (quadrado apoiado em um vértice).",
    baseLegal: "Anexo II do CTB"
  },
  {
    id: 86,
    categoria: "Sinalização de Trânsito",
    pergunta: "O que indica a placa 'Dê a preferência'?",
    opcoes: ["Pare obrigatoriamente", "Reduza e dê passagem se necessário", "Velocidade máxima", "Área escolar"],
    respostaCorreta: 1,
    explicacao: "A placa indica que o condutor deve reduzir a velocidade e dar preferência.",
    baseLegal: "Anexo II do CTB"
  },
  {
    id: 87,
    categoria: "Sinalização de Trânsito",
    pergunta: "Placas com fundo laranja indicam:",
    opcoes: ["Serviços", "Obras", "Escolas", "Hospitais"],
    respostaCorreta: 1,
    explicacao: "Placas com fundo laranja indicam obras ou serviços temporários na via.",
    baseLegal: "Anexo II do CTB"
  },
  {
    id: 88,
    categoria: "Sinalização de Trânsito",
    pergunta: "O que significa a faixa de pedestres?",
    opcoes: ["Preferência para veículos", "Preferência para pedestres", "Proibido pedestres", "Estacionamento"],
    respostaCorreta: 1,
    explicacao: "A faixa de pedestres indica preferência de travessia para pedestres.",
    baseLegal: "Art. 70 do CTB"
  },
  {
    id: 89,
    categoria: "Sinalização de Trânsito",
    pergunta: "Qual placa indica 'proibido estacionar'?",
    opcoes: ["Círculo vermelho com E cortado", "Triângulo amarelo", "Quadrado azul", "Retângulo verde"],
    respostaCorreta: 0,
    explicacao: "A placa de proibido estacionar é circular com a letra E e uma barra diagonal.",
    baseLegal: "Anexo II do CTB"
  },
  {
    id: 90,
    categoria: "Sinalização de Trânsito",
    pergunta: "O que indica a pintura amarela no meio-fio?",
    opcoes: ["Estacionamento livre", "Proibido estacionar", "Ponto de ônibus", "Área de carga/descarga"],
    respostaCorreta: 1,
    explicacao: "Meio-fio pintado de amarelo indica proibição de estacionamento.",
    baseLegal: "Anexo II do CTB"
  },
  {
    id: 91,
    categoria: "Sinalização de Trânsito",
    pergunta: "Qual o significado da placa triangular amarela com 'X'?",
    opcoes: ["Cruzamento", "Passagem de nível (ferrovia)", "Interseção", "Área de risco"],
    respostaCorreta: 1,
    explicacao: "A placa com 'X' adverte sobre cruzamento com linha férrea (passagem de nível).",
    baseLegal: "Anexo II do CTB"
  },
  {
    id: 92,
    categoria: "Sinalização de Trânsito",
    pergunta: "O que significa a seta verde no semáforo?",
    opcoes: ["Apenas siga em frente", "Pode seguir na direção indicada", "Pare", "Atenção"],
    respostaCorreta: 1,
    explicacao: "A seta verde indica que o veículo pode seguir apenas na direção apontada pela seta.",
    baseLegal: "Art. 41 do CTB"
  },
  {
    id: 93,
    categoria: "Sinalização de Trânsito",
    pergunta: "Placas azuis com pictogramas indicam:",
    opcoes: ["Advertência", "Regulamentação", "Serviços auxiliares", "Obras"],
    respostaCorreta: 2,
    explicacao: "Placas azuis indicam serviços auxiliares como postos, hospitais, restaurantes.",
    baseLegal: "Anexo II do CTB"
  },
  {
    id: 94,
    categoria: "Sinalização de Trânsito",
    pergunta: "O que indica a linha de retenção (faixa branca larga)?",
    opcoes: ["Onde parar antes do cruzamento", "Faixa de pedestres", "Início da via", "Estacionamento"],
    respostaCorreta: 0,
    explicacao: "A linha de retenção indica onde o veículo deve parar antes de cruzamentos.",
    baseLegal: "Anexo II do CTB"
  },
  {
    id: 95,
    categoria: "Sinalização de Trânsito",
    pergunta: "Qual placa indica 'mão única'?",
    opcoes: ["Seta para cima em fundo azul", "Círculo vermelho", "Triângulo amarelo", "Losango laranja"],
    respostaCorreta: 0,
    explicacao: "A placa de sentido único é retangular azul com seta branca indicando a direção.",
    baseLegal: "Anexo II do CTB"
  },
  {
    id: 96,
    categoria: "Sinalização de Trânsito",
    pergunta: "Qual a cor da sinalização horizontal de estacionamento regulamentado?",
    opcoes: ["Amarela", "Branca", "Azul", "Vermelha"],
    respostaCorreta: 2,
    explicacao: "A cor azul indica áreas de estacionamento regulamentado (zona azul).",
    baseLegal: "Anexo II do CTB"
  },
  {
    id: 97,
    categoria: "Sinalização de Trânsito",
    pergunta: "O que indica a placa 'área de pedestres'?",
    opcoes: ["Proibido pedestres", "Via preferencial para pedestres", "Proibido veículos", "Faixa de pedestres adiante"],
    respostaCorreta: 1,
    explicacao: "A placa indica área com preferência para circulação de pedestres.",
    baseLegal: "Anexo II do CTB"
  },
  {
    id: 98,
    categoria: "Sinalização de Trânsito",
    pergunta: "Tachas refletivas amarelas indicam:",
    opcoes: ["Divisão de fluxos opostos", "Divisão de mesmo sentido", "Área de estacionamento", "Lombada"],
    respostaCorreta: 0,
    explicacao: "Tachas amarelas indicam divisão de fluxos opostos (não ultrapassar).",
    baseLegal: "Anexo II do CTB"
  },
  {
    id: 99,
    categoria: "Sinalização de Trânsito",
    pergunta: "Qual placa indica 'curva acentuada à esquerda'?",
    opcoes: ["Circular vermelha", "Losango amarelo com seta curva", "Quadrada azul", "Retângulo verde"],
    respostaCorreta: 1,
    explicacao: "Placas de advertência de curvas são losangos amarelos com representação da curva.",
    baseLegal: "Anexo II do CTB"
  },
  {
    id: 100,
    categoria: "Sinalização de Trânsito",
    pergunta: "O que significa piscar a luz alta para outro veículo?",
    opcoes: ["Saudação", "Há fiscalização à frente", "Cedendo passagem ou alertando", "Pressa"],
    respostaCorreta: 2,
    explicacao: "Piscar faróis pode indicar que está cedendo passagem ou alertando sobre algo.",
    baseLegal: "Art. 42 do CTB"
  },

  // MEIO AMBIENTE (15 questões)
  {
    id: 101,
    categoria: "Meio Ambiente e Cidadania",
    pergunta: "A fumaça preta emitida por veículos indica:",
    opcoes: ["Motor em boas condições", "Queima incompleta de combustível", "Uso de gasolina premium", "Troca de óleo recente"],
    respostaCorreta: 1,
    explicacao: "Fumaça preta indica queima incompleta de combustível, poluindo o ambiente.",
    baseLegal: "Resolução CONAMA 418/09"
  },
  {
    id: 102,
    categoria: "Meio Ambiente e Cidadania",
    pergunta: "O que é CONAMA?",
    opcoes: ["Conselho Nacional do Meio Ambiente", "Controle de Automóveis", "Congresso de Motoristas", "Confederação de Autoescolas"],
    respostaCorreta: 0,
    explicacao: "CONAMA é o Conselho Nacional do Meio Ambiente, que define padrões de emissões.",
    baseLegal: "Lei 6.938/81"
  },
  {
    id: 103,
    categoria: "Meio Ambiente e Cidadania",
    pergunta: "Qual o principal poluente emitido por veículos?",
    opcoes: ["Oxigênio", "Dióxido de carbono (CO2)", "Nitrogênio", "Hélio"],
    respostaCorreta: 1,
    explicacao: "Veículos emitem principalmente CO2, contribuindo para o efeito estufa.",
    baseLegal: "Resolução CONAMA 418/09"
  },
  {
    id: 104,
    categoria: "Meio Ambiente e Cidadania",
    pergunta: "O que é inspeção veicular?",
    opcoes: ["Lavagem do carro", "Verificação de emissões e segurança", "Troca de óleo", "Pintura"],
    respostaCorreta: 1,
    explicacao: "Inspeção veicular verifica se o veículo atende padrões de emissões e segurança.",
    baseLegal: "Resolução CONAMA 418/09"
  },
  {
    id: 105,
    categoria: "Meio Ambiente e Cidadania",
    pergunta: "Qual atitude reduz a poluição no trânsito?",
    opcoes: ["Acelerar bruscamente", "Manter o veículo regulado", "Usar pneus carecas", "Andar sempre em marcha lenta"],
    respostaCorreta: 1,
    explicacao: "Manter o veículo regulado reduz emissões e consumo de combustível.",
    baseLegal: "Resolução CONAMA 418/09"
  },
  {
    id: 106,
    categoria: "Meio Ambiente e Cidadania",
    pergunta: "O catalisador do veículo serve para:",
    opcoes: ["Aumentar a potência", "Reduzir gases poluentes", "Economizar combustível", "Melhorar o som"],
    respostaCorreta: 1,
    explicacao: "O catalisador transforma gases nocivos em menos poluentes antes de serem liberados.",
    baseLegal: "Resolução CONAMA 315/02"
  },
  {
    id: 107,
    categoria: "Meio Ambiente e Cidadania",
    pergunta: "Jogar lixo pela janela do veículo é:",
    opcoes: ["Permitido em rodovias", "Proibido e passível de multa", "Permitido se for orgânico", "Normal"],
    respostaCorreta: 1,
    explicacao: "Jogar lixo na via é infração média, além de crime ambiental.",
    baseLegal: "Art. 172 do CTB"
  },
  {
    id: 108,
    categoria: "Meio Ambiente e Cidadania",
    pergunta: "O que é direção econômica?",
    opcoes: ["Dirigir devagar", "Técnicas para economizar combustível", "Usar carro popular", "Não usar ar-condicionado"],
    respostaCorreta: 1,
    explicacao: "Direção econômica são técnicas que reduzem consumo de combustível e emissões.",
    baseLegal: "Manual DENATRAN de Direção Defensiva"
  },
  {
    id: 109,
    categoria: "Meio Ambiente e Cidadania",
    pergunta: "O escapamento furado aumenta:",
    opcoes: ["A potência", "A poluição sonora e do ar", "A economia", "A segurança"],
    respostaCorreta: 1,
    explicacao: "Escapamento furado aumenta ruído e emissões de gases poluentes.",
    baseLegal: "Art. 230, XI do CTB"
  },
  {
    id: 110,
    categoria: "Meio Ambiente e Cidadania",
    pergunta: "Qual combustível é considerado mais limpo?",
    opcoes: ["Gasolina", "Diesel", "Etanol", "GNV e elétrico"],
    respostaCorreta: 3,
    explicacao: "GNV e veículos elétricos são considerados mais limpos em termos de emissões.",
    baseLegal: "Resolução CONAMA 418/09"
  },
  {
    id: 111,
    categoria: "Meio Ambiente e Cidadania",
    pergunta: "Pneus em mau estado aumentam:",
    opcoes: ["A aderência", "O consumo de combustível", "A segurança", "A economia"],
    respostaCorreta: 1,
    explicacao: "Pneus desgastados ou com pressão errada aumentam o consumo de combustível.",
    baseLegal: "Manual DENATRAN"
  },
  {
    id: 112,
    categoria: "Meio Ambiente e Cidadania",
    pergunta: "Calibrar os pneus corretamente ajuda a:",
    opcoes: ["Aumentar o barulho", "Economizar combustível", "Desgastar mais rápido", "Poluir mais"],
    respostaCorreta: 1,
    explicacao: "Pneus calibrados corretamente reduzem o consumo de combustível.",
    baseLegal: "Manual DENATRAN"
  },
  {
    id: 113,
    categoria: "Meio Ambiente e Cidadania",
    pergunta: "O uso de transporte coletivo:",
    opcoes: ["Aumenta a poluição", "Reduz congestionamentos e poluição", "É mais poluente", "Não faz diferença"],
    respostaCorreta: 1,
    explicacao: "O transporte coletivo reduz o número de veículos, diminuindo poluição e congestionamentos.",
    baseLegal: "Política Nacional de Mobilidade Urbana"
  },
  {
    id: 114,
    categoria: "Meio Ambiente e Cidadania",
    pergunta: "O que é mobilidade urbana sustentável?",
    opcoes: ["Usar apenas carros", "Integração de transportes com menos impacto ambiental", "Andar só de moto", "Não usar transporte"],
    respostaCorreta: 1,
    explicacao: "Mobilidade sustentável integra diversos modais reduzindo impacto ambiental.",
    baseLegal: "Lei 12.587/12"
  },
  {
    id: 115,
    categoria: "Meio Ambiente e Cidadania",
    pergunta: "Buzinar excessivamente causa:",
    opcoes: ["Nada", "Poluição sonora", "Melhora do trânsito", "Economia de combustível"],
    respostaCorreta: 1,
    explicacao: "Buzinas excessivas causam poluição sonora, prejudicando a saúde e o bem-estar.",
    baseLegal: "Art. 227 do CTB"
  },

  // MECÂNICA BÁSICA (15 questões)
  {
    id: 116,
    categoria: "Mecânica Básica",
    pergunta: "Qual o nível correto do óleo do motor?",
    opcoes: ["Abaixo do mínimo", "Entre o mínimo e o máximo", "Acima do máximo", "Não importa"],
    respostaCorreta: 1,
    explicacao: "O óleo deve estar entre as marcas de mínimo e máximo na vareta.",
    baseLegal: "Manual do Proprietário / Normas ABNT"
  },
  {
    id: 117,
    categoria: "Mecânica Básica",
    pergunta: "Qual a função do radiador?",
    opcoes: ["Aquecer o motor", "Resfriar o motor", "Gerar eletricidade", "Aumentar a potência"],
    respostaCorreta: 1,
    explicacao: "O radiador resfria a água que circula pelo motor, evitando superaquecimento.",
    baseLegal: "Manual do Proprietário"
  },
  {
    id: 118,
    categoria: "Mecânica Básica",
    pergunta: "O que indica a luz de óleo acesa no painel?",
    opcoes: ["Troque o óleo", "Pressão de óleo baixa - problema grave", "Motor novo", "Economia de combustível"],
    respostaCorreta: 1,
    explicacao: "Luz de óleo acesa indica baixa pressão no sistema, problema grave que pode danificar o motor.",
    baseLegal: "Manual do Proprietário"
  },
  {
    id: 119,
    categoria: "Mecânica Básica",
    pergunta: "Quando verificar a pressão dos pneus?",
    opcoes: ["Com pneus quentes", "Com pneus frios", "Apenas quando furar", "Nunca"],
    respostaCorreta: 1,
    explicacao: "A pressão deve ser verificada com pneus frios para leitura correta.",
    baseLegal: "Normas INMETRO"
  },
  {
    id: 120,
    categoria: "Mecânica Básica",
    pergunta: "Qual a função da bateria?",
    opcoes: ["Resfriar o motor", "Fornecer energia elétrica", "Lubrificar", "Aquecer o motor"],
    respostaCorreta: 1,
    explicacao: "A bateria fornece energia para dar partida e alimentar sistemas elétricos.",
    baseLegal: "Manual do Proprietário"
  },
  {
    id: 121,
    categoria: "Mecânica Básica",
    pergunta: "TWI nos pneus indica:",
    opcoes: ["Marca do fabricante", "Indicador de desgaste", "Pressão máxima", "Ano de fabricação"],
    respostaCorreta: 1,
    explicacao: "TWI (Tread Wear Indicator) é o indicador de desgaste do pneu.",
    baseLegal: "Normas INMETRO"
  },
  {
    id: 122,
    categoria: "Mecânica Básica",
    pergunta: "O que verificar antes de viajar?",
    opcoes: ["Apenas combustível", "Pneus, óleo, água, freios e luzes", "Apenas documentos", "Nada"],
    respostaCorreta: 1,
    explicacao: "Antes de viajar, verifique pneus, fluidos, freios, luzes e documentos.",
    baseLegal: "Art. 103 do CTB"
  },
  {
    id: 123,
    categoria: "Mecânica Básica",
    pergunta: "Qual a função do extintor de incêndio no veículo?",
    opcoes: ["Decoração", "Combater princípios de incêndio", "Obrigatório apenas para caminhões", "Não tem função"],
    respostaCorreta: 1,
    explicacao: "O extintor serve para combater princípios de incêndio no veículo.",
    baseLegal: "Art. 105, VII do CTB"
  },
  {
    id: 124,
    categoria: "Mecânica Básica",
    pergunta: "O freio ABS serve para:",
    opcoes: ["Frear mais rápido", "Evitar travamento das rodas na frenagem", "Aumentar a velocidade", "Economizar combustível"],
    respostaCorreta: 1,
    explicacao: "O ABS evita o travamento das rodas, mantendo o controle da direção na frenagem.",
    baseLegal: "Resolução CONTRAN 312/09"
  },
  {
    id: 125,
    categoria: "Mecânica Básica",
    pergunta: "Qual fluido deve ser verificado no sistema de freios?",
    opcoes: ["Água", "Fluido de freio", "Gasolina", "Óleo de motor"],
    respostaCorreta: 1,
    explicacao: "O fluido de freio deve ser verificado regularmente e trocado conforme o manual.",
    baseLegal: "Manual do Proprietário"
  },
  {
    id: 126,
    categoria: "Mecânica Básica",
    pergunta: "O filtro de ar sujo causa:",
    opcoes: ["Economia", "Aumento de consumo e perda de potência", "Mais potência", "Nada"],
    respostaCorreta: 1,
    explicacao: "Filtro de ar sujo dificulta a entrada de ar, aumentando consumo e reduzindo potência.",
    baseLegal: "Manual do Proprietário"
  },
  {
    id: 127,
    categoria: "Mecânica Básica",
    pergunta: "Qual a função do amortecedor?",
    opcoes: ["Aumentar velocidade", "Absorver impactos e manter estabilidade", "Gerar eletricidade", "Economizar combustível"],
    respostaCorreta: 1,
    explicacao: "O amortecedor absorve impactos e mantém o contato dos pneus com o solo.",
    baseLegal: "Manual do Proprietário"
  },
  {
    id: 128,
    categoria: "Mecânica Básica",
    pergunta: "O que indica fumaça branca excessiva no escapamento?",
    opcoes: ["Motor em boas condições", "Possível problema com junta do cabeçote", "Falta de gasolina", "Normal no frio"],
    respostaCorreta: 1,
    explicacao: "Fumaça branca excessiva pode indicar problema na junta do cabeçote (água no motor).",
    baseLegal: "Manual do Proprietário"
  },
  {
    id: 129,
    categoria: "Mecânica Básica",
    pergunta: "Qual a função das velas de ignição?",
    opcoes: ["Iluminar o motor", "Produzir faísca para queima do combustível", "Resfriar", "Lubrificar"],
    respostaCorreta: 1,
    explicacao: "As velas produzem a faísca que inicia a combustão do combustível no motor.",
    baseLegal: "Manual do Proprietário"
  },
  {
    id: 130,
    categoria: "Mecânica Básica",
    pergunta: "O sistema de direção hidráulica funciona com:",
    opcoes: ["Água", "Fluido específico de direção", "Gasolina", "Óleo de motor"],
    respostaCorreta: 1,
    explicacao: "A direção hidráulica usa fluido específico que deve ser verificado periodicamente.",
    baseLegal: "Manual do Proprietário"
  }
];

// Função para selecionar questões aleatórias para o simulado
// Distribuição oficial DETRAN: 30 questões conforme padrão CNH360
export function selecionarQuestoesAleatorias(quantidade: number = 30): QuestaoSimulado[] {
  const categorias = [
    { nome: "Legislação de Trânsito", quantidade: 10 },      // +1 (era 9)
    { nome: "Direção Defensiva", quantidade: 7 },            // -1 (era 8)
    { nome: "Primeiros Socorros", quantidade: 3 },           // -2 (era 5)
    { nome: "Sinalização de Trânsito", quantidade: 6 },      // +1 (era 5)
    { nome: "Meio Ambiente e Cidadania", quantidade: 4 }     // +2 (era 2), Mecânica removida
  ];

  const questoesSelecionadas: QuestaoSimulado[] = [];

  categorias.forEach(cat => {
    const questoesCategoria = questoesSimulado.filter(q => q.categoria === cat.nome);
    const shuffled = [...questoesCategoria].sort(() => Math.random() - 0.5);
    questoesSelecionadas.push(...shuffled.slice(0, cat.quantidade));
  });

  // Embaralhar todas as questões selecionadas
  return questoesSelecionadas.sort(() => Math.random() - 0.5);
}
