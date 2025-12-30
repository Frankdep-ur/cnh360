import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import RecuperarSenha from "./pages/RecuperarSenha";
import RedefinirSenha from "./pages/RedefinirSenha";
import PoliticaPrivacidade from "./pages/PoliticaPrivacidade";
import TermosUso from "./pages/TermosUso";

// Onboarding
import AlunoOnboarding from "./pages/onboarding/AlunoOnboarding";
import InstrutorOnboarding from "./pages/onboarding/InstrutorOnboarding";
import AutoescolaOnboarding from "./pages/onboarding/AutoescolaOnboarding";

// Aluno Pages
import AlunoDashboard from "./pages/aluno/AlunoDashboard";
import AlunoPerfil from "./pages/aluno/AlunoPerfil";
import BuscarInstrutores from "./pages/aluno/BuscarInstrutores";
import InstrutorPerfilView from "./pages/aluno/InstrutorPerfil";
import AgendarAula from "./pages/aluno/AgendarAula";
import AulaConfirmada from "./pages/aluno/AulaConfirmada";
import AulaConfirmadaById from "./pages/aluno/AulaConfirmadaById";
import AulaSolicitada from "./pages/aluno/AulaSolicitada";
import CursoTeoricoEAD from "./pages/aluno/CursoTeoricoEAD";
import ModuloDetalhes from "./pages/aluno/ModuloDetalhes";
import AulaConteudo from "./pages/aluno/AulaConteudo";
import ExamePratico from "./pages/aluno/ExamePratico";
import ValidacaoAula from "./pages/aluno/ValidacaoAula";
import SimuladoTeorico from "./pages/aluno/SimuladoTeorico";
import CertificadoEAD from "./pages/aluno/CertificadoEAD";

// Instrutor Pages
import InstrutorDashboard from "./pages/instrutor/InstrutorDashboard";
import InstrutorPerfil from "./pages/instrutor/InstrutorPerfil";
import InstrutorGanhos from "./pages/instrutor/InstrutorGanhos";
import InstrutorAgenda from "./pages/instrutor/InstrutorAgenda";
import ValidarAulaInstrutor from "./pages/instrutor/ValidarAulaInstrutor";
import InstrutorACaminho from "./pages/instrutor/InstrutorACaminho";

// Aluno tracking
import RastrearInstrutor from "./pages/aluno/RastrearInstrutor";

// Autoescola Pages
import AutoescolaDashboard from "./pages/autoescola/AutoescolaDashboard";
import AutoescolaLeads from "./pages/autoescola/AutoescolaLeads";
import AutoescolaTurmas from "./pages/autoescola/AutoescolaTurmas";
import AutoescolaMEI from "./pages/autoescola/AutoescolaMEI";
import AutoescolaAgenda from "./pages/autoescola/AutoescolaAgenda";
import AutoescolaFinanceiro from "./pages/autoescola/AutoescolaFinanceiro";
import AutoescolaContratos from "./pages/autoescola/AutoescolaContratos";
import AutoescolaAvaliacoes from "./pages/autoescola/AutoescolaAvaliacoes";
import AutoescolaComunicacao from "./pages/autoescola/AutoescolaComunicacao";
import AutoescolaProvas from "./pages/autoescola/AutoescolaProvas";
import AutoescolaCRM from "./pages/autoescola/AutoescolaCRM";
import AutoescolaPerfil from "./pages/autoescola/AutoescolaPerfil";
import AutoescolaSimuladosRelatorio from "./pages/autoescola/AutoescolaSimuladosRelatorio";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
            <Routes>
            {/* Public */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/entrar" element={<Auth />} />
            <Route path="/cadastro" element={<Auth />} />
            <Route path="/recuperar-senha" element={<RecuperarSenha />} />
            <Route path="/redefinir-senha" element={<RedefinirSenha />} />
            <Route path="/politica-privacidade" element={<PoliticaPrivacidade />} />
            <Route path="/politica-de-privacidade" element={<PoliticaPrivacidade />} />
            <Route path="/termos-uso" element={<TermosUso />} />
            <Route path="/termos-de-uso" element={<TermosUso />} />

            {/* Onboarding - Protected */}
            <Route path="/onboarding/aluno" element={
              <ProtectedRoute>
                <AlunoOnboarding />
              </ProtectedRoute>
            } />
            <Route path="/onboarding/instrutor" element={
              <ProtectedRoute>
                <InstrutorOnboarding />
              </ProtectedRoute>
            } />
            <Route path="/onboarding/autoescola" element={
              <ProtectedRoute>
                <AutoescolaOnboarding />
              </ProtectedRoute>
            } />

            {/* Aluno - Protected */}
            <Route path="/aluno" element={
              <ProtectedRoute>
                <AlunoDashboard />
              </ProtectedRoute>
            } />
            <Route path="/aluno/buscar" element={
              <ProtectedRoute>
                <BuscarInstrutores />
              </ProtectedRoute>
            } />
            <Route path="/aluno/instrutor/:id" element={
              <ProtectedRoute>
                <InstrutorPerfilView />
              </ProtectedRoute>
            } />
            <Route path="/aluno/perfil" element={
              <ProtectedRoute>
                <AlunoPerfil />
              </ProtectedRoute>
            } />
            <Route path="/aluno/agendar/:id" element={
              <ProtectedRoute>
                <AgendarAula />
              </ProtectedRoute>
            } />
            <Route path="/aluno/aula-confirmada" element={
              <ProtectedRoute>
                <AulaConfirmada />
              </ProtectedRoute>
            } />
            <Route path="/aluno/aula-confirmada/:aulaId" element={
              <ProtectedRoute>
                <AulaConfirmadaById />
              </ProtectedRoute>
            } />
            <Route path="/aluno/aula-solicitada/:aulaId" element={
              <ProtectedRoute>
                <AulaSolicitada />
              </ProtectedRoute>
            } />
            <Route path="/aluno/curso-teorico" element={
              <ProtectedRoute>
                <CursoTeoricoEAD />
              </ProtectedRoute>
            } />
            <Route path="/aluno/curso-teorico/modulo/:moduloId" element={
              <ProtectedRoute>
                <ModuloDetalhes />
              </ProtectedRoute>
            } />
            <Route path="/aluno/curso-teorico/aula/:aulaId" element={
              <ProtectedRoute>
                <AulaConteudo />
              </ProtectedRoute>
            } />
            <Route path="/aluno/exame-pratico" element={
              <ProtectedRoute>
                <ExamePratico />
              </ProtectedRoute>
            } />
            <Route path="/aluno/validacao-aula" element={
              <ProtectedRoute>
                <ValidacaoAula />
              </ProtectedRoute>
            } />
            <Route path="/aluno/simulado" element={
              <ProtectedRoute>
                <SimuladoTeorico />
              </ProtectedRoute>
            } />
            <Route path="/aluno/rastrear/:aulaId" element={
              <ProtectedRoute>
                <RastrearInstrutor />
              </ProtectedRoute>
            } />
            <Route path="/aluno/certificado-ead" element={
              <ProtectedRoute>
                <CertificadoEAD />
              </ProtectedRoute>
            } />

            {/* Instrutor - Protected */}
            <Route path="/instrutor" element={
              <ProtectedRoute>
                <InstrutorDashboard />
              </ProtectedRoute>
            } />
            <Route path="/instrutor/ganhos" element={
              <ProtectedRoute>
                <InstrutorGanhos />
              </ProtectedRoute>
            } />
            <Route path="/instrutor/agenda" element={
              <ProtectedRoute>
                <InstrutorAgenda />
              </ProtectedRoute>
            } />
            <Route path="/instrutor/validar-aula" element={
              <ProtectedRoute>
                <ValidarAulaInstrutor />
              </ProtectedRoute>
            } />
            <Route path="/instrutor/a-caminho/:aulaId" element={
              <ProtectedRoute>
                <InstrutorACaminho />
              </ProtectedRoute>
            } />
            <Route path="/instrutor/perfil" element={
              <ProtectedRoute>
                <InstrutorPerfil />
              </ProtectedRoute>
            } />

            {/* Autoescola - Protected */}
            <Route path="/autoescola" element={
              <ProtectedRoute>
                <AutoescolaDashboard />
              </ProtectedRoute>
            } />
            <Route path="/autoescola/leads" element={
              <ProtectedRoute>
                <AutoescolaLeads />
              </ProtectedRoute>
            } />
            <Route path="/autoescola/turmas" element={
              <ProtectedRoute>
                <AutoescolaTurmas />
              </ProtectedRoute>
            } />
            <Route path="/autoescola/mei" element={
              <ProtectedRoute>
                <AutoescolaMEI />
              </ProtectedRoute>
            } />
            <Route path="/autoescola/agenda" element={
              <ProtectedRoute>
                <AutoescolaAgenda />
              </ProtectedRoute>
            } />
            <Route path="/autoescola/financeiro" element={
              <ProtectedRoute>
                <AutoescolaFinanceiro />
              </ProtectedRoute>
            } />
            <Route path="/autoescola/contratos" element={
              <ProtectedRoute>
                <AutoescolaContratos />
              </ProtectedRoute>
            } />
            <Route path="/autoescola/avaliacoes" element={
              <ProtectedRoute>
                <AutoescolaAvaliacoes />
              </ProtectedRoute>
            } />
            <Route path="/autoescola/comunicacao" element={
              <ProtectedRoute>
                <AutoescolaComunicacao />
              </ProtectedRoute>
            } />
            <Route path="/autoescola/provas" element={
              <ProtectedRoute>
                <AutoescolaProvas />
              </ProtectedRoute>
            } />
            <Route path="/autoescola/crm" element={
              <ProtectedRoute>
                <AutoescolaCRM />
              </ProtectedRoute>
            } />
            <Route path="/autoescola/perfil" element={
              <ProtectedRoute>
                <AutoescolaPerfil />
              </ProtectedRoute>
            } />
            <Route path="/autoescola/simulados-relatorio" element={
              <ProtectedRoute>
                <AutoescolaSimuladosRelatorio />
              </ProtectedRoute>
            } />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
