import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Building2, Users, BookOpen, DollarSign, UserCheck, 
  TrendingUp, Crown, ChevronRight, Bell, Calendar,
  Target, MessageSquare, FileText
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AutoescolaBottomNav } from "@/components/layout/AutoescolaBottomNav";
import { cn } from "@/lib/utils";

export default function AutoescolaDashboard() {
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(true);

  // Mock data
  const autoescola = {
    nome: "Autoescola Araçatuba",
    cidade: "Araçatuba-SP",
    plano: "Gratuito",
    leadsHoje: 12,
    turmasAtivas: 3,
    ganhosAlunos: 2840,
    ganhosMEIs: 1240,
    instrutoresMEI: 8,
  };

  const quickActions = [
    { icon: Users, label: "Ver Leads", path: "/autoescola/leads", count: autoescola.leadsHoje, color: "bg-blue-500" },
    { icon: BookOpen, label: "Turmas", path: "/autoescola/turmas", count: autoescola.turmasAtivas, color: "bg-emerald-500" },
    { icon: UserCheck, label: "MEIs", path: "/autoescola/mei", count: autoescola.instrutoresMEI, color: "bg-purple-500" },
    { icon: Calendar, label: "Agenda", path: "/autoescola/agenda", color: "bg-orange-500" },
  ];

  const menuItems = [
    { icon: Target, label: "Captação de Leads", path: "/autoescola/leads", description: "Novos alunos interessados" },
    { icon: BookOpen, label: "Gestão de Turmas", path: "/autoescola/turmas", description: "EAD e presencial" },
    { icon: UserCheck, label: "Marketplace MEI", path: "/autoescola/mei", description: "Instrutores autônomos" },
    { icon: Calendar, label: "Agenda Inteligente", path: "/autoescola/agenda", description: "Calendário e rotas" },
    { icon: DollarSign, label: "Financeiro", path: "/autoescola/financeiro", description: "Fluxo de caixa" },
    { icon: FileText, label: "Contratos", path: "/autoescola/contratos", description: "Assinatura digital" },
    { icon: TrendingUp, label: "Avaliação Instrutores", path: "/autoescola/avaliacoes", description: "NPS e ranking" },
    { icon: MessageSquare, label: "Comunicação", path: "/autoescola/comunicacao", description: "Chat com alunos" },
    { icon: Bell, label: "Provas", path: "/autoescola/provas", description: "Acompanhamento" },
    { icon: Users, label: "CRM", path: "/autoescola/crm", description: "Funil de vendas" },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white px-6 py-6 safe-top">
        <div className="max-w-md mx-auto">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-bold">{autoescola.nome}</h1>
                <p className="text-white/80 text-sm">{autoescola.cidade}</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-white/20 text-white border-0">
              Plano {autoescola.plano}
            </Badge>
          </div>

          {/* Upgrade Banner */}
          <button 
            onClick={() => navigate("/autoescola/planos")}
            className="w-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl p-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-white" />
              <span className="text-white font-medium text-sm">
                Upgrade Premium R$299/mês
              </span>
            </div>
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-4 -mt-2">
        <div className="max-w-md mx-auto space-y-4">
          
          {/* Ganhos Card */}
          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-emerald-700 font-medium">Ganhos este mês</span>
                <Badge className="bg-emerald-500">Via CNH 360</Badge>
              </div>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-3xl font-bold text-emerald-800">
                  R$ {(autoescola.ganhosAlunos + autoescola.ganhosMEIs).toLocaleString()}
                </span>
              </div>
              <div className="flex gap-4 text-sm text-emerald-600">
                <span>R$ {autoescola.ganhosAlunos.toLocaleString()} alunos</span>
                <span>•</span>
                <span>R$ {autoescola.ganhosMEIs.toLocaleString()} MEIs</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-4 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  onClick={() => navigate(action.path)}
                  className="flex flex-col items-center gap-1 p-3 rounded-xl bg-card border hover:border-emerald-300 transition-all"
                >
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white", action.color)}>
                    <Icon className="w-5 h-5" />
                    {action.count && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {action.count}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-medium text-foreground">{action.label}</span>
                </button>
              );
            })}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/autoescola/leads")}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  <span className="text-sm text-muted-foreground">Leads hoje</span>
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-bold">{autoescola.leadsHoje}</span>
                  <Button size="sm" variant="ghost" className="text-blue-500 h-7 px-2">
                    Ver todos
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/autoescola/turmas")}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm text-muted-foreground">Turmas ativas</span>
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-bold">{autoescola.turmasAtivas}</span>
                  <Badge variant="outline" className="text-emerald-600 border-emerald-300">
                    +2 EAD
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Menu Items */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Gestão Completa</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-all"
                    >
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-foreground">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AutoescolaBottomNav />
    </div>
  );
}
