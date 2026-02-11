import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Calendar, MapPin, Clock, User, 
  CheckCircle, XCircle, AlertCircle, Navigation
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AutoescolaBottomNav } from "@/components/layout/AutoescolaBottomNav";
import { cn } from "@/lib/utils";

interface Prova {
  id: string;
  aluno: string;
  tipo: "teorica" | "pratica";
  data: Date;
  horario: string;
  local: string;
  trajeto: string;
  status: "agendada" | "aprovado" | "reprovado" | "ausente";
}

export default function AutoescolaProvas() {
  const navigate = useNavigate();
  const [filterTipo, setFilterTipo] = useState<"todas" | "teorica" | "pratica">("todas");

  // Mock provas
  const provas: Prova[] = [
    { id: "1", aluno: "Maria Silva", tipo: "pratica", data: new Date(Date.now() + 86400000), horario: "09:00", local: "DETRAN Regional", trajeto: "Trajeto Centro-Norte", status: "agendada" },
    { id: "2", aluno: "João Santos", tipo: "teorica", data: new Date(Date.now() + 172800000), horario: "14:00", local: "DETRAN Regional", trajeto: "-", status: "agendada" },
    { id: "3", aluno: "Ana Oliveira", tipo: "pratica", data: new Date(), horario: "08:00", local: "DETRAN Regional", trajeto: "Trajeto Bairro Sul", status: "aprovado" },
    { id: "4", aluno: "Carlos Pereira", tipo: "pratica", data: new Date(Date.now() - 86400000), horario: "10:00", local: "DETRAN Regional", trajeto: "Trajeto Centro-Norte", status: "reprovado" },
  ];

  const filteredProvas = filterTipo === "todas" 
    ? provas 
    : provas.filter(p => p.tipo === filterTipo);

  const getStatusConfig = (status: Prova["status"]) => {
    switch (status) {
      case "agendada": return { label: "Agendada", icon: Calendar, className: "bg-blue-100 text-blue-700" };
      case "aprovado": return { label: "Aprovado", icon: CheckCircle, className: "bg-emerald-100 text-emerald-700" };
      case "reprovado": return { label: "Reprovado", icon: XCircle, className: "bg-red-100 text-red-700" };
      case "ausente": return { label: "Ausente", icon: AlertCircle, className: "bg-gray-100 text-gray-700" };
    }
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) return "Hoje";
    if (date.toDateString() === tomorrow.toDateString()) return "Amanhã";
    return date.toLocaleDateString("pt-BR");
  };

  // Trajetos críticos (mock)
  const trajetosCriticos = [
    { nome: "Trajeto Centro-Norte", aprovacao: 72, pontosCriticos: ["Rotatória Av. Brasil", "Baliza rua estreita"] },
    { nome: "Trajeto Bairro Sul", aprovacao: 85, pontosCriticos: ["Subida íngreme", "Parada de ônibus"] },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white px-6 py-6 safe-top">
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
              <h1 className="text-2xl font-bold">Acompanhamento de Provas</h1>
              <p className="text-white/80">{provas.filter(p => p.status === "agendada").length} provas agendadas</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="px-6 py-4 -mt-2">
        <div className="max-w-md mx-auto">
          <div className="flex gap-2 bg-muted p-1 rounded-xl">
            {[
              { key: "todas", label: "Todas" },
              { key: "teorica", label: "Teóricas" },
              { key: "pratica", label: "Práticas" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilterTipo(tab.key as typeof filterTipo)}
                className={cn(
                  "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all",
                  filterTipo === tab.key
                    ? "bg-card shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Provas List */}
      <div className="px-6">
        <div className="max-w-md mx-auto space-y-4">
          {/* Próximas provas */}
          <h3 className="font-semibold text-foreground">Próximas provas</h3>
          
          {filteredProvas
            .filter(p => p.status === "agendada")
            .map((prova) => {
              const statusConfig = getStatusConfig(prova.status);
              const StatusIcon = statusConfig.icon;
              
              return (
                <Card key={prova.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{prova.aluno}</h3>
                        <Badge variant="outline" className={prova.tipo === "pratica" ? "text-emerald-600 border-emerald-300" : "text-blue-600 border-blue-300"}>
                          {prova.tipo === "pratica" ? "Prova Prática" : "Prova Teórica"}
                        </Badge>
                      </div>
                      <Badge className={cn("text-xs", statusConfig.className)}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusConfig.label}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {formatDate(prova.data)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {prova.horario}
                      </div>
                      <div className="flex items-center gap-2 col-span-2">
                        <MapPin className="w-4 h-4" />
                        {prova.local}
                      </div>
                      {prova.tipo === "pratica" && (
                        <div className="flex items-center gap-2 col-span-2">
                          <Navigation className="w-4 h-4" />
                          {prova.trajeto}
                        </div>
                      )}
                    </div>

                    {prova.tipo === "pratica" && (
                      <Button size="sm" variant="outline" className="w-full">
                        <Navigation className="w-4 h-4 mr-2" />
                        Ver trajeto no mapa
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}

          {/* Trajetos críticos */}
          {filterTipo !== "teorica" && (
            <>
              <h3 className="font-semibold text-foreground mt-6">Trajetos Críticos</h3>
              {trajetosCriticos.map((trajeto) => (
                <Card key={trajeto.nome}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{trajeto.nome}</h4>
                      <Badge variant={trajeto.aprovacao >= 80 ? "default" : "destructive"} className={trajeto.aprovacao >= 80 ? "bg-emerald-500" : ""}>
                        {trajeto.aprovacao}% aprovação
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Pontos de atenção:</p>
                      <ul className="text-sm">
                        {trajeto.pontosCriticos.map((ponto, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <AlertCircle className="w-3 h-3 text-amber-500" />
                            {ponto}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}

          {/* Histórico */}
          <h3 className="font-semibold text-foreground mt-6">Histórico recente</h3>
          {filteredProvas
            .filter(p => p.status !== "agendada")
            .map((prova) => {
              const statusConfig = getStatusConfig(prova.status);
              const StatusIcon = statusConfig.icon;
              
              return (
                <Card key={prova.id} className="opacity-80">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{prova.aluno}</h3>
                        <p className="text-sm text-muted-foreground">
                          {prova.tipo === "pratica" ? "Prática" : "Teórica"} - {formatDate(prova.data)}
                        </p>
                      </div>
                      <Badge className={cn("text-xs", statusConfig.className)}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusConfig.label}
                      </Badge>
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
