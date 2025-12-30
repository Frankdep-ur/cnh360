import { useState, useEffect } from "react";
import { ComplianceBanner } from "@/components/layout/ComplianceBanner";
import { InstructorBottomNav } from "@/components/layout/InstructorBottomNav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Car,
  Navigation,
  Zap,
  Filter,
  MessageCircle,
  TrendingUp,
  BookOpen
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Aula {
  id: string;
  data_hora: string;
  duracao_minutos: number;
  status: string;
  valor: number;
  ponto_encontro: string | null;
  usa_carro_aluno: boolean | null;
  aluno_nome: string | null;
  aluno_foto: string | null;
}

type StatusFilter = 'todas' | 'pendente' | 'confirmada' | 'em_andamento' | 'concluida' | 'cancelada';

export default function InstrutorAulas() {
  const { user } = useAuth();
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<StatusFilter>('todas');

  useEffect(() => {
    if (!user) return;

    const fetchAulas = async () => {
      setLoading(true);
      
      // First get the instructor id
      const { data: instrutor } = await supabase
        .from('instrutores')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!instrutor) {
        setLoading(false);
        return;
      }

      // Then fetch aulas with aluno info via alunos_seguros view
      const { data: aulasData, error } = await supabase
        .from('aulas')
        .select(`
          id,
          data_hora,
          duracao_minutos,
          status,
          valor,
          ponto_encontro,
          usa_carro_aluno,
          aluno_id
        `)
        .eq('instrutor_id', instrutor.id)
        .order('data_hora', { ascending: false });

      if (error) {
        console.error('Error fetching aulas:', error);
        setLoading(false);
        return;
      }

      // Get aluno info for each aula
      const aulasWithAluno = await Promise.all(
        (aulasData || []).map(async (aula) => {
          const { data: alunoData } = await supabase
            .from('alunos_seguros')
            .select('full_name, avatar_url')
            .eq('id', aula.aluno_id)
            .single();

          return {
            ...aula,
            aluno_nome: alunoData?.full_name || 'Aluno',
            aluno_foto: alunoData?.avatar_url
          };
        })
      );

      setAulas(aulasWithAluno);
      setLoading(false);
    };

    fetchAulas();
  }, [user]);

  const aulasFiltradas = filtro === 'todas' 
    ? aulas 
    : aulas.filter(a => a.status === filtro);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "concluida":
        return (
          <Badge className="bg-primary/10 text-primary border-0">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Concluída
          </Badge>
        );
      case "confirmada":
        return (
          <Badge className="bg-secondary/10 text-secondary border-0">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Confirmada
          </Badge>
        );
      case "em_andamento":
        return (
          <Badge className="bg-blue-500/10 text-blue-600 border-0">
            <Zap className="w-3 h-3 mr-1" /> Em andamento
          </Badge>
        );
      case "pendente":
        return (
          <Badge className="bg-amber-500/10 text-amber-600 border-0">
            <AlertCircle className="w-3 h-3 mr-1" /> Pendente
          </Badge>
        );
      case "cancelada":
        return (
          <Badge className="bg-destructive/10 text-destructive border-0">
            <XCircle className="w-3 h-3 mr-1" /> Cancelada
          </Badge>
        );
      default:
        return null;
    }
  };

  const totalGanhos = aulas
    .filter(a => a.status === 'concluida')
    .reduce((acc, a) => acc + a.valor, 0);

  const totalAulas = aulas.filter(a => a.status === 'concluida').length;

  return (
    <div className="app-container pb-24">
      <ComplianceBanner />
      
      <div className="px-4 py-6 page-enter space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">Minhas Aulas</h1>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalAulas}</p>
                <p className="text-xs text-muted-foreground">Aulas concluídas</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">R${totalGanhos}</p>
                <p className="text-xs text-muted-foreground">Total ganho</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
          {(['todas', 'pendente', 'confirmada', 'em_andamento', 'concluida', 'cancelada'] as StatusFilter[]).map((status) => (
            <Button
              key={status}
              variant={filtro === status ? "default" : "outline"}
              size="sm"
              onClick={() => setFiltro(status)}
              className="shrink-0"
            >
              {status === 'todas' ? 'Todas' : 
               status === 'em_andamento' ? 'Em andamento' : 
               status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>

        {/* Lista de Aulas */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-4 shadow-card">
                <div className="flex items-start gap-3">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : aulasFiltradas.length === 0 ? (
          <Card className="p-8 shadow-card text-center">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-semibold text-foreground mb-1">Nenhuma aula encontrada</h3>
            <p className="text-sm text-muted-foreground">
              {filtro === 'todas' 
                ? 'Você ainda não tem aulas agendadas' 
                : `Nenhuma aula com status "${filtro}"`}
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {aulasFiltradas.map((aula) => (
              <Card key={aula.id} className="p-4 shadow-card">
                <div className="flex items-start gap-3">
                  <div className="relative">
                    {aula.aluno_foto ? (
                      <img 
                        src={aula.aluno_foto} 
                        alt={aula.aluno_nome || 'Aluno'}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-lg font-semibold text-muted-foreground">
                          {(aula.aluno_nome || 'A').charAt(0)}
                        </span>
                      </div>
                    )}
                    {aula.status === "concluida" && (
                      <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-0.5">
                        <CheckCircle2 className="w-4 h-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-foreground">{aula.aluno_nome}</h4>
                      {getStatusBadge(aula.status)}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {format(new Date(aula.data_hora), "dd/MM 'às' HH:mm", { locale: ptBR })}
                      </span>
                      <span className="font-semibold text-foreground">R${aula.valor}</span>
                    </div>
                    
                    {aula.ponto_encontro && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="truncate">{aula.ponto_encontro}</span>
                      </div>
                    )}

                    {aula.usa_carro_aluno && (
                      <Badge variant="outline" className="text-xs bg-secondary/10 text-secondary border-secondary/20 mb-2">
                        <Car className="w-3 h-3 mr-1" />
                        Carro do aluno (-20%)
                      </Badge>
                    )}
                    
                    {(aula.status === "confirmada" || aula.status === "pendente") && (
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Navigation className="w-4 h-4 mr-1" />
                          Rota
                        </Button>
                        {aula.status === "confirmada" && (
                          <Link to={`/instrutor/a-caminho/${aula.id}`} className="flex-1">
                            <Button size="sm" className="w-full gradient-primary text-primary-foreground">
                              <Zap className="w-4 h-4 mr-1" />
                              Iniciar
                            </Button>
                          </Link>
                        )}
                        {aula.status === "pendente" && (
                          <Button size="sm" className="flex-1 bg-amber-500 hover:bg-amber-600 text-white">
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Confirmar
                          </Button>
                        )}
                      </div>
                    )}

                    {aula.status === "em_andamento" && (
                      <div className="flex gap-2 mt-3">
                        <Link to={`/instrutor/a-caminho/${aula.id}`} className="flex-1">
                          <Button size="sm" variant="outline" className="w-full">
                            <MessageCircle className="w-4 h-4 mr-1" />
                            Chat
                          </Button>
                        </Link>
                        <Link to="/instrutor/validar-aula" className="flex-1">
                          <Button size="sm" className="w-full gradient-primary text-primary-foreground">
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Finalizar
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <InstructorBottomNav />
    </div>
  );
}
