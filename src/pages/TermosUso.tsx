import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function TermosUso() {
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
          <h1 className="text-xl font-bold text-foreground">Termos de Uso</h1>
        </div>
      </header>

      <main className="px-6 py-8">
        <div className="max-w-3xl mx-auto prose prose-slate dark:prose-invert">
          <p className="text-muted-foreground">
            <strong>Última atualização:</strong> Dezembro de 2024
          </p>

          <h2>1. Aceitação dos Termos</h2>
          <p>
            Ao acessar ou usar a plataforma CNH 360, você concorda com estes Termos de Uso. 
            Se não concordar com qualquer parte, não utilize nossos serviços.
          </p>

          <h2>2. Descrição do Serviço</h2>
          <p>
            A CNH 360 é uma plataforma que conecta alunos de habilitação veicular a instrutores 
            credenciados e autoescolas, em conformidade com a Resolução CONTRAN 1.020/2025, 
            facilitando o agendamento e gestão de aulas práticas.
          </p>

          <h2>3. Tipos de Usuários</h2>
          <ul>
            <li><strong>Alunos:</strong> pessoas em processo de obtenção ou renovação da CNH</li>
            <li><strong>Instrutores:</strong> profissionais credenciados pelo DETRAN para ministrar aulas práticas</li>
            <li><strong>Autoescolas:</strong> centros de formação de condutores credenciados</li>
          </ul>

          <h2>4. Cadastro e Responsabilidades</h2>
          <h3>4.1. Alunos</h3>
          <ul>
            <li>Fornecer informações verdadeiras e atualizadas</li>
            <li>Manter sigilo sobre suas credenciais de acesso</li>
            <li>Comparecer às aulas agendadas ou cancelar com antecedência</li>
          </ul>

          <h3>4.2. Instrutores</h3>
          <ul>
            <li>Manter credenciais do DETRAN válidas e atualizadas</li>
            <li>Possuir veículo em conformidade com as normas de trânsito</li>
            <li>Cumprir horários agendados</li>
            <li>Seguir as diretrizes do CONTRAN para aulas práticas</li>
          </ul>

          <h3>4.3. Autoescolas</h3>
          <ul>
            <li>Manter credenciamento válido junto ao DETRAN</li>
            <li>Garantir a qualidade dos instrutores vinculados</li>
            <li>Cumprir todas as normas regulatórias aplicáveis</li>
          </ul>

          <h2>5. Pagamentos</h2>
          <p>
            Os pagamentos são processados através de nossa plataforma. A CNH 360 cobra uma 
            taxa de serviço sobre cada transação. Os valores das aulas são definidos pelos 
            instrutores ou autoescolas.
          </p>

          <h2>6. Cancelamentos e Reembolsos</h2>
          <ul>
            <li>Cancelamentos com mais de 24h de antecedência: reembolso integral</li>
            <li>Cancelamentos com menos de 24h: pode haver taxa de cancelamento</li>
            <li>Não comparecimento: não há reembolso</li>
          </ul>

          <h2>7. Conformidade Regulatória</h2>
          <p>
            Nossa plataforma opera em conformidade com a Resolução CONTRAN 1.020/2025, que 
            estabelece as regras para formação de condutores. Todas as aulas devem seguir 
            as diretrizes estabelecidas pelo DETRAN de cada estado.
          </p>

          <h2>8. Limitação de Responsabilidade</h2>
          <p>
            A CNH 360 é uma plataforma de intermediação. Não nos responsabilizamos por:
          </p>
          <ul>
            <li>Qualidade das aulas ministradas por instrutores</li>
            <li>Aprovação ou reprovação em exames do DETRAN</li>
            <li>Acidentes ocorridos durante as aulas</li>
            <li>Problemas com veículos de instrutores</li>
          </ul>

          <h2>9. Propriedade Intelectual</h2>
          <p>
            Todo o conteúdo da plataforma CNH 360, incluindo marca, logo, design e código, 
            é de nossa propriedade ou licenciado para nós.
          </p>

          <h2>10. Alterações nos Termos</h2>
          <p>
            Podemos modificar estes termos a qualquer momento. Alterações significativas 
            serão comunicadas aos usuários.
          </p>

          <h2>11. Foro e Lei Aplicável</h2>
          <p>
            Estes termos são regidos pelas leis brasileiras. Fica eleito o foro da comarca 
            de Araçatuba/SP para dirimir quaisquer controvérsias.
          </p>

          <h2>12. Contato</h2>
          <p>
            Para dúvidas sobre estes termos: <strong>contato@cnh360.com</strong>
          </p>
        </div>
      </main>
    </div>
  );
}