import { useNavigate } from "react-router-dom";
import { ArrowLeft, PartyPopper } from "lucide-react";
import { BottomNav } from "@/components/layout/BottomNav";
import { CertificadoCursoTeorico } from "@/components/certificado/CertificadoCursoTeorico";
import { useCursoTeorico } from "@/hooks/useCursoTeorico";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function CertificadoEAD() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { progressoGeral, loading: cursoLoading } = useCursoTeorico();
  const [nomeAluno, setNomeAluno] = useState<string>("");
  const [dataConclusao, setDataConclusao] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDados() {
      if (!user) return;

      try {
        // Buscar nome do aluno
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();

        if (profile?.full_name) {
          setNomeAluno(profile.full_name);
        }

        // Buscar data de conclusão do curso teórico
        const { data: aluno } = await supabase
          .from("alunos")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (aluno) {
          const { data: progresso } = await supabase
            .from("progresso_renach")
            .select("curso_teorico_conclusao")
            .eq("aluno_id", aluno.id)
            .single();

          if (progresso?.curso_teorico_conclusao) {
            setDataConclusao(new Date(progresso.curso_teorico_conclusao));
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDados();
  }, [user]);

  const isLoading = loading || cursoLoading;
  const cursoCompleto = progressoGeral === 100;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 pt-4 pb-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-foreground">Certificado de Conclusão</h1>
              <p className="text-sm text-muted-foreground">Curso Teórico EAD</p>
            </div>
          </div>
        </div>
      </header>

      <div className="px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-96 w-full rounded-3xl" />
            </div>
          ) : cursoCompleto ? (
            <>
              {/* Mensagem de parabéns */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                  <PartyPopper className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Parabéns!</h2>
                <p className="text-muted-foreground">
                  Você concluiu o Curso Teórico EAD com sucesso!
                </p>
              </div>

              {/* Certificado */}
              <CertificadoCursoTeorico
                nomeAluno={nomeAluno || "Aluno"}
                dataConlusao={dataConclusao}
                horasCompletadas={45}
              />
            </>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
                <ArrowLeft className="w-10 h-10 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">
                Curso ainda não concluído
              </h2>
              <p className="text-muted-foreground mb-6">
                Complete todas as aulas e quizzes para obter seu certificado.
              </p>
              <p className="text-3xl font-bold text-primary mb-6">{progressoGeral}% concluído</p>
              <Button onClick={() => navigate("/aluno/curso-teorico")}>
                Continuar Curso
              </Button>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
