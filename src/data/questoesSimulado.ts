export interface QuestaoSimulado {
  id: number;
  categoria: string;
  pergunta: string;
  opcoes: string[];
  respostaCorreta: number;
  explicacao: string;
  baseLegal?: string;
  dificuldade: 'facil' | 'media' | 'dificil';
}

export const questoesSimulado: QuestaoSimulado[] = [
  // =====================================
  // LEGISLAÇÃO DE TRÂNSITO (60 questões)
  // =====================================
  
  // Questões Fáceis (24)
  {
    id: 1,
    categoria: "Legislação de Trânsito",
    pergunta: "Qual é a velocidade máxima permitida em vias locais urbanas?",
    opcoes: ["30 km/h", "40 km/h", "60 km/h", "80 km/h"],
    respostaCorreta: 0,
    explicacao: "Em vias locais urbanas, a velocidade máxima permitida é de 30 km/h, salvo sinalização em contrário.",
    baseLegal: "Art. 61, I, b do CTB",
    dificuldade: "facil"
  },
  {
    id: 2,
    categoria: "Legislação de Trânsito",
    pergunta: "O que significa CNH?",
    opcoes: ["Carteira Nacional de Habilitação", "Certificado Nacional de Habilitação", "Código Nacional de Habilitação", "Controle Nacional de Habilitação"],
    respostaCorreta: 0,
    explicacao: "CNH significa Carteira Nacional de Habilitação, documento que autoriza o cidadão a conduzir veículos.",
    baseLegal: "Art. 140 do CTB | Resolução CONTRAN 1.020/2025",
    dificuldade: "facil"
  },
  {
    id: 3,
    categoria: "Legislação de Trânsito",
    pergunta: "Qual a penalidade para dirigir sob efeito de álcool?",
    opcoes: ["Multa leve", "Multa média", "Multa grave", "Multa gravíssima com suspensão do direito de dirigir"],
    respostaCorreta: 3,
    explicacao: "Dirigir sob influência de álcool é infração gravíssima, com multa multiplicada por 10 e suspensão do direito de dirigir.",
    baseLegal: "Art. 165 do CTB",
    dificuldade: "facil"
  },
  {
    id: 4,
    categoria: "Legislação de Trânsito",
    pergunta: "Quantos pontos na CNH levam à suspensão do direito de dirigir?",
    opcoes: ["10 pontos", "15 pontos", "20 pontos", "40 pontos"],
    respostaCorreta: 2,
    explicacao: "O condutor que atingir 20 pontos em 12 meses terá sua CNH suspensa, conforme o CTB.",
    baseLegal: "Art. 261, §1º do CTB",
    dificuldade: "facil"
  },
  {
    id: 5,
    categoria: "Legislação de Trânsito",
    pergunta: "Qual a idade mínima para obter a CNH categoria B?",
    opcoes: ["16 anos", "18 anos", "21 anos", "25 anos"],
    respostaCorreta: 1,
    explicacao: "A idade mínima para obter a CNH é 18 anos completos.",
    baseLegal: "Art. 140, I do CTB",
    dificuldade: "facil"
  },
  {
    id: 6,
    categoria: "Legislação de Trânsito",
    pergunta: "O que é PPD?",
    opcoes: ["Permissão Provisória para Dirigir", "Primeiro Passo para Dirigir", "Programa de Prática de Direção", "Permissão Permanente de Direção"],
    respostaCorreta: 0,
    explicacao: "PPD é a Permissão Provisória para Dirigir, válida por 12 meses.",
    baseLegal: "Art. 148, §3º do CTB | Resolução CONTRAN 1.020/2025",
    dificuldade: "facil"
  },
  {
    id: 7,
    categoria: "Legislação de Trânsito",
    pergunta: "Qual documento é obrigatório portar ao dirigir?",
    opcoes: ["Apenas RG", "Apenas CNH", "CNH e documento do veículo", "Apenas comprovante de residência"],
    respostaCorreta: 2,
    explicacao: "O condutor deve portar a CNH e o CRLV (documento do veículo) ou documento digital equivalente.",
    baseLegal: "Art. 159 do CTB",
    dificuldade: "facil"
  },
  {
    id: 8,
    categoria: "Legislação de Trânsito",
    pergunta: "Qual a velocidade máxima em rodovias de pista dupla?",
    opcoes: ["80 km/h", "100 km/h", "110 km/h", "120 km/h"],
    respostaCorreta: 2,
    explicacao: "A velocidade máxima em rodovias de pista dupla é de 110 km/h para automóveis e camionetas.",
    baseLegal: "Art. 61, I, a do CTB",
    dificuldade: "facil"
  },
  {
    id: 9,
    categoria: "Legislação de Trânsito",
    pergunta: "O uso do cinto de segurança é obrigatório para:",
    opcoes: ["Apenas o motorista", "Motorista e passageiro da frente", "Todos os ocupantes do veículo", "Apenas em rodovias"],
    respostaCorreta: 2,
    explicacao: "O uso do cinto de segurança é obrigatório para todos os ocupantes do veículo.",
    baseLegal: "Art. 65 do CTB",
    dificuldade: "facil"
  },
  {
    id: 10,
    categoria: "Legislação de Trânsito",
    pergunta: "O que significa RENACH?",
    opcoes: ["Registro Nacional de Carteiras de Habilitação", "Rede Nacional de Condutores Habilitados", "Regulamento Nacional de Habilitação", "Registro de Novos Condutores"],
    respostaCorreta: 0,
    explicacao: "RENACH é o Registro Nacional de Carteiras de Habilitação.",
    baseLegal: "Resolução CONTRAN 168/04",
    dificuldade: "facil"
  },
  {
    id: 11,
    categoria: "Legislação de Trânsito",
    pergunta: "O que é infração de trânsito?",
    opcoes: ["Qualquer ato do condutor", "Inobservância de norma do CTB", "Apenas acidentes", "Dirigir devagar"],
    respostaCorreta: 1,
    explicacao: "Infração de trânsito é a inobservância de qualquer preceito do CTB ou legislação complementar.",
    baseLegal: "Art. 161 do CTB",
    dificuldade: "facil"
  },
  {
    id: 12,
    categoria: "Legislação de Trânsito",
    pergunta: "É obrigatório usar farol baixo durante o dia em rodovias?",
    opcoes: ["Sim, sempre", "Não, nunca", "Apenas com neblina", "Apenas à noite"],
    respostaCorreta: 0,
    explicacao: "O uso do farol baixo é obrigatório em rodovias, mesmo durante o dia.",
    baseLegal: "Art. 40 do CTB",
    dificuldade: "facil"
  },
  {
    id: 13,
    categoria: "Legislação de Trânsito",
    pergunta: "Qual a velocidade máxima em vias arteriais?",
    opcoes: ["40 km/h", "50 km/h", "60 km/h", "80 km/h"],
    respostaCorreta: 2,
    explicacao: "A velocidade máxima em vias arteriais é de 60 km/h, salvo sinalização.",
    baseLegal: "Art. 61, I, c do CTB",
    dificuldade: "facil"
  },
  {
    id: 14,
    categoria: "Legislação de Trânsito",
    pergunta: "O que é DPVAT?",
    opcoes: ["Seguro obrigatório", "Imposto veicular", "Taxa de licenciamento", "Multa de trânsito"],
    respostaCorreta: 0,
    explicacao: "DPVAT era o seguro obrigatório de danos pessoais causados por veículos automotores.",
    baseLegal: "Lei 6.194/74",
    dificuldade: "facil"
  },
  {
    id: 15,
    categoria: "Legislação de Trânsito",
    pergunta: "Crianças menores de 10 anos devem ocupar qual posição no veículo?",
    opcoes: ["Banco da frente", "Banco traseiro", "Qualquer banco", "No colo de adulto"],
    respostaCorreta: 1,
    explicacao: "Crianças menores de 10 anos devem ser transportadas no banco traseiro, em dispositivo adequado.",
    baseLegal: "Art. 64 do CTB",
    dificuldade: "facil"
  },
  {
    id: 16,
    categoria: "Legislação de Trânsito",
    pergunta: "É permitido dirigir utilizando fones de ouvido?",
    opcoes: ["Sim, sempre", "Não, é proibido", "Apenas em um ouvido", "Apenas mãos livres"],
    respostaCorreta: 1,
    explicacao: "É proibido dirigir usando fones de ouvido conectados a aparelho sonoro.",
    baseLegal: "Art. 252, VI do CTB",
    dificuldade: "facil"
  },
  {
    id: 17,
    categoria: "Legislação de Trânsito",
    pergunta: "Qual categoria de CNH permite dirigir motocicletas?",
    opcoes: ["Categoria A", "Categoria B", "Categoria C", "Categoria D"],
    respostaCorreta: 0,
    explicacao: "A categoria A da CNH habilita o condutor a dirigir motocicletas.",
    baseLegal: "Art. 143, I do CTB",
    dificuldade: "facil"
  },
  {
    id: 18,
    categoria: "Legislação de Trânsito",
    pergunta: "O que significa a sigla CTB?",
    opcoes: ["Código de Trânsito Brasileiro", "Controle de Tráfego Brasileiro", "Central de Trânsito do Brasil", "Código Total Brasileiro"],
    respostaCorreta: 0,
    explicacao: "CTB significa Código de Trânsito Brasileiro, a lei que regulamenta o trânsito no país.",
    baseLegal: "Lei 9.503/97",
    dificuldade: "facil"
  },
  {
    id: 19,
    categoria: "Legislação de Trânsito",
    pergunta: "É obrigatório acionar a seta ao mudar de faixa?",
    opcoes: ["Não", "Apenas em rodovias", "Sim, sempre", "Apenas com trânsito intenso"],
    respostaCorreta: 2,
    explicacao: "O uso da seta é obrigatório sempre que houver mudança de direção ou faixa.",
    baseLegal: "Art. 35 do CTB",
    dificuldade: "facil"
  },
  {
    id: 20,
    categoria: "Legislação de Trânsito",
    pergunta: "Quem tem prioridade em uma rotatória?",
    opcoes: ["Quem está entrando", "Quem já está circulando", "Veículos maiores", "Ninguém"],
    respostaCorreta: 1,
    explicacao: "Quem já está circulando na rotatória tem preferência de passagem.",
    baseLegal: "Art. 29, III do CTB",
    dificuldade: "facil"
  },
  {
    id: 21,
    categoria: "Legislação de Trânsito",
    pergunta: "Qual a velocidade máxima em vias coletoras?",
    opcoes: ["30 km/h", "40 km/h", "50 km/h", "60 km/h"],
    respostaCorreta: 1,
    explicacao: "A velocidade máxima em vias coletoras é de 40 km/h, salvo sinalização em contrário.",
    baseLegal: "Art. 61, I, d do CTB",
    dificuldade: "facil"
  },
  {
    id: 22,
    categoria: "Legislação de Trânsito",
    pergunta: "O CRLV é o documento que comprova:",
    opcoes: ["Habilitação do condutor", "Licenciamento anual do veículo", "Seguro obrigatório", "Pagamento de multas"],
    respostaCorreta: 1,
    explicacao: "O CRLV (Certificado de Registro e Licenciamento de Veículo) comprova o licenciamento anual.",
    baseLegal: "Art. 130 do CTB",
    dificuldade: "facil"
  },
  {
    id: 23,
    categoria: "Legislação de Trânsito",
    pergunta: "Qual categoria de CNH permite dirigir automóveis?",
    opcoes: ["Categoria A", "Categoria B", "Categoria C", "Categoria E"],
    respostaCorreta: 1,
    explicacao: "A categoria B permite dirigir veículos de 4 rodas até 3.500 kg e 8 passageiros.",
    baseLegal: "Art. 143, II do CTB",
    dificuldade: "facil"
  },
  {
    id: 24,
    categoria: "Legislação de Trânsito",
    pergunta: "O que é o RENAVAM?",
    opcoes: ["Registro Nacional de Veículos Automotores", "Registro Nacional de Habilitação", "Rede Nacional de Veículos", "Regulamento Nacional Automotivo"],
    respostaCorreta: 0,
    explicacao: "RENAVAM é o Registro Nacional de Veículos Automotores, código identificador único de cada veículo.",
    baseLegal: "Art. 120 do CTB",
    dificuldade: "facil"
  },
  
  // Questões Médias (24)
  {
    id: 25,
    categoria: "Legislação de Trânsito",
    pergunta: "Qual a validade da CNH para condutores com menos de 50 anos?",
    opcoes: ["5 anos", "10 anos", "15 anos", "Vitalícia"],
    respostaCorreta: 1,
    explicacao: "A CNH tem validade de 10 anos para condutores com menos de 50 anos. De 50 a 69 anos, 5 anos; acima de 70 anos, 3 anos.",
    baseLegal: "Art. 147, §2º do CTB | Resolução CONTRAN 1.020/2025",
    dificuldade: "media"
  },
  {
    id: 26,
    categoria: "Legislação de Trânsito",
    pergunta: "É permitido ultrapassar pela direita?",
    opcoes: ["Sempre", "Nunca", "Apenas em vias de mão única com mais de uma faixa", "Apenas em rodovias"],
    respostaCorreta: 2,
    explicacao: "A ultrapassagem pela direita é permitida em vias de mão única com mais de uma faixa de mesmo sentido.",
    baseLegal: "Art. 29, IX do CTB",
    dificuldade: "media"
  },
  {
    id: 27,
    categoria: "Legislação de Trânsito",
    pergunta: "Qual a penalidade por estacionar em local proibido?",
    opcoes: ["Advertência", "Multa leve", "Multa média", "Multa grave"],
    respostaCorreta: 2,
    explicacao: "Estacionar em local proibido é infração média, sujeita a multa.",
    baseLegal: "Art. 181 do CTB",
    dificuldade: "media"
  },
  {
    id: 28,
    categoria: "Legislação de Trânsito",
    pergunta: "Quantos pontos vale uma infração gravíssima?",
    opcoes: ["3 pontos", "4 pontos", "5 pontos", "7 pontos"],
    respostaCorreta: 3,
    explicacao: "Infrações gravíssimas computam 7 pontos na CNH do condutor.",
    baseLegal: "Art. 259 do CTB",
    dificuldade: "media"
  },
  {
    id: 29,
    categoria: "Legislação de Trânsito",
    pergunta: "O que acontece se o condutor se recusar ao teste do bafômetro?",
    opcoes: ["Nada", "Advertência", "Mesmas penalidades de quem está embriagado", "Apenas multa leve"],
    respostaCorreta: 2,
    explicacao: "A recusa ao teste do bafômetro implica nas mesmas penalidades previstas para embriaguez ao volante.",
    baseLegal: "Art. 165-A do CTB",
    dificuldade: "media"
  },
  {
    id: 30,
    categoria: "Legislação de Trânsito",
    pergunta: "É permitido estacionar em esquinas?",
    opcoes: ["Sim", "Não, deve manter 5 metros de distância", "Apenas com sinalização", "Apenas à noite"],
    respostaCorreta: 1,
    explicacao: "É proibido estacionar a menos de 5 metros do bordo do alinhamento da esquina.",
    baseLegal: "Art. 181, VIII do CTB",
    dificuldade: "media"
  },
  {
    id: 31,
    categoria: "Legislação de Trânsito",
    pergunta: "Qual a distância mínima para estacionar de hidrantes?",
    opcoes: ["3 metros", "5 metros", "7 metros", "10 metros"],
    respostaCorreta: 1,
    explicacao: "É proibido estacionar a menos de 5 metros de hidrantes de incêndio.",
    baseLegal: "Art. 181, XI do CTB",
    dificuldade: "media"
  },
  {
    id: 32,
    categoria: "Legislação de Trânsito",
    pergunta: "Dirigir sem CNH é infração de qual natureza?",
    opcoes: ["Leve", "Média", "Grave", "Gravíssima"],
    respostaCorreta: 3,
    explicacao: "Dirigir sem possuir CNH é infração gravíssima.",
    baseLegal: "Art. 162, I do CTB",
    dificuldade: "media"
  },
  {
    id: 33,
    categoria: "Legislação de Trânsito",
    pergunta: "Qual a punição por dirigir com CNH vencida há mais de 30 dias?",
    opcoes: ["Nenhuma", "Advertência", "Multa grave", "Multa gravíssima"],
    respostaCorreta: 2,
    explicacao: "Dirigir com CNH vencida há mais de 30 dias é infração grave.",
    baseLegal: "Art. 162, V do CTB",
    dificuldade: "media"
  },
  {
    id: 34,
    categoria: "Legislação de Trânsito",
    pergunta: "É permitido transportar passageiros na carroceria de caminhonete?",
    opcoes: ["Sim, sempre", "Não, é proibido em áreas urbanas", "Apenas adultos", "Apenas em estradas"],
    respostaCorreta: 1,
    explicacao: "É proibido transportar pessoas na carroceria de caminhonetes em vias urbanas e rodovias.",
    baseLegal: "Art. 230, II do CTB",
    dificuldade: "media"
  },
  {
    id: 35,
    categoria: "Legislação de Trânsito",
    pergunta: "Quantos pontos vale uma infração grave?",
    opcoes: ["3 pontos", "4 pontos", "5 pontos", "7 pontos"],
    respostaCorreta: 2,
    explicacao: "Infrações graves computam 5 pontos na CNH do condutor.",
    baseLegal: "Art. 259 do CTB",
    dificuldade: "media"
  },
  {
    id: 36,
    categoria: "Legislação de Trânsito",
    pergunta: "Quantos pontos vale uma infração média?",
    opcoes: ["3 pontos", "4 pontos", "5 pontos", "7 pontos"],
    respostaCorreta: 1,
    explicacao: "Infrações médias computam 4 pontos na CNH do condutor.",
    baseLegal: "Art. 259 do CTB",
    dificuldade: "media"
  },
  {
    id: 37,
    categoria: "Legislação de Trânsito",
    pergunta: "Quantos pontos vale uma infração leve?",
    opcoes: ["1 ponto", "2 pontos", "3 pontos", "4 pontos"],
    respostaCorreta: 2,
    explicacao: "Infrações leves computam 3 pontos na CNH do condutor.",
    baseLegal: "Art. 259 do CTB",
    dificuldade: "media"
  },
  {
    id: 38,
    categoria: "Legislação de Trânsito",
    pergunta: "O condutor com PPD pode cometer qual tipo de infração sem perder o direito de dirigir?",
    opcoes: ["Qualquer infração", "Apenas infrações leves", "Nenhuma infração grave ou gravíssima", "Nenhuma infração média"],
    respostaCorreta: 2,
    explicacao: "O condutor com PPD não pode cometer infrações de natureza grave ou gravíssima, sob pena de cancelamento da permissão.",
    baseLegal: "Art. 148, §4º do CTB",
    dificuldade: "media"
  },
  {
    id: 39,
    categoria: "Legislação de Trânsito",
    pergunta: "Qual a idade mínima para obter a CNH categoria D?",
    opcoes: ["18 anos", "21 anos", "23 anos", "25 anos"],
    respostaCorreta: 1,
    explicacao: "Para a categoria D (ônibus e micro-ônibus), a idade mínima é 21 anos.",
    baseLegal: "Art. 145, I, d do CTB",
    dificuldade: "media"
  },
  {
    id: 40,
    categoria: "Legislação de Trânsito",
    pergunta: "Qual a idade mínima para obter a CNH categoria E?",
    opcoes: ["18 anos", "21 anos", "23 anos", "25 anos"],
    respostaCorreta: 1,
    explicacao: "Para a categoria E (veículos articulados), a idade mínima é 21 anos.",
    baseLegal: "Art. 145, I, e do CTB",
    dificuldade: "media"
  },
  {
    id: 41,
    categoria: "Legislação de Trânsito",
    pergunta: "Avançar o sinal vermelho é infração de qual natureza?",
    opcoes: ["Leve", "Média", "Grave", "Gravíssima"],
    respostaCorreta: 3,
    explicacao: "Avançar o sinal vermelho do semáforo é infração gravíssima.",
    baseLegal: "Art. 208 do CTB",
    dificuldade: "media"
  },
  {
    id: 42,
    categoria: "Legislação de Trânsito",
    pergunta: "Estacionar em vaga de deficiente sem credencial é infração:",
    opcoes: ["Leve", "Média", "Grave", "Gravíssima"],
    respostaCorreta: 3,
    explicacao: "Estacionar em vaga reservada a pessoa com deficiência sem credencial é infração gravíssima.",
    baseLegal: "Art. 181, XVII do CTB",
    dificuldade: "media"
  },
  {
    id: 43,
    categoria: "Legislação de Trânsito",
    pergunta: "A CNH categoria C permite dirigir veículos de carga com peso bruto total de:",
    opcoes: ["Até 3.500 kg", "Acima de 3.500 kg", "Qualquer peso", "Até 6.000 kg"],
    respostaCorreta: 1,
    explicacao: "A categoria C permite conduzir veículos de carga com peso bruto total acima de 3.500 kg.",
    baseLegal: "Art. 143, III do CTB",
    dificuldade: "media"
  },
  {
    id: 44,
    categoria: "Legislação de Trânsito",
    pergunta: "O condutor de transporte escolar deve ter no mínimo:",
    opcoes: ["18 anos e CNH B", "21 anos e CNH D", "25 anos e CNH E", "21 anos e CNH B"],
    respostaCorreta: 1,
    explicacao: "Para transporte escolar, exige-se idade mínima de 21 anos e CNH categoria D.",
    baseLegal: "Art. 138 do CTB",
    dificuldade: "media"
  },
  {
    id: 45,
    categoria: "Legislação de Trânsito",
    pergunta: "O que é ACC (Autorização para Conduzir Ciclomotor)?",
    opcoes: ["Documento para dirigir motos acima de 125cc", "Documento para conduzir ciclomotores até 50cc", "Documento para bicicletas", "Documento provisório"],
    respostaCorreta: 1,
    explicacao: "ACC é a Autorização para Conduzir Ciclomotores de até 50 cilindradas.",
    baseLegal: "Art. 141 do CTB",
    dificuldade: "media"
  },
  {
    id: 46,
    categoria: "Legislação de Trânsito",
    pergunta: "Qual o prazo para indicar o condutor infrator após receber a notificação?",
    opcoes: ["15 dias", "30 dias", "45 dias", "60 dias"],
    respostaCorreta: 0,
    explicacao: "O proprietário tem 15 dias para indicar o condutor infrator após o recebimento da notificação.",
    baseLegal: "Art. 257, §7º do CTB",
    dificuldade: "media"
  },
  {
    id: 47,
    categoria: "Legislação de Trânsito",
    pergunta: "O que acontece se o proprietário não indicar o condutor infrator?",
    opcoes: ["Nada", "Assume a pontuação da infração", "Apenas paga a multa", "Multa é cancelada"],
    respostaCorreta: 1,
    explicacao: "Se não indicar o condutor, o proprietário assume a pontuação da infração.",
    baseLegal: "Art. 257, §8º do CTB",
    dificuldade: "media"
  },
  {
    id: 48,
    categoria: "Legislação de Trânsito",
    pergunta: "Qual a velocidade máxima permitida em rodovias de pista simples?",
    opcoes: ["60 km/h", "80 km/h", "100 km/h", "110 km/h"],
    respostaCorreta: 2,
    explicacao: "Em rodovias de pista simples, a velocidade máxima é 100 km/h para automóveis.",
    baseLegal: "Art. 61, I, a, 2 do CTB",
    dificuldade: "media"
  },
  
  // Questões Difíceis - Pegadinhas (12)
  {
    id: 49,
    categoria: "Legislação de Trânsito",
    pergunta: "Um condutor de 49 anos renovou sua CNH. Qual a validade?",
    opcoes: ["5 anos", "10 anos", "7 anos", "3 anos"],
    respostaCorreta: 1,
    explicacao: "Condutores com MENOS de 50 anos têm CNH válida por 10 anos. PEGADINHA: Aos 50 anos completos muda para 5 anos.",
    baseLegal: "Art. 147, §2º do CTB",
    dificuldade: "dificil"
  },
  {
    id: 50,
    categoria: "Legislação de Trânsito",
    pergunta: "Um condutor está com a CNH vencida há 25 dias. Qual a infração se for parado dirigindo?",
    opcoes: ["Gravíssima", "Grave", "Média", "Não há infração dentro de 30 dias"],
    respostaCorreta: 3,
    explicacao: "PEGADINHA: Só é infração dirigir com CNH vencida há MAIS de 30 dias. Com 25 dias ainda está no período de tolerância.",
    baseLegal: "Art. 162, V do CTB",
    dificuldade: "dificil"
  },
  {
    id: 51,
    categoria: "Legislação de Trânsito",
    pergunta: "Qual infração NÃO resulta em suspensão imediata do direito de dirigir?",
    opcoes: ["Embriaguez ao volante", "Racha", "Excesso de velocidade acima de 50%", "Estacionar em local proibido"],
    respostaCorreta: 3,
    explicacao: "PEGADINHA: Estacionar em local proibido é infração média, sem suspensão. As demais resultam em suspensão imediata.",
    baseLegal: "Art. 261 do CTB",
    dificuldade: "dificil"
  },
  {
    id: 52,
    categoria: "Legislação de Trânsito",
    pergunta: "Exceder a velocidade em mais de 20%, mas não superior a 50%, é infração:",
    opcoes: ["Leve", "Média", "Grave", "Gravíssima"],
    respostaCorreta: 2,
    explicacao: "Exceder de 20% a 50% acima da velocidade é infração GRAVE. PEGADINHA: Até 20% é média, acima de 50% é gravíssima.",
    baseLegal: "Art. 218, II do CTB",
    dificuldade: "dificil"
  },
  {
    id: 53,
    categoria: "Legislação de Trânsito",
    pergunta: "O condutor com 19 pontos na CNH em 12 meses:",
    opcoes: ["Terá a CNH suspensa", "Não terá a CNH suspensa", "Receberá advertência", "Perderá a CNH definitivamente"],
    respostaCorreta: 1,
    explicacao: "PEGADINHA: A suspensão ocorre com 20 ou mais pontos. Com 19 pontos, NÃO há suspensão.",
    baseLegal: "Art. 261, §1º do CTB",
    dificuldade: "dificil"
  },
  {
    id: 54,
    categoria: "Legislação de Trânsito",
    pergunta: "Para adicionar a categoria A à CNH B, o condutor precisa:",
    opcoes: ["Fazer todo o processo novamente", "Apenas exame prático de moto", "Apenas aulas práticas e exame", "Aulas teóricas, práticas e exames"],
    respostaCorreta: 2,
    explicacao: "PEGADINHA: Para ADIÇÃO de categoria, dispensa-se o curso teórico. Apenas aulas práticas e exames são necessários.",
    baseLegal: "Art. 147 do CTB",
    dificuldade: "dificil"
  },
  {
    id: 55,
    categoria: "Legislação de Trânsito",
    pergunta: "Qual a diferença de pontuação entre infração grave e gravíssima?",
    opcoes: ["1 ponto", "2 pontos", "3 pontos", "4 pontos"],
    respostaCorreta: 1,
    explicacao: "PEGADINHA: Grave = 5 pontos, Gravíssima = 7 pontos. Diferença = 2 pontos.",
    baseLegal: "Art. 259 do CTB",
    dificuldade: "dificil"
  },
  {
    id: 56,
    categoria: "Legislação de Trânsito",
    pergunta: "Um condutor recém-habilitado com PPD comete uma infração média. O que acontece?",
    opcoes: ["Perde a PPD imediatamente", "Recebe advertência", "Apenas soma pontos normalmente", "Multa em dobro"],
    respostaCorreta: 2,
    explicacao: "PEGADINHA: A PPD só é cancelada por infrações GRAVES ou GRAVÍSSIMAS. Infração média apenas soma pontos.",
    baseLegal: "Art. 148, §4º do CTB",
    dificuldade: "dificil"
  },
  {
    id: 57,
    categoria: "Legislação de Trânsito",
    pergunta: "Em via urbana, qual a velocidade máxima para veículos de transporte coletivo?",
    opcoes: ["30 km/h", "40 km/h", "Mesma dos demais veículos", "80 km/h"],
    respostaCorreta: 2,
    explicacao: "PEGADINHA: Em vias URBANAS, a velocidade máxima é igual para todos os veículos. A diferença existe apenas em RODOVIAS.",
    baseLegal: "Art. 61 do CTB",
    dificuldade: "dificil"
  },
  {
    id: 58,
    categoria: "Legislação de Trânsito",
    pergunta: "A cassação da CNH ocorre em qual período?",
    opcoes: ["1 ano", "2 anos", "3 anos", "5 anos"],
    respostaCorreta: 1,
    explicacao: "A cassação da CNH tem duração de 2 anos, após os quais o condutor pode requerer nova habilitação.",
    baseLegal: "Art. 263 do CTB",
    dificuldade: "dificil"
  },
  {
    id: 59,
    categoria: "Legislação de Trânsito",
    pergunta: "Um condutor pode recorrer de uma multa em quantas instâncias administrativas?",
    opcoes: ["1", "2", "3", "4"],
    respostaCorreta: 1,
    explicacao: "O condutor pode recorrer em 2 instâncias: JARI (1ª instância) e CETRAN/CONTRAN (2ª instância).",
    baseLegal: "Art. 285 do CTB",
    dificuldade: "dificil"
  },
  {
    id: 60,
    categoria: "Legislação de Trânsito",
    pergunta: "Transitar com veículo em calçada é infração de qual natureza?",
    opcoes: ["Leve", "Média", "Grave", "Gravíssima"],
    respostaCorreta: 3,
    explicacao: "Transitar com veículo em calçada é infração gravíssima, colocando em risco a segurança de pedestres.",
    baseLegal: "Art. 193 do CTB",
    dificuldade: "dificil"
  },

  // =====================================
  // DIREÇÃO DEFENSIVA (50 questões)
  // =====================================
  
  // Questões Fáceis (20)
  {
    id: 61,
    categoria: "Direção Defensiva",
    pergunta: "O que é direção defensiva?",
    opcoes: ["Dirigir rápido", "Dirigir de forma a prevenir acidentes", "Dirigir apenas em rodovias", "Defender-se de outros motoristas"],
    respostaCorreta: 1,
    explicacao: "Direção defensiva é a forma de dirigir que permite reconhecer e evitar situações de risco.",
    baseLegal: "Resolução CONTRAN 168/04, Anexo II",
    dificuldade: "facil"
  },
  {
    id: 62,
    categoria: "Direção Defensiva",
    pergunta: "Qual o intervalo de tempo recomendado para manter distância segura do veículo da frente em condições normais?",
    opcoes: ["1 segundo", "2 segundos", "5 segundos", "10 segundos"],
    respostaCorreta: 1,
    explicacao: "A regra dos 2 segundos garante distância segura em condições normais de pista.",
    baseLegal: "Manual DENATRAN de Direção Defensiva",
    dificuldade: "facil"
  },
  {
    id: 63,
    categoria: "Direção Defensiva",
    pergunta: "Em pista molhada, o que deve aumentar?",
    opcoes: ["A velocidade", "A distância de seguimento", "O uso de buzina", "O som do rádio"],
    respostaCorreta: 1,
    explicacao: "Em pista molhada, a distância de seguimento deve aumentar devido à maior distância de frenagem.",
    baseLegal: "Manual DENATRAN de Direção Defensiva",
    dificuldade: "facil"
  },
  {
    id: 64,
    categoria: "Direção Defensiva",
    pergunta: "O que é aquaplanagem?",
    opcoes: ["Dirigir na água", "Perda de aderência por camada de água entre pneu e pista", "Tipo de freio", "Manobra evasiva"],
    respostaCorreta: 1,
    explicacao: "Aquaplanagem ocorre quando uma camada de água se forma entre o pneu e o pavimento, causando perda de controle.",
    baseLegal: "Manual DENATRAN de Direção Defensiva",
    dificuldade: "facil"
  },
  {
    id: 65,
    categoria: "Direção Defensiva",
    pergunta: "O que significa o termo 'ponto cego'?",
    opcoes: ["Área não visível pelos retrovisores", "Cruzamento sem semáforo", "Curva fechada", "Pista sem iluminação"],
    respostaCorreta: 0,
    explicacao: "Ponto cego é a área ao redor do veículo que não é visível pelos espelhos retrovisores.",
    baseLegal: "Manual DENATRAN de Direção Defensiva",
    dificuldade: "facil"
  },
  {
    id: 66,
    categoria: "Direção Defensiva",
    pergunta: "Qual a principal causa de acidentes de trânsito?",
    opcoes: ["Problemas mecânicos", "Condições da via", "Falha humana", "Condições climáticas"],
    respostaCorreta: 2,
    explicacao: "A falha humana é responsável por cerca de 90% dos acidentes de trânsito.",
    baseLegal: "Estatísticas DENATRAN",
    dificuldade: "facil"
  },
  {
    id: 67,
    categoria: "Direção Defensiva",
    pergunta: "O que fazer ao se deparar com neblina?",
    opcoes: ["Acelerar para sair rápido", "Reduzir velocidade e usar farol baixo", "Parar imediatamente", "Usar farol alto"],
    respostaCorreta: 1,
    explicacao: "Em neblina, deve-se reduzir a velocidade e usar farol baixo para melhor visibilidade.",
    baseLegal: "Art. 40, §1º do CTB",
    dificuldade: "facil"
  },
  {
    id: 68,
    categoria: "Direção Defensiva",
    pergunta: "Qual elemento não faz parte da direção defensiva?",
    opcoes: ["Conhecimento", "Atenção", "Agressividade", "Previsão"],
    respostaCorreta: 2,
    explicacao: "Os elementos da direção defensiva são: conhecimento, atenção, previsão, habilidade e ação. Agressividade é o oposto.",
    baseLegal: "Resolução CONTRAN 168/04, Anexo II",
    dificuldade: "facil"
  },
  {
    id: 69,
    categoria: "Direção Defensiva",
    pergunta: "O que é tempo de reação?",
    opcoes: ["Tempo para frear", "Tempo entre perceber e agir", "Tempo de viagem", "Velocidade do veículo"],
    respostaCorreta: 1,
    explicacao: "Tempo de reação é o intervalo entre perceber uma situação de risco e iniciar uma ação.",
    baseLegal: "Manual DENATRAN de Direção Defensiva",
    dificuldade: "facil"
  },
  {
    id: 70,
    categoria: "Direção Defensiva",
    pergunta: "Dirigir com sono é:",
    opcoes: ["Permitido", "Recomendado à noite", "Muito perigoso", "Normal"],
    respostaCorreta: 2,
    explicacao: "Dirigir com sono é extremamente perigoso, pois reduz reflexos e pode causar o cochilo ao volante.",
    baseLegal: "Manual DENATRAN de Direção Defensiva",
    dificuldade: "facil"
  },
  {
    id: 71,
    categoria: "Direção Defensiva",
    pergunta: "O que deve fazer antes de iniciar uma ultrapassagem?",
    opcoes: ["Buzinar", "Verificar se há espaço e sinalizar", "Acelerar imediatamente", "Piscar os faróis"],
    respostaCorreta: 1,
    explicacao: "Antes de ultrapassar, deve-se verificar se há espaço suficiente e sinalizar a intenção.",
    baseLegal: "Art. 29, X do CTB",
    dificuldade: "facil"
  },
  {
    id: 72,
    categoria: "Direção Defensiva",
    pergunta: "O que é condição adversa?",
    opcoes: ["Pista bem conservada", "Qualquer fator que aumenta o risco de acidente", "Trânsito livre", "Veículo novo"],
    respostaCorreta: 1,
    explicacao: "Condições adversas são fatores que aumentam o risco, como chuva, neblina, pista ruim, etc.",
    baseLegal: "Resolução CONTRAN 168/04, Anexo II",
    dificuldade: "facil"
  },
  {
    id: 73,
    categoria: "Direção Defensiva",
    pergunta: "Qual atitude é correta ao ser ultrapassado?",
    opcoes: ["Acelerar", "Manter velocidade e facilitar", "Buzinar", "Fechar o veículo"],
    respostaCorreta: 1,
    explicacao: "Ao ser ultrapassado, deve-se manter a velocidade ou reduzir para facilitar a manobra.",
    baseLegal: "Art. 29, X, b do CTB",
    dificuldade: "facil"
  },
  {
    id: 74,
    categoria: "Direção Defensiva",
    pergunta: "O estresse ao dirigir:",
    opcoes: ["Melhora os reflexos", "Prejudica a atenção", "Não afeta a direção", "É necessário"],
    respostaCorreta: 1,
    explicacao: "O estresse prejudica a concentração e pode levar a decisões impulsivas no trânsito.",
    baseLegal: "Manual DENATRAN de Direção Defensiva",
    dificuldade: "facil"
  },
  {
    id: 75,
    categoria: "Direção Defensiva",
    pergunta: "O que fazer se os freios falharem?",
    opcoes: ["Saltar do veículo", "Usar o freio de mão gradualmente e reduzir marchas", "Acelerar", "Desligar o motor imediatamente"],
    respostaCorreta: 1,
    explicacao: "Se os freios falharem, deve-se usar o freio de mão gradualmente e reduzir as marchas progressivamente.",
    baseLegal: "Manual DENATRAN de Direção Defensiva",
    dificuldade: "facil"
  },
  {
    id: 76,
    categoria: "Direção Defensiva",
    pergunta: "Qual a atitude correta em cruzamentos sem sinalização?",
    opcoes: ["Passar rapidamente", "Dar preferência a quem vem da direita", "Buzinar e passar", "Parar sempre"],
    respostaCorreta: 1,
    explicacao: "Em cruzamentos sem sinalização, a preferência é de quem vem pela direita.",
    baseLegal: "Art. 29, III, c do CTB",
    dificuldade: "facil"
  },
  {
    id: 77,
    categoria: "Direção Defensiva",
    pergunta: "O uso do celular ao dirigir:",
    opcoes: ["É permitido", "É proibido e perigoso", "É permitido com fone", "Depende da situação"],
    respostaCorreta: 1,
    explicacao: "O uso de celular ao dirigir é proibido por lei e extremamente perigoso.",
    baseLegal: "Art. 252, VI do CTB",
    dificuldade: "facil"
  },
  {
    id: 78,
    categoria: "Direção Defensiva",
    pergunta: "Em uma emergência, qual a primeira ação?",
    opcoes: ["Buzinar", "Manter a calma", "Acelerar", "Fechar os olhos"],
    respostaCorreta: 1,
    explicacao: "Em emergências, manter a calma é essencial para tomar decisões corretas.",
    baseLegal: "Manual DENATRAN de Direção Defensiva",
    dificuldade: "facil"
  },
  {
    id: 79,
    categoria: "Direção Defensiva",
    pergunta: "Qual comportamento indica direção agressiva?",
    opcoes: ["Respeitar a sinalização", "Fazer ultrapassagens forçadas", "Manter distância segura", "Usar a seta"],
    respostaCorreta: 1,
    explicacao: "Ultrapassagens forçadas são comportamentos típicos de direção agressiva.",
    baseLegal: "Manual DENATRAN de Direção Defensiva",
    dificuldade: "facil"
  },
  {
    id: 80,
    categoria: "Direção Defensiva",
    pergunta: "O álcool afeta a direção porque:",
    opcoes: ["Melhora os reflexos", "Diminui os reflexos e o julgamento", "Não afeta", "Deixa mais atento"],
    respostaCorreta: 1,
    explicacao: "O álcool diminui os reflexos, prejudica o julgamento e a coordenação motora.",
    baseLegal: "Art. 165 do CTB",
    dificuldade: "facil"
  },
  
  // Questões Médias (20)
  {
    id: 81,
    categoria: "Direção Defensiva",
    pergunta: "O que é fading dos freios?",
    opcoes: ["Freio novo", "Perda de eficiência por superaquecimento", "Tipo de freio", "Regulagem dos freios"],
    respostaCorreta: 1,
    explicacao: "Fading é a perda de eficiência dos freios devido ao superaquecimento.",
    baseLegal: "Manual DENATRAN de Direção Defensiva",
    dificuldade: "media"
  },
  {
    id: 82,
    categoria: "Direção Defensiva",
    pergunta: "Em descidas longas, o que fazer?",
    opcoes: ["Usar só o freio", "Usar o freio motor (marchas reduzidas)", "Colocar em ponto morto", "Acelerar"],
    respostaCorreta: 1,
    explicacao: "Em descidas longas, deve-se usar o freio motor para evitar o superaquecimento dos freios.",
    baseLegal: "Manual DENATRAN de Direção Defensiva",
    dificuldade: "media"
  },
  {
    id: 83,
    categoria: "Direção Defensiva",
    pergunta: "O que são os retrovisores internos?",
    opcoes: ["Enfeites", "Equipamentos de segurança obrigatórios", "Opcionais", "Acessórios"],
    respostaCorreta: 1,
    explicacao: "Os retrovisores são equipamentos de segurança obrigatórios que ampliam o campo de visão.",
    baseLegal: "Art. 105, I do CTB",
    dificuldade: "media"
  },
  {
    id: 84,
    categoria: "Direção Defensiva",
    pergunta: "O que fazer ao avistar pedestres próximos à via?",
    opcoes: ["Manter velocidade", "Reduzir velocidade e ficar atento", "Buzinar para afastá-los", "Acelerar"],
    respostaCorreta: 1,
    explicacao: "Ao avistar pedestres, deve-se reduzir a velocidade e manter atenção redobrada.",
    baseLegal: "Art. 29, §2º do CTB",
    dificuldade: "media"
  },
  {
    id: 85,
    categoria: "Direção Defensiva",
    pergunta: "O que é evasão?",
    opcoes: ["Fuga de blitz", "Manobra para evitar colisão", "Tipo de multa", "Estacionamento"],
    respostaCorreta: 1,
    explicacao: "Evasão é a manobra de emergência realizada para evitar uma colisão iminente.",
    baseLegal: "Manual DENATRAN de Direção Defensiva",
    dificuldade: "media"
  },
  {
    id: 86,
    categoria: "Direção Defensiva",
    pergunta: "O que é hidroplanagem?",
    opcoes: ["Andar sobre água", "O mesmo que aquaplanagem", "Deslizar no gelo", "Tipo de pneu"],
    respostaCorreta: 1,
    explicacao: "Hidroplanagem é sinônimo de aquaplanagem: perda de aderência devido à água entre pneu e pista.",
    baseLegal: "Manual DENATRAN de Direção Defensiva",
    dificuldade: "media"
  },
  {
    id: 87,
    categoria: "Direção Defensiva",
    pergunta: "Qual a distância de frenagem em pista molhada comparada à seca?",
    opcoes: ["Igual", "Metade", "Dobro ou mais", "Ligeiramente maior"],
    respostaCorreta: 2,
    explicacao: "Em pista molhada, a distância de frenagem pode dobrar ou até triplicar.",
    baseLegal: "Manual DENATRAN de Direção Defensiva",
    dificuldade: "media"
  },
  {
    id: 88,
    categoria: "Direção Defensiva",
    pergunta: "O que fazer ao sentir sono dirigindo?",
    opcoes: ["Abrir a janela e continuar", "Parar em local seguro e descansar", "Ligar o ar-condicionado no máximo", "Aumentar o som"],
    respostaCorreta: 1,
    explicacao: "Ao sentir sono, a única solução segura é parar e descansar. Outras medidas são paliativas e perigosas.",
    baseLegal: "Manual DENATRAN de Direção Defensiva",
    dificuldade: "media"
  },
  {
    id: 89,
    categoria: "Direção Defensiva",
    pergunta: "O que é força centrífuga na condução?",
    opcoes: ["Força que puxa para dentro da curva", "Força que empurra para fora da curva", "Força de frenagem", "Força de aceleração"],
    respostaCorreta: 1,
    explicacao: "A força centrífuga é a tendência do veículo de sair para fora em curvas, maior quanto maior a velocidade.",
    baseLegal: "Manual DENATRAN de Direção Defensiva",
    dificuldade: "media"
  },
  {
    id: 90,
    categoria: "Direção Defensiva",
    pergunta: "Quais são os 5 elementos da direção defensiva?",
    opcoes: ["Atenção, velocidade, freio, volante, espelho", "Conhecimento, atenção, previsão, habilidade, ação", "Ver, ouvir, pensar, agir, parar", "Acelerar, frear, virar, buzinar, parar"],
    respostaCorreta: 1,
    explicacao: "Os 5 elementos são: Conhecimento, Atenção, Previsão, Habilidade e Ação.",
    baseLegal: "Resolução CONTRAN 168/04, Anexo II",
    dificuldade: "media"
  },
  {
    id: 91,
    categoria: "Direção Defensiva",
    pergunta: "A visão periférica é importante porque:",
    opcoes: ["Permite ver para trás", "Detecta movimentos laterais", "Melhora a visão à noite", "Aumenta a velocidade de reação"],
    respostaCorreta: 1,
    explicacao: "A visão periférica permite detectar movimentos e objetos nas laterais sem desviar o olhar da frente.",
    baseLegal: "Manual DENATRAN de Direção Defensiva",
    dificuldade: "media"
  },
  {
    id: 92,
    categoria: "Direção Defensiva",
    pergunta: "O que é subcorreção ao fazer uma curva?",
    opcoes: ["Virar demais o volante", "Virar menos que o necessário", "Não virar", "Virar para o lado errado"],
    respostaCorreta: 1,
    explicacao: "Subcorreção é virar o volante menos que o necessário, fazendo o veículo sair para fora da curva.",
    baseLegal: "Manual DENATRAN de Direção Defensiva",
    dificuldade: "media"
  },
  {
    id: 93,
    categoria: "Direção Defensiva",
    pergunta: "O que é sobrecorreção ao fazer uma curva?",
    opcoes: ["Virar demais o volante", "Virar menos que o necessário", "Não virar", "Virar devagar"],
    respostaCorreta: 0,
    explicacao: "Sobrecorreção é virar o volante mais que o necessário, podendo causar perda de controle.",
    baseLegal: "Manual DENATRAN de Direção Defensiva",
    dificuldade: "media"
  },
  {
    id: 94,
    categoria: "Direção Defensiva",
    pergunta: "Em quanto tempo uma pessoa elimina uma dose de álcool?",
    opcoes: ["30 minutos", "1 hora", "2 horas", "4 horas"],
    respostaCorreta: 1,
    explicacao: "O organismo leva aproximadamente 1 hora para eliminar cada dose padrão de álcool.",
    baseLegal: "Manual DENATRAN de Direção Defensiva",
    dificuldade: "media"
  },
  {
    id: 95,
    categoria: "Direção Defensiva",
    pergunta: "A luz ofuscante de outro veículo à noite, o que fazer?",
    opcoes: ["Olhar diretamente para os faróis", "Desviar o olhar para a direita da via", "Fechar os olhos", "Acelerar para passar rápido"],
    respostaCorreta: 1,
    explicacao: "Ao ser ofuscado, desvie o olhar para a margem direita da pista para não perder a referência.",
    baseLegal: "Manual DENATRAN de Direção Defensiva",
    dificuldade: "media"
  },
  {
    id: 96,
    categoria: "Direção Defensiva",
    pergunta: "O que causa o efeito de visão em túnel?",
    opcoes: ["Alta velocidade", "Baixa velocidade", "Chuva", "Luz do sol"],
    respostaCorreta: 0,
    explicacao: "Em alta velocidade, o campo de visão se estreita (visão em túnel), reduzindo a percepção periférica.",
    baseLegal: "Manual DENATRAN de Direção Defensiva",
    dificuldade: "media"
  },
  {
    id: 97,
    categoria: "Direção Defensiva",
    pergunta: "Qual o efeito da velocidade na distância de frenagem?",
    opcoes: ["Aumenta proporcionalmente", "Aumenta exponencialmente", "Diminui", "Não afeta"],
    respostaCorreta: 1,
    explicacao: "A distância de frenagem aumenta exponencialmente com a velocidade (dobrar a velocidade quadruplica a distância).",
    baseLegal: "Manual DENATRAN de Direção Defensiva",
    dificuldade: "media"
  },
  {
    id: 98,
    categoria: "Direção Defensiva",
    pergunta: "O que é aquecimento dos pneus e por que é perigoso?",
    opcoes: ["É bom, melhora a aderência", "Pode causar estouro em viagens longas", "Não existe", "Só ocorre em corridas"],
    respostaCorreta: 1,
    explicacao: "Pneus aquecem com o atrito, e em viagens longas com calibragem errada podem estourar.",
    baseLegal: "Manual DENATRAN de Direção Defensiva",
    dificuldade: "media"
  },
  {
    id: 99,
    categoria: "Direção Defensiva",
    pergunta: "Por que medicamentos podem afetar a direção?",
    opcoes: ["Não afetam", "Podem causar sonolência ou alterar reflexos", "Melhoram a atenção", "Só afetam idosos"],
    respostaCorreta: 1,
    explicacao: "Muitos medicamentos causam sonolência, tontura ou alteração dos reflexos, prejudicando a direção.",
    baseLegal: "Manual DENATRAN de Direção Defensiva",
    dificuldade: "media"
  },
  {
    id: 100,
    categoria: "Direção Defensiva",
    pergunta: "O que fazer ao perceber fumaça saindo do capô?",
    opcoes: ["Parar imediatamente e abrir o capô", "Parar em local seguro e esperar esfriar antes de abrir", "Continuar dirigindo", "Acelerar para ventilar"],
    respostaCorreta: 1,
    explicacao: "Pare em local seguro e espere esfriar. Abrir imediatamente pode causar queimaduras ou alimentar um incêndio.",
    baseLegal: "Manual DENATRAN de Direção Defensiva",
    dificuldade: "media"
  },
  
  // Questões Difíceis - Pegadinhas (10)
  {
    id: 101,
    categoria: "Direção Defensiva",
    pergunta: "Em pista molhada, qual deve ser o intervalo de tempo para distância segura?",
    opcoes: ["2 segundos", "3 segundos", "4 segundos", "6 segundos"],
    respostaCorreta: 2,
    explicacao: "PEGADINHA: Em condições adversas, a regra dos 2 segundos deve ser DOBRADA para 4 segundos.",
    baseLegal: "Manual DENATRAN de Direção Defensiva",
    dificuldade: "dificil"
  },
  {
    id: 102,
    categoria: "Direção Defensiva",
    pergunta: "A velocidade do veículo dobra. O que acontece com a distância de frenagem?",
    opcoes: ["Dobra", "Triplica", "Quadruplica", "Permanece igual"],
    respostaCorreta: 2,
    explicacao: "PEGADINHA: A distância de frenagem aumenta com o QUADRADO da velocidade. Dobrar velocidade = 4x distância.",
    baseLegal: "Física aplicada à direção defensiva",
    dificuldade: "dificil"
  },
  {
    id: 103,
    categoria: "Direção Defensiva",
    pergunta: "Qual NÃO é uma condição adversa relacionada ao condutor?",
    opcoes: ["Fadiga", "Uso de medicamentos", "Pneus carecas", "Estado emocional alterado"],
    respostaCorreta: 2,
    explicacao: "PEGADINHA: Pneus carecas é condição adversa do VEÍCULO, não do condutor.",
    baseLegal: "Resolução CONTRAN 168/04, Anexo II",
    dificuldade: "dificil"
  },
  {
    id: 104,
    categoria: "Direção Defensiva",
    pergunta: "Em caso de aquaplanagem, o que NÃO deve fazer?",
    opcoes: ["Tirar o pé do acelerador", "Segurar o volante com firmeza", "Frear bruscamente", "Esperar o veículo desacelerar naturalmente"],
    respostaCorreta: 2,
    explicacao: "PEGADINHA: Frear bruscamente em aquaplanagem pode fazer o veículo rodar. Deve-se desacelerar gradualmente.",
    baseLegal: "Manual DENATRAN de Direção Defensiva",
    dificuldade: "dificil"
  },
  {
    id: 105,
    categoria: "Direção Defensiva",
    pergunta: "O tempo de reação médio de um condutor é de aproximadamente:",
    opcoes: ["0,25 segundo", "0,75 segundo", "1,5 segundo", "3 segundos"],
    respostaCorreta: 1,
    explicacao: "PEGADINHA: O tempo de reação médio é de 0,75 segundo (entre 0,5 e 1 segundo para a maioria das pessoas).",
    baseLegal: "Manual DENATRAN de Direção Defensiva",
    dificuldade: "dificil"
  },
  {
    id: 106,
    categoria: "Direção Defensiva",
    pergunta: "A 100 km/h, quantos metros o veículo percorre durante o tempo de reação (0,75s)?",
    opcoes: ["10 metros", "15 metros", "21 metros", "30 metros"],
    respostaCorreta: 2,
    explicacao: "PEGADINHA: 100 km/h = 27,7 m/s. Em 0,75s percorre cerca de 21 metros ANTES de começar a frear.",
    baseLegal: "Cálculo físico aplicado à direção",
    dificuldade: "dificil"
  },
  {
    id: 107,
    categoria: "Direção Defensiva",
    pergunta: "Qual a principal diferença entre direção defensiva e direção preventiva?",
    opcoes: ["São sinônimos", "Defensiva é mais completa", "Preventiva foca apenas em prevenção", "Defensiva é para profissionais"],
    respostaCorreta: 0,
    explicacao: "PEGADINHA: Direção defensiva e direção preventiva são SINÔNIMOS, termos usados intercambiavelmente.",
    baseLegal: "Resolução CONTRAN 168/04, Anexo II",
    dificuldade: "dificil"
  },
  {
    id: 108,
    categoria: "Direção Defensiva",
    pergunta: "A velocidade do veículo triplica. O que acontece com a força de impacto em uma colisão?",
    opcoes: ["Triplica", "Aumenta 6 vezes", "Aumenta 9 vezes", "Dobra"],
    respostaCorreta: 2,
    explicacao: "PEGADINHA: A força de impacto aumenta com o QUADRADO da velocidade. 3² = 9 vezes maior.",
    baseLegal: "Física aplicada à direção defensiva",
    dificuldade: "dificil"
  },
  {
    id: 109,
    categoria: "Direção Defensiva",
    pergunta: "Qual a velocidade aproximada para início da aquaplanagem com pneus normais?",
    opcoes: ["50 km/h", "60 km/h", "80 km/h", "100 km/h"],
    respostaCorreta: 2,
    explicacao: "PEGADINHA: A aquaplanagem pode iniciar a partir de 80 km/h com pneus em bom estado; menos com pneus gastos.",
    baseLegal: "Manual DENATRAN de Direção Defensiva",
    dificuldade: "dificil"
  },
  {
    id: 110,
    categoria: "Direção Defensiva",
    pergunta: "Em neblina densa, por que NÃO se deve usar farol alto?",
    opcoes: ["Gasta mais bateria", "A luz reflete na neblina e ofusca mais", "É proibido", "Não faz diferença"],
    respostaCorreta: 1,
    explicacao: "PEGADINHA: O farol alto reflete nas gotículas de água, criando um 'muro branco' que piora a visibilidade.",
    baseLegal: "Manual DENATRAN de Direção Defensiva",
    dificuldade: "dificil"
  },

  // =====================================
  // PRIMEIROS SOCORROS (40 questões)
  // =====================================
  
  // Questões Fáceis (16)
  {
    id: 111,
    categoria: "Primeiros Socorros",
    pergunta: "Qual o primeiro passo ao chegar em um acidente?",
    opcoes: ["Remover as vítimas", "Sinalizar o local e garantir segurança", "Chamar a polícia", "Fotografar"],
    respostaCorreta: 1,
    explicacao: "O primeiro passo é sinalizar o local para evitar novos acidentes e garantir a segurança.",
    baseLegal: "Art. 176 do CTB",
    dificuldade: "facil"
  },
  {
    id: 112,
    categoria: "Primeiros Socorros",
    pergunta: "Qual número do SAMU?",
    opcoes: ["190", "191", "192", "193"],
    respostaCorreta: 2,
    explicacao: "O SAMU (Serviço de Atendimento Móvel de Urgência) atende pelo 192.",
    baseLegal: "Portaria MS 1.010/2012",
    dificuldade: "facil"
  },
  {
    id: 113,
    categoria: "Primeiros Socorros",
    pergunta: "O que fazer em caso de hemorragia?",
    opcoes: ["Lavar com água", "Aplicar pressão no local", "Aplicar torniquete sempre", "Não fazer nada"],
    respostaCorreta: 1,
    explicacao: "Em hemorragias, deve-se aplicar pressão direta sobre o ferimento com pano limpo.",
    baseLegal: "Protocolo SAMU",
    dificuldade: "facil"
  },
  {
    id: 114,
    categoria: "Primeiros Socorros",
    pergunta: "Qual a posição correta para vítima inconsciente que respira?",
    opcoes: ["De barriga para cima", "Posição lateral de segurança", "Sentada", "De pé"],
    respostaCorreta: 1,
    explicacao: "A posição lateral de segurança previne engasgos em vítimas inconscientes que respiram.",
    baseLegal: "Protocolo SAMU",
    dificuldade: "facil"
  },
  {
    id: 115,
    categoria: "Primeiros Socorros",
    pergunta: "O que NÃO fazer em caso de fratura?",
    opcoes: ["Imobilizar", "Tentar colocar o osso no lugar", "Chamar socorro", "Manter a vítima calma"],
    respostaCorreta: 1,
    explicacao: "Nunca se deve tentar colocar um osso fraturado no lugar. Imobilize e aguarde socorro.",
    baseLegal: "Protocolo SAMU",
    dificuldade: "facil"
  },
  {
    id: 116,
    categoria: "Primeiros Socorros",
    pergunta: "O que é PCR?",
    opcoes: ["Problema Cardíaco Regular", "Parada Cardiorrespiratória", "Pressão Cardíaca Reduzida", "Pulso Cardíaco Rápido"],
    respostaCorreta: 1,
    explicacao: "PCR significa Parada Cardiorrespiratória, situação grave que requer RCP imediata.",
    baseLegal: "Protocolo SAMU",
    dificuldade: "facil"
  },
  {
    id: 117,
    categoria: "Primeiros Socorros",
    pergunta: "Qual o número do Corpo de Bombeiros?",
    opcoes: ["190", "191", "192", "193"],
    respostaCorreta: 3,
    explicacao: "O Corpo de Bombeiros atende pelo número 193.",
    baseLegal: "Lei 10.446/02",
    dificuldade: "facil"
  },
  {
    id: 118,
    categoria: "Primeiros Socorros",
    pergunta: "Em queimaduras, o que fazer primeiro?",
    opcoes: ["Aplicar manteiga", "Resfriar com água corrente", "Estourar bolhas", "Aplicar pasta de dente"],
    respostaCorreta: 1,
    explicacao: "Em queimaduras, deve-se resfriar o local com água corrente por vários minutos.",
    baseLegal: "Protocolo SAMU",
    dificuldade: "facil"
  },
  {
    id: 119,
    categoria: "Primeiros Socorros",
    pergunta: "O que verificar primeiro em uma vítima de acidente?",
    opcoes: ["Documentos", "Se está consciente e respirando", "Se tem celular", "A marca do carro"],
    respostaCorreta: 1,
    explicacao: "O primeiro passo é verificar se a vítima está consciente e respirando.",
    baseLegal: "Protocolo SAMU",
    dificuldade: "facil"
  },
  {
    id: 120,
    categoria: "Primeiros Socorros",
    pergunta: "Em caso de engasgo, o que fazer?",
    opcoes: ["Dar água", "Aplicar a manobra de Heimlich", "Colocar deitado", "Fazer cócegas"],
    respostaCorreta: 1,
    explicacao: "A manobra de Heimlich é indicada para desobstruir as vias aéreas em engasgos.",
    baseLegal: "Protocolo SAMU",
    dificuldade: "facil"
  },
  {
    id: 121,
    categoria: "Primeiros Socorros",
    pergunta: "O que significa RCP?",
    opcoes: ["Reanimação Cardiopulmonar", "Respiração Controlada Profunda", "Recuperação Cardíaca Preventiva", "Regulação de Pressão"],
    respostaCorreta: 0,
    explicacao: "RCP é a Reanimação Cardiopulmonar, técnica de emergência para parada cardíaca.",
    baseLegal: "Protocolo SAMU",
    dificuldade: "facil"
  },
  {
    id: 122,
    categoria: "Primeiros Socorros",
    pergunta: "Qual número da Polícia Militar?",
    opcoes: ["190", "191", "192", "193"],
    respostaCorreta: 0,
    explicacao: "A Polícia Militar atende pelo número 190.",
    baseLegal: "Lei 10.446/02",
    dificuldade: "facil"
  },
  {
    id: 123,
    categoria: "Primeiros Socorros",
    pergunta: "O que é estado de choque?",
    opcoes: ["Susto intenso", "Falha circulatória grave", "Eletricidade no corpo", "Dor forte"],
    respostaCorreta: 1,
    explicacao: "Estado de choque é uma falha circulatória grave que pode levar à morte se não tratada.",
    baseLegal: "Protocolo SAMU",
    dificuldade: "facil"
  },
  {
    id: 124,
    categoria: "Primeiros Socorros",
    pergunta: "O que fazer se a vítima estiver em pé e desmaiar?",
    opcoes: ["Deixar cair", "Ampará-la para evitar quedas", "Sacudir", "Jogar água"],
    respostaCorreta: 1,
    explicacao: "Deve-se amparar a vítima para evitar que ela se machuque na queda.",
    baseLegal: "Protocolo SAMU",
    dificuldade: "facil"
  },
  {
    id: 125,
    categoria: "Primeiros Socorros",
    pergunta: "O que significa a sigla PAS em primeiros socorros?",
    opcoes: ["Primeiro Atendimento Simples", "Prevenir, Alertar, Socorrer", "Parar, Ajudar, Sair", "Proteção e Ação Social"],
    respostaCorreta: 1,
    explicacao: "PAS significa Prevenir novos acidentes, Alertar o socorro e Socorrer as vítimas.",
    baseLegal: "Protocolo SAMU",
    dificuldade: "facil"
  },
  {
    id: 126,
    categoria: "Primeiros Socorros",
    pergunta: "Em caso de afogamento, o que fazer primeiro?",
    opcoes: ["Dar água", "Retirar a pessoa da água com segurança", "Esperar ela sair sozinha", "Pular na água imediatamente"],
    respostaCorreta: 1,
    explicacao: "Deve-se retirar a pessoa da água com segurança, sem se colocar em risco.",
    baseLegal: "Protocolo SAMU",
    dificuldade: "facil"
  },
  
  // Questões Médias (16)
  {
    id: 127,
    categoria: "Primeiros Socorros",
    pergunta: "Deve-se remover o capacete de um motociclista acidentado?",
    opcoes: ["Sim, sempre", "Não, exceto se ele não estiver respirando", "Depende do horário", "Só médicos podem"],
    respostaCorreta: 1,
    explicacao: "O capacete só deve ser removido se a vítima não estiver respirando, para permitir socorro.",
    baseLegal: "Protocolo SAMU",
    dificuldade: "media"
  },
  {
    id: 128,
    categoria: "Primeiros Socorros",
    pergunta: "Deve-se movimentar uma vítima com suspeita de lesão na coluna?",
    opcoes: ["Sim, para local seguro", "Não, manter imóvel", "Depende da situação", "Sim, para verificar"],
    respostaCorreta: 1,
    explicacao: "Vítimas com suspeita de lesão na coluna não devem ser movidas, exceto em risco iminente.",
    baseLegal: "Protocolo SAMU",
    dificuldade: "media"
  },
  {
    id: 129,
    categoria: "Primeiros Socorros",
    pergunta: "Quantas compressões torácicas por minuto na RCP?",
    opcoes: ["60", "80", "100 a 120", "150"],
    respostaCorreta: 2,
    explicacao: "A RCP deve ser feita com 100 a 120 compressões por minuto.",
    baseLegal: "American Heart Association / Protocolo SAMU",
    dificuldade: "media"
  },
  {
    id: 130,
    categoria: "Primeiros Socorros",
    pergunta: "Qual item deve estar no kit de primeiros socorros do veículo?",
    opcoes: ["Extintor", "Triângulo", "Nenhum é obrigatório", "Luvas descartáveis"],
    respostaCorreta: 2,
    explicacao: "Atualmente, kit de primeiros socorros não é mais obrigatório em veículos particulares.",
    baseLegal: "Resolução CONTRAN 36/98 (revogada)",
    dificuldade: "media"
  },
  {
    id: 131,
    categoria: "Primeiros Socorros",
    pergunta: "O que fazer em caso de convulsão?",
    opcoes: ["Segurar a língua", "Proteger a cabeça e afastar objetos", "Dar água", "Sacudir a pessoa"],
    respostaCorreta: 1,
    explicacao: "Em convulsões, deve-se proteger a cabeça da vítima e afastar objetos que possam machucar.",
    baseLegal: "Protocolo SAMU",
    dificuldade: "media"
  },
  {
    id: 132,
    categoria: "Primeiros Socorros",
    pergunta: "Qual a profundidade das compressões torácicas em adultos?",
    opcoes: ["2 a 3 cm", "5 a 6 cm", "8 a 10 cm", "1 cm"],
    respostaCorreta: 1,
    explicacao: "Em adultos, as compressões devem ter profundidade de 5 a 6 centímetros.",
    baseLegal: "American Heart Association",
    dificuldade: "media"
  },
  {
    id: 133,
    categoria: "Primeiros Socorros",
    pergunta: "O torniquete deve ser usado:",
    opcoes: ["Em qualquer hemorragia", "Apenas em amputações ou hemorragias não controláveis", "Nunca", "Sempre acima do cotovelo"],
    respostaCorreta: 1,
    explicacao: "O torniquete é último recurso, usado apenas quando a pressão direta não controla a hemorragia.",
    baseLegal: "Protocolo SAMU",
    dificuldade: "media"
  },
  {
    id: 134,
    categoria: "Primeiros Socorros",
    pergunta: "O que é hipotermia?",
    opcoes: ["Temperatura corporal alta", "Temperatura corporal baixa", "Pressão alta", "Frequência cardíaca alta"],
    respostaCorreta: 1,
    explicacao: "Hipotermia é a redução perigosa da temperatura corporal, abaixo de 35°C.",
    baseLegal: "Protocolo SAMU",
    dificuldade: "media"
  },
  {
    id: 135,
    categoria: "Primeiros Socorros",
    pergunta: "Em uma queimadura, por quanto tempo resfriar com água?",
    opcoes: ["30 segundos", "1 minuto", "5 a 10 minutos", "30 minutos"],
    respostaCorreta: 2,
    explicacao: "Deve-se resfriar a queimadura com água corrente por 5 a 10 minutos para aliviar a dor e reduzir danos.",
    baseLegal: "Protocolo SAMU",
    dificuldade: "media"
  },
  {
    id: 136,
    categoria: "Primeiros Socorros",
    pergunta: "Quais são os sinais de parada cardiorrespiratória?",
    opcoes: ["Dor de cabeça e febre", "Inconsciência, sem respiração, sem pulso", "Tosse e espirro", "Tontura e náusea"],
    respostaCorreta: 1,
    explicacao: "Os sinais de PCR são: inconsciência, ausência de respiração e ausência de pulso.",
    baseLegal: "Protocolo SAMU",
    dificuldade: "media"
  },
  {
    id: 137,
    categoria: "Primeiros Socorros",
    pergunta: "O que NÃO se deve fazer em caso de queimadura?",
    opcoes: ["Resfriar com água", "Cobrir com pano limpo", "Aplicar pomadas ou cremes", "Procurar atendimento médico"],
    respostaCorreta: 2,
    explicacao: "Nunca aplique pomadas, cremes, manteiga ou pasta de dente em queimaduras.",
    baseLegal: "Protocolo SAMU",
    dificuldade: "media"
  },
  {
    id: 138,
    categoria: "Primeiros Socorros",
    pergunta: "Qual a relação compressão/ventilação na RCP para leigos?",
    opcoes: ["15:1", "15:2", "30:2", "Apenas compressões contínuas"],
    respostaCorreta: 3,
    explicacao: "Para leigos, recomenda-se apenas compressões contínuas sem pausas para ventilação.",
    baseLegal: "American Heart Association - Diretrizes 2020",
    dificuldade: "media"
  },
  {
    id: 139,
    categoria: "Primeiros Socorros",
    pergunta: "O que é um AED/DEA?",
    opcoes: ["Tipo de ambulância", "Desfibrilador Externo Automático", "Máscara de oxigênio", "Monitor cardíaco"],
    respostaCorreta: 1,
    explicacao: "DEA é o Desfibrilador Externo Automático, usado para restabelecer o ritmo cardíaco.",
    baseLegal: "American Heart Association",
    dificuldade: "media"
  },
  {
    id: 140,
    categoria: "Primeiros Socorros",
    pergunta: "Qual o número da Polícia Rodoviária Federal?",
    opcoes: ["190", "191", "192", "193"],
    respostaCorreta: 1,
    explicacao: "A Polícia Rodoviária Federal atende pelo número 191.",
    baseLegal: "Lei 10.446/02",
    dificuldade: "media"
  },
  {
    id: 141,
    categoria: "Primeiros Socorros",
    pergunta: "O que fazer se um objeto estiver cravado no corpo da vítima?",
    opcoes: ["Remover imediatamente", "Não remover, estabilizar o objeto", "Empurrar mais fundo", "Ignorar o objeto"],
    respostaCorreta: 1,
    explicacao: "Nunca remova objetos cravados. Estabilize-os no lugar e aguarde socorro especializado.",
    baseLegal: "Protocolo SAMU",
    dificuldade: "media"
  },
  {
    id: 142,
    categoria: "Primeiros Socorros",
    pergunta: "Como identificar se uma vítima está respirando?",
    opcoes: ["Perguntar para ela", "Ver, ouvir, sentir por 10 segundos", "Medir a pressão", "Verificar a pupila"],
    respostaCorreta: 1,
    explicacao: "Use a técnica VOS: Ver o tórax subir, Ouvir a respiração, Sentir o ar nas bochechas.",
    baseLegal: "Protocolo SAMU",
    dificuldade: "media"
  },
  
  // Questões Difíceis - Pegadinhas (8)
  {
    id: 143,
    categoria: "Primeiros Socorros",
    pergunta: "Uma vítima de acidente está consciente mas não sente as pernas. O que NÃO deve fazer?",
    opcoes: ["Chamar socorro", "Manter a vítima imóvel", "Movê-la para local mais confortável", "Cobri-la para evitar hipotermia"],
    respostaCorreta: 2,
    explicacao: "PEGADINHA: Perda de sensibilidade nas pernas indica possível lesão medular. NÃO mover a vítima!",
    baseLegal: "Protocolo SAMU",
    dificuldade: "dificil"
  },
  {
    id: 144,
    categoria: "Primeiros Socorros",
    pergunta: "Qual a única situação em que se deve mover uma vítima com suspeita de lesão na coluna?",
    opcoes: ["Para deixá-la mais confortável", "Risco iminente de morte (incêndio, desabamento)", "Para verificar ferimentos", "Nunca se deve mover"],
    respostaCorreta: 1,
    explicacao: "PEGADINHA: Só se move a vítima quando o risco de NÃO mover (morte) supera o risco de mover (paralisia).",
    baseLegal: "Protocolo SAMU",
    dificuldade: "dificil"
  },
  {
    id: 145,
    categoria: "Primeiros Socorros",
    pergunta: "Ao encontrar uma vítima inconsciente sem respirar, qual a primeira ação?",
    opcoes: ["Iniciar compressões torácicas", "Verificar se há objetos na boca", "Chamar socorro", "Dar 2 ventilações"],
    respostaCorreta: 2,
    explicacao: "PEGADINHA: A PRIMEIRA ação é sempre chamar socorro (ou pedir para alguém chamar). Depois inicia-se RCP.",
    baseLegal: "American Heart Association",
    dificuldade: "dificil"
  },
  {
    id: 146,
    categoria: "Primeiros Socorros",
    pergunta: "Em uma convulsão, qual objeto NÃO deve ser colocado na boca da vítima?",
    opcoes: ["Colher", "Pano", "Dedo", "Todos os anteriores - nada deve ser colocado"],
    respostaCorreta: 3,
    explicacao: "PEGADINHA: NUNCA coloque nada na boca de uma pessoa convulsionando. Ela NÃO engole a língua.",
    baseLegal: "Protocolo SAMU",
    dificuldade: "dificil"
  },
  {
    id: 147,
    categoria: "Primeiros Socorros",
    pergunta: "Uma vítima de choque elétrico está caída sobre o fio. O que fazer?",
    opcoes: ["Puxar a vítima rapidamente", "Afastar o fio com as mãos secas", "Desligar a fonte de energia ou afastar com material isolante", "Jogar água para dispersar a corrente"],
    respostaCorreta: 2,
    explicacao: "PEGADINHA: Nunca toque diretamente. Desligue a energia ou use material isolante (madeira, borracha).",
    baseLegal: "Protocolo SAMU",
    dificuldade: "dificil"
  },
  {
    id: 148,
    categoria: "Primeiros Socorros",
    pergunta: "Qual o tempo máximo aceitável entre uma parada cardíaca e o início da RCP para evitar danos cerebrais?",
    opcoes: ["30 segundos", "2 a 3 minutos", "4 a 6 minutos", "10 minutos"],
    respostaCorreta: 2,
    explicacao: "PEGADINHA: Após 4-6 minutos sem oxigênio, começam danos cerebrais irreversíveis. Por isso a RCP é urgente.",
    baseLegal: "American Heart Association",
    dificuldade: "dificil"
  },
  {
    id: 149,
    categoria: "Primeiros Socorros",
    pergunta: "Em queimadura de 3º grau, a vítima sente muita dor no local?",
    opcoes: ["Sim, dor intensa", "Não, pois as terminações nervosas foram destruídas", "Depende da área", "Sim, mais que nas outras queimaduras"],
    respostaCorreta: 1,
    explicacao: "PEGADINHA: Na queimadura de 3º grau, NÃO há dor no centro da lesão pois os nervos foram destruídos.",
    baseLegal: "Protocolo SAMU",
    dificuldade: "dificil"
  },
  {
    id: 150,
    categoria: "Primeiros Socorros",
    pergunta: "Um socorrista leigo deve verificar o pulso da vítima antes de iniciar RCP?",
    opcoes: ["Sim, sempre", "Não, apenas profissionais fazem isso", "Sim, por 30 segundos", "Depende da situação"],
    respostaCorreta: 1,
    explicacao: "PEGADINHA: Leigos NÃO devem verificar pulso (difícil e impreciso). Se não responde e não respira = iniciar RCP.",
    baseLegal: "American Heart Association - Diretrizes 2020",
    dificuldade: "dificil"
  },

  // =====================================
  // SINALIZAÇÃO DE TRÂNSITO (50 questões)
  // =====================================
  
  // Questões Fáceis (20)
  {
    id: 151,
    categoria: "Sinalização de Trânsito",
    pergunta: "O que indica a placa circular vermelha com fundo branco?",
    opcoes: ["Advertência", "Regulamentação", "Indicação", "Obras"],
    respostaCorreta: 1,
    explicacao: "Placas circulares vermelhas com fundo branco são de regulamentação (proibição ou restrição).",
    baseLegal: "Anexo II do CTB",
    dificuldade: "facil"
  },
  {
    id: 152,
    categoria: "Sinalização de Trânsito",
    pergunta: "Qual a cor predominante das placas de advertência?",
    opcoes: ["Vermelha", "Amarela", "Verde", "Azul"],
    respostaCorreta: 1,
    explicacao: "Placas de advertência têm fundo amarelo e formato de losango.",
    baseLegal: "Anexo II do CTB",
    dificuldade: "facil"
  },
  {
    id: 153,
    categoria: "Sinalização de Trânsito",
    pergunta: "O que significa a faixa contínua amarela no centro da pista?",
    opcoes: ["Pode ultrapassar", "Proibido ultrapassar", "Estacionamento", "Área escolar"],
    respostaCorreta: 1,
    explicacao: "Faixa contínua amarela indica proibição de ultrapassagem.",
    baseLegal: "Anexo II do CTB",
    dificuldade: "facil"
  },
  {
    id: 154,
    categoria: "Sinalização de Trânsito",
    pergunta: "O que indica a placa R-1 (PARE)?",
    opcoes: ["Reduza a velocidade", "Parada obrigatória", "Dê preferência", "Proibido parar"],
    respostaCorreta: 1,
    explicacao: "A placa R-1 indica parada obrigatória antes de entrar na via preferencial.",
    baseLegal: "Anexo II do CTB",
    dificuldade: "facil"
  },
  {
    id: 155,
    categoria: "Sinalização de Trânsito",
    pergunta: "As placas de indicação são de qual cor?",
    opcoes: ["Amarela", "Vermelha", "Verde ou azul", "Branca"],
    respostaCorreta: 2,
    explicacao: "Placas de indicação são verdes (destinos) ou azuis (serviços e atrativos turísticos).",
    baseLegal: "Anexo II do CTB",
    dificuldade: "facil"
  },
  {
    id: 156,
    categoria: "Sinalização de Trânsito",
    pergunta: "O que significa semáforo amarelo?",
    opcoes: ["Avance", "Pare", "Atenção, semáforo vai fechar", "Preferência"],
    respostaCorreta: 2,
    explicacao: "O amarelo indica atenção: o semáforo vai mudar para vermelho.",
    baseLegal: "Art. 41, §1º do CTB",
    dificuldade: "facil"
  },
  {
    id: 157,
    categoria: "Sinalização de Trânsito",
    pergunta: "Qual placa indica velocidade máxima permitida?",
    opcoes: ["Triangular amarela", "Circular vermelha com número", "Quadrada verde", "Octogonal vermelha"],
    respostaCorreta: 1,
    explicacao: "A placa de velocidade máxima é circular, com borda vermelha e número no centro.",
    baseLegal: "Anexo II do CTB",
    dificuldade: "facil"
  },
  {
    id: 158,
    categoria: "Sinalização de Trânsito",
    pergunta: "O que indica a faixa tracejada branca?",
    opcoes: ["Proibido mudar de faixa", "Permitido mudar de faixa", "Área de estacionamento", "Pista exclusiva de ônibus"],
    respostaCorreta: 1,
    explicacao: "Faixa tracejada branca indica que é permitido mudar de faixa.",
    baseLegal: "Anexo II do CTB",
    dificuldade: "facil"
  },
  {
    id: 159,
    categoria: "Sinalização de Trânsito",
    pergunta: "Qual o formato das placas de advertência?",
    opcoes: ["Circular", "Quadrado", "Losango", "Triangular"],
    respostaCorreta: 2,
    explicacao: "Placas de advertência têm formato de losango (quadrado apoiado em um vértice).",
    baseLegal: "Anexo II do CTB",
    dificuldade: "facil"
  },
  {
    id: 160,
    categoria: "Sinalização de Trânsito",
    pergunta: "Placas com fundo laranja indicam:",
    opcoes: ["Serviços", "Obras", "Escolas", "Hospitais"],
    respostaCorreta: 1,
    explicacao: "Placas com fundo laranja indicam obras ou serviços temporários na via.",
    baseLegal: "Anexo II do CTB",
    dificuldade: "facil"
  },
  {
    id: 161,
    categoria: "Sinalização de Trânsito",
    pergunta: "O que significa a faixa de pedestres?",
    opcoes: ["Preferência para veículos", "Preferência para pedestres", "Proibido pedestres", "Estacionamento"],
    respostaCorreta: 1,
    explicacao: "A faixa de pedestres indica preferência de travessia para pedestres.",
    baseLegal: "Art. 70 do CTB",
    dificuldade: "facil"
  },
  {
    id: 162,
    categoria: "Sinalização de Trânsito",
    pergunta: "Qual placa indica 'proibido estacionar'?",
    opcoes: ["Círculo vermelho com E cortado", "Triângulo amarelo", "Quadrado azul", "Retângulo verde"],
    respostaCorreta: 0,
    explicacao: "A placa de proibido estacionar é circular com a letra E e uma barra diagonal.",
    baseLegal: "Anexo II do CTB",
    dificuldade: "facil"
  },
  {
    id: 163,
    categoria: "Sinalização de Trânsito",
    pergunta: "O que indica a pintura amarela no meio-fio?",
    opcoes: ["Estacionamento livre", "Proibido estacionar", "Ponto de ônibus", "Área de carga/descarga"],
    respostaCorreta: 1,
    explicacao: "Meio-fio pintado de amarelo indica proibição de estacionamento.",
    baseLegal: "Anexo II do CTB",
    dificuldade: "facil"
  },
  {
    id: 164,
    categoria: "Sinalização de Trânsito",
    pergunta: "A faixa branca contínua no bordo da pista indica:",
    opcoes: ["Limite da pista", "Faixa de pedestres", "Pode ultrapassar", "Área de estacionamento"],
    respostaCorreta: 0,
    explicacao: "A linha branca contínua no bordo indica o limite entre a pista e o acostamento.",
    baseLegal: "Anexo II do CTB",
    dificuldade: "facil"
  },
  {
    id: 165,
    categoria: "Sinalização de Trânsito",
    pergunta: "Qual é a cor das placas de serviços auxiliares?",
    opcoes: ["Verde", "Azul", "Amarela", "Branca"],
    respostaCorreta: 1,
    explicacao: "Placas azuis indicam serviços auxiliares como hospitais, postos, telefones.",
    baseLegal: "Anexo II do CTB",
    dificuldade: "facil"
  },
  {
    id: 166,
    categoria: "Sinalização de Trânsito",
    pergunta: "O que indica a placa de 'Dê a preferência'?",
    opcoes: ["Pare obrigatoriamente", "Reduza e dê passagem se necessário", "Velocidade máxima", "Área escolar"],
    respostaCorreta: 1,
    explicacao: "A placa indica que o condutor deve reduzir a velocidade e dar preferência.",
    baseLegal: "Anexo II do CTB",
    dificuldade: "facil"
  },
  {
    id: 167,
    categoria: "Sinalização de Trânsito",
    pergunta: "Qual a cor do semáforo que indica 'siga'?",
    opcoes: ["Vermelho", "Amarelo", "Verde", "Branco"],
    respostaCorreta: 2,
    explicacao: "A luz verde do semáforo indica que o condutor pode prosseguir.",
    baseLegal: "Art. 41 do CTB",
    dificuldade: "facil"
  },
  {
    id: 168,
    categoria: "Sinalização de Trânsito",
    pergunta: "O que significa uma placa com seta para a direita obrigatória?",
    opcoes: ["Pode virar à direita", "Deve virar à direita obrigatoriamente", "Proibido virar à direita", "Preferência à direita"],
    respostaCorreta: 1,
    explicacao: "A placa de 'Vire à direita' indica direção obrigatória.",
    baseLegal: "Anexo II do CTB",
    dificuldade: "facil"
  },
  {
    id: 169,
    categoria: "Sinalização de Trânsito",
    pergunta: "Qual placa indica área escolar?",
    opcoes: ["Losango amarelo com crianças", "Círculo vermelho com E", "Quadrado verde", "Triângulo vermelho"],
    respostaCorreta: 0,
    explicacao: "A placa de advertência (losango amarelo) com figuras de crianças indica proximidade de escola.",
    baseLegal: "Anexo II do CTB",
    dificuldade: "facil"
  },
  {
    id: 170,
    categoria: "Sinalização de Trânsito",
    pergunta: "O que indica a placa 'Proibido Parar e Estacionar'?",
    opcoes: ["Apenas proibido estacionar", "Proibido parar momentaneamente e estacionar", "Pode parar mas não estacionar", "Apenas carga e descarga"],
    respostaCorreta: 1,
    explicacao: "Esta placa proíbe tanto a parada (momentânea) quanto o estacionamento (prolongado).",
    baseLegal: "Anexo II do CTB",
    dificuldade: "facil"
  },
  
  // Questões Médias (20)
  {
    id: 171,
    categoria: "Sinalização de Trânsito",
    pergunta: "Qual a ordem de prioridade no trânsito?",
    opcoes: ["Sinalização, agente, regra geral", "Agente, sinalização, regra geral", "Regra geral, sinalização, agente", "Não há ordem"],
    respostaCorreta: 1,
    explicacao: "A ordem de prioridade é: 1º agente de trânsito, 2º sinalização e 3º regras gerais do CTB.",
    baseLegal: "Art. 88 do CTB",
    dificuldade: "media"
  },
  {
    id: 172,
    categoria: "Sinalização de Trânsito",
    pergunta: "O que significa a faixa dupla amarela contínua?",
    opcoes: ["Pode ultrapassar dos dois lados", "Proibido ultrapassar nos dois sentidos", "Apenas ultrapassar pelo lado direito", "Ultrapassagem permitida apenas à noite"],
    respostaCorreta: 1,
    explicacao: "Faixa dupla contínua amarela proíbe ultrapassagem em ambos os sentidos.",
    baseLegal: "Anexo II do CTB",
    dificuldade: "media"
  },
  {
    id: 173,
    categoria: "Sinalização de Trânsito",
    pergunta: "O que indica a placa triangular amarela com 'X'?",
    opcoes: ["Cruzamento", "Passagem de nível (ferrovia)", "Interdição", "Hospital"],
    respostaCorreta: 1,
    explicacao: "O 'X' em placa amarela indica passagem de nível (cruzamento ferroviário).",
    baseLegal: "Anexo II do CTB",
    dificuldade: "media"
  },
  {
    id: 174,
    categoria: "Sinalização de Trânsito",
    pergunta: "A faixa azul na via indica:",
    opcoes: ["Estacionamento proibido", "Área de estacionamento pago ou regulamentado", "Ponto de ônibus", "Ciclovia"],
    respostaCorreta: 1,
    explicacao: "A faixa azul no pavimento indica área de estacionamento pago ou zona azul.",
    baseLegal: "Anexo II do CTB",
    dificuldade: "media"
  },
  {
    id: 175,
    categoria: "Sinalização de Trânsito",
    pergunta: "O que indica uma faixa amarela e uma tracejada juntas?",
    opcoes: ["Ninguém pode ultrapassar", "Pode ultrapassar quem está do lado tracejado", "Pode ultrapassar quem está do lado contínuo", "Ultrapassagem livre para todos"],
    respostaCorreta: 1,
    explicacao: "Quem está do lado da linha tracejada pode ultrapassar; quem está do lado da contínua, não pode.",
    baseLegal: "Anexo II do CTB",
    dificuldade: "media"
  },
  {
    id: 176,
    categoria: "Sinalização de Trânsito",
    pergunta: "O que significa a marcação em 'zebrado' amarelo no pavimento?",
    opcoes: ["Faixa de pedestres", "Área de conflito - proibido parar ou estacionar", "Estacionamento para deficientes", "Área de embarque"],
    respostaCorreta: 1,
    explicacao: "O zebrado amarelo indica área de conflito onde é proibido parar ou estacionar.",
    baseLegal: "Anexo II do CTB",
    dificuldade: "media"
  },
  {
    id: 177,
    categoria: "Sinalização de Trânsito",
    pergunta: "Placa R-2 (Dê a preferência) tem qual formato?",
    opcoes: ["Circular", "Quadrada", "Triangular invertido", "Octogonal"],
    respostaCorreta: 2,
    explicacao: "A placa R-2 (Dê a preferência) tem formato triangular com vértice para baixo.",
    baseLegal: "Anexo II do CTB",
    dificuldade: "media"
  },
  {
    id: 178,
    categoria: "Sinalização de Trânsito",
    pergunta: "Qual o significado da linha branca em zigue-zague no pavimento?",
    opcoes: ["Faixa de pedestres", "Proibido estacionar (ponto de ônibus)", "Área de ultrapassagem", "Ciclofaixa"],
    respostaCorreta: 1,
    explicacao: "O zigue-zague branco indica proibição de estacionamento (geralmente ponto de ônibus).",
    baseLegal: "Anexo II do CTB",
    dificuldade: "media"
  },
  {
    id: 179,
    categoria: "Sinalização de Trânsito",
    pergunta: "O que indica a placa com fundo marrom?",
    opcoes: ["Serviços auxiliares", "Atrativos turísticos", "Obras", "Educação"],
    respostaCorreta: 1,
    explicacao: "Placas com fundo marrom indicam atrativos turísticos (praias, monumentos, parques).",
    baseLegal: "Anexo II do CTB",
    dificuldade: "media"
  },
  {
    id: 180,
    categoria: "Sinalização de Trânsito",
    pergunta: "O que significa a placa octogonal vermelha com 'PARE'?",
    opcoes: ["Reduza a velocidade", "Pare, verifique e prossiga com segurança", "Proibido parar", "Preferência do condutor"],
    respostaCorreta: 1,
    explicacao: "A placa PARE (R-1) exige parada obrigatória antes de entrar ou cruzar a via.",
    baseLegal: "Anexo II do CTB",
    dificuldade: "media"
  },
  {
    id: 181,
    categoria: "Sinalização de Trânsito",
    pergunta: "Qual a diferença entre a placa circular com borda vermelha e a circular toda azul?",
    opcoes: ["Nenhuma diferença", "Vermelha proíbe, azul obriga ou permite", "Azul proíbe, vermelha permite", "Vermelha é temporária"],
    respostaCorreta: 1,
    explicacao: "Placas com borda vermelha são de PROIBIÇÃO; placas azuis são de OBRIGAÇÃO ou permissão.",
    baseLegal: "Anexo II do CTB",
    dificuldade: "media"
  },
  {
    id: 182,
    categoria: "Sinalização de Trânsito",
    pergunta: "O que indica o semáforo piscando em amarelo?",
    opcoes: ["Pare obrigatoriamente", "Siga normalmente", "Atenção redobrada, siga com cuidado", "Defeito no semáforo, não obedeça"],
    respostaCorreta: 2,
    explicacao: "Semáforo amarelo intermitente indica atenção - o condutor deve prosseguir com cautela.",
    baseLegal: "Art. 41, §2º do CTB",
    dificuldade: "media"
  },
  {
    id: 183,
    categoria: "Sinalização de Trânsito",
    pergunta: "O que indica o semáforo vermelho piscando?",
    opcoes: ["Siga normalmente", "Pare, verifique e prossiga com segurança", "Atenção apenas", "Defeito no semáforo"],
    respostaCorreta: 1,
    explicacao: "Vermelho intermitente indica parada obrigatória; prossiga após verificar segurança.",
    baseLegal: "Art. 41, §2º do CTB",
    dificuldade: "media"
  },
  {
    id: 184,
    categoria: "Sinalização de Trânsito",
    pergunta: "O que indica as tachas refletivas amarelas no pavimento?",
    opcoes: ["Divisão de sentidos de tráfego", "Divisão de faixas de mesmo sentido", "Área de estacionamento", "Faixa de pedestres"],
    respostaCorreta: 0,
    explicacao: "Tachas amarelas dividem fluxos de sentidos opostos; tachas brancas dividem faixas de mesmo sentido.",
    baseLegal: "Anexo II do CTB",
    dificuldade: "media"
  },
  {
    id: 185,
    categoria: "Sinalização de Trânsito",
    pergunta: "A pintura vermelha no meio-fio indica:",
    opcoes: ["Proibido estacionar", "Área de carga e descarga", "Ponto de táxi", "Faixa exclusiva de ônibus"],
    respostaCorreta: 0,
    explicacao: "Meio-fio vermelho indica proibição de estacionamento (similar ao amarelo, mas mais restritivo).",
    baseLegal: "Anexo II do CTB",
    dificuldade: "media"
  },
  {
    id: 186,
    categoria: "Sinalização de Trânsito",
    pergunta: "Qual placa indica 'Área de pedestres'?",
    opcoes: ["Losango amarelo", "Círculo azul com pedestre", "Círculo vermelho com pedestre", "Quadrado verde"],
    respostaCorreta: 1,
    explicacao: "A placa azul com pedestre indica área ou travessia de pedestres (placa de indicação).",
    baseLegal: "Anexo II do CTB",
    dificuldade: "media"
  },
  {
    id: 187,
    categoria: "Sinalização de Trânsito",
    pergunta: "O que é balizamento?",
    opcoes: ["Tipo de multa", "Dispositivos para guiar o tráfego em situações especiais", "Placa de velocidade", "Faixa de pedestres"],
    respostaCorreta: 1,
    explicacao: "Balizamento são dispositivos temporários ou permanentes que orientam o fluxo de veículos.",
    baseLegal: "Anexo II do CTB",
    dificuldade: "media"
  },
  {
    id: 188,
    categoria: "Sinalização de Trânsito",
    pergunta: "A sinalização horizontal branca indica:",
    opcoes: ["Divisão de fluxos opostos", "Divisão de fluxos de mesmo sentido e regulamentações", "Obras", "Áreas proibidas"],
    respostaCorreta: 1,
    explicacao: "Linhas brancas regulam tráfego de mesmo sentido e indicam bordos, faixas, etc.",
    baseLegal: "Anexo II do CTB",
    dificuldade: "media"
  },
  {
    id: 189,
    categoria: "Sinalização de Trânsito",
    pergunta: "Qual o gesto do agente para mandar o trânsito parar?",
    opcoes: ["Braço erguido verticalmente", "Braços abertos horizontalmente", "Braço balançando para baixo", "Polegar para cima"],
    respostaCorreta: 0,
    explicacao: "Braço levantado verticalmente é o gesto para parar (válido para quem vê a frente ou costas do agente).",
    baseLegal: "Anexo II do CTB",
    dificuldade: "media"
  },
  {
    id: 190,
    categoria: "Sinalização de Trânsito",
    pergunta: "Qual o gesto do agente para liberar o trânsito?",
    opcoes: ["Braço erguido", "Braços estendidos horizontalmente, depois abaixando", "Apontando para você", "Virando as costas"],
    respostaCorreta: 1,
    explicacao: "Braços horizontais depois abaixando indica 'siga' para quem está na direção apontada pelos braços.",
    baseLegal: "Anexo II do CTB",
    dificuldade: "media"
  },
  
  // Questões Difíceis - Pegadinhas (10)
  {
    id: 191,
    categoria: "Sinalização de Trânsito",
    pergunta: "O semáforo está verde, mas há um agente de trânsito mandando parar. O que fazer?",
    opcoes: ["Seguir, pois o semáforo é verde", "Parar, pois o agente tem prioridade", "Buzinar e passar devagar", "Esperar o agente sair"],
    respostaCorreta: 1,
    explicacao: "PEGADINHA: O agente de trânsito tem PRIORIDADE sobre qualquer sinalização.",
    baseLegal: "Art. 88 do CTB",
    dificuldade: "dificil"
  },
  {
    id: 192,
    categoria: "Sinalização de Trânsito",
    pergunta: "Uma placa indica 'PARE' mas não há linha de retenção. Onde parar?",
    opcoes: ["Não precisa parar", "Junto à placa, antes de entrar na via preferencial", "Pode passar devagar", "No meio do cruzamento"],
    respostaCorreta: 1,
    explicacao: "PEGADINHA: A obrigação de parar existe mesmo sem linha de retenção. Pare junto à placa.",
    baseLegal: "Anexo II do CTB",
    dificuldade: "dificil"
  },
  {
    id: 193,
    categoria: "Sinalização de Trânsito",
    pergunta: "Qual a diferença de significado entre placa de 'Velocidade Máxima 60' e 'Velocidade Mínima 60'?",
    opcoes: ["Nenhuma", "Máxima é borda vermelha, mínima é fundo azul", "Ambas são vermelhas", "Máxima é azul, mínima é vermelha"],
    respostaCorreta: 1,
    explicacao: "PEGADINHA: Velocidade MÁXIMA tem borda vermelha (proibição). Velocidade MÍNIMA é azul (obrigação).",
    baseLegal: "Anexo II do CTB",
    dificuldade: "dificil"
  },
  {
    id: 194,
    categoria: "Sinalização de Trânsito",
    pergunta: "A placa R-1 (PARE) indica que você deve:",
    opcoes: ["Apenas reduzir a velocidade", "Parar completamente, verificar e prosseguir", "Parar apenas se houver veículos", "Buzinar e seguir"],
    respostaCorreta: 1,
    explicacao: "PEGADINHA: A placa PARE exige parada COMPLETA, mesmo que não haja outros veículos visíveis.",
    baseLegal: "Anexo II do CTB",
    dificuldade: "dificil"
  },
  {
    id: 195,
    categoria: "Sinalização de Trânsito",
    pergunta: "Qual placa NÃO é de regulamentação?",
    opcoes: ["Proibido virar à esquerda", "Velocidade máxima 80 km/h", "Curva acentuada à direita", "Proibido ultrapassar"],
    respostaCorreta: 2,
    explicacao: "PEGADINHA: 'Curva acentuada' é placa de ADVERTÊNCIA (losango amarelo), não regulamentação.",
    baseLegal: "Anexo II do CTB",
    dificuldade: "dificil"
  },
  {
    id: 196,
    categoria: "Sinalização de Trânsito",
    pergunta: "A sinalização de obras tem validade sobre a sinalização permanente?",
    opcoes: ["Não, a permanente sempre vale", "Sim, a temporária prevalece enquanto durar a obra", "Depende do horário", "São equivalentes"],
    respostaCorreta: 1,
    explicacao: "PEGADINHA: A sinalização temporária (obras) PREVALECE sobre a permanente enquanto estiver válida.",
    baseLegal: "Resolução CONTRAN 180/05",
    dificuldade: "dificil"
  },
  {
    id: 197,
    categoria: "Sinalização de Trânsito",
    pergunta: "A faixa de pedestres sem semáforo obriga o veículo a:",
    opcoes: ["Apenas reduzir velocidade", "Parar se houver pedestre atravessando ou esperando", "Buzinar para o pedestre", "Nada, pedestre deve esperar"],
    respostaCorreta: 1,
    explicacao: "PEGADINHA: O veículo deve parar se houver pedestre atravessando OU ESPERANDO para atravessar.",
    baseLegal: "Art. 70 do CTB",
    dificuldade: "dificil"
  },
  {
    id: 198,
    categoria: "Sinalização de Trânsito",
    pergunta: "Qual a única placa de regulamentação que NÃO é circular?",
    opcoes: ["Proibido estacionar", "PARE", "Velocidade máxima", "Sentido proibido"],
    respostaCorreta: 1,
    explicacao: "PEGADINHA: A placa PARE (R-1) é OCTOGONAL, única placa de regulamentação não circular.",
    baseLegal: "Anexo II do CTB",
    dificuldade: "dificil"
  },
  {
    id: 199,
    categoria: "Sinalização de Trânsito",
    pergunta: "Em uma rotatória, a ausência da placa 'Dê a preferência' significa:",
    opcoes: ["Preferência de quem entra", "Preferência de quem circula (regra geral)", "Ninguém tem preferência", "Veículo maior tem preferência"],
    respostaCorreta: 1,
    explicacao: "PEGADINHA: Mesmo sem placa, a regra geral é: quem JÁ ESTÁ circulando na rotatória tem preferência.",
    baseLegal: "Art. 29, III do CTB",
    dificuldade: "dificil"
  },
  {
    id: 200,
    categoria: "Sinalização de Trânsito",
    pergunta: "A placa de advertência indica perigo a qual distância aproximada?",
    opcoes: ["No local exato", "50 a 100 metros antes", "Após o perigo", "1 km antes"],
    respostaCorreta: 1,
    explicacao: "PEGADINHA: Placas de advertência ficam a 50-100m do perigo em vias urbanas; 100-300m em rodovias.",
    baseLegal: "Anexo II do CTB",
    dificuldade: "dificil"
  },

  // =====================================
  // MEIO AMBIENTE E CIDADANIA (50 questões)
  // =====================================
  
  // Questões Fáceis (20)
  {
    id: 201,
    categoria: "Meio Ambiente e Cidadania",
    pergunta: "O que é poluição sonora no trânsito?",
    opcoes: ["Fumaça dos veículos", "Barulho excessivo de buzinas e escapamentos", "Lixo nas ruas", "Falta de sinalização"],
    respostaCorreta: 1,
    explicacao: "Poluição sonora inclui buzinas excessivas, escapamentos barulhentos e ruídos desnecessários.",
    baseLegal: "Art. 227 do CTB",
    dificuldade: "facil"
  },
  {
    id: 202,
    categoria: "Meio Ambiente e Cidadania",
    pergunta: "Qual o principal poluente emitido pelos veículos?",
    opcoes: ["Água", "Monóxido de carbono (CO)", "Oxigênio", "Nitrogênio"],
    respostaCorreta: 1,
    explicacao: "O monóxido de carbono (CO) é um dos principais poluentes emitidos por veículos automotores.",
    baseLegal: "Resolução CONAMA 418/09",
    dificuldade: "facil"
  },
  {
    id: 203,
    categoria: "Meio Ambiente e Cidadania",
    pergunta: "Usar a buzina sem necessidade é:",
    opcoes: ["Permitido", "Proibido", "Recomendado", "Obrigatório"],
    respostaCorreta: 1,
    explicacao: "O uso da buzina sem necessidade é proibido, configurando poluição sonora.",
    baseLegal: "Art. 227 do CTB",
    dificuldade: "facil"
  },
  {
    id: 204,
    categoria: "Meio Ambiente e Cidadania",
    pergunta: "Jogar lixo pela janela do veículo é:",
    opcoes: ["Permitido", "Infração de trânsito", "Normal", "Apenas feio"],
    respostaCorreta: 1,
    explicacao: "Jogar lixo ou objetos pela janela é infração de trânsito (média) além de crime ambiental.",
    baseLegal: "Art. 172 do CTB",
    dificuldade: "facil"
  },
  {
    id: 205,
    categoria: "Meio Ambiente e Cidadania",
    pergunta: "O que é cidadania no trânsito?",
    opcoes: ["Ter CNH", "Respeitar leis, regras e outros usuários", "Dirigir rápido", "Ter carro novo"],
    respostaCorreta: 1,
    explicacao: "Cidadania no trânsito é o comportamento respeitoso e solidário com todos os usuários das vias.",
    baseLegal: "Art. 1º, §2º do CTB",
    dificuldade: "facil"
  },
  {
    id: 206,
    categoria: "Meio Ambiente e Cidadania",
    pergunta: "Por que a manutenção preventiva reduz a poluição?",
    opcoes: ["Não reduz", "Motor regulado emite menos poluentes", "Só economiza combustível", "Apenas por ser novo"],
    respostaCorreta: 1,
    explicacao: "Um motor bem regulado queima combustível de forma mais eficiente, emitindo menos poluentes.",
    baseLegal: "Resolução CONAMA 418/09",
    dificuldade: "facil"
  },
  {
    id: 207,
    categoria: "Meio Ambiente e Cidadania",
    pergunta: "O trânsito contribui para o aquecimento global através de:",
    opcoes: ["Apenas buzinas", "Emissão de CO2 e outros gases de efeito estufa", "Faróis", "Nada"],
    respostaCorreta: 1,
    explicacao: "Veículos emitem CO2 e outros gases de efeito estufa que contribuem para o aquecimento global.",
    baseLegal: "Protocolo de Kyoto / Acordo de Paris",
    dificuldade: "facil"
  },
  {
    id: 208,
    categoria: "Meio Ambiente e Cidadania",
    pergunta: "Qual atitude reduz o consumo de combustível?",
    opcoes: ["Acelerar bruscamente", "Manter velocidade constante", "Usar ar condicionado sempre", "Manter pneus murchos"],
    respostaCorreta: 1,
    explicacao: "Manter velocidade constante evita acelerações e frenagens desnecessárias, economizando combustível.",
    baseLegal: "Manual de Direção Econômica",
    dificuldade: "facil"
  },
  {
    id: 209,
    categoria: "Meio Ambiente e Cidadania",
    pergunta: "O respeito ao pedestre é dever de:",
    opcoes: ["Apenas motoristas de ônibus", "Todos os condutores", "Apenas em faixas", "Ninguém"],
    respostaCorreta: 1,
    explicacao: "Todo condutor deve respeitar o pedestre, especialmente em travessias e áreas de circulação.",
    baseLegal: "Art. 70 do CTB",
    dificuldade: "facil"
  },
  {
    id: 210,
    categoria: "Meio Ambiente e Cidadania",
    pergunta: "Qual combustível é considerado menos poluente?",
    opcoes: ["Gasolina", "Diesel", "Etanol", "Querosene"],
    respostaCorreta: 2,
    explicacao: "O etanol é considerado mais limpo pois é renovável e emite menos poluentes em sua queima.",
    baseLegal: "PROCONVE",
    dificuldade: "facil"
  },
  {
    id: 211,
    categoria: "Meio Ambiente e Cidadania",
    pergunta: "O que é carona solidária?",
    opcoes: ["Pegar carona sem pagar", "Compartilhar veículo para reduzir carros nas ruas", "Táxi gratuito", "Andar de ônibus"],
    respostaCorreta: 1,
    explicacao: "Carona solidária é o compartilhamento de veículos, reduzindo congestionamentos e poluição.",
    baseLegal: "Política Nacional de Mobilidade Urbana",
    dificuldade: "facil"
  },
  {
    id: 212,
    categoria: "Meio Ambiente e Cidadania",
    pergunta: "Por que devemos dar preferência a ciclistas?",
    opcoes: ["Porque são mais rápidos", "São mais vulneráveis e usam transporte limpo", "Não devemos", "Apenas em ciclovias"],
    respostaCorreta: 1,
    explicacao: "Ciclistas são usuários vulneráveis e usam meio de transporte não poluente, merecendo proteção especial.",
    baseLegal: "Art. 29, §2º do CTB",
    dificuldade: "facil"
  },
  {
    id: 213,
    categoria: "Meio Ambiente e Cidadania",
    pergunta: "O escapamento com fumaça preta indica:",
    opcoes: ["Motor em boas condições", "Problema na queima de combustível", "Carro novo", "Maior potência"],
    respostaCorreta: 1,
    explicacao: "Fumaça preta indica queima incompleta de combustível, sinal de motor desregulado ou problema mecânico.",
    baseLegal: "Resolução CONAMA 418/09",
    dificuldade: "facil"
  },
  {
    id: 214,
    categoria: "Meio Ambiente e Cidadania",
    pergunta: "A cortesia no trânsito inclui:",
    opcoes: ["Fechar outros veículos", "Dar passagem e respeitar o próximo", "Buzinar sempre", "Andar na contramão"],
    respostaCorreta: 1,
    explicacao: "A cortesia inclui dar passagem, respeitar filas, agradecer gestos educados e facilitar a vida de todos.",
    baseLegal: "Art. 26 do CTB",
    dificuldade: "facil"
  },
  {
    id: 215,
    categoria: "Meio Ambiente e Cidadania",
    pergunta: "O que fazer com o óleo usado do motor?",
    opcoes: ["Jogar no esgoto", "Descartar em posto de coleta autorizado", "Jogar no lixo comum", "Queimar"],
    respostaCorreta: 1,
    explicacao: "O óleo usado deve ser levado a postos de coleta para reciclagem. Jogar em esgoto é crime ambiental.",
    baseLegal: "Resolução CONAMA 362/05",
    dificuldade: "facil"
  },
  {
    id: 216,
    categoria: "Meio Ambiente e Cidadania",
    pergunta: "Por que respeitar idosos e deficientes no trânsito?",
    opcoes: ["Não é necessário", "São usuários vulneráveis com direito à prioridade", "Apenas se tiverem pressa", "Só em hospitais"],
    respostaCorreta: 1,
    explicacao: "Idosos e pessoas com deficiência têm prioridade legal e devem ser respeitados em todas as situações.",
    baseLegal: "Art. 70, parágrafo único do CTB",
    dificuldade: "facil"
  },
  {
    id: 217,
    categoria: "Meio Ambiente e Cidadania",
    pergunta: "Deixar o motor ligado enquanto espera é:",
    opcoes: ["Recomendado", "Desperdício de combustível e causa poluição", "Obrigatório", "Bom para o motor"],
    respostaCorreta: 1,
    explicacao: "Motor ligado desnecessariamente desperdiça combustível e emite poluentes sem necessidade.",
    baseLegal: "Art. 228 do CTB",
    dificuldade: "facil"
  },
  {
    id: 218,
    categoria: "Meio Ambiente e Cidadania",
    pergunta: "O uso de transporte público contribui para:",
    opcoes: ["Mais congestionamentos", "Menos carros nas ruas e menos poluição", "Nada", "Mais acidentes"],
    respostaCorreta: 1,
    explicacao: "O transporte público reduz o número de veículos, diminuindo congestionamentos e poluição.",
    baseLegal: "Política Nacional de Mobilidade Urbana",
    dificuldade: "facil"
  },
  {
    id: 219,
    categoria: "Meio Ambiente e Cidadania",
    pergunta: "Qual a importância da sinalização de acessibilidade?",
    opcoes: ["Nenhuma", "Garantir acesso de pessoas com deficiência", "Apenas decorativo", "Para ambulâncias"],
    respostaCorreta: 1,
    explicacao: "Vagas e acessos sinalizados garantem a inclusão e mobilidade de pessoas com deficiência.",
    baseLegal: "Lei 13.146/15 - Estatuto da Pessoa com Deficiência",
    dificuldade: "facil"
  },
  {
    id: 220,
    categoria: "Meio Ambiente e Cidadania",
    pergunta: "A educação para o trânsito deve começar:",
    opcoes: ["Aos 18 anos", "Na infância", "Ao tirar CNH", "Nunca"],
    respostaCorreta: 1,
    explicacao: "A educação para o trânsito deve começar na infância, formando cidadãos conscientes desde cedo.",
    baseLegal: "Art. 76 do CTB",
    dificuldade: "facil"
  },
  
  // Questões Médias (20)
  {
    id: 221,
    categoria: "Meio Ambiente e Cidadania",
    pergunta: "O que é o PROCONVE?",
    opcoes: ["Programa de Convênios", "Programa de Controle de Poluição do Ar por Veículos", "Proteção ao Consumidor de Veículos", "Programa de Conservação de Estradas"],
    respostaCorreta: 1,
    explicacao: "PROCONVE é o Programa de Controle de Poluição do Ar por Veículos Automotores, que define limites de emissões.",
    baseLegal: "Resolução CONAMA 418/09",
    dificuldade: "media"
  },
  {
    id: 222,
    categoria: "Meio Ambiente e Cidadania",
    pergunta: "Qual gás provoca o efeito estufa e é emitido pelos veículos?",
    opcoes: ["Oxigênio", "Nitrogênio", "Dióxido de carbono (CO2)", "Hélio"],
    respostaCorreta: 2,
    explicacao: "O CO2 (dióxido de carbono) é um dos principais gases de efeito estufa emitidos por veículos.",
    baseLegal: "IPCC / PROCONVE",
    dificuldade: "media"
  },
  {
    id: 223,
    categoria: "Meio Ambiente e Cidadania",
    pergunta: "O catalisador no veículo serve para:",
    opcoes: ["Aumentar a potência", "Reduzir emissões de poluentes", "Economizar combustível", "Fazer barulho"],
    respostaCorreta: 1,
    explicacao: "O catalisador transforma gases tóxicos do escapamento em substâncias menos nocivas.",
    baseLegal: "PROCONVE",
    dificuldade: "media"
  },
  {
    id: 224,
    categoria: "Meio Ambiente e Cidadania",
    pergunta: "O que é rodízio de veículos?",
    opcoes: ["Troca de pneus", "Restrição de circulação em dias alternados", "Troca de motorista", "Revisão periódica"],
    respostaCorreta: 1,
    explicacao: "Rodízio é a restrição de circulação de veículos em determinados dias para reduzir poluição e congestionamento.",
    baseLegal: "Legislação municipal (ex: São Paulo)",
    dificuldade: "media"
  },
  {
    id: 225,
    categoria: "Meio Ambiente e Cidadania",
    pergunta: "Qual é a consequência da queima incompleta de combustível?",
    opcoes: ["Maior potência", "Emissão de monóxido de carbono (CO)", "Economia de combustível", "Motor mais silencioso"],
    respostaCorreta: 1,
    explicacao: "A queima incompleta produz monóxido de carbono (CO), gás tóxico e inodoro.",
    baseLegal: "PROCONVE",
    dificuldade: "media"
  },
  {
    id: 226,
    categoria: "Meio Ambiente e Cidadania",
    pergunta: "O que significa mobilidade sustentável?",
    opcoes: ["Andar apenas de carro", "Usar meios de transporte que causem menos impacto ambiental", "Não sair de casa", "Usar apenas metrô"],
    respostaCorreta: 1,
    explicacao: "Mobilidade sustentável prioriza meios de transporte com menor impacto ambiental e social.",
    baseLegal: "Política Nacional de Mobilidade Urbana",
    dificuldade: "media"
  },
  {
    id: 227,
    categoria: "Meio Ambiente e Cidadania",
    pergunta: "Por que pneus descartados incorretamente são problema ambiental?",
    opcoes: ["Não são problema", "Acumulam água (dengue), queima polui, demoram a degradar", "São biodegradáveis", "Só ocupam espaço"],
    respostaCorreta: 1,
    explicacao: "Pneus acumulam água (mosquitos), levam séculos para degradar e sua queima libera poluentes tóxicos.",
    baseLegal: "Resolução CONAMA 416/09",
    dificuldade: "media"
  },
  {
    id: 228,
    categoria: "Meio Ambiente e Cidadania",
    pergunta: "Qual a responsabilidade do cidadão quanto à emissão de poluentes?",
    opcoes: ["Nenhuma, é do governo", "Manter veículo regulado e em boas condições", "Apenas não jogar lixo", "Só profissionais devem se preocupar"],
    respostaCorreta: 1,
    explicacao: "Todo cidadão deve manter seu veículo regulado para reduzir emissões, conforme determina a lei.",
    baseLegal: "Art. 104 do CTB",
    dificuldade: "media"
  },
  {
    id: 229,
    categoria: "Meio Ambiente e Cidadania",
    pergunta: "O que é inspeção veicular?",
    opcoes: ["Teste de direção", "Verificação de emissões e segurança do veículo", "Exame de CNH", "Lavagem do carro"],
    respostaCorreta: 1,
    explicacao: "Inspeção veicular verifica se o veículo atende aos padrões de emissões e segurança exigidos.",
    baseLegal: "Resolução CONTRAN 716/17",
    dificuldade: "media"
  },
  {
    id: 230,
    categoria: "Meio Ambiente e Cidadania",
    pergunta: "Qual é um comportamento de direção econômica?",
    opcoes: ["Aceleradas fortes", "Manter RPM baixo e marcha adequada", "Freadas bruscas", "Motor em alta rotação"],
    respostaCorreta: 1,
    explicacao: "Manter RPM baixo e usar a marcha adequada economiza combustível e reduz emissões.",
    baseLegal: "Manual de Direção Econômica",
    dificuldade: "media"
  },
  {
    id: 231,
    categoria: "Meio Ambiente e Cidadania",
    pergunta: "Pedestres e ciclistas são considerados:",
    opcoes: ["Obstáculos", "Usuários vulneráveis do trânsito", "Infratores", "Secundários"],
    respostaCorreta: 1,
    explicacao: "Pedestres e ciclistas são usuários vulneráveis e devem ter prioridade e proteção especial.",
    baseLegal: "Art. 29, §2º do CTB",
    dificuldade: "media"
  },
  {
    id: 232,
    categoria: "Meio Ambiente e Cidadania",
    pergunta: "Como o congestionamento afeta o meio ambiente?",
    opcoes: ["Não afeta", "Aumenta tempo de motor ligado, mais poluição e combustível", "Diminui poluição", "Só afeta economia"],
    respostaCorreta: 1,
    explicacao: "Congestionamentos mantêm motores ligados por mais tempo, aumentando emissões e consumo.",
    baseLegal: "Estudos de tráfego urbano",
    dificuldade: "media"
  },
  {
    id: 233,
    categoria: "Meio Ambiente e Cidadania",
    pergunta: "A calibragem correta dos pneus afeta a poluição?",
    opcoes: ["Não", "Sim, pneus murchos aumentam consumo e emissões", "Só afeta segurança", "Diminui poluição"],
    respostaCorreta: 1,
    explicacao: "Pneus descalibrados aumentam a resistência ao rolamento, consumindo mais combustível.",
    baseLegal: "Manual de Direção Econômica",
    dificuldade: "media"
  },
  {
    id: 234,
    categoria: "Meio Ambiente e Cidadania",
    pergunta: "O que é chuva ácida e qual sua relação com o trânsito?",
    opcoes: ["Chuva normal", "Chuva contaminada por poluentes emitidos por veículos e indústrias", "Chuva em lugares ácidos", "Não tem relação"],
    respostaCorreta: 1,
    explicacao: "A chuva ácida é formada por poluentes como óxidos de enxofre e nitrogênio emitidos por veículos.",
    baseLegal: "Estudos ambientais",
    dificuldade: "media"
  },
  {
    id: 235,
    categoria: "Meio Ambiente e Cidadania",
    pergunta: "O ar condicionado do veículo:",
    opcoes: ["Não afeta consumo", "Aumenta o consumo de combustível", "Diminui o consumo", "Só esfria"],
    respostaCorreta: 1,
    explicacao: "O ar condicionado aumenta o consumo de combustível em 10% a 20%, dependendo do veículo.",
    baseLegal: "Estudos de eficiência energética",
    dificuldade: "media"
  },
  {
    id: 236,
    categoria: "Meio Ambiente e Cidadania",
    pergunta: "O que fazer com baterias automotivas usadas?",
    opcoes: ["Jogar no lixo comum", "Devolver ao fabricante ou ponto de coleta", "Guardar em casa", "Queimar"],
    respostaCorreta: 1,
    explicacao: "Baterias contêm chumbo e ácido, devendo ser recicladas em pontos de coleta específicos.",
    baseLegal: "Resolução CONAMA 401/08",
    dificuldade: "media"
  },
  {
    id: 237,
    categoria: "Meio Ambiente e Cidadania",
    pergunta: "O que são veículos híbridos?",
    opcoes: ["Veículos com duas marcas", "Veículos que combinam motor a combustão e elétrico", "Veículos movidos a água", "Veículos sem motor"],
    respostaCorreta: 1,
    explicacao: "Veículos híbridos combinam motor a combustão com motor elétrico para maior eficiência.",
    baseLegal: "Legislação de incentivos fiscais para veículos verdes",
    dificuldade: "media"
  },
  {
    id: 238,
    categoria: "Meio Ambiente e Cidadania",
    pergunta: "Qual a penalidade por veículo emitindo fumaça, gases ou partículas acima do limite?",
    opcoes: ["Advertência", "Multa grave", "Nenhuma", "Apenas notificação"],
    respostaCorreta: 1,
    explicacao: "Transitar com veículo com emissões acima do limite é infração grave.",
    baseLegal: "Art. 231, III do CTB",
    dificuldade: "media"
  },
  {
    id: 239,
    categoria: "Meio Ambiente e Cidadania",
    pergunta: "O etanol polui menos porque:",
    opcoes: ["Não polui nada", "É combustível renovável e emite menos CO2 no ciclo total", "É mais caro", "Tem mais energia"],
    respostaCorreta: 1,
    explicacao: "O etanol é renovável: o CO2 emitido é reabsorvido pela cana-de-açúcar durante o cultivo.",
    baseLegal: "PROCONVE / Estudos de ciclo de vida",
    dificuldade: "media"
  },
  {
    id: 240,
    categoria: "Meio Ambiente e Cidadania",
    pergunta: "Qual legislação trata dos direitos dos pedestres com deficiência?",
    opcoes: ["Apenas o CTB", "CTB e Estatuto da Pessoa com Deficiência", "Nenhuma", "Código Civil"],
    respostaCorreta: 1,
    explicacao: "O CTB e a Lei 13.146/2015 (Estatuto da Pessoa com Deficiência) garantem direitos no trânsito.",
    baseLegal: "Lei 13.146/15 e CTB",
    dificuldade: "media"
  },
  
  // Questões Difíceis - Pegadinhas (10)
  {
    id: 241,
    categoria: "Meio Ambiente e Cidadania",
    pergunta: "O monóxido de carbono (CO) é perigoso porque:",
    opcoes: ["Tem cheiro forte", "É invisível, inodoro e impede o sangue de transportar oxigênio", "Causa apenas irritação", "Não é perigoso"],
    respostaCorreta: 1,
    explicacao: "PEGADINHA: O CO é INODORO e INVISÍVEL, por isso é tão perigoso - não se percebe sua presença.",
    baseLegal: "Estudos de saúde ambiental",
    dificuldade: "dificil"
  },
  {
    id: 242,
    categoria: "Meio Ambiente e Cidadania",
    pergunta: "O uso de celular ao dirigir reduz a atenção em aproximadamente:",
    opcoes: ["10%", "20%", "37%", "5%"],
    respostaCorreta: 2,
    explicacao: "PEGADINHA: Estudos mostram que o celular reduz a atenção em cerca de 37%, mesmo com viva-voz.",
    baseLegal: "Estudos de segurança no trânsito - NHTSA",
    dificuldade: "dificil"
  },
  {
    id: 243,
    categoria: "Meio Ambiente e Cidadania",
    pergunta: "A velocidade econômica ideal para a maioria dos veículos é entre:",
    opcoes: ["40-50 km/h", "60-80 km/h", "100-120 km/h", "Quanto mais rápido, melhor"],
    respostaCorreta: 1,
    explicacao: "PEGADINHA: A velocidade mais econômica para a maioria dos carros é entre 60-80 km/h.",
    baseLegal: "Estudos de eficiência energética",
    dificuldade: "dificil"
  },
  {
    id: 244,
    categoria: "Meio Ambiente e Cidadania",
    pergunta: "Em relação à poluição, qual afirmativa sobre veículos elétricos é CORRETA?",
    opcoes: ["Não poluem absolutamente nada", "Poluição zero no uso, mas há impacto na produção da bateria", "Poluem mais que a gasolina", "Só poluem em movimento"],
    respostaCorreta: 1,
    explicacao: "PEGADINHA: Veículos elétricos têm zero emissão durante uso, mas a fabricação de baterias tem impacto.",
    baseLegal: "Estudos de ciclo de vida de veículos",
    dificuldade: "dificil"
  },
  {
    id: 245,
    categoria: "Meio Ambiente e Cidadania",
    pergunta: "Qual destes comportamentos NÃO economiza combustível?",
    opcoes: ["Manter pneus calibrados", "Usar ar condicionado o tempo todo", "Evitar acelerações bruscas", "Fazer manutenção preventiva"],
    respostaCorreta: 1,
    explicacao: "PEGADINHA: O ar condicionado AUMENTA o consumo de combustível em até 20%.",
    baseLegal: "Manual de Direção Econômica",
    dificuldade: "dificil"
  },
  {
    id: 246,
    categoria: "Meio Ambiente e Cidadania",
    pergunta: "A educação para o trânsito nas escolas é:",
    opcoes: ["Proibida", "Facultativa", "Obrigatória", "Apenas para escolas de trânsito"],
    respostaCorreta: 2,
    explicacao: "PEGADINHA: O CTB determina que educação para o trânsito é OBRIGATÓRIA nas escolas de educação básica.",
    baseLegal: "Art. 76 do CTB",
    dificuldade: "dificil"
  },
  {
    id: 247,
    categoria: "Meio Ambiente e Cidadania",
    pergunta: "Qual é a ordem de prioridade dos usuários do trânsito segundo o CTB?",
    opcoes: ["Carros, motos, pedestres", "Pedestres e ciclistas primeiro, depois veículos motorizados", "Veículos maiores primeiro", "Todos são iguais"],
    respostaCorreta: 1,
    explicacao: "PEGADINHA: O CTB prioriza os mais VULNERÁVEIS: pedestres e ciclistas têm preferência.",
    baseLegal: "Art. 29, §2º do CTB",
    dificuldade: "dificil"
  },
  {
    id: 248,
    categoria: "Meio Ambiente e Cidadania",
    pergunta: "Uma motocicleta produz mais poluição atmosférica por quilômetro que um carro?",
    opcoes: ["Não, sempre polui menos", "Sim, muitas motos antigas poluem mais", "Nunca polui", "Só polui sonoramente"],
    respostaCorreta: 1,
    explicacao: "PEGADINHA: Motos antigas (2 tempos) e sem catalisador podem poluir MAIS que carros modernos por km.",
    baseLegal: "PROCONVE - Fases de controle de emissões",
    dificuldade: "dificil"
  },
  {
    id: 249,
    categoria: "Meio Ambiente e Cidadania",
    pergunta: "Estacionar em vaga de idoso sem credencial é infração de qual natureza?",
    opcoes: ["Leve", "Média", "Grave", "Gravíssima"],
    respostaCorreta: 3,
    explicacao: "PEGADINHA: Estacionar em vaga reservada (idoso ou deficiente) sem credencial é gravíssima.",
    baseLegal: "Art. 181, XVII do CTB",
    dificuldade: "dificil"
  },
  {
    id: 250,
    categoria: "Meio Ambiente e Cidadania",
    pergunta: "Qual fator NÃO contribui para a poluição sonora do trânsito?",
    opcoes: ["Escapamentos modificados", "Buzinas excessivas", "Farol baixo aceso", "Veículos com som alto"],
    respostaCorreta: 2,
    explicacao: "PEGADINHA: Farol baixo é luminoso, não produz som. Poluição SONORA é causada por ruídos.",
    baseLegal: "Art. 227 do CTB",
    dificuldade: "dificil"
  },

  // =====================================
  // MECÂNICA BÁSICA (50 questões)
  // =====================================
  
  // Questões Fáceis (20)
  {
    id: 251,
    categoria: "Mecânica Básica",
    pergunta: "Qual a função do sistema de freios?",
    opcoes: ["Acelerar", "Reduzir e parar o veículo", "Aumentar potência", "Economizar combustível"],
    respostaCorreta: 1,
    explicacao: "O sistema de freios tem a função de reduzir a velocidade e parar o veículo com segurança.",
    baseLegal: "Manual do Proprietário",
    dificuldade: "facil"
  },
  {
    id: 252,
    categoria: "Mecânica Básica",
    pergunta: "Para que serve o nível de óleo do motor?",
    opcoes: ["Resfriar o motor", "Lubrificar as peças móveis", "Aumentar velocidade", "Economizar gasolina"],
    respostaCorreta: 1,
    explicacao: "O óleo lubrifica as peças móveis do motor, reduzindo atrito e desgaste.",
    baseLegal: "Manual do Proprietário",
    dificuldade: "facil"
  },
  {
    id: 253,
    categoria: "Mecânica Básica",
    pergunta: "Qual a função do sistema de arrefecimento?",
    opcoes: ["Aquecer o motor", "Manter a temperatura ideal do motor", "Resfriar os passageiros", "Aquecer o combustível"],
    respostaCorreta: 1,
    explicacao: "O sistema de arrefecimento mantém o motor na temperatura ideal de funcionamento.",
    baseLegal: "Manual do Proprietário",
    dificuldade: "facil"
  },
  {
    id: 254,
    categoria: "Mecânica Básica",
    pergunta: "O que indica a luz do óleo acesa no painel?",
    opcoes: ["Motor frio", "Pressão do óleo baixa - pare imediatamente", "Trocar combustível", "Porta aberta"],
    respostaCorreta: 1,
    explicacao: "A luz do óleo indica pressão baixa. Pare o veículo imediatamente para evitar danos ao motor.",
    baseLegal: "Manual do Proprietário",
    dificuldade: "facil"
  },
  {
    id: 255,
    categoria: "Mecânica Básica",
    pergunta: "Qual a função da bateria?",
    opcoes: ["Fazer o carro andar", "Fornecer energia elétrica para partida e sistemas", "Aquecer o motor", "Frear o veículo"],
    respostaCorreta: 1,
    explicacao: "A bateria fornece energia elétrica para dar partida e alimentar sistemas elétricos.",
    baseLegal: "Manual do Proprietário",
    dificuldade: "facil"
  },
  {
    id: 256,
    categoria: "Mecânica Básica",
    pergunta: "Por que calibrar os pneus regularmente?",
    opcoes: ["Não é necessário", "Segurança, economia e durabilidade", "Apenas estética", "Só antes de viagens"],
    respostaCorreta: 1,
    explicacao: "Pneus bem calibrados garantem segurança, economia de combustível e maior durabilidade.",
    baseLegal: "Manual do Proprietário",
    dificuldade: "facil"
  },
  {
    id: 257,
    categoria: "Mecânica Básica",
    pergunta: "O que é o TWI no pneu?",
    opcoes: ["Marca do fabricante", "Indicador de desgaste (Tread Wear Indicator)", "Tipo de borracha", "Data de fabricação"],
    respostaCorreta: 1,
    explicacao: "TWI é o indicador de desgaste. Quando visível, o pneu deve ser trocado.",
    baseLegal: "Normas INMETRO",
    dificuldade: "facil"
  },
  {
    id: 258,
    categoria: "Mecânica Básica",
    pergunta: "A luz de temperatura do motor acesa indica:",
    opcoes: ["Motor frio", "Motor superaquecido - pare imediatamente", "Ar condicionado ligado", "Necessidade de combustível"],
    respostaCorreta: 1,
    explicacao: "Luz de temperatura alta indica superaquecimento. Pare e deixe o motor esfriar.",
    baseLegal: "Manual do Proprietário",
    dificuldade: "facil"
  },
  {
    id: 259,
    categoria: "Mecânica Básica",
    pergunta: "O que verificar antes de uma viagem longa?",
    opcoes: ["Apenas combustível", "Óleo, água, pneus, freios, luzes", "Só os pneus", "Apenas o rádio"],
    respostaCorreta: 1,
    explicacao: "Antes de viajar, verifique óleo, água do radiador, pneus (incluindo estepe), freios e luzes.",
    baseLegal: "Manual do Proprietário",
    dificuldade: "facil"
  },
  {
    id: 260,
    categoria: "Mecânica Básica",
    pergunta: "Qual a função do alternador?",
    opcoes: ["Dar partida", "Gerar energia elétrica e carregar a bateria", "Frear o veículo", "Aquecer o motor"],
    respostaCorreta: 1,
    explicacao: "O alternador gera energia elétrica com o motor funcionando e mantém a bateria carregada.",
    baseLegal: "Manual do Proprietário",
    dificuldade: "facil"
  },
  {
    id: 261,
    categoria: "Mecânica Básica",
    pergunta: "O que é o estepe?",
    opcoes: ["Tipo de combustível", "Pneu reserva", "Peça do motor", "Sistema de som"],
    respostaCorreta: 1,
    explicacao: "Estepe é o pneu reserva, usado em caso de furo ou problema no pneu principal.",
    baseLegal: "Art. 105 do CTB",
    dificuldade: "facil"
  },
  {
    id: 262,
    categoria: "Mecânica Básica",
    pergunta: "Qual líquido é usado no limpador de para-brisa?",
    opcoes: ["Água pura", "Óleo de motor", "Água com detergente adequado", "Gasolina"],
    respostaCorreta: 2,
    explicacao: "Use água com detergente adequado ou fluido específico para melhor limpeza e evitar danos.",
    baseLegal: "Manual do Proprietário",
    dificuldade: "facil"
  },
  {
    id: 263,
    categoria: "Mecânica Básica",
    pergunta: "Para que serve o catalisador?",
    opcoes: ["Aumentar potência", "Reduzir poluentes nos gases de escapamento", "Economizar combustível", "Fazer barulho"],
    respostaCorreta: 1,
    explicacao: "O catalisador transforma gases tóxicos do escapamento em substâncias menos nocivas.",
    baseLegal: "PROCONVE",
    dificuldade: "facil"
  },
  {
    id: 264,
    categoria: "Mecânica Básica",
    pergunta: "A luz do freio de mão acesa indica:",
    opcoes: ["Fluido de freio ok", "Freio de mão acionado ou nível baixo de fluido", "Portas abertas", "Combustível baixo"],
    respostaCorreta: 1,
    explicacao: "Esta luz indica freio de mão acionado ou nível baixo de fluido de freio. Verifique ambos.",
    baseLegal: "Manual do Proprietário",
    dificuldade: "facil"
  },
  {
    id: 265,
    categoria: "Mecânica Básica",
    pergunta: "Qual a função da caixa de marchas?",
    opcoes: ["Aumentar velocidade", "Transmitir força do motor às rodas em diferentes velocidades", "Frear", "Gerar eletricidade"],
    respostaCorreta: 1,
    explicacao: "A caixa de marchas permite usar a potência do motor de forma eficiente em diferentes velocidades.",
    baseLegal: "Manual do Proprietário",
    dificuldade: "facil"
  },
  {
    id: 266,
    categoria: "Mecânica Básica",
    pergunta: "O que é a embreagem?",
    opcoes: ["Tipo de freio", "Sistema que conecta e desconecta motor e câmbio", "Parte do pneu", "Tipo de combustível"],
    respostaCorreta: 1,
    explicacao: "A embreagem permite engatar e desengatar a transmissão do motor para as rodas.",
    baseLegal: "Manual do Proprietário",
    dificuldade: "facil"
  },
  {
    id: 267,
    categoria: "Mecânica Básica",
    pergunta: "Qual é a função do radiador?",
    opcoes: ["Aquecer o interior", "Resfriar a água que circula pelo motor", "Gerar energia", "Filtrar o ar"],
    respostaCorreta: 1,
    explicacao: "O radiador resfria a água (ou fluido) que absorve o calor do motor, mantendo a temperatura ideal.",
    baseLegal: "Manual do Proprietário",
    dificuldade: "facil"
  },
  {
    id: 268,
    categoria: "Mecânica Básica",
    pergunta: "A luz da bateria acesa com o motor funcionando indica:",
    opcoes: ["Bateria nova", "Problema no sistema de carga (alternador)", "Tudo normal", "Combustível baixo"],
    respostaCorreta: 1,
    explicacao: "Luz da bateria acesa com motor funcionando indica falha no alternador ou sistema de carga.",
    baseLegal: "Manual do Proprietário",
    dificuldade: "facil"
  },
  {
    id: 269,
    categoria: "Mecânica Básica",
    pergunta: "O que é o hodômetro?",
    opcoes: ["Velocímetro", "Marcador de quilometragem total", "Conta-giros", "Marcador de combustível"],
    respostaCorreta: 1,
    explicacao: "O hodômetro registra a quilometragem total percorrida pelo veículo.",
    baseLegal: "Manual do Proprietário",
    dificuldade: "facil"
  },
  {
    id: 270,
    categoria: "Mecânica Básica",
    pergunta: "Qual a função do limpador de para-brisa?",
    opcoes: ["Decoração", "Limpar água e sujeira do para-brisa para garantir visibilidade", "Aquecer o vidro", "Proteger contra sol"],
    respostaCorreta: 1,
    explicacao: "O limpador remove água e sujeira do para-brisa, garantindo visibilidade em condições adversas.",
    baseLegal: "Art. 105 do CTB",
    dificuldade: "facil"
  },
  
  // Questões Médias (20)
  {
    id: 271,
    categoria: "Mecânica Básica",
    pergunta: "O filtro de ar sujo causa:",
    opcoes: ["Economia", "Aumento de consumo e perda de potência", "Mais potência", "Nada"],
    respostaCorreta: 1,
    explicacao: "Filtro de ar sujo dificulta a entrada de ar, aumentando consumo e reduzindo potência.",
    baseLegal: "Manual do Proprietário",
    dificuldade: "media"
  },
  {
    id: 272,
    categoria: "Mecânica Básica",
    pergunta: "Qual a função do amortecedor?",
    opcoes: ["Aumentar velocidade", "Absorver impactos e manter estabilidade", "Gerar eletricidade", "Economizar combustível"],
    respostaCorreta: 1,
    explicacao: "O amortecedor absorve impactos e mantém o contato dos pneus com o solo.",
    baseLegal: "Manual do Proprietário",
    dificuldade: "media"
  },
  {
    id: 273,
    categoria: "Mecânica Básica",
    pergunta: "O que indica fumaça branca excessiva no escapamento?",
    opcoes: ["Motor em boas condições", "Possível problema com junta do cabeçote", "Falta de gasolina", "Normal sempre"],
    respostaCorreta: 1,
    explicacao: "Fumaça branca excessiva pode indicar problema na junta do cabeçote (água entrando na combustão).",
    baseLegal: "Manual do Proprietário",
    dificuldade: "media"
  },
  {
    id: 274,
    categoria: "Mecânica Básica",
    pergunta: "Qual a função das velas de ignição?",
    opcoes: ["Iluminar o motor", "Produzir faísca para queima do combustível", "Resfriar", "Lubrificar"],
    respostaCorreta: 1,
    explicacao: "As velas produzem a faísca que inicia a combustão do combustível no motor.",
    baseLegal: "Manual do Proprietário",
    dificuldade: "media"
  },
  {
    id: 275,
    categoria: "Mecânica Básica",
    pergunta: "O sistema de direção hidráulica funciona com:",
    opcoes: ["Água", "Fluido específico de direção hidráulica", "Gasolina", "Óleo de motor"],
    respostaCorreta: 1,
    explicacao: "A direção hidráulica usa fluido específico que deve ser verificado periodicamente.",
    baseLegal: "Manual do Proprietário",
    dificuldade: "media"
  },
  {
    id: 276,
    categoria: "Mecânica Básica",
    pergunta: "O que é o ABS?",
    opcoes: ["Ar condicionado", "Sistema antitravamento de freios", "Airbag", "Tipo de pneu"],
    respostaCorreta: 1,
    explicacao: "ABS (Anti-lock Braking System) impede o travamento das rodas durante frenagens bruscas.",
    baseLegal: "Resolução CONTRAN 380/11",
    dificuldade: "media"
  },
  {
    id: 277,
    categoria: "Mecânica Básica",
    pergunta: "Fumaça azulada no escapamento indica:",
    opcoes: ["Motor novo", "Queima de óleo lubrificante", "Excesso de combustível", "Tudo normal"],
    respostaCorreta: 1,
    explicacao: "Fumaça azul indica que o motor está queimando óleo, sinal de desgaste ou vazamento interno.",
    baseLegal: "Manual do Proprietário",
    dificuldade: "media"
  },
  {
    id: 278,
    categoria: "Mecânica Básica",
    pergunta: "O que é o conta-giros (tacômetro)?",
    opcoes: ["Velocímetro", "Indicador de RPM (rotações por minuto)", "Marcador de combustível", "Hodômetro"],
    respostaCorreta: 1,
    explicacao: "O conta-giros indica as rotações por minuto do motor, ajudando a economizar combustível.",
    baseLegal: "Manual do Proprietário",
    dificuldade: "media"
  },
  {
    id: 279,
    categoria: "Mecânica Básica",
    pergunta: "Qual a função da correia dentada?",
    opcoes: ["Fazer barulho", "Sincronizar o movimento das válvulas com o motor", "Gerar energia", "Frear o veículo"],
    respostaCorreta: 1,
    explicacao: "A correia dentada sincroniza o comando de válvulas com o virabrequim. Sua quebra pode destruir o motor.",
    baseLegal: "Manual do Proprietário",
    dificuldade: "media"
  },
  {
    id: 280,
    categoria: "Mecânica Básica",
    pergunta: "O que significa a sigla ESP?",
    opcoes: ["Especial", "Controle Eletrônico de Estabilidade", "Extra Speed Power", "Economia de Potência"],
    respostaCorreta: 1,
    explicacao: "ESP (Electronic Stability Program) ajuda a manter o controle do veículo em curvas e manobras.",
    baseLegal: "Resolução CONTRAN 717/17",
    dificuldade: "media"
  },
  {
    id: 281,
    categoria: "Mecânica Básica",
    pergunta: "A luz 'Check Engine' acesa indica:",
    opcoes: ["Trocar o motor", "Falha detectada no sistema de injeção/emissões", "Motor novo", "Falta de combustível"],
    respostaCorreta: 1,
    explicacao: "Check Engine indica falha no sistema de gerenciamento do motor. Procure um mecânico.",
    baseLegal: "Manual do Proprietário",
    dificuldade: "media"
  },
  {
    id: 282,
    categoria: "Mecânica Básica",
    pergunta: "Qual a função do diferencial?",
    opcoes: ["Diferenciar cores", "Permitir que as rodas girem em velocidades diferentes nas curvas", "Frear", "Dar partida"],
    respostaCorreta: 1,
    explicacao: "O diferencial permite que as rodas de um mesmo eixo girem em velocidades diferentes nas curvas.",
    baseLegal: "Manual do Proprietário",
    dificuldade: "media"
  },
  {
    id: 283,
    categoria: "Mecânica Básica",
    pergunta: "O que é injeção eletrônica?",
    opcoes: ["Injeção de combustível", "Sistema eletrônico de dosagem de combustível", "Tipo de motor", "Sistema de freios"],
    respostaCorreta: 1,
    explicacao: "A injeção eletrônica controla precisamente a quantidade de combustível injetada no motor.",
    baseLegal: "PROCONVE",
    dificuldade: "media"
  },
  {
    id: 284,
    categoria: "Mecânica Básica",
    pergunta: "Por que trocar o fluido de freio periodicamente?",
    opcoes: ["Não precisa trocar", "Ele absorve umidade e perde eficiência", "Só por estética", "Apenas em veículos velhos"],
    respostaCorreta: 1,
    explicacao: "O fluido de freio absorve umidade do ar, reduzindo seu ponto de ebulição e eficiência.",
    baseLegal: "Manual do Proprietário",
    dificuldade: "media"
  },
  {
    id: 285,
    categoria: "Mecânica Básica",
    pergunta: "O que são freios a disco?",
    opcoes: ["Freios musicais", "Freios com disco metálico e pastilhas", "Freios antigos", "Apenas para motos"],
    respostaCorreta: 1,
    explicacao: "Freios a disco usam pastilhas que pressionam um disco metálico para frear o veículo.",
    baseLegal: "Manual do Proprietário",
    dificuldade: "media"
  },
  {
    id: 286,
    categoria: "Mecânica Básica",
    pergunta: "Qual a diferença entre câmbio manual e automático?",
    opcoes: ["Nenhuma", "Manual exige troca de marchas pelo motorista, automático troca sozinho", "Automático é mais econômico sempre", "Manual é proibido"],
    respostaCorreta: 1,
    explicacao: "No câmbio manual, o motorista seleciona as marchas; no automático, a troca é feita pelo sistema.",
    baseLegal: "Manual do Proprietário",
    dificuldade: "media"
  },
  {
    id: 287,
    categoria: "Mecânica Básica",
    pergunta: "O que é o turbocompressor?",
    opcoes: ["Tipo de pneu", "Sistema que aumenta a entrada de ar no motor", "Freio especial", "Tipo de combustível"],
    respostaCorreta: 1,
    explicacao: "O turbo comprime o ar que entra no motor, aumentando potência e eficiência.",
    baseLegal: "Manual do Proprietário",
    dificuldade: "media"
  },
  {
    id: 288,
    categoria: "Mecânica Básica",
    pergunta: "Por que verificar o nível do líquido de arrefecimento?",
    opcoes: ["Não é necessário", "Evitar superaquecimento do motor", "Apenas estética", "Só em carros antigos"],
    respostaCorreta: 1,
    explicacao: "O nível baixo pode causar superaquecimento, danificando gravemente o motor.",
    baseLegal: "Manual do Proprietário",
    dificuldade: "media"
  },
  {
    id: 289,
    categoria: "Mecânica Básica",
    pergunta: "Qual a função do sensor de estacionamento?",
    opcoes: ["Estacionar sozinho", "Alertar sobre obstáculos durante manobras", "Controlar velocidade", "Medir combustível"],
    respostaCorreta: 1,
    explicacao: "Os sensores emitem alertas sonoros quando detectam obstáculos próximos durante manobras.",
    baseLegal: "Equipamento de segurança opcional",
    dificuldade: "media"
  },
  {
    id: 290,
    categoria: "Mecânica Básica",
    pergunta: "O que é balanceamento das rodas?",
    opcoes: ["Trocar os pneus de lugar", "Equilibrar o peso da roda para evitar vibrações", "Calibrar pneus", "Alinhar direção"],
    respostaCorreta: 1,
    explicacao: "O balanceamento distribui pesos nas rodas para evitar vibrações em alta velocidade.",
    baseLegal: "Manual do Proprietário",
    dificuldade: "media"
  },
  
  // Questões Difíceis - Pegadinhas (10)
  {
    id: 291,
    categoria: "Mecânica Básica",
    pergunta: "Qual a cor da fumaça que indica excesso de combustível na mistura?",
    opcoes: ["Branca", "Azul", "Preta", "Transparente"],
    respostaCorreta: 2,
    explicacao: "PEGADINHA: Fumaça PRETA indica mistura rica (excesso de combustível). Azul = óleo, Branca = água.",
    baseLegal: "Manual do Proprietário",
    dificuldade: "dificil"
  },
  {
    id: 292,
    categoria: "Mecânica Básica",
    pergunta: "Com qual frequência deve-se trocar o óleo do motor (em condições normais)?",
    opcoes: ["A cada 3.000 km", "A cada 5.000 a 10.000 km ou conforme fabricante", "Nunca", "Apenas quando acender a luz"],
    respostaCorreta: 1,
    explicacao: "PEGADINHA: A troca varia conforme fabricante e tipo de óleo (5.000 a 15.000 km). Consulte o manual.",
    baseLegal: "Manual do Proprietário",
    dificuldade: "dificil"
  },
  {
    id: 293,
    categoria: "Mecânica Básica",
    pergunta: "A calibragem dos pneus deve ser feita com os pneus:",
    opcoes: ["Quentes", "Frios", "Qualquer temperatura", "Após rodar 50 km"],
    respostaCorreta: 1,
    explicacao: "PEGADINHA: Pneus FRIOS. O calor do atrito aumenta a pressão, dando leitura incorreta.",
    baseLegal: "Normas INMETRO",
    dificuldade: "dificil"
  },
  {
    id: 294,
    categoria: "Mecânica Básica",
    pergunta: "Qual sistema NÃO é verificado na revisão básica antes de viagem?",
    opcoes: ["Freios", "Sistema de som", "Iluminação", "Pneus"],
    respostaCorreta: 1,
    explicacao: "PEGADINHA: Sistema de som é conforto, não segurança. Verifique freios, iluminação, pneus, óleo e água.",
    baseLegal: "Manual do Proprietário",
    dificuldade: "dificil"
  },
  {
    id: 295,
    categoria: "Mecânica Básica",
    pergunta: "O que acontece se usar óleo de motor com viscosidade incorreta?",
    opcoes: ["Nada", "Pode causar desgaste prematuro ou danos ao motor", "Melhora o desempenho", "Economiza combustível"],
    respostaCorreta: 1,
    explicacao: "PEGADINHA: Viscosidade errada causa lubrificação inadequada, desgaste e possíveis danos graves.",
    baseLegal: "Manual do Proprietário",
    dificuldade: "dificil"
  },
  {
    id: 296,
    categoria: "Mecânica Básica",
    pergunta: "O motor está superaquecendo. O que NÃO deve fazer?",
    opcoes: ["Parar o veículo", "Abrir o radiador imediatamente", "Ligar o aquecedor interno", "Aguardar esfriar"],
    respostaCorreta: 1,
    explicacao: "PEGADINHA: NUNCA abra o radiador com motor quente - o líquido fervente pode causar queimaduras graves.",
    baseLegal: "Manual do Proprietário",
    dificuldade: "dificil"
  },
  {
    id: 297,
    categoria: "Mecânica Básica",
    pergunta: "Pneus com pressão abaixo do recomendado causam:",
    opcoes: ["Economia de combustível", "Maior desgaste nas bordas e aumento de consumo", "Maior aderência", "Nada de diferente"],
    respostaCorreta: 1,
    explicacao: "PEGADINHA: Pneus murchos desgastam as BORDAS (laterais) e aumentam consumo de combustível.",
    baseLegal: "Manual do Proprietário",
    dificuldade: "dificil"
  },
  {
    id: 298,
    categoria: "Mecânica Básica",
    pergunta: "Pneus com pressão acima do recomendado causam:",
    opcoes: ["Maior conforto", "Maior desgaste no centro e menor aderência", "Economia de combustível", "Maior durabilidade"],
    respostaCorreta: 1,
    explicacao: "PEGADINHA: Pneus cheios demais desgastam o CENTRO e reduzem a área de contato (menos aderência).",
    baseLegal: "Manual do Proprietário",
    dificuldade: "dificil"
  },
  {
    id: 299,
    categoria: "Mecânica Básica",
    pergunta: "Qual a vida útil aproximada de uma correia dentada?",
    opcoes: ["10.000 km", "30.000 km", "50.000 a 100.000 km", "Nunca precisa trocar"],
    respostaCorreta: 2,
    explicacao: "PEGADINHA: Varia de 50.000 a 100.000 km conforme fabricante. Sua quebra pode destruir o motor.",
    baseLegal: "Manual do Proprietário",
    dificuldade: "dificil"
  },
  {
    id: 300,
    categoria: "Mecânica Básica",
    pergunta: "Qual dessas luzes de advertência NÃO exige parada imediata do veículo?",
    opcoes: ["Luz do óleo", "Luz da temperatura", "Luz do airbag", "Luz da bateria com motor funcionando"],
    respostaCorreta: 2,
    explicacao: "PEGADINHA: Luz do airbag indica falha no sistema, mas não exige parada IMEDIATA como óleo ou temperatura.",
    baseLegal: "Manual do Proprietário",
    dificuldade: "dificil"
  }
];

// Função para selecionar questões aleatórias para o simulado
// Distribuição oficial DETRAN: 30 questões com balanceamento por dificuldade
export function selecionarQuestoesAleatorias(quantidade: number = 30): QuestaoSimulado[] {
  const categorias = [
    { nome: "Legislação de Trânsito", quantidade: 10 },
    { nome: "Direção Defensiva", quantidade: 7 },
    { nome: "Primeiros Socorros", quantidade: 3 },
    { nome: "Sinalização de Trânsito", quantidade: 6 },
    { nome: "Meio Ambiente e Cidadania", quantidade: 4 }
  ];

  const questoesSelecionadas: QuestaoSimulado[] = [];

  categorias.forEach(cat => {
    const questoesCategoria = questoesSimulado.filter(q => q.categoria === cat.nome);
    
    // Separar por dificuldade
    const faceis = questoesCategoria.filter(q => q.dificuldade === 'facil');
    const medias = questoesCategoria.filter(q => q.dificuldade === 'media');
    const dificeis = questoesCategoria.filter(q => q.dificuldade === 'dificil');
    
    // Proporção: 40% fácil, 40% média, 20% difícil
    const qtdFacil = Math.round(cat.quantidade * 0.4);
    const qtdMedia = Math.round(cat.quantidade * 0.4);
    const qtdDificil = cat.quantidade - qtdFacil - qtdMedia;
    
    // Embaralhar cada grupo
    const shuffledFaceis = [...faceis].sort(() => Math.random() - 0.5);
    const shuffledMedias = [...medias].sort(() => Math.random() - 0.5);
    const shuffledDificeis = [...dificeis].sort(() => Math.random() - 0.5);
    
    // Selecionar de cada grupo
    questoesSelecionadas.push(
      ...shuffledFaceis.slice(0, qtdFacil),
      ...shuffledMedias.slice(0, qtdMedia),
      ...shuffledDificeis.slice(0, qtdDificil)
    );
  });

  // Embaralhar todas as questões selecionadas
  return questoesSelecionadas.sort(() => Math.random() - 0.5);
}

// Função para selecionar questões de Mecânica Básica (modo extra opcional)
export function selecionarQuestoesMecanica(quantidade: number = 15): QuestaoSimulado[] {
  const questoesMecanica = questoesSimulado.filter(q => q.categoria === "Mecânica Básica");
  
  // Separar por dificuldade para balanceamento
  const faceis = questoesMecanica.filter(q => q.dificuldade === 'facil');
  const medias = questoesMecanica.filter(q => q.dificuldade === 'media');
  const dificeis = questoesMecanica.filter(q => q.dificuldade === 'dificil');
  
  const qtdFacil = Math.round(quantidade * 0.4);
  const qtdMedia = Math.round(quantidade * 0.4);
  const qtdDificil = quantidade - qtdFacil - qtdMedia;
  
  const selecionadas: QuestaoSimulado[] = [];
  
  selecionadas.push(...[...faceis].sort(() => Math.random() - 0.5).slice(0, qtdFacil));
  selecionadas.push(...[...medias].sort(() => Math.random() - 0.5).slice(0, qtdMedia));
  selecionadas.push(...[...dificeis].sort(() => Math.random() - 0.5).slice(0, qtdDificil));
  
  return selecionadas.sort(() => Math.random() - 0.5);
}

// Função para obter estatísticas do banco de questões
export function getEstatisticasQuestoes() {
  const categorias = [
    "Legislação de Trânsito",
    "Direção Defensiva", 
    "Primeiros Socorros",
    "Sinalização de Trânsito",
    "Meio Ambiente e Cidadania",
    "Mecânica Básica"
  ];
  
  const estatisticas = categorias.map(cat => {
    const questoesCat = questoesSimulado.filter(q => q.categoria === cat);
    return {
      categoria: cat,
      total: questoesCat.length,
      faceis: questoesCat.filter(q => q.dificuldade === 'facil').length,
      medias: questoesCat.filter(q => q.dificuldade === 'media').length,
      dificeis: questoesCat.filter(q => q.dificuldade === 'dificil').length
    };
  });
  
  return {
    totalGeral: questoesSimulado.length,
    porCategoria: estatisticas,
    distribuicaoDificuldade: {
      faceis: questoesSimulado.filter(q => q.dificuldade === 'facil').length,
      medias: questoesSimulado.filter(q => q.dificuldade === 'media').length,
      dificeis: questoesSimulado.filter(q => q.dificuldade === 'dificil').length
    }
  };
}

// Lista de bases legais utilizadas no app (para referência)
export const BASES_LEGAIS = {
  ctb: "Lei 9.503/1997 - Código de Trânsito Brasileiro",
  contran789: "Resolução CONTRAN 789/2020 - Regulamenta habilitação",
  contran925: "Resolução CONTRAN 925/2022 - Manual Brasileiro de Fiscalização",
  contran1020: "Resolução CONTRAN 1.020/2025 - Atualiza regras de CNH/PPD",
  contran168: "Resolução CONTRAN 168/04 - Exames de habilitação",
  conama418: "Resolução CONAMA 418/09 - Emissões veiculares"
};
