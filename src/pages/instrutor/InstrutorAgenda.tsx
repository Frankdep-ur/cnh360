import { useState, useEffect } from "react";
import { ComplianceBanner } from "@/components/layout/ComplianceBanner";
import { ActiveLessonBanner } from "@/components/instrutor/ActiveLessonBanner";
import { useActiveLessonBanner } from "@/hooks/useActiveLessonBanner";
import { InstructorBottomNav } from "@/components/layout/InstructorBottomNav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Calendar,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Car,
  Navigation,
  Zap,
  Settings,
  Plus,
  CalendarDays
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format, startOfWeek, addDays, isSameDay, addWeeks, subWeeks } from "date-fns";
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

export default function InstrutorAgenda() {
  const { user } = useAuth();
  const { activeLesson } = useActiveLessonBanner();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [disponivel, setDisponivel] = useState(true);
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchAulas = async () => {
      setLoading(true);
      
      const { data: instrutor } = await supabase
        .from('instrutores')
        .select('id, ativo')
        .eq('user_id', user.id)
        .single();

      if (!instrutor) {
        setLoading(false);
        return;
      }

      setDisponivel(instrutor.ativo ?? true);

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
        .order('data_hora', { ascending: true });

      if (error) {
        console.error('Error fetching aulas:', error);
        setLoading(false);
        return;
      }

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

  const diasSemana = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const aulasHoje = aulas.filter(aula => 
    isSameDay(new Date(aula.data_hora), selectedDate)
  );

  const hasAulaOnDay = (date: Date) => {
    return aulas.some(aula => isSameDay(new Date(aula.data_hora), date));
  };

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

  const totalDia = aulasHoje.reduce((acc, aula) => acc + aula.valor, 0);

  return (
    <div className="app-container pb-24">
      <ComplianceBanner />
      
      <div className="px-4 py-6 page-enter space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">Minha Agenda</h1>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-1" />
            Horários
          </Button>
        </div>

        {/* Active Lesson Banner */}
        {activeLesson && <ActiveLessonBanner lesson={activeLesson} />}

        {/* Disponibilidade */}
        <Card className="p-4 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-foreground">Aceitar novas aulas</p>
              <p className="text-sm text-muted-foreground">
                {disponivel ? "Você está disponível para agendamentos" : "Você não está aceitando aulas"}
              </p>
            </div>
            <Switch 
              checked={disponivel} 
              onCheckedChange={setDisponivel}
              className="data-[state=checked]:bg-primary"
            />
          </div>
        </Card>

        {/* Calendário Semanal */}
        <Card className="p-4 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="icon" onClick={() => setWeekStart(subWeeks(weekStart, 1))}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h3 className="font-semibold text-foreground">
              {format(weekStart, "MMMM yyyy", { locale: ptBR })}
            </h3>
            <Button variant="ghost" size="icon" onClick={() => setWeekStart(addWeeks(weekStart, 1))}>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {diasSemana.map((dia) => {
              const isSelected = isSameDay(dia, selectedDate);
              const hasAula = hasAulaOnDay(dia);
              const isToday = isSameDay(dia, new Date());
              
              return (
                <button
                  key={dia.toISOString()}
                  onClick={() => setSelectedDate(dia)}
                  className={`flex flex-col items-center p-2 rounded-xl transition-all relative ${
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : isToday
                      ? "bg-primary/10"
                      : "hover:bg-muted"
                  }`}
                >
                  <span className="text-xs opacity-80">
                    {format(dia, "EEE", { locale: ptBR })}
                  </span>
                  <span className="text-lg font-bold">{format(dia, "d")}</span>
                  {hasAula && !isSelected && (
                    <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Resumo do Dia */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-primary" />
              {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
            </h3>
            <p className="text-sm text-muted-foreground">
              {aulasHoje.length} {aulasHoje.length === 1 ? 'aula' : 'aulas'} | Potencial: R${totalDia}
            </p>
          </div>
          <Button size="sm" variant="outline">
            <Plus className="w-4 h-4 mr-1" />
            Bloquear
          </Button>
        </div>

        {/* Lista de Aulas */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
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
        ) : aulasHoje.length === 0 ? (
          <Card className="p-8 shadow-card text-center">
            <CalendarDays className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-semibold text-foreground mb-1">Nenhuma aula neste dia</h3>
            <p className="text-sm text-muted-foreground">
              Você não tem aulas agendadas para esta data
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {aulasHoje.map((aula) => (
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
                        {format(new Date(aula.data_hora), "HH:mm", { locale: ptBR })} - {aula.duracao_minutos}min
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
                              Iniciar Aula
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
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Adicionar Disponibilidade */}
        <Card className="p-4 shadow-card border-dashed border-2">
          <button className="w-full flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <Plus className="w-5 h-5" />
            <span className="font-medium">Adicionar horário disponível</span>
          </button>
        </Card>
      </div>

      <InstructorBottomNav />
    </div>
  );
}
