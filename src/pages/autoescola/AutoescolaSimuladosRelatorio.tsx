import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown,
  Users,
  Target,
  Award,
  AlertTriangle,
  BookOpen,
  BarChart3,
  ShieldCheck,
  RefreshCw
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AutoescolaBottomNav } from "@/components/layout/AutoescolaBottomNav";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface CategoriaDesempenho {
  categoria: string;
  acertos: number;
  total: number;
  percentual: number;
}

interface AlunoDesempenho {
  id: string;
  nome: string;
  avatar: string | null;
  totalSimulados: number;
  ultimaNota: number;
  aprovacoes: number;
  categoriasProblema: string[];
}

export default function AutoescolaSimuladosRelatorio() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSimulados: 0,
    taxaAprovacao: 0,
    mediaNotas: 0,
    alunosAtivos: 0,
    tendencia: 'up' as 'up' | 'down' | 'stable'
  });
  const [categoriaDesempenho, setCategoriaDesempenho] = useState<CategoriaDesempenho[]>([]);
  const [alunosProblema, setAlunosProblema] = useState<AlunoDesempenho[]>([]);

  useEffect(() => {
    // Simular carregamento de dados (em produção, buscar do banco)
    const loadData = async () => {
      setLoading(true);
      
      // Mock data - em produção seria buscado do Supabase
      // Nota: Para funcionalidade completa, seria necessário criar RLS policies
      // para autoescolas acessarem dados de simulados dos alunos vinculados
      
      setTimeout(() => {
        setStats({
          totalSimulados: 147,
          taxaAprovacao: 68,
          mediaNotas: 72,
          alunosAtivos: 23,
          tendencia: 'up'
        });

        setCategoriaDesempenho([
          { categoria: "Legislação de Trânsito", acertos: 234, total: 320, percentual: 73 },
          { categoria: "Direção Defensiva", acertos: 198, total: 280, percentual: 71 },
          { categoria: "Primeiros Socorros", acertos: 89, total: 140, percentual: 64 },
          { categoria: "Sinalização de Trânsito", acertos: 156, total: 210, percentual: 74 },
          { categoria: "Meio Ambiente e Cidadania", acertos: 112, total: 160, percentual: 70 }
        ]);

        setAlunosProblema([
          { 
            id: "1", 
            nome: "João Silva", 
            avatar: null, 
            totalSimulados: 5, 
            ultimaNota: 53, 
            aprovacoes: 0,
            categoriasProblema: ["Primeiros Socorros", "Legislação"] 
          },
          { 
            id: "2", 
            nome: "Maria Santos", 
            avatar: null, 
            totalSimulados: 3, 
            ultimaNota: 60, 
            aprovacoes: 0,
            categoriasProblema: ["Direção Defensiva"] 
          },
          { 
            id: "3", 
            nome: "Pedro Costa", 
            avatar: null, 
            totalSimulados: 4, 
            ultimaNota: 63, 
            aprovacoes: 1,
            categoriasProblema: ["Sinalização"] 
          }
        ]);

        setLoading(false);
      }, 1000);
    };

    loadData();
  }, [user]);

  const getCorCategoria = (percentual: number) => {
    if (percentual >= 70) return "text-primary";
    if (percentual >= 50) return "text-amber-500";
    return "text-destructive";
  };

  const getBgCategoria = (percentual: number) => {
    if (percentual >= 70) return "bg-primary";
    if (percentual >= 50) return "bg-amber-500";
    return "bg-destructive";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando relatórios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 pt-6 pb-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-foreground">Relatórios de Simulados</h1>
              <p className="text-sm text-muted-foreground">Desempenho dos alunos</p>
            </div>
          </div>
        </div>
      </header>

      <div className="px-6 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Selo de Confiança */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-full">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-sm font-medium">Questões alinhadas ao CTB/DETRAN</span>
            </div>
          </div>

          {/* Cards de Estatísticas Principais */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Simulados</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalSimulados}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Taxa Aprovação</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold text-foreground">{stats.taxaAprovacao}%</p>
                    {stats.tendencia === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-primary" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-destructive" />
                    )}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Target className="w-5 h-5 text-primary" />
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Média Notas</p>
                  <p className="text-2xl font-bold text-foreground">{stats.mediaNotas}%</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-secondary" />
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Alunos Ativos</p>
                  <p className="text-2xl font-bold text-foreground">{stats.alunosAtivos}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-amber-500" />
                </div>
              </div>
            </Card>
          </div>

          {/* Desempenho por Categoria */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-foreground">Desempenho por Categoria</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Identifique as áreas que precisam de mais atenção no treinamento
            </p>

            <div className="space-y-4">
              {categoriaDesempenho.map((cat) => (
                <div key={cat.categoria}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-foreground">{cat.categoria}</span>
                    <span className={cn("text-sm font-medium", getCorCategoria(cat.percentual))}>
                      {cat.percentual}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full rounded-full transition-all", getBgCategoria(cat.percentual))}
                      style={{ width: `${cat.percentual}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {cat.acertos} acertos de {cat.total} questões
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">
                <strong>Dica:</strong> Categorias abaixo de 70% indicam necessidade de reforço. 
                Considere aulas extras ou materiais complementares.
              </p>
            </div>
          </Card>

          {/* Alunos que Precisam de Atenção */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h2 className="font-semibold text-foreground">Alunos que Precisam de Atenção</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Alunos com dificuldades recorrentes nos simulados
            </p>

            {alunosProblema.length === 0 ? (
              <div className="text-center py-8">
                <Award className="w-12 h-12 text-primary mx-auto mb-2" />
                <p className="text-muted-foreground">Todos os alunos estão indo bem!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {alunosProblema.map((aluno) => (
                  <div 
                    key={aluno.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        {aluno.avatar ? (
                          <img src={aluno.avatar} alt={aluno.nome} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <span className="text-sm font-medium text-muted-foreground">
                            {aluno.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">{aluno.nome}</p>
                        <p className="text-xs text-muted-foreground">
                          {aluno.totalSimulados} simulados • {aluno.aprovacoes} aprovações
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn(
                        "font-bold text-lg",
                        aluno.ultimaNota >= 70 ? "text-primary" : "text-destructive"
                      )}>
                        {aluno.ultimaNota}%
                      </p>
                      <p className="text-xs text-muted-foreground">última nota</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
              <p className="text-xs text-amber-700 dark:text-amber-400">
                <strong>Ação sugerida:</strong> Entre em contato com estes alunos para oferecer 
                suporte adicional e entender suas dificuldades específicas.
              </p>
            </div>
          </Card>

          {/* Questões Mais Erradas */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-destructive" />
              <h2 className="font-semibold text-foreground">Questões Mais Erradas</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Tópicos que precisam de reforço nas aulas teóricas
            </p>

            <div className="space-y-3">
              <div className="p-3 bg-destructive/5 rounded-lg border-l-4 border-destructive">
                <p className="text-sm font-medium text-foreground">Primeiros Socorros - Posição de vítima</p>
                <p className="text-xs text-muted-foreground mt-1">
                  47% de erro • Baseado em 85 respostas
                </p>
                <p className="text-xs text-primary mt-1">📖 Protocolo SAMU</p>
              </div>

              <div className="p-3 bg-amber-500/5 rounded-lg border-l-4 border-amber-500">
                <p className="text-sm font-medium text-foreground">Legislação - Pontuação CNH</p>
                <p className="text-xs text-muted-foreground mt-1">
                  38% de erro • Baseado em 92 respostas
                </p>
                <p className="text-xs text-primary mt-1">📖 Art. 259 do CTB</p>
              </div>

              <div className="p-3 bg-amber-500/5 rounded-lg border-l-4 border-amber-500">
                <p className="text-sm font-medium text-foreground">Direção Defensiva - Aquaplanagem</p>
                <p className="text-xs text-muted-foreground mt-1">
                  35% de erro • Baseado em 78 respostas
                </p>
                <p className="text-xs text-primary mt-1">📖 Manual DENATRAN</p>
              </div>
            </div>
          </Card>

          {/* Nota sobre dados */}
          <div className="text-center text-xs text-muted-foreground py-4">
            <p>Dados atualizados em tempo real conforme alunos realizam simulados</p>
          </div>

        </div>
      </div>

      <AutoescolaBottomNav />
    </div>
  );
}
