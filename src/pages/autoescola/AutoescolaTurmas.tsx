import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Plus, BookOpen, Users, Video, MapPin, 
  Calendar, Clock, MoreVertical, CheckCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AutoescolaBottomNav } from "@/components/layout/AutoescolaBottomNav";
import { cn } from "@/lib/utils";

interface Turma {
  id: string;
  nome: string;
  tipo: "ead" | "presencial" | "hibrido";
  alunos: number;
  maxAlunos: number;
  progresso: number;
  inicioData: string;
  horario: string;
  status: "em_andamento" | "formando" | "concluida";
}

export default function AutoescolaTurmas() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"todas" | "ead" | "presencial">("todas");

  // Mock turmas
  const turmas: Turma[] = [
    { id: "1", nome: "Turma EAD Janeiro", tipo: "ead", alunos: 45, maxAlunos: 50, progresso: 75, inicioData: "10/01/2026", horario: "Flexível", status: "em_andamento" },
    { id: "2", nome: "Turma Presencial A", tipo: "presencial", alunos: 20, maxAlunos: 25, progresso: 40, inicioData: "15/01/2026", horario: "19h-22h", status: "em_andamento" },
    { id: "3", nome: "Turma Híbrida Nova Lei", tipo: "hibrido", alunos: 12, maxAlunos: 30, progresso: 10, inicioData: "20/01/2026", horario: "Flexível + Sáb 8h", status: "formando" },
  ];

  const filteredTurmas = activeTab === "todas" 
    ? turmas 
    : turmas.filter(t => t.tipo === activeTab || (activeTab === "ead" && t.tipo === "hibrido"));

  const getTipoBadge = (tipo: Turma["tipo"]) => {
    const config = {
      ead: { label: "100% EAD", icon: Video, className: "bg-purple-100 text-purple-700" },
      presencial: { label: "Presencial", icon: MapPin, className: "bg-blue-100 text-blue-700" },
      hibrido: { label: "Híbrido", icon: BookOpen, className: "bg-emerald-100 text-emerald-700" },
    };
    return config[tipo];
  };

  const getStatusBadge = (status: Turma["status"]) => {
    const config = {
      em_andamento: { label: "Em andamento", className: "bg-emerald-500" },
      formando: { label: "Formando turma", className: "bg-amber-500" },
      concluida: { label: "Concluída", className: "bg-gray-500" },
    };
    return config[status];
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white px-6 py-6 safe-top">
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
              <h1 className="text-2xl font-bold">Gestão de Turmas</h1>
              <p className="text-white/80">{turmas.length} turmas ativas</p>
            </div>
            <Button 
              size="sm" 
              className="bg-white/20 hover:bg-white/30"
              onClick={() => {/* TODO: Modal criar turma */}}
            >
              <Plus className="w-4 h-4 mr-1" />
              Nova
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 py-4 -mt-2">
        <div className="max-w-md mx-auto">
          <div className="flex gap-2 bg-muted p-1 rounded-xl">
            {[
              { key: "todas", label: "Todas" },
              { key: "ead", label: "EAD" },
              { key: "presencial", label: "Presencial" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={cn(
                  "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all",
                  activeTab === tab.key
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

      {/* Turmas List */}
      <div className="px-6">
        <div className="max-w-md mx-auto space-y-3">
          {filteredTurmas.map((turma) => {
            const tipoConfig = getTipoBadge(turma.tipo);
            const statusConfig = getStatusBadge(turma.status);
            const TipoIcon = tipoConfig.icon;

            return (
              <Card key={turma.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{turma.nome}</h3>
                        <Badge className={cn("text-xs", statusConfig.className)}>
                          {statusConfig.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className={cn("text-xs", tipoConfig.className)}>
                          <TipoIcon className="w-3 h-3 mr-1" />
                          {tipoConfig.label}
                        </Badge>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{turma.alunos}/{turma.maxAlunos} alunos</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{turma.inicioData}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                      <Clock className="w-4 h-4" />
                      <span>{turma.horario}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progresso do curso</span>
                      <span className="font-medium">{turma.progresso}%</span>
                    </div>
                    <Progress value={turma.progresso} className="h-2" />
                  </div>

                  <div className="flex gap-2 mt-4 pt-3 border-t">
                    <Button size="sm" variant="outline" className="flex-1">
                      Ver alunos
                    </Button>
                    <Button size="sm" className="flex-1 bg-emerald-500 hover:bg-emerald-600">
                      Simulados
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Add Turma Card */}
          <Card 
            className="border-dashed border-2 cursor-pointer hover:border-emerald-400 transition-colors"
            onClick={() => {/* TODO: Modal criar turma */}}
          >
            <CardContent className="py-8 flex flex-col items-center justify-center text-muted-foreground">
              <Plus className="w-10 h-10 mb-2" />
              <span className="font-medium">Criar nova turma</span>
              <span className="text-sm">EAD, Presencial ou Híbrida</span>
            </CardContent>
          </Card>
        </div>
      </div>

      <AutoescolaBottomNav />
    </div>
  );
}
