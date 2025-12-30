import { ArrowLeft, Shield, Mail, Database, Lock, Users, FileText, Clock, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PoliticaPrivacidade() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="px-6 pt-6 pb-4 safe-top border-b border-border">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Política de Privacidade</h1>
          </div>
        </div>
      </header>

      <main className="px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Badge LGPD */}
          <div className="mb-8 p-4 bg-primary/10 rounded-xl border border-primary/20 flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary flex-shrink-0" />
            <div>
              <p className="font-semibold text-foreground">Conforme a LGPD</p>
              <p className="text-sm text-muted-foreground">Lei Geral de Proteção de Dados (Lei nº 13.709/2018)</p>
            </div>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none">
            <p className="text-muted-foreground text-lg">
              <strong>Última atualização:</strong> 30 de Dezembro de 2025
            </p>

            {/* 1. Introdução */}
            <section className="mt-8">
              <h2 className="flex items-center gap-2 text-xl font-bold">
                <FileText className="w-5 h-5 text-primary" />
                1. Introdução
              </h2>
              <p>
                A <strong>CNH 360</strong> ("nós", "nosso" ou "Plataforma") está comprometida com a proteção 
                dos seus dados pessoais. Esta Política de Privacidade explica como coletamos, usamos, 
                compartilhamos e protegemos suas informações quando você utiliza nossa plataforma de 
                conexão entre alunos, instrutores de trânsito e autoescolas.
              </p>
              <p>
                Ao utilizar nossos serviços, você concorda com as práticas descritas nesta política. 
                Recomendamos a leitura atenta deste documento.
              </p>
            </section>

            {/* 2. Controlador de Dados */}
            <section className="mt-8">
              <h2 className="flex items-center gap-2 text-xl font-bold">
                <Users className="w-5 h-5 text-primary" />
                2. Controlador de Dados
              </h2>
              <p>
                O controlador dos dados pessoais tratados por meio desta plataforma é a <strong>CNH 360</strong>, 
                responsável pelas decisões referentes ao tratamento de dados pessoais.
              </p>
              <div className="bg-muted/50 p-4 rounded-lg mt-4">
                <p className="mb-2"><strong>Contato do Controlador:</strong></p>
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <a href="mailto:360cnh@gmail.com" className="text-primary hover:underline">360cnh@gmail.com</a>
                </p>
              </div>
            </section>

            {/* 3. Dados Coletados */}
            <section className="mt-8">
              <h2 className="flex items-center gap-2 text-xl font-bold">
                <Database className="w-5 h-5 text-primary" />
                3. Dados que Coletamos
              </h2>
              <p>Coletamos os seguintes tipos de dados pessoais:</p>
              
              <h3 className="text-lg font-semibold mt-4">3.1 Dados de Identificação</h3>
              <ul>
                <li>Nome completo</li>
                <li>Endereço de e-mail</li>
                <li>Número de telefone</li>
                <li>CPF (Cadastro de Pessoa Física)</li>
                <li>Foto de perfil (opcional)</li>
              </ul>

              <h3 className="text-lg font-semibold mt-4">3.2 Dados de CNH e Habilitação</h3>
              <ul>
                <li>Número da CNH</li>
                <li>Categoria da CNH (A, B, AB, C, D, E, ACC)</li>
                <li>Data de validade da CNH</li>
                <li>Número do RENACH (quando aplicável)</li>
                <li>Objetivo do aluno (primeira habilitação, adição de categoria, renovação)</li>
              </ul>

              <h3 className="text-lg font-semibold mt-4">3.3 Dados de Localização</h3>
              <ul>
                <li>Localização GPS em tempo real (durante aulas práticas)</li>
                <li>Endereço para ponto de encontro</li>
                <li>Histórico de rotas de aulas</li>
              </ul>

              <h3 className="text-lg font-semibold mt-4">3.4 Dados de Pagamento</h3>
              <ul>
                <li>Informações de transações (processadas por gateways seguros)</li>
                <li>Histórico de pagamentos</li>
                <li>Dados de faturamento</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-2">
                <strong>Nota:</strong> Não armazenamos dados de cartão de crédito. Estes são processados 
                diretamente por nossos parceiros de pagamento (Stripe, Mercado Pago) em conformidade 
                com o padrão PCI-DSS.
              </p>

              <h3 className="text-lg font-semibold mt-4">3.5 Dados Profissionais (Instrutores)</h3>
              <ul>
                <li>Credencial do DETRAN</li>
                <li>Dados do veículo (modelo, placa, ano, tipo de transmissão)</li>
                <li>Status de MEI/Autônomo</li>
                <li>CNPJ MEI (quando aplicável)</li>
                <li>Raio de atendimento</li>
                <li>Preço por hora</li>
              </ul>

              <h3 className="text-lg font-semibold mt-4">3.6 Dados Empresariais (Autoescolas)</h3>
              <ul>
                <li>Razão social e nome fantasia</li>
                <li>CNPJ</li>
                <li>Credencial do DETRAN</li>
                <li>Endereço comercial</li>
              </ul>

              <h3 className="text-lg font-semibold mt-4">3.7 Dados de Uso</h3>
              <ul>
                <li>Histórico de aulas agendadas e realizadas</li>
                <li>Avaliações e comentários</li>
                <li>Progresso no curso teórico EAD</li>
                <li>Resultados de simulados</li>
                <li>Logs de acesso à plataforma</li>
              </ul>
            </section>

            {/* 4. Finalidades */}
            <section className="mt-8">
              <h2 className="flex items-center gap-2 text-xl font-bold">
                <FileText className="w-5 h-5 text-primary" />
                4. Finalidades do Tratamento
              </h2>
              <p>Utilizamos seus dados pessoais para as seguintes finalidades:</p>
              <ul>
                <li><strong>Cadastro e autenticação:</strong> criar e gerenciar sua conta na plataforma</li>
                <li><strong>Agendamento de aulas:</strong> permitir o agendamento e gestão de aulas práticas de direção</li>
                <li><strong>Matching aluno-instrutor:</strong> conectar alunos a instrutores credenciados compatíveis</li>
                <li><strong>Processamento de pagamentos:</strong> processar transações e emitir recibos</li>
                <li><strong>Rastreamento em tempo real:</strong> permitir que alunos acompanhem a chegada do instrutor</li>
                <li><strong>Curso teórico EAD:</strong> fornecer conteúdo educacional e acompanhar progresso</li>
                <li><strong>Comunicação:</strong> enviar notificações sobre aulas, pagamentos e atualizações</li>
                <li><strong>Conformidade regulatória:</strong> atender às exigências da Resolução CONTRAN 1.020/2025 e legislação de trânsito</li>
                <li><strong>Melhoria dos serviços:</strong> analisar uso da plataforma para aprimorar a experiência</li>
                <li><strong>Segurança:</strong> prevenir fraudes e garantir a integridade da plataforma</li>
              </ul>
            </section>

            {/* 5. Base Legal */}
            <section className="mt-8">
              <h2 className="flex items-center gap-2 text-xl font-bold">
                <FileText className="w-5 h-5 text-primary" />
                5. Base Legal (LGPD - Art. 7º)
              </h2>
              <p>
                O tratamento dos seus dados pessoais está fundamentado nas seguintes bases legais 
                previstas na Lei Geral de Proteção de Dados (Lei nº 13.709/2018):
              </p>
              <ul>
                <li>
                  <strong>Execução de contrato (Art. 7º, V):</strong> tratamento necessário para a 
                  prestação dos serviços contratados, como agendamento de aulas e processamento de pagamentos
                </li>
                <li>
                  <strong>Consentimento (Art. 7º, I):</strong> para finalidades específicas como 
                  coleta de localização em tempo real e envio de comunicações promocionais
                </li>
                <li>
                  <strong>Cumprimento de obrigação legal (Art. 7º, II):</strong> conformidade com 
                  Resolução CONTRAN 1.020/2025, Código de Trânsito Brasileiro e regulamentações do DETRAN
                </li>
                <li>
                  <strong>Legítimo interesse (Art. 7º, IX):</strong> melhorias na plataforma, 
                  prevenção a fraudes e segurança dos usuários
                </li>
              </ul>
            </section>

            {/* 6. Compartilhamento */}
            <section className="mt-8">
              <h2 className="flex items-center gap-2 text-xl font-bold">
                <Users className="w-5 h-5 text-primary" />
                6. Compartilhamento de Dados
              </h2>
              <p>Seus dados podem ser compartilhados com:</p>
              
              <h3 className="text-lg font-semibold mt-4">6.1 Usuários da Plataforma</h3>
              <ul>
                <li><strong>Instrutores:</strong> recebem dados necessários do aluno para realização da aula 
                  (nome, telefone, localização do ponto de encontro)</li>
                <li><strong>Alunos:</strong> recebem dados do instrutor (nome, foto, avaliação, veículo, localização em tempo real)</li>
                <li><strong>Autoescolas:</strong> têm acesso aos dados de instrutores e alunos vinculados para gestão</li>
              </ul>

              <h3 className="text-lg font-semibold mt-4">6.2 Parceiros de Pagamento</h3>
              <ul>
                <li><strong>Stripe:</strong> processamento de pagamentos com cartão</li>
                <li><strong>Mercado Pago:</strong> processamento de pagamentos</li>
                <li><strong>Instituições financeiras:</strong> para transações Pix</li>
              </ul>

              <h3 className="text-lg font-semibold mt-4">6.3 Provedores de Infraestrutura</h3>
              <ul>
                <li>Serviços de hospedagem e banco de dados em nuvem</li>
                <li>Serviços de mapas e geolocalização</li>
                <li>Serviços de envio de notificações</li>
              </ul>

              <h3 className="text-lg font-semibold mt-4">6.4 Autoridades</h3>
              <ul>
                <li>Órgãos de trânsito (DETRAN, CONTRAN) quando exigido por regulamentação</li>
                <li>Autoridades judiciais mediante ordem judicial</li>
                <li>Autoridade Nacional de Proteção de Dados (ANPD) quando aplicável</li>
              </ul>
            </section>

            {/* 7. Direitos do Titular */}
            <section className="mt-8">
              <h2 className="flex items-center gap-2 text-xl font-bold">
                <Shield className="w-5 h-5 text-primary" />
                7. Seus Direitos (LGPD - Art. 18)
              </h2>
              <p>Como titular dos dados, você tem os seguintes direitos:</p>
              <ul>
                <li><strong>Confirmação e acesso:</strong> confirmar a existência de tratamento e acessar seus dados</li>
                <li><strong>Correção:</strong> solicitar a correção de dados incompletos, inexatos ou desatualizados</li>
                <li><strong>Anonimização, bloqueio ou eliminação:</strong> de dados desnecessários, excessivos ou tratados em desconformidade</li>
                <li><strong>Portabilidade:</strong> solicitar a portabilidade dos dados a outro fornecedor de serviço</li>
                <li><strong>Eliminação:</strong> solicitar a exclusão dos dados tratados com base no consentimento</li>
                <li><strong>Informação sobre compartilhamento:</strong> saber com quais entidades seus dados foram compartilhados</li>
                <li><strong>Revogação do consentimento:</strong> revogar o consentimento a qualquer momento</li>
                <li><strong>Oposição:</strong> opor-se ao tratamento realizado com base em outras hipóteses legais, em caso de descumprimento da LGPD</li>
              </ul>
              
              <div className="bg-primary/10 p-4 rounded-lg mt-4 border border-primary/20">
                <p className="font-semibold mb-2">Como exercer seus direitos:</p>
                <p>
                  Envie um e-mail para <a href="mailto:360cnh@gmail.com" className="text-primary hover:underline font-semibold">360cnh@gmail.com</a> com 
                  o assunto "Solicitação de Direitos LGPD" e descreva sua solicitação. 
                  Responderemos em até 15 dias úteis.
                </p>
              </div>
            </section>

            {/* 8. Segurança */}
            <section className="mt-8">
              <h2 className="flex items-center gap-2 text-xl font-bold">
                <Lock className="w-5 h-5 text-primary" />
                8. Segurança dos Dados
              </h2>
              <p>
                Adotamos medidas técnicas e organizacionais para proteger seus dados pessoais 
                contra acessos não autorizados, destruição, perda, alteração ou divulgação:
              </p>
              <ul>
                <li><strong>Criptografia HTTPS:</strong> todas as comunicações são criptografadas</li>
                <li><strong>Row Level Security (RLS):</strong> controle de acesso granular ao banco de dados</li>
                <li><strong>Autenticação JWT:</strong> tokens seguros para autenticação de usuários</li>
                <li><strong>Controle de acesso baseado em roles:</strong> diferentes níveis de permissão para diferentes tipos de usuários</li>
                <li><strong>Monitoramento contínuo:</strong> vigilância de atividades suspeitas</li>
                <li><strong>Backups regulares:</strong> cópias de segurança dos dados</li>
                <li><strong>Conformidade PCI-DSS:</strong> parceiros de pagamento certificados</li>
              </ul>
            </section>

            {/* 9. Retenção */}
            <section className="mt-8">
              <h2 className="flex items-center gap-2 text-xl font-bold">
                <Clock className="w-5 h-5 text-primary" />
                9. Retenção de Dados
              </h2>
              <p>Mantemos seus dados pessoais pelo tempo necessário para:</p>
              <ul>
                <li><strong>Durante a vigência do contrato:</strong> enquanto você mantiver conta ativa na plataforma</li>
                <li><strong>Registros de aulas práticas:</strong> conforme regulamentação do DETRAN e CONTRAN 
                  (mínimo 5 anos após a conclusão do processo de habilitação)</li>
                <li><strong>Dados fiscais e financeiros:</strong> 5 anos para cumprimento de obrigações tributárias</li>
                <li><strong>Registros de consentimento:</strong> enquanto necessário para comprovar conformidade legal</li>
                <li><strong>Após exclusão da conta:</strong> dados podem ser anonimizados para fins estatísticos</li>
              </ul>
            </section>

            {/* 10. DPO */}
            <section className="mt-8">
              <h2 className="flex items-center gap-2 text-xl font-bold">
                <Shield className="w-5 h-5 text-primary" />
                10. Encarregado de Proteção de Dados (DPO)
              </h2>
              <p>
                O Encarregado de Proteção de Dados é o responsável por receber reclamações e 
                comunicações dos titulares, prestar esclarecimentos e adotar providências.
              </p>
              <div className="bg-muted/50 p-4 rounded-lg mt-4">
                <p className="mb-2"><strong>Contato do DPO:</strong></p>
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <a href="mailto:360cnh@gmail.com" className="text-primary hover:underline">360cnh@gmail.com</a>
                </p>
              </div>
            </section>

            {/* 11. Cookies */}
            <section className="mt-8">
              <h2 className="flex items-center gap-2 text-xl font-bold">
                <Database className="w-5 h-5 text-primary" />
                11. Cookies e Tecnologias Similares
              </h2>
              <p>Utilizamos cookies e tecnologias similares para:</p>
              <ul>
                <li><strong>Cookies essenciais:</strong> necessários para funcionamento básico da plataforma</li>
                <li><strong>Cookies de autenticação:</strong> manter você logado durante a sessão</li>
                <li><strong>Cookies de preferências:</strong> lembrar suas configurações (tema, idioma)</li>
                <li><strong>Local Storage:</strong> armazenar dados da sessão localmente</li>
              </ul>
              <p className="mt-2">
                Você pode gerenciar cookies através das configurações do seu navegador.
              </p>
            </section>

            {/* 12. Alterações */}
            <section className="mt-8">
              <h2 className="flex items-center gap-2 text-xl font-bold">
                <AlertCircle className="w-5 h-5 text-primary" />
                12. Alterações nesta Política
              </h2>
              <p>
                Podemos atualizar esta Política de Privacidade periodicamente. Quando fizermos 
                alterações significativas, notificaremos você por e-mail ou através de um aviso 
                destacado na plataforma.
              </p>
              <p>
                Recomendamos que você revise esta página regularmente para estar ciente de 
                quaisquer mudanças. O uso continuado da plataforma após as alterações constitui 
                aceite da nova política.
              </p>
            </section>

            {/* 13. Contato */}
            <section className="mt-8">
              <h2 className="flex items-center gap-2 text-xl font-bold">
                <Mail className="w-5 h-5 text-primary" />
                13. Contato
              </h2>
              <p>
                Para dúvidas, sugestões ou solicitações relacionadas a esta Política de 
                Privacidade ou ao tratamento de seus dados pessoais, entre em contato:
              </p>
              <div className="bg-muted/50 p-4 rounded-lg mt-4">
                <p className="mb-2"><strong>CNH 360</strong></p>
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <a href="mailto:360cnh@gmail.com" className="text-primary hover:underline">360cnh@gmail.com</a>
                </p>
              </div>
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
