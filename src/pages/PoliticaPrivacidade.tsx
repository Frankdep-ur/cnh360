import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PoliticaPrivacidade() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="px-6 pt-6 pb-4 safe-top border-b border-border">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-foreground">Política de Privacidade</h1>
        </div>
      </header>

      <main className="px-6 py-8">
        <div className="max-w-3xl mx-auto prose prose-slate dark:prose-invert">
          <p className="text-muted-foreground">
            <strong>Última atualização:</strong> Dezembro de 2024
          </p>

          <h2>1. Introdução</h2>
          <p>
            A CNH 360 ("nós", "nosso" ou "CNH 360") está comprometida com a proteção de seus 
            dados pessoais. Esta Política de Privacidade explica como coletamos, usamos, 
            compartilhamos e protegemos suas informações quando você utiliza nossa plataforma.
          </p>

          <h2>2. Dados que Coletamos</h2>
          <p>Coletamos os seguintes tipos de dados:</p>
          <ul>
            <li><strong>Dados de cadastro:</strong> nome completo, email, telefone, CPF</li>
            <li><strong>Dados profissionais (instrutores):</strong> número da CNH, credencial DETRAN, dados do veículo</li>
            <li><strong>Dados de localização:</strong> para agendamento e rastreamento de aulas</li>
            <li><strong>Dados de uso:</strong> como você interage com nossa plataforma</li>
          </ul>

          <h2>3. Finalidade do Tratamento</h2>
          <p>Utilizamos seus dados para:</p>
          <ul>
            <li>Permitir o agendamento e gestão de aulas práticas</li>
            <li>Conectar alunos a instrutores credenciados</li>
            <li>Processar pagamentos e emitir recibos</li>
            <li>Verificar credenciais de instrutores junto ao DETRAN</li>
            <li>Melhorar nossos serviços e experiência do usuário</li>
            <li>Cumprir obrigações legais e regulatórias</li>
          </ul>

          <h2>4. Compartilhamento de Dados</h2>
          <p>
            Seus dados podem ser compartilhados com:
          </p>
          <ul>
            <li><strong>Instrutores/Alunos:</strong> informações necessárias para aulas agendadas</li>
            <li><strong>Autoescolas:</strong> se vinculadas ao seu processo de habilitação</li>
            <li><strong>Processadores de pagamento:</strong> para transações financeiras</li>
            <li><strong>Autoridades:</strong> quando exigido por lei</li>
          </ul>

          <h2>5. Base Legal (LGPD)</h2>
          <p>
            O tratamento de seus dados pessoais está fundamentado nas seguintes bases legais 
            previstas na Lei Geral de Proteção de Dados (Lei nº 13.709/2018):
          </p>
          <ul>
            <li><strong>Execução de contrato:</strong> para prestação de nossos serviços</li>
            <li><strong>Consentimento:</strong> quando aplicável</li>
            <li><strong>Cumprimento de obrigação legal:</strong> conformidade com CONTRAN/DETRAN</li>
            <li><strong>Legítimo interesse:</strong> melhorias e segurança da plataforma</li>
          </ul>

          <h2>6. Seus Direitos</h2>
          <p>Você tem direito a:</p>
          <ul>
            <li>Acessar seus dados pessoais</li>
            <li>Corrigir dados incompletos ou incorretos</li>
            <li>Solicitar a exclusão de seus dados</li>
            <li>Revogar consentimento a qualquer momento</li>
            <li>Solicitar portabilidade de dados</li>
            <li>Obter informações sobre compartilhamento</li>
          </ul>

          <h2>7. Segurança dos Dados</h2>
          <p>
            Adotamos medidas técnicas e organizacionais para proteger seus dados, incluindo 
            criptografia, controle de acesso e monitoramento contínuo.
          </p>

          <h2>8. Retenção de Dados</h2>
          <p>
            Mantemos seus dados pelo tempo necessário para cumprir as finalidades descritas 
            nesta política ou conforme exigido por lei (especialmente registros de aulas 
            práticas conforme regulamentação do DETRAN).
          </p>

          <h2>9. Contato</h2>
          <p>
            Para exercer seus direitos ou esclarecer dúvidas sobre esta política, entre em 
            contato através do email: <strong>privacidade@cnh360.com</strong>
          </p>

          <h2>10. Alterações nesta Política</h2>
          <p>
            Podemos atualizar esta política periodicamente. Recomendamos que você revise 
            esta página regularmente.
          </p>
        </div>
      </main>
    </div>
  );
}