import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Pages
import Index from "./pages/Index";
import SelecionarTipo from "./pages/SelecionarTipo";
import NotFound from "./pages/NotFound";

// Onboarding
import AlunoOnboarding from "./pages/onboarding/AlunoOnboarding";
import InstrutorOnboarding from "./pages/onboarding/InstrutorOnboarding";

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
            <Route path="/selecionar-tipo" element={<SelecionarTipo />} />

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

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
