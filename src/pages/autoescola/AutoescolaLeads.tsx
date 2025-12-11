import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Search, Filter, UserPlus, Phone, Mail, 
  Clock, DollarSign, CheckCircle, X, MapPin
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AutoescolaBottomNav } from "@/components/layout/AutoescolaBottomNav";
import { cn } from "@/lib/utils";

interface Lead {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  modo: "nova_lei" | "atual";
  categoria: string;
  cidade: string;
  criadoEm: Date;
  comissao: number;
  status: "novo" | "contato" | "negociando" | "convertido" | "perdido";
}

export default function AutoescolaLeads() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("todos");

  // Mock leads
  const leads: Lead[] = [
    { id: "1", nome: "Maria Silva", telefone: "(18) 99999-1234", email: "maria@email.com", modo: "nova_lei", categoria: "B", cidade: "Araçatuba", criadoEm: new Date(), comissao: 119.85, status: "novo" },
    { id: "2", nome: "João Santos", telefone: "(18) 99888-5678", email: "joao@email.com", modo: "atual", categoria: "AB", cidade: "Araçatuba", criadoEm: new Date(Date.now() - 3600000), comissao: 375.00, status: "novo" },
    { id: "3", nome: "Ana Oliveira", telefone: "(18) 99777-9012", email: "ana@email.com", modo: "nova_lei", categoria: "B", cidade: "Birigui", criadoEm: new Date(Date.now() - 7200000), comissao: 119.85, status: "contato" },
    { id: "4", nome: "Carlos Pereira", telefone: "(18) 99666-3456", email: "carlos@email.com", modo: "atual", categoria: "B", cidade: "Araçatuba", criadoEm: new Date(Date.now() - 86400000), comissao: 330.00, status: "negociando" },
  ];

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "todos" || lead.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: Lead["status"]) => {
    const config = {
      novo: { label: "Novo", className: "bg-blue-100 text-blue-700" },
      contato: { label: "Em contato", className: "bg-yellow-100 text-yellow-700" },
      negociando: { label: "Negociando", className: "bg-purple-100 text-purple-700" },
      convertido: { label: "Convertido", className: "bg-emerald-100 text-emerald-700" },
      perdido: { label: "Perdido", className: "bg-red-100 text-red-700" },
    };
    return config[status];
  };

  const getTimeAgo = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
    if (minutes < 60) return `${minutes}min atrás`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h atrás`;
    return `${Math.floor(hours / 24)}d atrás`;
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white px-6 py-6 safe-top">
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
              <h1 className="text-2xl font-bold">Captação de Leads</h1>
              <p className="text-white/80">{filteredLeads.length} leads disponíveis</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <UserPlus className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="px-6 py-4 -mt-2">
        <div className="max-w-md mx-auto space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Buscar lead..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {["todos", "novo", "contato", "negociando", "convertido"].map((status) => (
              <Button
                key={status}
                variant={filterStatus === status ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus(status)}
                className={cn(
                  "whitespace-nowrap",
                  filterStatus === status && "bg-blue-500 hover:bg-blue-600"
                )}
              >
                {status === "todos" ? "Todos" : getStatusBadge(status as Lead["status"]).label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Leads List */}
      <div className="px-6">
        <div className="max-w-md mx-auto space-y-3">
          {filteredLeads.map((lead) => {
            const statusConfig = getStatusBadge(lead.status);
            return (
              <Card key={lead.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{lead.nome}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {lead.cidade}
                        <span>•</span>
                        <Clock className="w-3 h-3" />
                        {getTimeAgo(lead.criadoEm)}
                      </div>
                    </div>
                    <Badge className={cn("text-xs", statusConfig.className)}>
                      {statusConfig.label}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 mb-3 text-sm">
                    <Badge variant={lead.modo === "nova_lei" ? "default" : "secondary"} className={lead.modo === "nova_lei" ? "bg-emerald-500" : ""}>
                      {lead.modo === "nova_lei" ? "Nova Lei" : "Tradicional"}
                    </Badge>
                    <span className="text-muted-foreground">Categoria {lead.categoria}</span>
                  </div>

                  <div className="flex items-center gap-3 mb-4 text-sm text-muted-foreground">
                    <a href={`tel:${lead.telefone}`} className="flex items-center gap-1 hover:text-foreground">
                      <Phone className="w-4 h-4" />
                      {lead.telefone}
                    </a>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm">
                        Você ganha: <strong className="text-emerald-600">R$ {lead.comissao.toFixed(2)}</strong>
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="h-8">
                        <X className="w-4 h-4" />
                      </Button>
                      <Button size="sm" className="h-8 bg-emerald-500 hover:bg-emerald-600">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Aceitar
                      </Button>
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
