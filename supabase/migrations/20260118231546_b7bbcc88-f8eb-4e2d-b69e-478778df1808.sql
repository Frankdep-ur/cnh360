
-- =============================================
-- EXPANSÃO COMPLETA DO CURSO TEÓRICO EAD
-- +43 novas aulas (29 em módulos existentes + 14 em 2 novos módulos)
-- Total: 84 aulas
-- =============================================

-- MÓDULO 1: LEGISLAÇÃO DE TRÂNSITO (+8 aulas, ordem 13-20)
INSERT INTO curso_aulas (modulo_id, ordem, titulo, conteudo_texto, duracao_minutos, ativo) VALUES
('5247e404-37d6-459d-8629-d67ec28118bc', 13, 'Documentos Obrigatórios do Veículo', 
'# Documentos Obrigatórios do Veículo

Todo veículo em circulação deve portar documentos específicos. A ausência deles configura infração.

## Documentos Obrigatórios

### 1. CRLV - Certificado de Registro e Licenciamento de Veículo
- **O que é**: Documento que comprova que o veículo está regular perante os órgãos de trânsito
- **Validade**: Anual (renovado com o licenciamento)
- **Versão digital**: Aceita via aplicativo (CDT ou Carteira Digital)

### 2. Nota Fiscal (para transporte de carga)
- Obrigatória para veículos de carga
- Deve corresponder à mercadoria transportada

## Infrações Relacionadas

| Documento Ausente | Infração | Pontos |
|-------------------|----------|--------|
| CRLV vencido | Gravíssima | 7 |
| Sem CRLV | Leve | 3 |
| Nota fiscal irregular | Grave | 5 |

## Dica DETRAN
O CRLV digital tem a mesma validade do documento físico. Mantenha sempre atualizado no aplicativo oficial.', 10, true),

('5247e404-37d6-459d-8629-d67ec28118bc', 14, 'Documentos Obrigatórios do Condutor',
'# Documentos Obrigatórios do Condutor

O condutor deve sempre portar documentação válida para dirigir legalmente.

## Documentos Necessários

### CNH - Carteira Nacional de Habilitação
- **Obrigatória**: Para conduzir qualquer veículo automotor
- **Validade**: 5 a 10 anos (dependendo da idade)
- **Digital**: Aceita via aplicativo CDT

### Documento de Identificação
- RG, Passaporte ou outro documento oficial com foto
- Necessário para fiscalizações

## Situações Especiais

### CNH Vencida
- **Até 30 dias**: Infração leve (3 pontos)
- **Mais de 30 dias**: Infração gravíssima (7 pontos)

### CNH de Categoria Diferente
- Dirigir veículo incompatível com a categoria é **infração gravíssima**
- Exemplo: CNH categoria B dirigindo caminhão (categoria C)

## PPD e ACC
- **PPD**: Permissão Para Dirigir (primeiro ano de habilitação)
- **ACC**: Autorização para Conduzir Ciclomotor

> **Atenção**: CNH suspensa ou cassada = crime de trânsito!', 12, true),

('5247e404-37d6-459d-8629-d67ec28118bc', 15, 'Categorias de CNH',
'# Categorias de Habilitação

As categorias de CNH determinam quais veículos o condutor pode dirigir.

## Categorias Básicas

| Categoria | Veículos | Requisitos |
|-----------|----------|------------|
| **ACC** | Ciclomotores até 50cc | 18 anos |
| **A** | Motocicletas | 18 anos |
| **B** | Automóveis até 8 passageiros | 18 anos |
| **AB** | Motos + Carros | 18 anos |

## Categorias Profissionais

| Categoria | Veículos | Requisitos |
|-----------|----------|------------|
| **C** | Caminhões, tratores | CNH B há 1 ano, 21 anos |
| **D** | Ônibus, micro-ônibus | CNH B há 2 anos ou C há 1 ano, 21 anos |
| **E** | Veículos com reboque >6t | CNH B há 1 ano, 21 anos |

## Regras Importantes

### Adição de Categoria
- Requer novo exame prático
- Mantém a categoria anterior

### Mudança de Categoria
- B → C, D ou E
- Requer exames teórico e prático específicos
- Curso especializado obrigatório

## Dica DETRAN
Dirigir com categoria inferior à exigida é infração gravíssima com multa multiplicada por 3!', 15, true),

('5247e404-37d6-459d-8629-d67ec28118bc', 16, 'PPD e ACC - Regras Especiais',
'# PPD e ACC - Regras Especiais

## PPD - Permissão Para Dirigir

### O que é
Documento provisório válido por **1 ano** após aprovação nos exames.

### Restrições do PPD
- ❌ Não pode cometer infração grave ou gravíssima
- ❌ Não pode ser reincidente em infração média
- ✅ Pode dirigir normalmente respeitando as regras

### Conversão para CNH
Se durante 1 ano o condutor:
- **Não cometeu infrações**: Recebe a CNH definitiva automaticamente
- **Cometeu infrações**: Processo reinicia do zero

## ACC - Autorização para Conduzir Ciclomotor

### Características
- Para ciclomotores até 50cc
- Velocidade máxima: 50 km/h
- Não é categoria de CNH

### Diferenças ACC x Categoria A

| Aspecto | ACC | Categoria A |
|---------|-----|-------------|
| Veículo | Até 50cc | Qualquer moto |
| Velocidade | Até 50 km/h | Sem limite específico |
| Exame | Simplificado | Completo |

## Pegadinha DETRAN
O PPD tem as mesmas permissões da CNH, mas com tolerância zero para infrações graves!', 12, true),

('5247e404-37d6-459d-8629-d67ec28118bc', 17, 'Crimes de Trânsito',
'# Crimes de Trânsito

Diferente das infrações administrativas, crimes de trânsito são julgados pela Justiça Criminal.

## Principais Crimes (CTB Art. 302-312)

### Homicídio Culposo no Trânsito
- **Pena**: 2 a 4 anos de detenção
- **Agravantes**: Embriaguez, racha, sem habilitação

### Lesão Corporal Culposa
- **Pena**: 6 meses a 2 anos de detenção
- Inclui lesões de qualquer gravidade

### Embriaguez ao Volante
- **Pena**: 6 meses a 3 anos de detenção
- Qualquer concentração de álcool acima do limite

### Participar de Racha
- **Pena**: 6 meses a 3 anos de detenção
- Mesmo que não cause acidente

### Dirigir sem Habilitação (gerando risco)
- **Pena**: 6 meses a 1 ano de detenção
- Apenas se gerar perigo de dano

## Consequências Adicionais

| Crime | Suspensão/Cassação |
|-------|-------------------|
| Homicídio | Cassação obrigatória |
| Lesão corporal | Suspensão |
| Embriaguez | Suspensão 12 meses |
| Racha | Suspensão |

> **Importante**: Crimes de trânsito geram antecedentes criminais!', 15, true),

('5247e404-37d6-459d-8629-d67ec28118bc', 18, 'Recursos contra Multas',
'# Recursos contra Multas de Trânsito

O condutor tem direito de recorrer de multas que considere injustas.

## Fases do Recurso

### 1. Defesa Prévia
- **Prazo**: Indicado na notificação (geralmente 15 dias)
- **Onde**: Órgão autuador
- **Objetivo**: Evitar que a multa seja aplicada

### 2. Recurso em 1ª Instância (JARI)
- **Prazo**: 30 dias após notificação da penalidade
- **Onde**: Junta Administrativa de Recursos de Infrações
- **Custo**: Gratuito

### 3. Recurso em 2ª Instância (CETRAN)
- **Prazo**: 30 dias após decisão da JARI
- **Onde**: Conselho Estadual de Trânsito
- **Requisito**: Ter perdido na JARI

## Motivos Comuns para Recurso

- Erro na identificação do veículo
- Condutor não era o infrator
- Irregularidade na sinalização
- Erro no equipamento de fiscalização
- Veículo clonado

## Dicas Importantes

✅ Sempre guarde comprovantes de pagamento
✅ Fotografe a sinalização do local
✅ Respeite os prazos rigorosamente
✅ Argumente com base legal (CTB)

> Recurso aceito = multa cancelada e pontos não computados!', 12, true),

('5247e404-37d6-459d-8629-d67ec28118bc', 19, 'DPVAT e Seguros Obrigatórios',
'# DPVAT e Seguros Obrigatórios

## DPVAT - Seguro DPVAT (Danos Pessoais por Veículos Automotores Terrestres)

### O que cobre
- Morte: Até R$ 13.500
- Invalidez permanente: Até R$ 13.500
- Despesas médicas: Até R$ 2.700

### Características
- **Obrigatório** para todos os veículos
- Pago junto com o licenciamento
- Cobre qualquer pessoa (motorista, passageiro, pedestre)
- Não depende de culpa

### Como solicitar
1. Boletim de Ocorrência
2. Laudo médico (IML em caso de morte)
3. Documentos pessoais
4. Protocolar em seguradora conveniada

## Outros Seguros

### Seguro Facultativo
- Contratado pelo proprietário
- Cobre danos ao próprio veículo
- Coberturas variadas

### Carta Verde (Mercosul)
- Obrigatório para viajar a países do Mercosul
- Cobre responsabilidade civil no exterior

## Importante

| Situação | DPVAT cobre? |
|----------|--------------|
| Acidente de trânsito | ✅ Sim |
| Atropelamento | ✅ Sim |
| Suicídio | ❌ Não |
| Acidente com veículo estacionado | ❌ Não |', 10, true),

('5247e404-37d6-459d-8629-d67ec28118bc', 20, 'Registro e Licenciamento de Veículos',
'# Registro e Licenciamento de Veículos

## Registro do Veículo

### CRV - Certificado de Registro de Veículo
- **Função**: Comprova a propriedade do veículo
- **Quando usar**: Venda, transferência, financiamento
- **Emissão**: DETRAN

### Processo de Registro
1. Nota fiscal do veículo (0km) ou documento de compra (usado)
2. Comprovante de residência
3. CPF/CNPJ
4. Pagamento de taxas

## Licenciamento Anual

### CRLV - Certificado de Registro e Licenciamento
- **Obrigatório**: Para circular com o veículo
- **Renovação**: Anual (conforme final da placa)
- **Requisitos**: IPVA pago, multas quitadas, seguro DPVAT

### Calendário de Licenciamento
- Final 1: Janeiro/Fevereiro
- Final 2: Fevereiro/Março
- Final 3: Março/Abril
- E assim sucessivamente...

## Transferência de Propriedade

### Prazos
- **Comprador**: 30 dias para transferir
- **Vendedor**: Comunicar venda em 30 dias

### Penalidades
- Não transferir: Multa + responsabilidade solidária
- Circular sem licenciamento: Apreensão do veículo

> Veículo com licenciamento vencido há mais de 30 dias pode ser apreendido!', 12, true);

-- MÓDULO 2: DIREÇÃO DEFENSIVA (+5 aulas, ordem 11-15)
INSERT INTO curso_aulas (modulo_id, ordem, titulo, conteudo_texto, duracao_minutos, ativo) VALUES
('1e05579e-d5cb-433b-9f98-0c755f501032', 11, 'Aquaplanagem e Hidroplanagem',
'# Aquaplanagem e Hidroplanagem

A aquaplanagem ocorre quando os pneus perdem contato com o asfalto devido à água acumulada.

## Como Acontece

### Fatores de Risco
- Velocidade acima de 80 km/h
- Pneus desgastados (sulcos rasos)
- Lâmina de água na pista
- Pista lisa (sem rugosidade)

### O que ocorre
1. Água se acumula entre pneu e pista
2. Pneu "flutua" sobre a água
3. Perda total de aderência
4. Veículo não responde à direção

## Como Evitar

✅ Reduzir velocidade em pista molhada
✅ Manter pneus com sulcos adequados (mínimo 1,6mm)
✅ Evitar poças de água
✅ Manter distância de segurança maior

## Se Acontecer

1. **NÃO freie bruscamente**
2. Tire o pé do acelerador gradualmente
3. Mantenha o volante fireto
4. Espere o veículo recuperar aderência
5. Reduza a velocidade quando possível

## Profundidade dos Sulcos

| Profundidade | Situação |
|--------------|----------|
| > 3mm | Ideal |
| 1,6mm - 3mm | Aceitável |
| < 1,6mm | Irregular (troca obrigatória) |

> Em alta velocidade + chuva forte, mesmo pneus novos podem aquaplanar!', 12, true),

('1e05579e-d5cb-433b-9f98-0c755f501032', 12, 'Condução Econômica (Eco-driving)',
'# Condução Econômica - Eco-driving

Dirigir de forma econômica reduz consumo de combustível e emissões poluentes.

## Princípios Básicos

### 1. Aceleração Suave
- Evitar acelerações bruscas
- Trocar marchas entre 2.000 e 2.500 RPM
- Usar a inércia do veículo

### 2. Velocidade Constante
- Manter velocidade uniforme
- Usar piloto automático em rodovias
- Evitar frenagens desnecessárias

### 3. Antecipação
- Prever o fluxo do trânsito
- Frear com antecedência
- Aproveitar descidas para economizar

## Dicas Práticas

| Ação | Economia |
|------|----------|
| Pneus calibrados | Até 3% |
| Ar-condicionado desligado | Até 10% |
| Janelas fechadas (alta velocidade) | Até 5% |
| Bagageiro removido | Até 8% |
| Marchas corretas | Até 15% |

## Manutenção Preventiva

- Troca de óleo em dia
- Filtro de ar limpo
- Velas em bom estado
- Alinhamento e balanceamento

## Benefícios

✅ Menor gasto com combustível
✅ Menos emissão de poluentes
✅ Maior vida útil do veículo
✅ Condução mais segura
✅ Menos desgaste de peças', 10, true),

('1e05579e-d5cb-433b-9f98-0c755f501032', 13, 'Direção em Rodovias',
'# Direção em Rodovias

Rodovias exigem atenção especial devido às altas velocidades e características específicas.

## Regras Fundamentais

### Velocidades Máximas

| Via | Velocidade |
|----|------------|
| Rodovia pista simples | 80 km/h |
| Rodovia pista dupla | 100 km/h |
| Autoestrada | 110 km/h |

### Faixas de Rodagem
- **Faixa da direita**: Para veículos mais lentos
- **Faixa da esquerda**: Para ultrapassagens
- **Acostamento**: Apenas para emergências

## Ultrapassagens Seguras

1. Verificar retrovisor e ponto cego
2. Sinalizar com seta
3. Acelerar com segurança
4. Manter distância do veículo ultrapassado
5. Retornar à faixa original com segurança

## Perigos Específicos

### Fadiga ao Volante
- Parar a cada 2 horas
- Evitar dirigir após refeições pesadas
- Reconhecer sinais de sono

### Animais na Pista
- Comum em áreas rurais
- Reduzir velocidade ao avistar
- NÃO desviar bruscamente

## Distância de Segurança

**Regra dos 2 segundos** (tempo mínimo)
- Pista seca: 2 segundos
- Pista molhada: 4 segundos
- Neblina: 6 segundos ou mais', 15, true),

('1e05579e-d5cb-433b-9f98-0c755f501032', 14, 'Direção Noturna',
'# Direção Noturna

A visibilidade reduzida à noite aumenta significativamente os riscos de acidentes.

## Estatísticas

- 50% dos acidentes fatais ocorrem à noite
- Visibilidade reduzida em até 70%
- Tempo de reação maior

## Cuidados Especiais

### Iluminação do Veículo
- Verificar faróis, lanternas e luzes de freio
- Usar farol baixo em áreas urbanas
- Farol alto apenas em vias sem iluminação

### Quando usar Farol Alto
✅ Rodovias escuras sem veículos
✅ Estradas rurais
❌ Nunca ao cruzar com outro veículo
❌ Nunca em áreas urbanas

## Ofuscamento

### Como evitar ser ofuscado
- Olhar para o acostamento direito
- Nunca olhar diretamente para faróis
- Reduzir velocidade se ofuscado

### Tempo de recuperação
- Até 7 segundos para adaptar a visão
- Distância percorrida: ~100m a 50 km/h

## Dicas de Segurança

✅ Descansar antes de viagens longas
✅ Manter para-brisa limpo
✅ Evitar óculos com lentes escuras
✅ Aumentar distância de segurança
✅ Cuidado com pedestres de roupa escura', 12, true),

('1e05579e-d5cb-433b-9f98-0c755f501032', 15, 'Transporte de Cargas e Passageiros',
'# Transporte de Cargas e Passageiros

Regras específicas para transporte seguro de pessoas e mercadorias.

## Transporte de Passageiros

### Limites por Categoria

| Categoria | Passageiros |
|-----------|-------------|
| B | Até 8 + motorista |
| D | Micro-ônibus/Ônibus |
| E | Combinações |

### Regras de Segurança
- Cinto de segurança obrigatório para todos
- Crianças até 10 anos no banco traseiro
- Bebês em cadeirinha apropriada
- Excesso de passageiros: infração gravíssima

## Transporte de Cargas

### Limites de Peso
- Respeitar capacidade máxima (PBT)
- Distribuir carga uniformemente
- Não ultrapassar dimensões do veículo

### Cargas que se Projetam

| Projeção | Sinalização |
|----------|-------------|
| Até 2m traseira | Bandeirola vermelha |
| Acima de 2m | Autorização especial |
| Lateral | Proibido |

### Cargas Perigosas
- Curso específico obrigatório
- Sinalização especial
- Documentação ANTT

## Infrações Comuns

- Excesso de peso: Multa + retenção
- Excesso de passageiros: Gravíssima (7 pontos)
- Carga mal acondicionada: Grave (5 pontos)', 12, true);

-- MÓDULO 3: PRIMEIROS SOCORROS (+4 aulas, ordem 9-12)
INSERT INTO curso_aulas (modulo_id, ordem, titulo, conteudo_texto, duracao_minutos, ativo) VALUES
('264e184f-ba09-4886-8eba-2098fc35339e', 9, 'Queimaduras e Choque Elétrico',
'# Queimaduras e Choque Elétrico

Acidentes com fogo ou eletricidade exigem ação rápida e conhecimento específico.

## Tipos de Queimaduras

### 1º Grau (Superficial)
- Atinge apenas epiderme
- Vermelhidão e dor
- Exemplo: Queimadura solar

### 2º Grau (Parcial)
- Atinge epiderme e parte da derme
- Bolhas e dor intensa
- Cicatrização mais lenta

### 3º Grau (Total)
- Atinge todas as camadas
- Pele esbranquiçada ou carbonizada
- Pode não haver dor (nervos destruídos)

## Primeiros Socorros - Queimaduras

✅ Resfriar com água corrente (15-20 min)
✅ Cobrir com pano limpo úmido
✅ Manter vítima hidratada
✅ Encaminhar ao hospital

❌ NÃO usar gelo
❌ NÃO aplicar pasta de dente, manteiga, etc.
❌ NÃO estourar bolhas
❌ NÃO remover roupas grudadas

## Choque Elétrico

### Riscos
- Parada cardíaca
- Queimaduras internas
- Lesões musculares

### Como Agir
1. **Desligue a fonte de energia**
2. Se não for possível, afaste a vítima com objeto isolante
3. Verifique respiração e pulso
4. Inicie RCP se necessário
5. Chame SAMU (192)

> NUNCA toque na vítima se ela ainda estiver em contato com a eletricidade!', 12, true),

('264e184f-ba09-4886-8eba-2098fc35339e', 10, 'Afogamento e Asfixia',
'# Afogamento e Asfixia

Situações que comprometem a respiração exigem ação imediata.

## Afogamento

### Tipos
- **Primário**: Aspiração de água
- **Secundário**: Complicações horas depois

### Sinais
- Dificuldade para respirar
- Tosse com espuma
- Cianose (lábios azulados)
- Inconsciência

### Primeiros Socorros
1. Retire a vítima da água com segurança
2. Posicione em superfície plana
3. Verifique respiração
4. Se não respira: inicie RCP
5. Posição de recuperação se respira

## Engasgo (Obstrução de Vias Aéreas)

### Se a Vítima Consegue Tossir
- Incentive a tosse
- NÃO bata nas costas
- Observe atentamente

### Se a Vítima NÃO Consegue Tossir/Falar

**Manobra de Heimlich:**
1. Posicione-se atrás da vítima
2. Feche uma mão em punho
3. Posicione acima do umbigo
4. Com a outra mão, empurre para dentro e para cima
5. Repita até desobstruir

### Em Bebês (até 1 ano)
1. Coloque de bruços sobre seu antebraço
2. Aplique 5 tapas nas costas
3. Vire e aplique 5 compressões no peito
4. Alterne até desobstruir

> Após engasgo grave, sempre leve ao hospital para avaliação!', 15, true),

('264e184f-ba09-4886-8eba-2098fc35339e', 11, 'Convulsões e Desmaios',
'# Convulsões e Desmaios

Alterações de consciência são comuns em acidentes e requerem cuidados específicos.

## Convulsões

### O que é
Atividade elétrica anormal no cérebro causando movimentos involuntários.

### Sinais
- Movimentos bruscos e repetitivos
- Salivação excessiva
- Perda de consciência
- Rigidez muscular

### Como Agir

✅ **FAÇA:**
- Proteja a cabeça com algo macio
- Afaste objetos perigosos
- Deite a vítima de lado (após convulsão)
- Cronometre a duração
- Chame emergência se > 5 minutos

❌ **NÃO FAÇA:**
- Segurar a vítima
- Colocar objetos na boca
- Dar água ou medicamentos
- Jogar água no rosto

## Desmaio (Síncope)

### Causas Comuns
- Queda de pressão
- Calor excessivo
- Jejum prolongado
- Emoção forte

### Sinais de Alerta
- Tontura
- Visão turva
- Palidez
- Suor frio

### Primeiros Socorros
1. Deite a vítima
2. Eleve as pernas (aumenta fluxo para cérebro)
3. Afrouxe roupas apertadas
4. Ventile o ambiente
5. Se não acordar em 1 minuto, chame emergência', 12, true),

('264e184f-ba09-4886-8eba-2098fc35339e', 12, 'Kit de Primeiros Socorros',
'# Kit de Primeiros Socorros Veicular

Todo veículo deveria ter um kit básico para emergências.

## Itens Essenciais

### Material de Curativo
- Gaze estéril (pacotes)
- Ataduras de crepe
- Esparadrapo
- Band-aids de vários tamanhos
- Algodão

### Antissépticos
- Soro fisiológico
- Álcool 70%
- Água oxigenada

### Instrumentos
- Tesoura sem ponta
- Pinça
- Luvas descartáveis
- Termômetro

### Outros
- Manta térmica
- Cobertor
- Lanterna
- Triângulo de segurança

## Medicamentos Básicos

| Tipo | Uso |
|------|-----|
| Analgésico | Dores leves |
| Antitérmico | Febre |
| Antisséptico | Limpeza de feridas |
| Soro de reidratação | Desidratação |

## Verificações Periódicas

✅ Verificar validade dos itens
✅ Repor itens utilizados
✅ Manter em local acessível
✅ Proteger de calor excessivo

## Obrigatoriedade

Embora não obrigatório por lei, o kit é **altamente recomendado** para:
- Viagens longas
- Transporte de família
- Uso profissional

> Um kit básico pode salvar vidas enquanto o socorro não chega!', 10, true);

-- MÓDULO 4: MEIO AMBIENTE E CIDADANIA (+6 aulas, ordem 7-12)
INSERT INTO curso_aulas (modulo_id, ordem, titulo, conteudo_texto, duracao_minutos, ativo) VALUES
('b6db4ec4-fa27-4343-bf3e-01ef391137c3', 7, 'Inspeção Veicular',
'# Inspeção Veicular

A inspeção técnica garante que veículos circulem em condições adequadas de segurança e emissões.

## Tipos de Inspeção

### Inspeção de Segurança
- Freios
- Suspensão
- Direção
- Iluminação
- Pneus

### Inspeção de Emissões
- Gases de escapamento
- Ruído
- Opacidade (diesel)

## Programa I/M (Inspeção e Manutenção)

### Estados com Programa Obrigatório
- São Paulo
- Rio de Janeiro
- Outros em implementação

### Frequência
- Veículos novos: Isento nos primeiros anos
- Veículos usados: Anual

### Consequências da Reprovação
- Prazo para correção
- Nova inspeção
- Impedimento de licenciamento

## O que é Verificado

| Item | Critério |
|------|----------|
| CO (gasolina) | < 0,5% |
| HC (gasolina) | < 100 ppm |
| Opacidade (diesel) | Conforme ano do veículo |
| Ruído | < 103 dB |

## Benefícios

✅ Redução da poluição
✅ Maior segurança viária
✅ Identificação de problemas mecânicos
✅ Valorização do veículo', 10, true),

('b6db4ec4-fa27-4343-bf3e-01ef391137c3', 8, 'Combustíveis Alternativos',
'# Combustíveis Alternativos

O futuro da mobilidade passa por fontes de energia mais limpas e sustentáveis.

## Tipos de Combustíveis

### Etanol
- **Origem**: Cana-de-açúcar
- **Vantagens**: Renovável, menor emissão de CO2
- **Desvantagens**: Menor autonomia

### GNV (Gás Natural Veicular)
- **Origem**: Fóssil, mas mais limpo
- **Vantagens**: Menor custo por km
- **Desvantagens**: Perda de porta-malas

### Eletricidade
- **Origem**: Várias fontes
- **Vantagens**: Zero emissões locais
- **Desvantagens**: Autonomia limitada, recarga

### Hidrogênio
- **Origem**: Água (eletrólise)
- **Vantagens**: Emite apenas água
- **Desvantagens**: Infraestrutura limitada

## Comparativo de Emissões

| Combustível | CO2 (g/km) |
|-------------|------------|
| Gasolina | 120-180 |
| Etanol | 80-120* |
| GNV | 100-150 |
| Elétrico | 0 (local) |
| Hidrogênio | 0 |

*Considerando absorção da cana

## Veículos Flex

### Vantagens
- Escolha pelo preço
- Menor dependência de um combustível
- Tecnologia brasileira consolidada

## Tendências

🔮 Carros elétricos em crescimento
🔮 Híbridos como transição
🔮 Hidrogênio para veículos pesados', 12, true),

('b6db4ec4-fa27-4343-bf3e-01ef391137c3', 9, 'Educação para o Trânsito',
'# Educação para o Trânsito

A formação de condutores conscientes começa na infância e continua por toda a vida.

## Educação nas Escolas

### Conteúdo Obrigatório
- Regras de circulação
- Sinalização básica
- Comportamento seguro como pedestre
- Respeito às leis de trânsito

### Faixas Etárias

| Idade | Foco |
|-------|------|
| 4-6 anos | Pedestre seguro |
| 7-10 anos | Ciclista responsável |
| 11-14 anos | Passageiro consciente |
| 15-17 anos | Futuro condutor |

## Programas de Conscientização

### Maio Amarelo
- Campanha mundial
- Foco em segurança viária
- Ações educativas

### Semana Nacional de Trânsito
- 18 a 25 de setembro
- Palestras e eventos
- Tema anual definido pelo CONTRAN

## Papel da Família

✅ Dar exemplo ao dirigir
✅ Ensinar regras desde cedo
✅ Discutir notícias sobre trânsito
✅ Supervisionar uso de bicicleta

## Formação Continuada

### Para Condutores
- Cursos de reciclagem
- Atualizações sobre leis
- Especialização (transporte coletivo, cargas)

### Impacto da Educação
- Redução de acidentes
- Melhor convivência
- Respeito mútuo no trânsito', 10, true),

('b6db4ec4-fa27-4343-bf3e-01ef391137c3', 10, 'Mobilidade Urbana Sustentável',
'# Mobilidade Urbana Sustentável

Repensar o transporte nas cidades é essencial para qualidade de vida e meio ambiente.

## Conceito

Mobilidade sustentável prioriza:
- Transporte público
- Modos não motorizados
- Veículos menos poluentes
- Uso racional do carro particular

## Modos de Transporte

### Hierarquia de Prioridade

1. **Pedestres** (maior prioridade)
2. **Ciclistas**
3. **Transporte público**
4. **Veículos compartilhados**
5. **Veículos particulares** (menor prioridade)

## Iniciativas Sustentáveis

### Ciclovias e Ciclofaixas
- Infraestrutura dedicada
- Segurança para ciclistas
- Integração com transporte público

### Zonas de Baixa Emissão
- Restrição a veículos poluentes
- Incentivo a alternativas limpas
- Exemplo: Rodízio em SP

### Transporte Compartilhado
- Aplicativos de carona
- Carros por assinatura
- Patinetes e bicicletas compartilhadas

## Benefícios

| Ação | Benefício |
|------|-----------|
| Usar transporte público | -70% de emissões |
| Carona solidária | -50% de veículos |
| Bicicleta | 100% limpo |

## Lei da Mobilidade Urbana (12.587/2012)

- Define diretrizes para cidades
- Prioriza transporte não motorizado
- Integração entre modais
- Gestão democrática', 12, true),

('b6db4ec4-fa27-4343-bf3e-01ef391137c3', 11, 'Pedestres e Ciclistas',
'# Pedestres e Ciclistas

Os usuários mais vulneráveis do trânsito merecem atenção e respeito especial.

## Direitos dos Pedestres

### Prioridade Absoluta
- Na faixa de pedestres
- Em travessias sinalizadas
- Ao atravessar via sem faixa (com cuidado)

### Locais de Travessia
- Faixas de pedestres
- Passarelas
- Passagens subterrâneas
- Semáforos de pedestre

## Deveres dos Condutores

### Junto a Pedestres
✅ Reduzir velocidade próximo a escolas
✅ Parar na faixa de pedestres
✅ Dar preferência a idosos e deficientes
✅ Cuidado com crianças nas calçadas

## Ciclistas no Trânsito

### Direitos
- Circular na via quando não houver ciclovia
- Usar faixa da direita
- Prioridade em rotatórias (alguns estados)

### Deveres
- Usar equipamentos de segurança
- Sinalizar manobras
- Respeitar sinalização
- Não usar celular

## Equipamentos Obrigatórios para Bicicletas

| Item | Obrigatoriedade |
|------|-----------------|
| Campainha | Obrigatório |
| Refletores | Obrigatório |
| Farol dianteiro | À noite |
| Lanterna traseira | À noite |
| Capacete | Recomendado |

## Convivência Harmônica

> O respeito mútuo é a base para um trânsito seguro para todos!', 12, true),

('b6db4ec4-fa27-4343-bf3e-01ef391137c3', 12, 'Campanhas de Conscientização',
'# Campanhas de Conscientização no Trânsito

Ações educativas são fundamentais para mudar comportamentos e salvar vidas.

## Principais Campanhas

### Maio Amarelo (Movimento Internacional)
- **Mês**: Maio
- **Símbolo**: Laço amarelo
- **Foco**: Segurança viária
- **Lema 2024**: "Paz no trânsito começa por você"

### Semana Nacional de Trânsito
- **Período**: 18 a 25 de setembro
- **Organizador**: CONTRAN
- **Ações**: Palestras, blitzes educativas

### Operação Lei Seca
- **Foco**: Combate à embriaguez
- **Ação**: Fiscalização com bafômetro
- **Resultado**: Redução de mortes

## Estatísticas Importantes

### Causas de Acidentes no Brasil
| Causa | Percentual |
|-------|------------|
| Falta de atenção | 32% |
| Velocidade | 21% |
| Embriaguez | 18% |
| Ultrapassagem indevida | 12% |
| Outros | 17% |

## Como Participar

✅ Compartilhar mensagens nas redes
✅ Dar exemplo no trânsito
✅ Participar de eventos locais
✅ Conversar com família e amigos

## Impacto das Campanhas

- **Lei Seca**: -30% mortes por embriaguez
- **Maio Amarelo**: Alcance de milhões
- **Educação escolar**: Formação desde cedo

## Mensagem Final

> "No trânsito, somos todos pedestres. A diferença é que alguns estão dentro de veículos."', 10, true);

-- MÓDULO 5: MECÂNICA BÁSICA (+6 aulas, ordem 6-11)
INSERT INTO curso_aulas (modulo_id, ordem, titulo, conteudo_texto, duracao_minutos, ativo) VALUES
('86bda2fd-db5d-4715-80e5-d3d2865e7c17', 6, 'Sistema Elétrico do Veículo',
'# Sistema Elétrico do Veículo

O sistema elétrico alimenta todos os componentes eletrônicos do veículo.

## Componentes Principais

### Bateria
- **Função**: Armazenar energia
- **Tensão**: 12V (carros) ou 24V (caminhões)
- **Vida útil**: 2 a 4 anos

### Alternador
- **Função**: Gerar energia e recarregar bateria
- **Quando funciona**: Com motor ligado

### Motor de Partida
- **Função**: Dar partida no motor
- **Acionamento**: Chave de ignição

## Problemas Comuns

### Bateria Fraca
**Sinais:**
- Motor gira lento na partida
- Luzes fracas
- Sistema de som falha

**Causas:**
- Idade da bateria
- Luzes acesas com motor desligado
- Alternador com defeito

### Alternador com Defeito
**Sinais:**
- Luz da bateria acesa no painel
- Bateria não carrega
- Componentes elétricos falham

## Cuidados Básicos

✅ Manter terminais limpos
✅ Verificar nível de água (baterias não seladas)
✅ Evitar ligar acessórios com motor desligado
✅ Trocar bateria no prazo

## Chupeta (Partida Auxiliar)

### Como Fazer
1. Conecte cabo vermelho no positivo (+) das duas baterias
2. Conecte cabo preto no negativo (-) do carro bom
3. Conecte outro cabo preto em metal do carro com problema
4. Ligue o carro com bateria boa
5. Dê partida no carro com problema

> CUIDADO: Inverter cabos pode danificar componentes eletrônicos!', 15, true),

('86bda2fd-db5d-4715-80e5-d3d2865e7c17', 7, 'Sistema de Arrefecimento',
'# Sistema de Arrefecimento

Responsável por manter o motor na temperatura ideal de funcionamento (90-100°C).

## Componentes

### Radiador
- Troca calor com o ar
- Possui aletas de alumínio
- Localizado na frente do veículo

### Bomba de Água
- Circula o líquido de arrefecimento
- Acionada por correia

### Termostato
- Válvula que regula temperatura
- Abre quando motor aquece

### Ventoinha
- Liga quando temperatura sobe
- Elétrica ou mecânica

## Líquido de Arrefecimento

### Composição
- Água + aditivo (50/50)
- Nunca usar só água

### Funções do Aditivo
- Elevar ponto de ebulição
- Evitar congelamento
- Proteger contra corrosão

## Problemas Comuns

### Superaquecimento
**Sinais:**
- Ponteiro no vermelho
- Luz de temperatura acesa
- Vapor saindo do motor

**Causas:**
- Falta de líquido
- Termostato travado
- Ventoinha com defeito
- Radiador entupido

### O que Fazer

✅ Pare imediatamente
✅ Desligue o motor
✅ NÃO abra o reservatório quente
✅ Espere esfriar (20-30 minutos)
✅ Verifique nível e vazamentos

> PERIGO: Abrir radiador quente pode causar queimaduras graves!', 12, true),

('86bda2fd-db5d-4715-80e5-d3d2865e7c17', 8, 'Luzes do Painel - Significados',
'# Luzes do Painel - Significados

As luzes de advertência comunicam problemas importantes do veículo.

## Cores e Urgência

| Cor | Significado |
|-----|-------------|
| 🔴 Vermelha | PARE imediatamente |
| 🟡 Amarela | Atenção, verificar em breve |
| 🟢 Verde | Informativo |
| 🔵 Azul | Informativo |

## Luzes Vermelhas (Urgentes)

### 🔴 Temperatura
- Motor superaquecendo
- PARE imediatamente

### 🔴 Óleo
- Pressão de óleo baixa
- PARE imediatamente

### 🔴 Bateria
- Problema no carregamento
- Verifique alternador

### 🔴 Freio
- Freio de mão acionado OU
- Nível de fluido baixo

## Luzes Amarelas (Atenção)

### 🟡 Check Engine
- Problema no motor/injeção
- Leve à oficina

### 🟡 ABS
- Sistema ABS com falha
- Freios funcionam normalmente

### 🟡 Airbag
- Sistema de airbag com defeito
- Verificar urgente

### 🟡 Combustível
- Reserva de combustível
- Abasteça em breve

## Luzes Informativas

### 🟢 Setas
- Indicador de direção ativo

### 🔵 Farol Alto
- Farol alto ligado

### 🟢 Luz de Posição
- Lanternas ligadas

## Regra de Ouro

> Luz vermelha = PARE. Luz amarela = VERIFIQUE.', 10, true),

('86bda2fd-db5d-4715-80e5-d3d2865e7c17', 9, 'Verificações Antes de Viajar',
'# Verificações Antes de Viajar

Uma inspeção simples pode evitar problemas na estrada.

## Checklist Completo

### 1. Pneus
- [ ] Calibragem correta (incluindo estepe)
- [ ] Desgaste uniforme
- [ ] Sem bolhas ou cortes
- [ ] Sulcos adequados (> 1,6mm)

### 2. Fluidos
- [ ] Óleo do motor
- [ ] Líquido de arrefecimento
- [ ] Fluido de freio
- [ ] Água do para-brisa

### 3. Iluminação
- [ ] Faróis (alto e baixo)
- [ ] Lanternas traseiras
- [ ] Luz de freio
- [ ] Setas
- [ ] Luz de ré

### 4. Documentação
- [ ] CNH válida
- [ ] CRLV em dia
- [ ] Seguro (se houver)

### 5. Equipamentos Obrigatórios
- [ ] Triângulo de segurança
- [ ] Macaco e chave de roda
- [ ] Estepe calibrado

## Itens Recomendados

- Lanterna
- Cabo de bateria
- Kit primeiros socorros
- Água e alimentos
- Carregador de celular

## Manutenção em Dia

| Item | Verificar |
|------|-----------|
| Óleo | A cada 5.000-10.000 km |
| Correia dentada | Conforme manual |
| Pastilhas de freio | A cada 30.000 km |
| Bateria | A cada 2-3 anos |

## Cuidados Especiais

### Viagens Longas
- Descansar a cada 2 horas
- Verificar veículo em paradas
- Ter mapa alternativo (sem internet)

> Prevenir é sempre melhor (e mais barato) que remediar!', 12, true),

('86bda2fd-db5d-4715-80e5-d3d2865e7c17', 10, 'Troca de Pneu - Passo a Passo',
'# Troca de Pneu - Passo a Passo

Saber trocar um pneu é habilidade essencial para qualquer condutor.

## Equipamentos Necessários

- Macaco
- Chave de roda
- Triângulo de segurança
- Estepe calibrado
- Luvas (opcional)

## Passo a Passo

### 1. Segurança Primeiro
- Estacione em local seguro e plano
- Ligue pisca-alerta
- Coloque triângulo a 30m (mínimo)
- Acione freio de mão
- Calce rodas opostas

### 2. Preparação
- Retire estepe e ferramentas
- Afrouxe parafusos (sem remover)
- Use peso do corpo na chave

### 3. Levantamento
- Posicione macaco no local correto
- Levante até pneu sair do chão
- Verifique estabilidade

### 4. Troca
- Remova parafusos
- Retire pneu furado
- Coloque estepe
- Aperte parafusos em X

### 5. Finalização
- Baixe veículo
- Aperte parafusos com força
- Guarde equipamentos
- Verifique calibragem do estepe

## Padrão de Aperto em X

```
    1 ---- 3
    |      |
    |      |
    4 ---- 2
```

Apertar na ordem: 1, 2, 3, 4, 5 (se houver)

## Cuidados Importantes

❌ Nunca entre embaixo do veículo
❌ Não use macaco em aclive/declive
❌ Estepe é temporário (máx 80 km/h)

> Pratique em casa para estar preparado na emergência!', 15, true),

('86bda2fd-db5d-4715-80e5-d3d2865e7c17', 11, 'Problemas Comuns e Diagnóstico',
'# Problemas Comuns e Diagnóstico

Identificar sintomas ajuda a comunicar com o mecânico e evitar golpes.

## Problemas no Motor

### Motor não Liga
| Sintoma | Possível Causa |
|---------|----------------|
| Nenhum som | Bateria descarregada |
| Clique repetido | Motor de partida |
| Gira mas não pega | Combustível ou ignição |

### Motor Falhando
- Velas sujas/gastas
- Bobina de ignição
- Injeção eletrônica
- Filtro de combustível

## Problemas na Direção

### Volante Treme
**Em baixa velocidade:**
- Problema na direção hidráulica

**Em alta velocidade:**
- Balanceamento das rodas
- Pneus desgastados

### Volante Puxa para um Lado
- Alinhamento incorreto
- Pneus com pressões diferentes
- Problema na suspensão

## Problemas nos Freios

### Freio Range (Barulho)
- Pastilhas gastas
- Disco empenado
- Peças soltas

### Pedal Mole
- Ar no sistema
- Fluido baixo
- Cilindro mestre com defeito

### Pedal Duro
- Servo-freio com defeito
- Problema no vácuo

## Vazamentos

### Identificação pela Cor

| Cor | Fluido |
|-----|--------|
| Verde/Rosa | Arrefecimento |
| Marrom/Preto | Óleo do motor |
| Vermelho | Câmbio automático |
| Transparente | Água do ar-condicionado |

## Quando Procurar Mecânico

🔴 **Imediatamente:**
- Luz vermelha no painel
- Vazamento grande
- Barulho forte repentino

🟡 **Em breve:**
- Luz amarela no painel
- Consumo anormal
- Barulhos leves', 15, true);

-- CRIAR NOVOS MÓDULOS

-- MÓDULO 6: SINALIZAÇÃO AVANÇADA
INSERT INTO curso_modulos (ordem, titulo, descricao, icone, cor, duracao_estimada_minutos, ativo)
VALUES (6, 'Sinalização Avançada', 'Placas especiais, sinalização de obras, dispositivos e interpretação avançada', 'TrafficCone', '#9c27b0', 96, true);

-- MÓDULO 7: SITUAÇÕES ESPECIAIS DE DIREÇÃO  
INSERT INTO curso_modulos (ordem, titulo, descricao, icone, cor, duracao_estimada_minutos, ativo)
VALUES (7, 'Situações Especiais de Direção', 'Direção em condições adversas, rotatórias, reboque e condução com carga', 'AlertTriangle', '#607d8b', 72, true);

-- INSERIR AULAS DO MÓDULO 6 (Sinalização Avançada)
INSERT INTO curso_aulas (modulo_id, ordem, titulo, conteudo_texto, duracao_minutos, ativo)
SELECT id, 1, 'Placas Especiais e Educativas',
'# Placas Especiais e Educativas

Além das placas comuns, existem sinalizações específicas para situações particulares.

## Placas Educativas

### Características
- Fundo branco
- Texto informativo
- Não obrigatórias, mas importantes

### Exemplos
- "Dirija com cuidado"
- "Área escolar"
- "Respeite o ciclista"
- "Trecho monitorado"

## Placas de Atrativos Turísticos

### Cores
- Fundo marrom
- Símbolos brancos

### Indicações
- Monumentos históricos
- Parques naturais
- Praias
- Museus

## Placas de Serviços Auxiliares

### Cores
- Fundo azul
- Símbolos brancos

### Exemplos
| Símbolo | Significado |
|---------|-------------|
| H | Hospital |
| Bomba | Posto de combustível |
| Garfo/Faca | Restaurante |
| Cama | Hotel |
| ✆ | Telefone |

## Placas de Identificação

### Marcos Quilométricos
- Indicam distância
- Referência em acidentes

### Placas de Localidade
- Nome da cidade
- Limites municipais

## Pegadinha DETRAN

Placas educativas e de serviços não são de obrigatoriedade legal, mas placas de regulamentação e advertência são!', 12, true
FROM curso_modulos WHERE ordem = 6;

INSERT INTO curso_aulas (modulo_id, ordem, titulo, conteudo_texto, duracao_minutos, ativo)
SELECT id, 2, 'Sinalização de Obras',
'# Sinalização de Obras

Obras na via exigem sinalização específica para garantir segurança de trabalhadores e motoristas.

## Características

### Cores
- Fundo laranja (advertência de obras)
- Texto e símbolos pretos

### Formato
- Losango (advertência)
- Retangular (orientação)

## Principais Placas

### Advertência de Obras

| Símbolo | Significado |
|---------|-------------|
| Homem trabalhando | Obra na pista |
| Estreitamento | Pista mais estreita |
| Desvio | Mudança de trajeto |
| Máquina | Equipamento na via |

### Regulamentação Temporária
- Velocidade reduzida
- Proibido ultrapassar
- Desvio obrigatório

## Dispositivos Auxiliares

### Cones
- Delimitar áreas
- Cores: laranja e branco

### Cavaletes
- Bloquear passagem
- Indicar desvios

### Sinalização Luminosa
- Setas direcionais
- Luzes piscantes

## Regras para Condutores

✅ Reduzir velocidade
✅ Obedecer sinalizadores
✅ Manter distância
✅ Atenção redobrada

❌ Não ultrapassar barreiras
❌ Não ignorar redução de velocidade

## Multas Relacionadas

- Avançar sinal de obra: Gravíssima
- Desrespeitar velocidade: Grave a gravíssima', 12, true
FROM curso_modulos WHERE ordem = 6;

INSERT INTO curso_aulas (modulo_id, ordem, titulo, conteudo_texto, duracao_minutos, ativo)
SELECT id, 3, 'Marcas Viárias Especiais',
'# Marcas Viárias Especiais

Além das faixas comuns, existem marcações específicas para situações particulares.

## Marcas de Canalização

### Zebrado (Área de Conflito)
- Listras diagonais
- Área proibida para circulação
- Separa fluxos opostos

### Ilhas de Refúgio
- Área elevada ou pintada
- Proteção para pedestres
- Separação de fluxos

## Marcas de Estacionamento

### Cores e Significados

| Cor | Significado |
|-----|-------------|
| Amarelo | Proibido estacionar |
| Vermelho | Proibido parar |
| Branco | Regulamentado |
| Azul | Deficiente físico |

### Vagas Especiais
- Idosos
- Gestantes
- Deficientes
- Carga/descarga

## Marcas Transversais

### Faixa de Pedestres
- Listras brancas
- Prioridade ao pedestre

### Linha de Retenção
- Linha branca contínua
- Limite para parar no semáforo

### Marcação de Cruzamento
- Indicar posição de parada
- Área de conflito

## Setas Direcionais

### No Solo
- Indicam sentido obrigatório
- Devem ser obedecidas

### Tipos
- Seta reta
- Seta curva (esquerda/direita)
- Seta combinada

## Dica Importante

> Linha amarela = separação de fluxos opostos
> Linha branca = separação de fluxos no mesmo sentido', 12, true
FROM curso_modulos WHERE ordem = 6;

INSERT INTO curso_aulas (modulo_id, ordem, titulo, conteudo_texto, duracao_minutos, ativo)
SELECT id, 4, 'Dispositivos de Segurança',
'# Dispositivos de Segurança

Equipamentos instalados nas vias para proteção de condutores e pedestres.

## Dispositivos de Proteção

### Defensas Metálicas (Guard-rails)
- Absorvem impactos
- Evitam saída de pista
- Comum em curvas e pontes

### Barreiras de Concreto (New Jersey)
- Separação de pistas
- Proteção em obras
- Alta resistência

### Atenuadores de Impacto
- Instalados antes de obstáculos fixos
- Absorvem energia de colisões
- Reduzem gravidade de acidentes

## Dispositivos de Sinalização

### Balizadores
- Indicam bordas da pista
- Refletivos (visíveis à noite)
- Cores: branco (direita) e amarelo (esquerda)

### Tachas e Tachões
- No pavimento
- Refletivos
- Delimitam faixas

### Prismas Refletivos
- Curvas perigosas
- Obstáculos
- Desvios

## Lombadas e Redutores

### Lombada Física
- Elevação no pavimento
- Reduz velocidade

### Sonorizadores
- Faixas no solo
- Produzem vibração/som
- Alertam o condutor

## Semáforos Especiais

| Tipo | Uso |
|------|-----|
| Pedestre | Travessias |
| Ciclista | Ciclovias |
| Bonde | Transporte público |
| Amarelo piscante | Atenção especial |

## Manutenção

> Dispositivos danificados devem ser reportados ao órgão de trânsito!', 12, true
FROM curso_modulos WHERE ordem = 6;

INSERT INTO curso_aulas (modulo_id, ordem, titulo, conteudo_texto, duracao_minutos, ativo)
SELECT id, 5, 'Sinalização de Túneis e Pontes',
'# Sinalização de Túneis e Pontes

Estruturas especiais exigem sinalização e comportamentos específicos.

## Túneis

### Sinalização de Entrada
- Placa de advertência
- Limite de velocidade
- Farol obrigatório

### Regras de Circulação

✅ Ligar farol baixo
✅ Manter velocidade constante
✅ Distância de segurança maior
✅ Retirar óculos escuros

❌ NÃO ultrapassar (linha contínua)
❌ NÃO parar (exceto emergência)
❌ NÃO fazer retorno

### Sistemas de Segurança
- Iluminação de emergência
- Ventilação
- Câmeras de monitoramento
- Telefones SOS

### Em Caso de Emergência
1. Pare no acostamento/refúgio
2. Desligue o motor
3. NÃO tente sair pelo túnel
4. Use telefone de emergência

## Pontes e Viadutos

### Restrições Comuns
- Peso máximo
- Largura máxima
- Velocidade reduzida

### Sinalização
- Placas de peso
- Placas de largura
- Advertência de vento lateral

### Cuidados Especiais
- Reduzir velocidade com vento forte
- Manter distância de veículos grandes
- Atenção ao metal quando molhado

## Passagens de Nível

### O que são
- Cruzamento com ferrovia

### Sinalização
- Cruz de Santo André
- Cancela (com ou sem guarda)
- Sinal sonoro

### Regra Absoluta
> Trem SEMPRE tem prioridade!', 12, true
FROM curso_modulos WHERE ordem = 6;

INSERT INTO curso_aulas (modulo_id, ordem, titulo, conteudo_texto, duracao_minutos, ativo)
SELECT id, 6, 'Sinalização em Rodovias',
'# Sinalização em Rodovias

Rodovias possuem sinalização específica para altas velocidades e longas distâncias.

## Placas de Identificação

### Nomenclatura das Rodovias

| Sigla | Tipo |
|-------|------|
| BR | Federal |
| SP, RJ, etc | Estadual |
| Número par | Leste-Oeste |
| Número ímpar | Norte-Sul |

### Marcos Quilométricos
- Postes a cada km
- Referência para localização
- Importantes em acidentes

## Placas de Velocidade

### Velocidades Máximas

| Via | Limite |
|-----|--------|
| Rodovia pista simples | 80 km/h (60 para ônibus/caminhões) |
| Rodovia pista dupla | 100 km/h |
| Autoestrada | 110 km/h |

### Velocidades Mínimas
- Geralmente metade da máxima
- Indicadas em placas específicas

## Sinalização de Saídas

### Placas de Destino
- Fundo verde
- Indicam cidades e distâncias
- Numeração de saídas

### Pré-sinalização
- 1km antes: anúncio
- 500m: confirmação
- Saída: indicação final

## Áreas de Descanso

### Indicações
- Postos de combustível
- Restaurantes
- Telefone
- Banheiros

## Placas de Advertência Específicas

- Animais na pista
- Vento lateral
- Neblina frequente
- Serra perigosa
- Curvas acentuadas

## Dica de Prova

> Em rodovias, a velocidade mínima permitida é geralmente metade da máxima!', 12, true
FROM curso_modulos WHERE ordem = 6;

INSERT INTO curso_aulas (modulo_id, ordem, titulo, conteudo_texto, duracao_minutos, ativo)
SELECT id, 7, 'Sinalização Eletrônica',
'# Sinalização Eletrônica

Tecnologia a serviço da segurança e fluidez do trânsito.

## Painéis de Mensagem Variável (PMV)

### Funções
- Alertas em tempo real
- Condições de tráfego
- Acidentes e bloqueios
- Previsão de tempo

### Exemplos de Mensagens
- "ACIDENTE KM 45 - USE FAIXA ESQUERDA"
- "NEBLINA - REDUZA VELOCIDADE"
- "CONGESTIONAMENTO 3KM"

## Radares e Fiscalização

### Tipos de Radares

| Tipo | Função |
|------|--------|
| Fixo | Velocidade pontual |
| Móvel | Velocidade pontual |
| De trecho | Velocidade média |
| Lombada eletrônica | Velocidade + faixa |

### Radar de Trecho
- Mede velocidade média
- Entre dois pontos
- Mais difícil de burlar

## Semáforos Inteligentes

### Características
- Tempo ajustável
- Sensores de fluxo
- Sincronização (onda verde)

### Detectores
- Laços indutivos (no solo)
- Câmeras
- Sensores infravermelhos

## Pedágios Eletrônicos

### Free Flow
- Sem cancelas
- Cobrança automática
- Tag ou reconhecimento de placa

### TAG (Identificador)
- Instalado no para-brisa
- Débito automático
- Diversas operadoras

## Aplicativos de Trânsito

### Integração
- Waze, Google Maps
- Informações em tempo real
- Alertas de radares (legal no Brasil)

> Sinalização eletrônica complementa, mas não substitui, a sinalização tradicional!', 12, true
FROM curso_modulos WHERE ordem = 6;

INSERT INTO curso_aulas (modulo_id, ordem, titulo, conteudo_texto, duracao_minutos, ativo)
SELECT id, 8, 'Interpretação de Placas Complexas',
'# Interpretação de Placas Complexas

Algumas placas exigem atenção especial para correta interpretação.

## Placas Combinadas

### Placa + Painel Adicional

Exemplos:
- R-1 (Parada obrigatória) + "A 100m"
- R-19 (Velocidade máxima) + "Quando chover"
- A-26 (Sentido duplo) + distância

### Interpretação
- Placa principal: regra
- Painel: condição ou complemento

## Placas de Regulamentação Complexas

### R-2: Dê a preferência
- Reduza, não precisa parar
- Só pare se houver veículos

### R-6a/b/c: Proibido Estacionar
- Setas indicam lado proibido
- Validade conforme indicação

### R-25a/b/c/d: Vire à esquerda/direita
- Obrigatório virar
- Combinações com faixas

## Placas de Advertência Similares

### Curvas x Pista Sinuosa

| Placa | Significado |
|-------|-------------|
| A-1a/b | Uma curva |
| A-2a/b | Curva acentuada |
| A-3a/b | Curva em S |
| A-4a/b | Pista sinuosa |

### Cruzamentos

- A-5: Cruz (vias iguais)
- A-6/7/8: T, Y ou entroncamento
- A-9/10: Bifurcação

## Pegadinhas Comuns

### Parar x Preferência
- R-1 (PARE): Parada obrigatória total
- R-2 (Triângulo): Apenas dar preferência

### Proibido x Regulamentado
- Círculo vermelho: Proibição
- Círculo azul: Obrigação

### Distâncias
- "A 200m": Situação à frente
- "Por 200m": Extensão da situação

## Dica Final

> Em dúvida, sempre opte pela interpretação mais restritiva (mais segura)!', 12, true
FROM curso_modulos WHERE ordem = 6;

-- INSERIR AULAS DO MÓDULO 7 (Situações Especiais de Direção)
INSERT INTO curso_aulas (modulo_id, ordem, titulo, conteudo_texto, duracao_minutos, ativo)
SELECT id, 1, 'Direção em Montanhas e Serras',
'# Direção em Montanhas e Serras

Trechos de serra exigem técnicas específicas para garantir segurança.

## Subidas

### Técnicas Corretas
- Usar marcha adequada (mais baixa)
- Manter rotação do motor
- Evitar retomadas com carga
- Não forçar o motor

### Cuidados
- Verificar temperatura do motor
- Parar se superaquecer
- Não desligar motor em movimento

## Descidas

### Técnica do Freio-Motor
- Usar mesma marcha da subida
- Motor ajuda a frear
- Preserva sistema de freios

### Perigos do Freio Contínuo
- Superaquecimento
- Fade (perda de eficiência)
- Risco de falha total

### Áreas de Escape
- Rampas com areia/brita
- Para veículos sem freio
- NÃO usar se freios funcionam

## Ultrapassagens em Serra

### Subida
- Veículo subindo tem preferência
- Mais difícil retomar velocidade

### Descida
- Ainda mais perigoso
- Distância de frenagem maior

## Veículos Pesados

### Regras Especiais
- Usar faixa da direita
- Paradas obrigatórias (verificação de freios)
- Calços para estacionamento

## Condições Adversas

### Neblina em Serra
- Muito comum
- Usar farol baixo
- Reduzir drasticamente velocidade

### Chuva
- Pista mais escorregadia em curvas
- Risco de aquaplanagem
- Maior distância de segurança', 12, true
FROM curso_modulos WHERE ordem = 7;

INSERT INTO curso_aulas (modulo_id, ordem, titulo, conteudo_texto, duracao_minutos, ativo)
SELECT id, 2, 'Travessia de Alagamentos',
'# Travessia de Alagamentos

Enchentes e alagamentos são extremamente perigosos e requerem decisões cuidadosas.

## Avaliação da Situação

### Quando NÃO atravessar
❌ Água acima do meio da roda
❌ Não consegue ver o fundo
❌ Água em movimento forte
❌ Fios elétricos próximos
❌ Bueiros destampados

### Quando pode tentar
✅ Água rasa (abaixo do meio-fio)
✅ Água parada
✅ Consegue ver o pavimento
✅ Conhece o local

## Técnica de Travessia

### Se decidir atravessar:
1. Entre devagar (10-20 km/h)
2. Mantenha rotação constante
3. NÃO troque de marcha
4. Vá em linha reta
5. Não pare no meio

### Após atravessar:
- Teste os freios levemente
- Seque as lonas/pastilhas
- Verifique funcionamento

## Riscos Principais

### Motor "Calçar"
- Água entra na admissão
- Motor trava instantaneamente
- Dano grave e caro

### Hidrostatic Lock
- Água não comprime como ar
- Biela pode entortar
- Motor pode ser perdido

## Se o Veículo Parar na Água

1. NÃO tente dar partida novamente
2. Desligue o motor imediatamente
3. Saia do veículo se seguro
4. Aguarde reboque
5. Verifique óleo antes de ligar

## Seguro e Cobertura

> Muitos seguros NÃO cobrem danos por alagamento se ficar comprovada negligência!', 12, true
FROM curso_modulos WHERE ordem = 7;

INSERT INTO curso_aulas (modulo_id, ordem, titulo, conteudo_texto, duracao_minutos, ativo)
SELECT id, 3, 'Neblina e Visibilidade Reduzida',
'# Neblina e Visibilidade Reduzida

Condições de baixa visibilidade são responsáveis por acidentes graves com múltiplos veículos.

## Tipos de Restrição de Visibilidade

### Neblina
- Partículas de água suspensas
- Comum em serras e vales
- Pode surgir repentinamente

### Fumaça
- Queimadas
- Incêndios
- Indústrias

### Chuva Intensa
- Reduz visibilidade drasticamente
- Spray de veículos à frente

## Técnicas de Condução

### Iluminação Correta

| Situação | Farol |
|----------|-------|
| Neblina leve | Baixo |
| Neblina densa | Baixo + farol de neblina |
| Neblina muito densa | Considere parar |

### Por que NÃO usar Farol Alto?
- Luz reflete nas partículas
- Cria "parede branca"
- Piora a visibilidade

### Velocidade
- Compatível com visibilidade
- Você deve conseguir parar na distância que vê
- Em neblina densa: 20-40 km/h

## Dicas Importantes

✅ Aumente distância de seguimento
✅ Use as linhas da pista como guia
✅ Evite ultrapassagens
✅ Desligue som para ouvir outros veículos
✅ Abra um pouco a janela

❌ NÃO pare na pista
❌ NÃO siga luzes do veículo à frente muito de perto
❌ NÃO faça movimentos bruscos

## Se Precisar Parar

1. Saia completamente da pista
2. Acione pisca-alerta
3. Ligue faróis baixos
4. Permaneça no veículo
5. Use triângulo se possível

## Engavetamentos

### Por que Ocorrem
- Efeito surpresa
- Velocidade inadequada
- Falta de distância

> Na dúvida, pare em local seguro e espere a neblina dissipar!', 12, true
FROM curso_modulos WHERE ordem = 7;

INSERT INTO curso_aulas (modulo_id, ordem, titulo, conteudo_texto, duracao_minutos, ativo)
SELECT id, 4, 'Cruzamentos e Rotatórias',
'# Cruzamentos e Rotatórias

Pontos de conflito que exigem atenção especial e conhecimento das regras.

## Cruzamentos

### Regras de Preferência

1. **Veículo da direita** tem preferência (sem sinalização)
2. **Via principal** tem preferência sobre secundária
3. **Quem está na via** tem preferência sobre quem entra

### Procedimento Correto
1. Reduza a velocidade
2. Verifique ambos os lados
3. Não confie apenas em sinais
4. Mantenha atenção em pedestres

### Conversões

| Tipo | Procedimento |
|------|--------------|
| Direita | Aproxime-se da direita |
| Esquerda | Aproxime-se do centro |
| Retorno | Quando permitido, com segurança |

## Rotatórias

### Regra Básica
**Quem está na rotatória tem preferência**
(Exceto se sinalização indicar diferente)

### Como Entrar
1. Sinalize a intenção
2. Dê preferência a quem já está dentro
3. Entre quando houver espaço seguro

### Como Sair
1. Sinalize com antecedência
2. Use faixa da direita para sair
3. Cuidado com motos no ponto cego

### Faixas na Rotatória

| Saída | Faixa a Usar |
|-------|--------------|
| 1ª saída | Direita |
| 2ª saída | Centro ou direita |
| 3ª+ saída | Esquerda, migrando para direita |

## Erros Comuns

❌ Entrar sem dar preferência
❌ Trocar de faixa dentro da rotatória
❌ Não sinalizar saída
❌ Parar dentro da rotatória

## Dica DETRAN

> Na falta de sinalização, a preferência é sempre de quem vem pela DIREITA!', 12, true
FROM curso_modulos WHERE ordem = 7;

INSERT INTO curso_aulas (modulo_id, ordem, titulo, conteudo_texto, duracao_minutos, ativo)
SELECT id, 5, 'Reboque e Socorro Mecânico',
'# Reboque e Socorro Mecânico

Situações de pane exigem conhecimento para agir com segurança.

## Tipos de Reboque

### Reboque por Guincho
- Método mais seguro
- Obrigatório para alguns veículos
- Recomendado para câmbio automático

### Reboque por Veículo
- Permitido em emergências
- Limite: 50 km/h
- Distância máxima: próximo posto/oficina

## Regras para Rebocar

### Equipamento
- Corda ou barra rígida
- Sinalização (bandeirola)
- Pisca-alerta em ambos

### Procedimentos

| Veículo Rebocado | Cuidado |
|-----------------|---------|
| Direção hidráulica | Mais pesada |
| Freio hidrovácuo | Menos eficiente |
| Câmbio automático | Pode danificar |

### Comunicação
- Combinar sinais antes
- Buzinar para avisos
- Manter velocidade constante

## Câmbio Automático

### Cuidados Especiais
- Preferir guincho
- Se rebocar: máximo 30 km a 30 km/h
- Algumas marcas: proibido qualquer reboque

### Verifique o Manual
- Cada fabricante tem regras
- Pode haver modo de reboque

## Procedimento em Pane

1. Saia da via (acostamento)
2. Ligue pisca-alerta
3. Coloque triângulo
4. Vista colete (se tiver)
5. Chame socorro

## Socorro Mecânico

### Quando Chamar
- Pane sem solução simples
- Acidente
- Dúvida sobre o problema

### Serviços Disponíveis
- Seguradora
- Guincho particular
- Aplicativos de socorro

> NUNCA fique atrás do veículo parado na via - risco de atropelamento!', 12, true
FROM curso_modulos WHERE ordem = 7;

INSERT INTO curso_aulas (modulo_id, ordem, titulo, conteudo_texto, duracao_minutos, ativo)
SELECT id, 6, 'Condução com Carga',
'# Condução com Carga

Transportar carga altera significativamente o comportamento do veículo.

## Efeitos da Carga

### No Veículo
- Centro de gravidade mais alto
- Maior inércia (demora para parar)
- Maior consumo de combustível
- Maior desgaste de pneus e freios

### Na Direção
- Mais peso = mais distância de frenagem
- Curvas mais perigosas
- Subidas mais lentas

## Distribuição da Carga

### Regras Básicas

| Local | Tipo de Carga |
|-------|---------------|
| Parte baixa | Itens pesados |
| Centro | Distribuir uniformemente |
| Nunca | Sobre apenas um lado |

### Peso Máximo
- Respeitar capacidade do veículo
- Verificar manual do proprietário
- Carga máxima útil (CMU)

## Amarração e Fixação

### Itens Soltos
- Perigo em frenagens
- Podem virar projéteis
- Fixar com cintas ou redes

### Carga que se Projeta
- Máximo 2 metros para trás
- Sinalizar com bandeirola
- Acima de 2m: autorização especial

## Bagageiro de Teto

### Cuidados
- Verificar peso máximo
- Fixar corretamente
- Altera centro de gravidade
- Aumenta consumo (arrasto)

### Velocidade
- Reduzir em curvas
- Cuidado com vento lateral
- Testar freios antes de viagem

## Carretinha/Trailer

### Requisitos
- Registro específico
- Iluminação própria
- Engate adequado
- Corrente de segurança

### Habilitação
- Categoria B: até 3.500 kg
- Categoria E: acima de 6.000 kg

## Dica de Segurança

> Com carga, dobre a distância de segurança e reduza a velocidade em curvas!', 12, true
FROM curso_modulos WHERE ordem = 7;

-- Atualizar duração estimada dos módulos existentes
UPDATE curso_modulos SET duracao_estimada_minutos = 200 WHERE ordem = 1; -- Legislação (20 aulas)
UPDATE curso_modulos SET duracao_estimada_minutos = 180 WHERE ordem = 2; -- Direção Defensiva (15 aulas)
UPDATE curso_modulos SET duracao_estimada_minutos = 147 WHERE ordem = 3; -- Primeiros Socorros (12 aulas)
UPDATE curso_modulos SET duracao_estimada_minutos = 132 WHERE ordem = 4; -- Meio Ambiente (12 aulas)
UPDATE curso_modulos SET duracao_estimada_minutos = 134 WHERE ordem = 5; -- Mecânica (11 aulas)
