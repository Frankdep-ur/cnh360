import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ModoTransicaoProvider } from "@/contexts/ModoTransicaoContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

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
import CursoTeoricoEAD from "./pages/aluno/CursoTeoricoEAD";
import ExamePratico from "./pages/aluno/ExamePratico";
import ValidacaoAula from "./pages/aluno/ValidacaoAula";
import SimuladoTeorico from "./pages/aluno/SimuladoTeorico";

// Instrutor Pages
import InstrutorDashboard from "./pages/instrutor/InstrutorDashboard";
import InstrutorPerfil from "./pages/instrutor/InstrutorPerfil";
import InstrutorGanhos from "./pages/instrutor/InstrutorGanhos";
import InstrutorAgenda from "./pages/instrutor/InstrutorAgenda";
import ValidarAulaInstrutor from "./pages/instrutor/ValidarAulaInstrutor";

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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ModoTransicaoProvider>
            <Routes>
            {/* Public */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/login" element={<Auth />} />

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
            <Route path="/aluno/curso-teorico" element={
              <ProtectedRoute>
                <CursoTeoricoEAD />
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

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </ModoTransicaoProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
