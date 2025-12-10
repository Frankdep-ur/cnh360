import { useState } from "react";
import { ComplianceBanner } from "@/components/layout/ComplianceBanner";
import { InstructorBottomNav } from "@/components/layout/InstructorBottomNav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
  Plus
} from "lucide-react";
import { Link } from "react-router-dom";

export default function InstrutorAgenda() {
  const [selectedDate, setSelectedDate] = useState(10);
  const [disponivel, setDisponivel] = useState(true);

  const diasSemana = [
    { dia: "Seg", num: 9 },
    { dia: "Ter", num: 10 },
    { dia: "Qua", num: 11 },
    { dia: "Qui", num: 12 },
    { dia: "Sex", num: 13 },
    { dia: "Sáb", num: 14 },
    { dia: "Dom", num: 15 },
  ];

  const aulasHoje = [
    {
      id: 1,
      aluno: "Maria Santos",
      foto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
      horario: "08:00 - 09:00",
      local: "Av. Brasil, 1200 - Centro",
      status: "concluida",
      carroProprioAluno: false,
      valor: 120,
    },
    {
      id: 2,
      aluno: "João Pereira",
      foto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
      horario: "10:00 - 11:00",
      local: "R. São Paulo, 500 - Jd. Europa",
      status: "concluida",
      carroProprioAluno: true,
      valor: 96,
    },
    {
      id: 3,
      aluno: "Ana Costa",
      foto: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      horario: "14:00 - 15:00",
      local: "Av. Brasília, 800 - Vila Aurora",
      status: "confirmada",
      carroProprioAluno: false,
      valor: 120,
    },
    {
      id: 4,
      aluno: "Pedro Lima",
      foto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      horario: "16:00 - 18:00",
      local: "R. XV de Novembro, 300 - Centro",
      status: "pendente",
      carroProprioAluno: false,
      valor: 240,
    },
  ];

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
            <Button variant="ghost" size="icon">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h3 className="font-semibold text-foreground">Dezembro 2025</h3>
            <Button variant="ghost" size="icon">
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {diasSemana.map((d) => (
              <button
                key={d.num}
                onClick={() => setSelectedDate(d.num)}
                className={`flex flex-col items-center p-2 rounded-xl transition-all ${
                  selectedDate === d.num
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                <span className="text-xs opacity-80">{d.dia}</span>
                <span className="text-lg font-bold">{d.num}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Resumo do Dia */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Terça, 10 de Dezembro
            </h3>
            <p className="text-sm text-muted-foreground">
              {aulasHoje.length} aulas | Potencial: R${totalDia}
            </p>
          </div>
          <Button size="sm" variant="outline">
            <Plus className="w-4 h-4 mr-1" />
            Bloquear
          </Button>
        </div>

        {/* Lista de Aulas */}
        <div className="space-y-3">
          {aulasHoje.map((aula) => (
            <Card key={aula.id} className="p-4 shadow-card">
              <div className="flex items-start gap-3">
                <div className="relative">
                  <img 
                    src={aula.foto} 
                    alt={aula.aluno}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {aula.status === "concluida" && (
                    <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-0.5">
                      <CheckCircle2 className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-foreground">{aula.aluno}</h4>
                    {getStatusBadge(aula.status)}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {aula.horario}
                    </span>
                    <span className="font-semibold text-foreground">R${aula.valor}</span>
                  </div>
                  
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="truncate">{aula.local}</span>
                  </div>

                  {aula.carroProprioAluno && (
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
                        <Link to="/instrutor/validar-aula" className="flex-1">
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
