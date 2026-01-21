import { ArrowLeft, FileText, Users, CreditCard, Calendar, AlertTriangle, Scale, Shield, Mail, Building, Car, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function TermosUso() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="px-6 pt-6 pb-4 safe-top border-b border-border">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Termos de Uso</h1>
          </div>
        </div>
      </header>

      <main className="px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Badge Conformidade */}
          <div className="mb-8 p-4 bg-primary/10 rounded-xl border border-primary/20 flex items-center gap-3">
            <Scale className="w-8 h-8 text-primary flex-shrink-0" />
            <div>
              <p className="font-semibold text-foreground">Termos Legais</p>
              <p className="text-sm text-muted-foreground">Em conformidade com a legislação brasileira e regulamentação do CONTRAN</p>
            </div>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none">
            <p className="text-muted-foreground text-lg">
              <strong>Última atualização:</strong> 30 de Dezembro de 2025
            </p>

            {/* 1. Aceitação dos Termos */}
            <section className="mt-8">
              <h2 className="flex items-center gap-2 text-xl font-bold">
                <FileText className="w-5 h-5 text-primary" />
                1. Aceitação dos Termos
              </h2>
              <p>
                Ao acessar, cadastrar-se ou utilizar a plataforma <strong>CNH 360</strong> ("Plataforma", 
                "nós" ou "nosso"), você declara que leu, entendeu e concorda integralmente com estes 
                Termos de Uso ("Termos").
              </p>
              <p>
                Se você não concordar com qualquer parte destes Termos, não deverá utilizar a Plataforma. 
                O uso continuado da Plataforma constitui aceite das condições aqui estabelecidas.
              </p>
              <p>
                Ao se cadastrar, você também declara ter pelo menos 18 anos de idade ou, se menor, 
                estar devidamente assistido por responsável legal conforme legislação aplicável.
              </p>
            </section>

            {/* 2. Descrição do Serviço */}
            <section className="mt-8">
              <h2 className="flex items-center gap-2 text-xl font-bold">
                <Car className="w-5 h-5 text-primary" />
                2. Descrição do Serviço
              </h2>
              <p>
                A <strong>CNH 360</strong> é uma plataforma tecnológica que conecta:
              </p>
              <ul>
                <li><strong>Alunos</strong> em processo de habilitação ou renovação de CNH</li>
                <li><strong>Instrutores de trânsito</strong> credenciados pelo DETRAN</li>
                <li><strong>Autoescolas</strong> (Centros de Formação de Condutores - CFCs)</li>
              </ul>
              <p>Nossa plataforma oferece:</p>
              <ul>
                <li>Agendamento de aulas práticas de direção veicular</li>
                <li>Curso teórico EAD preparatório para o exame de legislação</li>
                <li>Simulados oficiais baseados no banco de questões do DETRAN</li>
                <li>Rastreamento em tempo real do instrutor</li>
                <li>Processamento seguro de pagamentos</li>
                <li>Avaliações e reviews de instrutores</li>
                <li>Gestão completa para autoescolas</li>
              </ul>
              <p className="mt-4">
                <strong>Importante:</strong> A CNH 360 atua em conformidade com a <strong>Resolução 
                CONTRAN nº 1.020/2025</strong> e demais regulamentações aplicáveis ao processo de 
                habilitação de condutores no Brasil.
              </p>
            </section>

            {/* 3. Tipos de Usuários */}
            <section className="mt-8">
              <h2 className="flex items-center gap-2 text-xl font-bold">
                <Users className="w-5 h-5 text-primary" />
                3. Tipos de Usuários
              </h2>
              
              <h3 className="flex items-center gap-2 text-lg font-semibold mt-4">
                <GraduationCap className="w-4 h-4" />
                3.1 Alunos
              </h3>
              <p>
                Pessoas físicas em processo de obtenção ou renovação de Carteira Nacional de 
                Habilitação (CNH), que utilizam a plataforma para:
              </p>
              <ul>
                <li>Primeira habilitação</li>
                <li>Adição de categoria</li>
                <li>Renovação de CNH</li>
                <li>Mudança de categoria</li>
              </ul>

              <h3 className="flex items-center gap-2 text-lg font-semibold mt-4">
                <Car className="w-4 h-4" />
                3.2 Instrutores
              </h3>
              <p>
                Profissionais devidamente credenciados pelo DETRAN, que podem atuar como:
              </p>
              <ul>
                <li><strong>Autônomos (MEI):</strong> instrutores independentes com CNPJ próprio</li>
                <li><strong>Vinculados:</strong> instrutores associados a uma autoescola</li>
              </ul>

              <h3 className="flex items-center gap-2 text-lg font-semibold mt-4">
                <Building className="w-4 h-4" />
                3.3 Autoescolas
              </h3>
              <p>
                Centros de Formação de Condutores (CFCs) devidamente credenciados pelo DETRAN, 
                que utilizam a plataforma para gestão de alunos, instrutores e turmas.
              </p>
            </section>

            {/* 4. Responsabilidades */}
            <section className="mt-8">
              <h2 className="flex items-center gap-2 text-xl font-bold">
                <Shield className="w-5 h-5 text-primary" />
                4. Responsabilidades dos Usuários
              </h2>
              
              <h3 className="text-lg font-semibold mt-4">4.1 Responsabilidades dos Alunos</h3>
              <ul>
                <li>Fornecer dados pessoais verdadeiros, completos e atualizados</li>
                <li>Manter o sigilo de suas credenciais de acesso</li>
                <li>Efetuar o pagamento das aulas agendadas conforme acordado</li>
                <li>Comparecer pontualmente aos agendamentos ou cancelar com antecedência mínima</li>
                <li>Tratar instrutores com respeito e cordialidade</li>
                <li>Cumprir as instruções do instrutor durante as aulas práticas</li>
                <li>Portar documentação necessária (documento de identidade, LADV quando aplicável)</li>
                <li>Não conduzir o veículo sob efeito de álcool ou substâncias psicoativas</li>
              </ul>

              <h3 className="text-lg font-semibold mt-4">4.2 Responsabilidades dos Instrutores</h3>
              <ul>
                <li>Manter credenciais do DETRAN válidas e atualizadas</li>
                <li>Possuir CNH compatível com a categoria ensinada e em validade</li>
                <li>Manter veículo em perfeitas condições de segurança e legalidade</li>
                <li>Cumprir o Código de Trânsito Brasileiro (CTB) durante as aulas</li>
                <li>Entregar aulas de qualidade, conforme padrões do DETRAN</li>
                <li>Comparecer pontualmente aos agendamentos</li>
                <li>Tratar alunos com respeito, paciência e profissionalismo</li>
                <li>Reportar quaisquer incidentes ou irregularidades</li>
                <li>Quando MEI, manter CNPJ ativo e regular</li>
              </ul>

              <h3 className="text-lg font-semibold mt-4">4.3 Responsabilidades das Autoescolas</h3>
              <ul>
                <li>Manter credenciamento junto ao DETRAN válido e atualizado</li>
                <li>Garantir conformidade regulatória de todas as operações</li>
                <li>Supervisionar a qualidade dos serviços de instrutores vinculados</li>
                <li>Manter documentação fiscal e tributária em ordem</li>
                <li>Atender às determinações da Resolução CONTRAN 1.020/2025</li>
              </ul>
            </section>

            {/* 5. Pagamentos */}
            <section className="mt-8">
              <h2 className="flex items-center gap-2 text-xl font-bold">
                <CreditCard className="w-5 h-5 text-primary" />
                5. Pagamentos
              </h2>
              
              <h3 className="text-lg font-semibold mt-4">5.1 Formas de Pagamento</h3>
              <p>Aceitamos os seguintes métodos de pagamento:</p>
              <ul>
                <li><strong>Cartão de crédito:</strong> processado via Pagar.me (Stone)</li>
                <li><strong>Pix:</strong> transferência instantânea via Pagar.me</li>
              </ul>

              <h3 className="text-lg font-semibold mt-4">5.2 Valores e Taxas</h3>
              <ul>
                <li>Os valores das aulas são definidos pelos instrutores ou autoescolas</li>
                <li>A CNH 360 cobra uma taxa de serviço sobre cada transação</li>
                <li>Os valores são exibidos de forma transparente antes da confirmação</li>
                <li>Pagamentos são processados em Reais (BRL)</li>
              </ul>

              <h3 className="text-lg font-semibold mt-4">5.3 Repasse aos Instrutores</h3>
              <p>
                Os valores são repassados aos instrutores conforme política de pagamento vigente, 
                após a confirmação de realização da aula.
              </p>
            </section>

            {/* 6. Cancelamentos e Reembolsos */}
            <section className="mt-8">
              <h2 className="flex items-center gap-2 text-xl font-bold">
                <Calendar className="w-5 h-5 text-primary" />
                6. Cancelamentos e Reembolsos
              </h2>
              
              <div className="bg-muted/50 p-4 rounded-lg mt-4">
                <h3 className="text-lg font-semibold">Política de Cancelamento</h3>
                <ul className="mt-2">
                  <li>
                    <strong>Mais de 24 horas de antecedência:</strong> reembolso integral (100%)
                  </li>
                  <li>
                    <strong>Menos de 24 horas de antecedência:</strong> taxa de cancelamento de 30% do valor
                  </li>
                  <li>
                    <strong>Não comparecimento (no-show):</strong> sem direito a reembolso
                  </li>
                  <li>
                    <strong>Cancelamento pelo instrutor:</strong> reembolso integral ao aluno
                  </li>
                </ul>
              </div>

              <h3 className="text-lg font-semibold mt-4">6.1 Procedimento de Reembolso</h3>
              <ul>
                <li>Reembolsos em cartão: processados em até 10 dias úteis</li>
                <li>Reembolsos via Pix: processados em até 3 dias úteis</li>
                <li>O prazo pode variar conforme a instituição financeira</li>
              </ul>

              <h3 className="text-lg font-semibold mt-4">6.2 Situações Especiais</h3>
              <ul>
                <li>Condições climáticas adversas: reagendamento sem custo ou reembolso integral</li>
                <li>Problemas técnicos com o veículo: reagendamento sem custo ou reembolso integral</li>
                <li>Emergências comprovadas: análise caso a caso</li>
              </ul>
            </section>

            {/* 7. Proibições */}
            <section className="mt-8">
              <h2 className="flex items-center gap-2 text-xl font-bold">
                <AlertTriangle className="w-5 h-5 text-primary" />
                7. Condutas Proibidas
              </h2>
              <p>É expressamente proibido aos usuários:</p>
              <ul>
                <li>Fornecer informações falsas ou documentos fraudulentos</li>
                <li>Utilizar conta de terceiros ou permitir uso de sua conta por terceiros</li>
                <li>Assédio, discriminação ou comportamento inadequado de qualquer natureza</li>
                <li>Tentativa de burlar a plataforma (pagamentos diretos, contato fora da plataforma para evitar taxas)</li>
                <li>Prática de atividades ilegais ou contrárias à legislação de trânsito</li>
                <li>Conduzir veículo sob efeito de álcool, drogas ou medicamentos que comprometam a capacidade</li>
                <li>Divulgar dados pessoais de outros usuários sem autorização</li>
                <li>Criar avaliações falsas ou manipular sistema de reputação</li>
                <li>Utilizar a plataforma para fins diferentes dos previstos nestes Termos</li>
                <li>Violar direitos de propriedade intelectual</li>
              </ul>
              
              <div className="bg-destructive/10 p-4 rounded-lg mt-4 border border-destructive/20">
                <p className="text-destructive font-semibold">
                  O descumprimento das regras acima pode resultar em suspensão ou banimento 
                  permanente da plataforma, sem prejuízo de medidas legais cabíveis.
                </p>
              </div>
            </section>

            {/* 8. Conformidade Regulatória */}
            <section className="mt-8">
              <h2 className="flex items-center gap-2 text-xl font-bold">
                <Scale className="w-5 h-5 text-primary" />
                8. Conformidade Regulatória
              </h2>
              <p>
                A CNH 360 opera em conformidade com a legislação brasileira de trânsito, incluindo:
              </p>
              <ul>
                <li><strong>Resolução CONTRAN nº 1.020/2025:</strong> regulamenta os processos de habilitação de condutores</li>
                <li><strong>Código de Trânsito Brasileiro (CTB):</strong> Lei nº 9.503/1997</li>
                <li><strong>Regulamentações do DETRAN:</strong> conforme cada Unidade da Federação</li>
                <li><strong>LGPD:</strong> Lei Geral de Proteção de Dados (Lei nº 13.709/2018)</li>
                <li><strong>Código de Defesa do Consumidor:</strong> Lei nº 8.078/1990</li>
              </ul>
              <p className="mt-4">
                Instrutores e autoescolas devem manter suas credenciais válidas junto ao DETRAN 
                e cumprir todas as exigências regulatórias aplicáveis.
              </p>
            </section>

            {/* 9. Limitação de Responsabilidade */}
            <section className="mt-8">
              <h2 className="flex items-center gap-2 text-xl font-bold">
                <Shield className="w-5 h-5 text-primary" />
                9. Limitação de Responsabilidade
              </h2>
              <p>
                A <strong>CNH 360 é uma plataforma de intermediação tecnológica</strong>. Nesta qualidade:
              </p>
              <ul>
                <li>
                  <strong>Não garantimos aprovação em exames:</strong> o resultado dos exames teóricos 
                  e práticos depende exclusivamente do desempenho do candidato
                </li>
                <li>
                  <strong>Não nos responsabilizamos por acidentes:</strong> a condução do veículo 
                  durante as aulas é de responsabilidade do instrutor credenciado
                </li>
                <li>
                  <strong>Não somos parte do contrato de prestação de serviços:</strong> a relação 
                  contratual de ensino é entre aluno e instrutor/autoescola
                </li>
                <li>
                  <strong>Não garantimos disponibilidade contínua:</strong> a plataforma pode sofrer 
                  interrupções para manutenção ou por fatores externos
                </li>
              </ul>
              <p className="mt-4">
                A CNH 360 empenha-se em manter a qualidade da plataforma e dos usuários cadastrados, 
                mas não pode ser responsabilizada por atos de terceiros.
              </p>
            </section>

            {/* 10. Propriedade Intelectual */}
            <section className="mt-8">
              <h2 className="flex items-center gap-2 text-xl font-bold">
                <FileText className="w-5 h-5 text-primary" />
                10. Propriedade Intelectual
              </h2>
              <p>
                Todos os direitos de propriedade intelectual relacionados à plataforma CNH 360 
                são de titularidade exclusiva da CNH 360, incluindo:
              </p>
              <ul>
                <li>Marca, logo e identidade visual</li>
                <li>Software, código-fonte e interface</li>
                <li>Conteúdo do curso teórico EAD</li>
                <li>Banco de questões dos simulados</li>
                <li>Textos, imagens e materiais educacionais</li>
              </ul>
              <p>
                É proibida a reprodução, distribuição ou utilização não autorizada de qualquer 
                conteúdo da plataforma.
              </p>
            </section>

            {/* 11. Suspensão e Encerramento */}
            <section className="mt-8">
              <h2 className="flex items-center gap-2 text-xl font-bold">
                <AlertTriangle className="w-5 h-5 text-primary" />
                11. Suspensão e Encerramento de Conta
              </h2>
              <p>A CNH 360 reserva-se o direito de:</p>
              <ul>
                <li><strong>Suspender temporariamente:</strong> contas sob investigação de irregularidades</li>
                <li><strong>Encerrar permanentemente:</strong> contas que violem estes Termos</li>
                <li><strong>Recusar cadastro:</strong> de usuários que já foram banidos anteriormente</li>
              </ul>
              <p className="mt-4">
                O usuário pode solicitar o encerramento de sua conta a qualquer momento através 
                do e-mail de suporte.
              </p>
            </section>

            {/* 12. Alterações nos Termos */}
            <section className="mt-8">
              <h2 className="flex items-center gap-2 text-xl font-bold">
                <FileText className="w-5 h-5 text-primary" />
                12. Alterações nos Termos
              </h2>
              <p>
                A CNH 360 pode alterar estes Termos a qualquer momento. Quando houver alterações 
                significativas:
              </p>
              <ul>
                <li>Notificaremos os usuários por e-mail ou aviso na plataforma</li>
                <li>As alterações entram em vigor na data indicada</li>
                <li>O uso continuado após as alterações constitui aceite dos novos Termos</li>
                <li>Se você não concordar com as alterações, deverá encerrar sua conta</li>
              </ul>
            </section>

            {/* 13. Resolução de Conflitos */}
            <section className="mt-8">
              <h2 className="flex items-center gap-2 text-xl font-bold">
                <Scale className="w-5 h-5 text-primary" />
                13. Resolução de Conflitos
              </h2>
              
              <h3 className="text-lg font-semibold mt-4">13.1 Solução Amigável</h3>
              <p>
                Em caso de controvérsia, as partes se comprometem a buscar solução amigável 
                através do canal de atendimento da CNH 360.
              </p>

              <h3 className="text-lg font-semibold mt-4">13.2 Foro</h3>
              <p>
                Não sendo possível a solução amigável, fica eleito o <strong>Foro da Comarca de 
                Araçatuba, Estado de São Paulo</strong>, para dirimir quaisquer controvérsias 
                decorrentes destes Termos, com renúncia expressa a qualquer outro, por mais 
                privilegiado que seja.
              </p>

              <h3 className="text-lg font-semibold mt-4">13.3 Lei Aplicável</h3>
              <p>
                Estes Termos são regidos exclusivamente pela legislação da República Federativa 
                do Brasil.
              </p>
            </section>

            {/* 14. Contato */}
            <section className="mt-8">
              <h2 className="flex items-center gap-2 text-xl font-bold">
                <Mail className="w-5 h-5 text-primary" />
                14. Contato
              </h2>
              <p>
                Para dúvidas, sugestões, reclamações ou solicitações relacionadas a estes 
                Termos de Uso, entre em contato conosco:
              </p>
              <div className="bg-muted/50 p-4 rounded-lg mt-4">
                <p className="mb-2"><strong>CNH 360</strong></p>
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <a href="mailto:360cnh@gmail.com" className="text-primary hover:underline">360cnh@gmail.com</a>
                </p>
              </div>
            </section>

            {/* Vigência */}
            <section className="mt-8">
              <h2 className="flex items-center gap-2 text-xl font-bold">
                <Calendar className="w-5 h-5 text-primary" />
                15. Vigência
              </h2>
              <p>
                Estes Termos de Uso entram em vigor a partir da data de seu aceite pelo usuário 
                e permanecem válidos enquanto o usuário mantiver conta ativa na plataforma CNH 360.
              </p>
            </section>

            {/* Data de atualização final */}
            <div className="mt-12 pt-6 border-t border-border">
              <p className="text-center text-muted-foreground">
                <strong>Última atualização:</strong> 30 de Dezembro de 2025
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
