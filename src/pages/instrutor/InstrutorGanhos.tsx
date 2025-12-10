import { useState } from "react";
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Download,
  Filter,
  ChevronRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { InstructorBottomNav } from "@/components/layout/InstructorBottomNav";
import { cn } from "@/lib/utils";

const periods = ["Hoje", "Semana", "Mês", "Ano"];

const transactions = [
  { id: 1, student: "Maria Santos", date: "Hoje, 15:00", amount: 80, type: "lesson", status: "completed" },
  { id: 2, student: "João Pedro", date: "Hoje, 10:00", amount: 160, type: "lesson", status: "completed" },
  { id: 3, student: "Saque PIX", date: "Ontem", amount: -500, type: "withdrawal", status: "completed" },
  { id: 4, student: "Ana Costa", date: "Ontem, 14:00", amount: 80, type: "lesson", status: "completed" },
  { id: 5, student: "Pedro Lima", date: "12/01", amount: 80, type: "lesson", status: "completed" },
  { id: 6, student: "Carla Souza", date: "11/01", amount: 160, type: "lesson", status: "completed" },
];

const summary = {
  balance: 1240,
  pending: 320,
  totalMonth: 3560,
  platformFee: 996.80,
  netEarnings: 2563.20,
  lessonsCount: 44,
  avgPerLesson: 80.91,
};

export default function InstrutorGanhos() {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState("Mês");

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="gradient-secondary text-secondary-foreground px-6 pt-8 pb-24 safe-top">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-xl bg-secondary-foreground/20 flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold">Meus ganhos</h1>
          </div>

          {/* Balance */}
          <div className="text-center">
            <p className="text-secondary-foreground/80 text-sm mb-1">Saldo disponível</p>
            <h2 className="text-4xl font-bold mb-2">R$ {summary.balance.toFixed(2)}</h2>
            <p className="text-sm text-secondary-foreground/80">
              + R$ {summary.pending.toFixed(2)} pendente
            </p>
          </div>

          {/* Withdraw Button */}
          <Button
            variant="outline"
            className="w-full mt-6 bg-secondary-foreground/10 border-secondary-foreground/30 text-secondary-foreground hover:bg-secondary-foreground/20"
          >
            Sacar para conta bancária
          </Button>
        </div>
      </header>

      {/* Summary Card */}
      <div className="px-6 -mt-12">
        <div className="max-w-md mx-auto">
          <div className="bg-card rounded-3xl shadow-elevated p-6">
            {/* Period Selector */}
            <div className="flex gap-2 mb-6 overflow-x-auto">
              {periods.map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap",
                    selectedPeriod === period
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {period}
                </button>
              ))}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/50 rounded-2xl p-4">
                <p className="text-sm text-muted-foreground mb-1">Faturamento bruto</p>
                <p className="text-xl font-bold text-foreground">R$ {summary.totalMonth.toFixed(2)}</p>
                <div className="flex items-center gap-1 text-primary text-sm mt-1">
                  <TrendingUp className="w-4 h-4" />
                  +18% vs mês anterior
                </div>
              </div>

              <div className="bg-muted/50 rounded-2xl p-4">
                <p className="text-sm text-muted-foreground mb-1">Taxa da plataforma</p>
                <p className="text-xl font-bold text-foreground">R$ {summary.platformFee.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground mt-1">28% do faturamento</p>
              </div>

              <div className="bg-primary/10 rounded-2xl p-4">
                <p className="text-sm text-muted-foreground mb-1">Ganho líquido</p>
                <p className="text-xl font-bold text-primary">R$ {summary.netEarnings.toFixed(2)}</p>
              </div>

              <div className="bg-muted/50 rounded-2xl p-4">
                <p className="text-sm text-muted-foreground mb-1">Total de aulas</p>
                <p className="text-xl font-bold text-foreground">{summary.lessonsCount}</p>
                <p className="text-sm text-muted-foreground mt-1">~R$ {summary.avgPerLesson.toFixed(2)}/aula</p>
              </div>
            </div>

            {/* Premium CTA */}
            <div className="mt-4 p-4 bg-amber-50 rounded-2xl border border-amber-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400 flex items-center justify-center">
                  <span className="text-lg">⭐</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-amber-900">Seja Premium</p>
                  <p className="text-sm text-amber-700">Reduza a taxa para 18% por R$ 89/mês</p>
                </div>
                <ChevronRight className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div className="px-6 mt-6">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Histórico</h3>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm">
                <Filter className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="bg-card rounded-2xl p-4 border border-border/50 flex items-center gap-4"
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  tx.type === "withdrawal" ? "bg-destructive/10" : "bg-primary/10"
                )}>
                  {tx.type === "withdrawal" ? (
                    <TrendingDown className="w-5 h-5 text-destructive" />
                  ) : (
                    <TrendingUp className="w-5 h-5 text-primary" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{tx.student}</p>
                  <p className="text-sm text-muted-foreground">{tx.date}</p>
                </div>
                <span className={cn(
                  "font-bold",
                  tx.amount < 0 ? "text-destructive" : "text-primary"
                )}>
                  {tx.amount < 0 ? "-" : "+"}R$ {Math.abs(tx.amount).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <InstructorBottomNav />
    </div>
  );
}
