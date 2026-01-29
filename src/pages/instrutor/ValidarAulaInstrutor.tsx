import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";

/**
 * PÁGINA DEPRECADA
 * 
 * Esta página foi substituída por AulaEmAndamento.tsx que implementa
 * o fluxo real de validação com dados do banco de dados.
 * 
 * Redireciona automaticamente para a página correta.
 */
export default function ValidarAulaInstrutor() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const aulaId = searchParams.get("aulaId");

  useEffect(() => {
    if (aulaId) {
      // Redireciona para a página correta com dados reais
      navigate(`/instrutor/aula/${aulaId}`, { replace: true });
    } else {
      // Sem ID de aula, volta para o dashboard
      navigate("/instrutor", { replace: true });
    }
  }, [aulaId, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Redirecionando...</p>
      </div>
    </div>
  );
}
