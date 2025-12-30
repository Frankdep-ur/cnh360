import { useState, useEffect } from "react";
import { ComplianceBanner } from "@/components/layout/ComplianceBanner";
import { BottomNav } from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  MessageCircle,
  Star,
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
  instrutor_nome: string | null;
  instrutor_foto: string | null;
  instrutor_nota: number | null;
}

export default function AlunoAgenda() {
  const { user } = useAuth();
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));

  useEffect(() => {
    if (!user) return;

    const fetchAulas = async () => {
      setLoading(true);
      
      // First get the aluno id
      const { data: aluno } = await supabase
        .from('alunos')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!aluno) {
        setLoading(false);
        return;
      }

      // Fetch aulas
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
          instrutor_id
        `)
        .eq('aluno_id', aluno.id)
        .order('data_hora', { ascending: true });

      if (error) {
        console.error('Error fetching aulas:', error);
        setLoading(false);
        return;
      }

      // Get instrutor info for each aula
      const aulasWithInstrutor = await Promise.all(
        (aulasData || []).map(async (aula) => {
          const { data: instrutorData } = await supabase
            .from('instrutores_seguros')
            .select('full_name, avatar_url, nota_media')
            .eq('id', aula.instrutor_id)
            .single();

          return {
            ...aula,
            instrutor_nome: instrutorData?.full_name || 'Instrutor',
            instrutor_foto: instrutorData?.avatar_url,
            instrutor_nota: instrutorData?.nota_media
          };
        })
      );

      setAulas(aulasWithInstrutor);
      setLoading(false);
    };

    fetchAulas();
  }, [user]);

  const diasSemana = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  
  const aulasDoDia = aulas.filter(aula => 
    isSameDay(new Date(aula.data_hora), selectedDate)
  );

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
            <Navigation className="w-3 h-3 mr-1" /> Em andamento
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

  const hasAulaOnDay = (date: Date) => {
    return aulas.some(aula => isSameDay(new Date(aula.data_hora), date));
  };

  return (
    <div className="app-container pb-24">
      <ComplianceBanner />
      
      <div className="px-4 py-6 page-enter space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">Minha Agenda</h1>
          <Link to="/aluno/buscar">
            <Button size="sm">
              <Calendar className="w-4 h-4 mr-1" />
              Nova Aula
            </Button>
          </Link>
        </div>

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
              {aulasDoDia.length} {aulasDoDia.length === 1 ? 'aula' : 'aulas'}
            </p>
          </div>
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
        ) : aulasDoDia.length === 0 ? (
          <Card className="p-8 shadow-card text-center">
            <CalendarDays className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-semibold text-foreground mb-1">Nenhuma aula neste dia</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Que tal agendar uma aula prática?
            </p>
            <Link to="/aluno/buscar">
              <Button>Buscar Instrutores</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {aulasDoDia.map((aula) => (
              <Card key={aula.id} className="p-4 shadow-card">
                <div className="flex items-start gap-3">
                  <div className="relative">
                    {aula.instrutor_foto ? (
                      <img 
                        src={aula.instrutor_foto} 
                        alt={aula.instrutor_nome || 'Instrutor'}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-lg font-semibold text-muted-foreground">
                          {(aula.instrutor_nome || 'I').charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <h4 className="font-semibold text-foreground">{aula.instrutor_nome}</h4>
                        {aula.instrutor_nota && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            {aula.instrutor_nota.toFixed(1)}
                          </div>
                        )}
                      </div>
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
                        Usando meu carro (-20%)
                      </Badge>
                    )}
                    
                    {(aula.status === "confirmada" || aula.status === "em_andamento") && (
                      <div className="flex gap-2 mt-3">
                        <Link to={`/aluno/rastrear/${aula.id}`} className="flex-1">
                          <Button size="sm" variant="outline" className="w-full">
                            <Navigation className="w-4 h-4 mr-1" />
                            Rastrear
                          </Button>
                        </Link>
                        <Link to={`/aluno/rastrear/${aula.id}`} className="flex-1">
                          <Button size="sm" className="w-full gradient-primary text-primary-foreground">
                            <MessageCircle className="w-4 h-4 mr-1" />
                            Chat
                          </Button>
                        </Link>
                      </div>
                    )}

                    {aula.status === "pendente" && (
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline" className="flex-1 text-destructive hover:text-destructive">
                          <XCircle className="w-4 h-4 mr-1" />
                          Cancelar
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Próximas Aulas (se não estiver vendo hoje) */}
        {!isSameDay(selectedDate, new Date()) && aulas.filter(a => 
          new Date(a.data_hora) > new Date() && 
          (a.status === 'confirmada' || a.status === 'pendente')
        ).length > 0 && (
          <div className="pt-4 border-t border-border">
            <h3 className="font-semibold text-foreground mb-3">Próximas Aulas</h3>
            <div className="space-y-2">
              {aulas
                .filter(a => 
                  new Date(a.data_hora) > new Date() && 
                  (a.status === 'confirmada' || a.status === 'pendente')
                )
                .slice(0, 3)
                .map((aula) => (
                  <Card 
                    key={aula.id} 
                    className="p-3 shadow-card cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setSelectedDate(new Date(aula.data_hora))}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{aula.instrutor_nome}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(aula.data_hora), "dd/MM 'às' HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(aula.status)}
                    </div>
                  </Card>
                ))}
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
