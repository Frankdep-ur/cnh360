import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, DollarSign, TrendingUp, TrendingDown, 
  Calendar, Download, Filter, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AutoescolaBottomNav } from "@/components/layout/AutoescolaBottomNav";
import { cn } from "@/lib/utils";

interface Transacao {
  id: string;
  descricao: string;
  tipo: "entrada" | "saida";
  categoria: "aluno" | "mei" | "mensalidade" | "taxa";
  valor: number;
  data: Date;
}

export default function AutoescolaFinanceiro() {
  const navigate = useNavigate();
  const [periodo, setPeriodo] = useState<"hoje" | "semana" | "mes">("mes");

  // Mock dados financeiros
  const resumo = {
    entradas: 12840,
    saidas: 3240,
    saldo: 9600,
    comissoesAlunos: 4260,
    comissoesMEIs: 2480,
    previsaoMes: 15000,
  };

  const transacoes: Transacao[] = [
    { id: "1", descricao: "Comissão - Maria Silva (15%)", tipo: "entrada", categoria: "aluno", valor: 119.85, data: new Date() },
    { id: "2", descricao: "Comissão - Aula João (MEI Ricardo)", tipo: "entrada", categoria: "mei", valor: 13.00, data: new Date() },
    { id: "3", descricao: "Taxa plataforma CNH 360", tipo: "saida", categoria: "taxa", valor: 29.90, data: new Date(Date.now() - 86400000) },
    { id: "4", descricao: "Comissão - Ana Oliveira (15%)", tipo: "entrada", categoria: "aluno", valor: 375.00, data: new Date(Date.now() - 86400000) },
    { id: "5", descricao: "Comissão - Aula Pedro (MEI Fernanda)", tipo: "entrada", categoria: "mei", valor: 14.00, data: new Date(Date.now() - 172800000) },
  ];

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) return "Hoje";
    if (date.toDateString() === yesterday.toDateString()) return "Ontem";
    return date.toLocaleDateString("pt-BR");
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
          
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">Financeiro</h1>
              <p className="text-white/80">Fluxo de caixa CNH 360</p>
            </div>
            <Button variant="ghost" size="icon" className="text-white">
              <Download className="w-5 h-5" />
            </Button>
          </div>

          {/* Saldo Card */}
          <Card className="bg-white/10 border-0">
            <CardContent className="pt-4">
              <p className="text-white/80 text-sm mb-1">Saldo disponível</p>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold">R$ {resumo.saldo.toLocaleString()}</span>
                <Badge className="bg-white/20 text-white">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +12%
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Period Filter */}
      <div className="px-6 py-4 -mt-2">
        <div className="max-w-md mx-auto">
          <div className="flex gap-2 bg-muted p-1 rounded-xl">
            {[
              { key: "hoje", label: "Hoje" },
              { key: "semana", label: "Semana" },
              { key: "mes", label: "Mês" },
            ].map((p) => (
              <button
                key={p.key}
                onClick={() => setPeriodo(p.key as typeof periodo)}
                className={cn(
                  "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all",
                  periodo === p.key
                    ? "bg-card shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-6">
        <div className="max-w-md mx-auto space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-emerald-50 border-emerald-200">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowUpRight className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm text-emerald-700">Entradas</span>
                </div>
                <span className="text-xl font-bold text-emerald-800">
                  R$ {resumo.entradas.toLocaleString()}
                </span>
              </CardContent>
            </Card>

            <Card className="bg-red-50 border-red-200">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowDownRight className="w-5 h-5 text-red-500" />
                  <span className="text-sm text-red-700">Saídas</span>
                </div>
                <span className="text-xl font-bold text-red-800">
                  R$ {resumo.saidas.toLocaleString()}
                </span>
              </CardContent>
            </Card>
          </div>

          {/* Comissões Breakdown */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Comissões por fonte</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-sm">Alunos captados (15%)</span>
                  </div>
                  <span className="font-semibold">R$ {resumo.comissoesAlunos.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500" />
                    <span className="text-sm">MEIs alocados (20%)</span>
                  </div>
                  <span className="font-semibold">R$ {resumo.comissoesMEIs.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transações */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Últimas transações</CardTitle>
                <Button variant="ghost" size="sm">
                  <Filter className="w-4 h-4 mr-1" />
                  Filtrar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transacoes.map((t) => (
                  <div key={t.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center",
                        t.tipo === "entrada" ? "bg-emerald-100" : "bg-red-100"
                      )}>
                        {t.tipo === "entrada" 
                          ? <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                          : <ArrowDownRight className="w-4 h-4 text-red-600" />
                        }
                      </div>
                      <div>
                        <p className="text-sm font-medium">{t.descricao}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(t.data)}</p>
                      </div>
                    </div>
                    <span className={cn(
                      "font-semibold",
                      t.tipo === "entrada" ? "text-emerald-600" : "text-red-600"
                    )}>
                      {t.tipo === "entrada" ? "+" : "-"}R$ {t.valor.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AutoescolaBottomNav />
    </div>
  );
}
