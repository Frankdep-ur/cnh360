import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Calendar, Clock, MapPin, Cloud, Sun, 
  CloudRain, Car, User, ChevronLeft, ChevronRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AutoescolaBottomNav } from "@/components/layout/AutoescolaBottomNav";
import { cn } from "@/lib/utils";

interface Aula {
  id: string;
  aluno: string;
  instrutor: string;
  horario: string;
  duracao: number;
  local: string;
  tipo: "pratica" | "teorica" | "simulado";
  clima: "sol" | "nublado" | "chuva";
}

export default function AutoescolaAgenda() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", 
                 "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  // Mock aulas do dia
  const aulasHoje: Aula[] = [
    { id: "1", aluno: "Maria Silva", instrutor: "Ricardo MEI", horario: "08:00", duracao: 50, local: "Av. Brasil, 1200", tipo: "pratica", clima: "sol" },
    { id: "2", aluno: "João Santos", instrutor: "Fernanda MEI", horario: "09:00", duracao: 50, local: "Centro", tipo: "pratica", clima: "sol" },
    { id: "3", aluno: "Turma A (15 alunos)", instrutor: "EAD", horario: "10:00", duracao: 120, local: "Online", tipo: "teorica", clima: "sol" },
    { id: "4", aluno: "Ana Oliveira", instrutor: "Carlos MEI", horario: "14:00", duracao: 50, local: "DETRAN", tipo: "simulado", clima: "nublado" },
    { id: "5", aluno: "Pedro Costa", instrutor: "Ricardo MEI", horario: "15:00", duracao: 50, local: "Av. Brasil, 1200", tipo: "pratica", clima: "nublado" },
  ];

  const getClimaIcon = (clima: Aula["clima"]) => {
    switch (clima) {
      case "sol": return <Sun className="w-4 h-4 text-amber-500" />;
      case "nublado": return <Cloud className="w-4 h-4 text-gray-400" />;
      case "chuva": return <CloudRain className="w-4 h-4 text-blue-500" />;
    }
  };

  const getTipoBadge = (tipo: Aula["tipo"]) => {
    switch (tipo) {
      case "pratica": return { label: "Prática", className: "bg-emerald-100 text-emerald-700" };
      case "teorica": return { label: "Teórica", className: "bg-blue-100 text-blue-700" };
      case "simulado": return { label: "Simulado", className: "bg-purple-100 text-purple-700" };
    }
  };

  // Gerar dias do calendário
  const getDaysInMonth = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const prevMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1));
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white px-6 py-6 safe-top">
        <div className="max-w-md mx-auto">
          <button 
            onClick={() => navigate("/autoescola")}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Agenda Inteligente</h1>
              <p className="text-white/80">{aulasHoje.length} aulas hoje</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Mini */}
      <div className="px-6 py-4 -mt-2">
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="pt-4">
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-4">
                <Button variant="ghost" size="sm" onClick={prevMonth}>
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <h3 className="font-semibold">
                  {meses[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                </h3>
                <Button variant="ghost" size="sm" onClick={nextMonth}>
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>

              {/* Days Header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {diasSemana.map(dia => (
                  <div key={dia} className="text-center text-xs text-muted-foreground py-1">
                    {dia}
                  </div>
                ))}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1">
                {getDaysInMonth().map((day, index) => (
                  <button
                    key={index}
                    className={cn(
                      "aspect-square flex items-center justify-center text-sm rounded-lg transition-all",
                      day === selectedDate.getDate() 
                        ? "bg-orange-500 text-white font-bold"
                        : day 
                          ? "hover:bg-muted"
                          : ""
                    )}
                    disabled={!day}
                    onClick={() => day && setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day))}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Aulas do Dia */}
      <div className="px-6">
        <div className="max-w-md mx-auto space-y-3">
          <h3 className="font-semibold text-foreground">
            Agenda de {selectedDate.getDate()}/{selectedDate.getMonth() + 1}
          </h3>

          {aulasHoje.map((aula) => {
            const tipoConfig = getTipoBadge(aula.tipo);
            return (
              <Card key={aula.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    {/* Time */}
                    <div className="text-center min-w-[50px]">
                      <span className="text-lg font-bold text-orange-600">{aula.horario}</span>
                      <p className="text-xs text-muted-foreground">{aula.duracao}min</p>
                    </div>

                    {/* Divider */}
                    <div className="w-px h-16 bg-border" />

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={cn("text-xs", tipoConfig.className)}>
                          {tipoConfig.label}
                        </Badge>
                        {getClimaIcon(aula.clima)}
                      </div>

                      <h4 className="font-medium mb-1">{aula.aluno}</h4>
                      
                      <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {aula.instrutor}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {aula.local}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <AutoescolaBottomNav />
    </div>
  );
}
