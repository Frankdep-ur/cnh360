import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Users, Target, Phone, Mail, Clock, 
  ChevronRight, Bell, Filter, Plus
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AutoescolaBottomNav } from "@/components/layout/AutoescolaBottomNav";
import { cn } from "@/lib/utils";

interface Lead {
  id: string;
  nome: string;
  telefone: string;
  etapa: "novo" | "contato" | "negociando" | "fechado" | "perdido";
  valor: number;
  ultimoContato: Date;
  lembrete?: Date;
}

export default function AutoescolaCRM() {
  const navigate = useNavigate();
  const [draggedLead, setDraggedLead] = useState<string | null>(null);

  // Mock leads
  const [leads, setLeads] = useState<Lead[]>([
    { id: "1", nome: "Maria Silva", telefone: "(18) 99999-1234", etapa: "novo", valor: 799, ultimoContato: new Date() },
    { id: "2", nome: "João Santos", telefone: "(18) 99888-5678", etapa: "novo", valor: 2500, ultimoContato: new Date(Date.now() - 3600000) },
    { id: "3", nome: "Ana Oliveira", telefone: "(18) 99777-9012", etapa: "contato", valor: 799, ultimoContato: new Date(Date.now() - 86400000), lembrete: new Date(Date.now() + 86400000) },
    { id: "4", nome: "Carlos Pereira", telefone: "(18) 99666-3456", etapa: "negociando", valor: 2200, ultimoContato: new Date(Date.now() - 172800000) },
    { id: "5", nome: "Pedro Costa", telefone: "(18) 99555-7890", etapa: "fechado", valor: 799, ultimoContato: new Date(Date.now() - 259200000) },
  ]);

  const etapas = [
    { key: "novo", label: "Novos", color: "bg-blue-500" },
    { key: "contato", label: "Em contato", color: "bg-amber-500" },
    { key: "negociando", label: "Negociando", color: "bg-purple-500" },
    { key: "fechado", label: "Fechados", color: "bg-emerald-500" },
  ];

  const getLeadsByEtapa = (etapa: string) => leads.filter(l => l.etapa === etapa);

  const getTotalByEtapa = (etapa: string) => {
    return getLeadsByEtapa(etapa).reduce((acc, l) => acc + l.valor, 0);
  };

  const getTimeAgo = (date: Date) => {
    const hours = Math.floor((Date.now() - date.getTime()) / 3600000);
    if (hours < 1) return "Agora";
    if (hours < 24) return `${hours}h atrás`;
    return `${Math.floor(hours / 24)}d atrás`;
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-violet-500 to-violet-600 text-white px-6 py-6 safe-top">
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
              <h1 className="text-2xl font-bold">CRM</h1>
              <p className="text-white/80">Funil de vendas</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
          </div>

          {/* Pipeline Stats */}
          <div className="mt-4 grid grid-cols-4 gap-2">
            {etapas.map((etapa) => (
              <div key={etapa.key} className="text-center">
                <div className={cn("w-full h-1 rounded-full mb-2", etapa.color)} />
                <p className="text-lg font-bold">{getLeadsByEtapa(etapa.key).length}</p>
                <p className="text-xs text-white/70">{etapa.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Funnel View */}
      <div className="px-6 py-4">
        <div className="max-w-md mx-auto space-y-4">
          {etapas.map((etapa) => {
            const leadsEtapa = getLeadsByEtapa(etapa.key);
            const totalEtapa = getTotalByEtapa(etapa.key);

            return (
              <Card key={etapa.key}>
                <CardHeader className="py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-3 h-3 rounded-full", etapa.color)} />
                      <CardTitle className="text-base">{etapa.label}</CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {leadsEtapa.length}
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      R$ {totalEtapa.toLocaleString()}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {leadsEtapa.slice(0, 3).map((lead) => (
                      <div 
                        key={lead.id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm truncate">{lead.nome}</h4>
                            {lead.lembrete && (
                              <Bell className="w-3 h-3 text-amber-500" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {getTimeAgo(lead.ultimoContato)}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-sm">R$ {lead.valor}</p>
                          <div className="flex gap-1 mt-1">
                            <Button size="icon" variant="ghost" className="h-6 w-6">
                              <Phone className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {leadsEtapa.length > 3 && (
                      <Button variant="ghost" size="sm" className="w-full text-xs">
                        Ver todos ({leadsEtapa.length})
                        <ChevronRight className="w-3 h-3 ml-1" />
                      </Button>
                    )}

                    {leadsEtapa.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Nenhum lead nesta etapa
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Lembretes */}
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader className="py-3">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-600" />
                <CardTitle className="text-base text-amber-800">Lembretes pendentes</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {leads.filter(l => l.lembrete).map((lead) => (
                <div key={lead.id} className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-sm">{lead.nome}</p>
                    <p className="text-xs text-amber-700">
                      Ligar em {lead.lembrete?.toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" className="border-amber-300 text-amber-700">
                    <Phone className="w-3 h-3 mr-1" />
                    Ligar
                  </Button>
                </div>
              ))}
              {leads.filter(l => l.lembrete).length === 0 && (
                <p className="text-sm text-amber-700 text-center py-2">
                  Nenhum lembrete pendente
                </p>
              )}
            </CardContent>
          </Card>

          {/* Add Lead */}
          <Button className="w-full bg-violet-500 hover:bg-violet-600">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar lead manualmente
          </Button>
        </div>
      </div>

      <AutoescolaBottomNav />
    </div>
  );
}
