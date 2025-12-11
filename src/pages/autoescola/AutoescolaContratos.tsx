import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, FileText, Plus, CheckCircle, Clock, 
  AlertCircle, Download, Send, Eye
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AutoescolaBottomNav } from "@/components/layout/AutoescolaBottomNav";
import { cn } from "@/lib/utils";

interface Contrato {
  id: string;
  aluno: string;
  tipo: "nova_lei" | "tradicional";
  valor: number;
  parcelas: number;
  status: "rascunho" | "enviado" | "assinado" | "cancelado";
  criadoEm: Date;
}

export default function AutoescolaContratos() {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState<string>("todos");

  // Mock contratos
  const contratos: Contrato[] = [
    { id: "1", aluno: "Maria Silva", tipo: "nova_lei", valor: 799, parcelas: 3, status: "assinado", criadoEm: new Date() },
    { id: "2", aluno: "João Santos", tipo: "tradicional", valor: 2500, parcelas: 10, status: "enviado", criadoEm: new Date(Date.now() - 86400000) },
    { id: "3", aluno: "Ana Oliveira", tipo: "nova_lei", valor: 799, parcelas: 1, status: "rascunho", criadoEm: new Date(Date.now() - 172800000) },
    { id: "4", aluno: "Carlos Pereira", tipo: "tradicional", valor: 2200, parcelas: 8, status: "assinado", criadoEm: new Date(Date.now() - 259200000) },
  ];

  const filteredContratos = filterStatus === "todos" 
    ? contratos 
    : contratos.filter(c => c.status === filterStatus);

  const getStatusConfig = (status: Contrato["status"]) => {
    switch (status) {
      case "rascunho": return { label: "Rascunho", icon: FileText, className: "bg-gray-100 text-gray-700" };
      case "enviado": return { label: "Aguardando assinatura", icon: Clock, className: "bg-amber-100 text-amber-700" };
      case "assinado": return { label: "Assinado", icon: CheckCircle, className: "bg-emerald-100 text-emerald-700" };
      case "cancelado": return { label: "Cancelado", icon: AlertCircle, className: "bg-red-100 text-red-700" };
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-700 to-slate-800 text-white px-6 py-6 safe-top">
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
              <h1 className="text-2xl font-bold">Contratos Digitais</h1>
              <p className="text-white/80">{contratos.filter(c => c.status === "assinado").length} contratos ativos</p>
            </div>
            <Button 
              size="sm" 
              className="bg-white/20 hover:bg-white/30"
            >
              <Plus className="w-4 h-4 mr-1" />
              Novo
            </Button>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="px-6 py-4 -mt-2">
        <div className="max-w-md mx-auto">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {["todos", "rascunho", "enviado", "assinado"].map((status) => (
              <Button
                key={status}
                variant={filterStatus === status ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus(status)}
                className={cn(
                  "whitespace-nowrap",
                  filterStatus === status && "bg-slate-700 hover:bg-slate-800"
                )}
              >
                {status === "todos" ? "Todos" : getStatusConfig(status as Contrato["status"]).label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Contratos List */}
      <div className="px-6">
        <div className="max-w-md mx-auto space-y-3">
          {filteredContratos.map((contrato) => {
            const statusConfig = getStatusConfig(contrato.status);
            const StatusIcon = statusConfig.icon;

            return (
              <Card key={contrato.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{contrato.aluno}</h3>
                      <Badge 
                        variant="outline" 
                        className={contrato.tipo === "nova_lei" ? "text-emerald-600 border-emerald-300" : "text-blue-600 border-blue-300"}
                      >
                        {contrato.tipo === "nova_lei" ? "Nova Lei" : "Tradicional"}
                      </Badge>
                    </div>
                    <Badge className={cn("text-xs", statusConfig.className)}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {statusConfig.label}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between mb-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Valor: </span>
                      <span className="font-semibold">R$ {contrato.valor.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Parcelas: </span>
                      <span className="font-semibold">{contrato.parcelas}x de R$ {(contrato.valor / contrato.parcelas).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3 border-t">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="w-4 h-4 mr-1" />
                      Visualizar
                    </Button>
                    {contrato.status === "rascunho" && (
                      <Button size="sm" className="flex-1 bg-slate-700 hover:bg-slate-800">
                        <Send className="w-4 h-4 mr-1" />
                        Enviar
                      </Button>
                    )}
                    {contrato.status === "assinado" && (
                      <Button size="sm" variant="outline" className="flex-1">
                        <Download className="w-4 h-4 mr-1" />
                        PDF
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Add Contract Card */}
          <Card 
            className="border-dashed border-2 cursor-pointer hover:border-slate-400 transition-colors"
          >
            <CardContent className="py-8 flex flex-col items-center justify-center text-muted-foreground">
              <Plus className="w-10 h-10 mb-2" />
              <span className="font-medium">Criar novo contrato</span>
              <span className="text-sm">Nova Lei ou Tradicional</span>
            </CardContent>
          </Card>
        </div>
      </div>

      <AutoescolaBottomNav />
    </div>
  );
}
