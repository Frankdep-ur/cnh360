import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { queryClient } from "@/lib/queryClient";
import { PageSkeleton } from "@/components/skeletons/PageSkeleton";

// Critical pages - load immediately
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Lazy loaded pages - Onboarding
const AlunoOnboarding = lazy(() => import("./pages/onboarding/AlunoOnboarding"));
const InstrutorOnboarding = lazy(() => import("./pages/onboarding/InstrutorOnboarding"));
const AutoescolaOnboarding = lazy(() => import("./pages/onboarding/AutoescolaOnboarding"));

// Lazy loaded pages - Aluno
const AlunoDashboard = lazy(() => import("./pages/aluno/AlunoDashboard"));
const AlunoPerfil = lazy(() => import("./pages/aluno/AlunoPerfil"));
const BuscarInstrutores = lazy(() => import("./pages/aluno/BuscarInstrutores"));
const InstrutorPerfilView = lazy(() => import("./pages/aluno/InstrutorPerfil"));
const AgendarAula = lazy(() => import("./pages/aluno/AgendarAula"));
const AulaConfirmada = lazy(() => import("./pages/aluno/AulaConfirmada"));
const AulaConfirmadaById = lazy(() => import("./pages/aluno/AulaConfirmadaById"));
const AulaSolicitada = lazy(() => import("./pages/aluno/AulaSolicitada"));
const CursoTeoricoEAD = lazy(() => import("./pages/aluno/CursoTeoricoEAD"));
const ModuloDetalhes = lazy(() => import("./pages/aluno/ModuloDetalhes"));
const AulaConteudo = lazy(() => import("./pages/aluno/AulaConteudo"));
const ExamePratico = lazy(() => import("./pages/aluno/ExamePratico"));
const ValidacaoAula = lazy(() => import("./pages/aluno/ValidacaoAula"));
const SimuladoTeorico = lazy(() => import("./pages/aluno/SimuladoTeorico"));
const SimuladoMecanica = lazy(() => import("./pages/aluno/SimuladoMecanica"));
const EnviarCertificado = lazy(() => import("./pages/aluno/EnviarCertificado"));

const AlunoAgenda = lazy(() => import("./pages/aluno/AlunoAgenda"));
const AlunoChat = lazy(() => import("./pages/aluno/AlunoChat"));
const RastrearInstrutor = lazy(() => import("./pages/aluno/RastrearInstrutor"));

// Lazy loaded pages - Instrutor
const InstrutorDashboard = lazy(() => import("./pages/instrutor/InstrutorDashboard"));
const InstrutorPerfil = lazy(() => import("./pages/instrutor/InstrutorPerfil"));
const InstrutorGanhos = lazy(() => import("./pages/instrutor/InstrutorGanhos"));
const InstrutorAgenda = lazy(() => import("./pages/instrutor/InstrutorAgenda"));
const InstrutorAulas = lazy(() => import("./pages/instrutor/InstrutorAulas"));
const InstrutorChat = lazy(() => import("./pages/instrutor/InstrutorChat"));
const ValidarAulaInstrutor = lazy(() => import("./pages/instrutor/ValidarAulaInstrutor"));
const InstrutorACaminho = lazy(() => import("./pages/instrutor/InstrutorACaminho"));

// Lazy loaded pages - Autoescola
const AutoescolaDashboard = lazy(() => import("./pages/autoescola/AutoescolaDashboard"));
const AutoescolaLeads = lazy(() => import("./pages/autoescola/AutoescolaLeads"));
const AutoescolaTurmas = lazy(() => import("./pages/autoescola/AutoescolaTurmas"));
const AutoescolaMEI = lazy(() => import("./pages/autoescola/AutoescolaMEI"));
const AutoescolaAgenda = lazy(() => import("./pages/autoescola/AutoescolaAgenda"));
const AutoescolaFinanceiro = lazy(() => import("./pages/autoescola/AutoescolaFinanceiro"));
const AutoescolaContratos = lazy(() => import("./pages/autoescola/AutoescolaContratos"));
const AutoescolaAvaliacoes = lazy(() => import("./pages/autoescola/AutoescolaAvaliacoes"));
const AutoescolaComunicacao = lazy(() => import("./pages/autoescola/AutoescolaComunicacao"));
const AutoescolaProvas = lazy(() => import("./pages/autoescola/AutoescolaProvas"));
const AutoescolaCRM = lazy(() => import("./pages/autoescola/AutoescolaCRM"));
const AutoescolaPerfil = lazy(() => import("./pages/autoescola/AutoescolaPerfil"));
const AutoescolaSimuladosRelatorio = lazy(() => import("./pages/autoescola/AutoescolaSimuladosRelatorio"));

// Lazy loaded pages - Other
const RecuperarSenha = lazy(() => import("./pages/RecuperarSenha"));
const RedefinirSenha = lazy(() => import("./pages/RedefinirSenha"));
const PoliticaPrivacidade = lazy(() => import("./pages/PoliticaPrivacidade"));
const TermosUso = lazy(() => import("./pages/TermosUso"));
const Status = lazy(() => import("./pages/Status"));

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<PageSkeleton />}>
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
              <Route path="/status" element={<Status />} />

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
              <Route path="/aluno/simulado-mecanica" element={
                <ProtectedRoute>
                  <SimuladoMecanica />
                </ProtectedRoute>
              } />
              <Route path="/aluno/enviar-certificado" element={
                <ProtectedRoute>
                  <EnviarCertificado />
                </ProtectedRoute>
              } />
              <Route path="/aluno/rastrear/:aulaId" element={
                <ProtectedRoute>
                  <RastrearInstrutor />
                </ProtectedRoute>
              } />
              <Route path="/aluno/agenda" element={
                <ProtectedRoute>
                  <AlunoAgenda />
                </ProtectedRoute>
              } />
              <Route path="/aluno/chat" element={
                <ProtectedRoute>
                  <AlunoChat />
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
              <Route path="/instrutor/aulas" element={
                <ProtectedRoute>
                  <InstrutorAulas />
                </ProtectedRoute>
              } />
              <Route path="/instrutor/chat" element={
                <ProtectedRoute>
                  <InstrutorChat />
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
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
