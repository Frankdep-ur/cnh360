import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

// Onboarding
import AlunoOnboarding from "./pages/onboarding/AlunoOnboarding";
import InstrutorOnboarding from "./pages/onboarding/InstrutorOnboarding";

// Aluno Pages
import AlunoDashboard from "./pages/aluno/AlunoDashboard";
import BuscarInstrutores from "./pages/aluno/BuscarInstrutores";
import InstrutorPerfil from "./pages/aluno/InstrutorPerfil";
import AgendarAula from "./pages/aluno/AgendarAula";
import AulaConfirmada from "./pages/aluno/AulaConfirmada";

// Instrutor Pages
import InstrutorDashboard from "./pages/instrutor/InstrutorDashboard";
import InstrutorGanhos from "./pages/instrutor/InstrutorGanhos";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Landing */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />

          {/* Onboarding */}
          <Route path="/onboarding/aluno" element={<AlunoOnboarding />} />
          <Route path="/onboarding/instrutor" element={<InstrutorOnboarding />} />

          {/* Aluno */}
          <Route path="/aluno" element={<AlunoDashboard />} />
          <Route path="/aluno/buscar" element={<BuscarInstrutores />} />
          <Route path="/aluno/instrutor/:id" element={<InstrutorPerfil />} />
          <Route path="/aluno/agendar/:id" element={<AgendarAula />} />
          <Route path="/aluno/aula-confirmada" element={<AulaConfirmada />} />

          {/* Instrutor */}
          <Route path="/instrutor" element={<InstrutorDashboard />} />
          <Route path="/instrutor/ganhos" element={<InstrutorGanhos />} />

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
