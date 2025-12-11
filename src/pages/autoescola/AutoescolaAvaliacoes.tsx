import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Star, TrendingUp, Award, ThumbsUp, 
  ThumbsDown, MessageSquare
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AutoescolaBottomNav } from "@/components/layout/AutoescolaBottomNav";
import { cn } from "@/lib/utils";

interface Instrutor {
  id: string;
  nome: string;
  foto: string;
  nps: number;
  totalAvaliacoes: number;
  promotores: number;
  detratores: number;
  comentarios: number;
  tendencia: "up" | "down" | "stable";
}

export default function AutoescolaAvaliacoes() {
  const navigate = useNavigate();

  // Mock instrutores
  const instrutores: Instrutor[] = [
    { id: "1", nome: "Ricardo Gomes", foto: "", nps: 85, totalAvaliacoes: 142, promotores: 120, detratores: 8, comentarios: 45, tendencia: "up" },
    { id: "2", nome: "Fernanda Lima", foto: "", nps: 72, totalAvaliacoes: 98, promotores: 75, detratores: 12, comentarios: 32, tendencia: "stable" },
    { id: "3", nome: "Carlos Eduardo", foto: "", nps: 68, totalAvaliacoes: 67, promotores: 48, detratores: 10, comentarios: 28, tendencia: "down" },
    { id: "4", nome: "Ana Paula", foto: "", nps: 92, totalAvaliacoes: 156, promotores: 148, detratores: 4, comentarios: 52, tendencia: "up" },
  ];

  const getNPSColor = (nps: number) => {
    if (nps >= 75) return "text-emerald-600";
    if (nps >= 50) return "text-amber-600";
    return "text-red-600";
  };

  const getNPSBadge = (nps: number) => {
    if (nps >= 75) return { label: "Excelente", className: "bg-emerald-100 text-emerald-700" };
    if (nps >= 50) return { label: "Bom", className: "bg-amber-100 text-amber-700" };
    return { label: "Precisa melhorar", className: "bg-red-100 text-red-700" };
  };

  // Média geral
  const npsGeral = Math.round(instrutores.reduce((acc, i) => acc + i.nps, 0) / instrutores.length);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white px-6 py-6 safe-top">
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
              <h1 className="text-2xl font-bold">Avaliação de Instrutores</h1>
              <p className="text-white/80">NPS e ranking interno</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
          </div>

          {/* NPS Geral */}
          <Card className="bg-white/10 border-0 mt-4">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">NPS Geral da Equipe</p>
                  <span className="text-3xl font-bold">{npsGeral}</span>
                </div>
                <Badge className={cn("text-sm", getNPSBadge(npsGeral).className)}>
                  {getNPSBadge(npsGeral).label}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Ranking */}
      <div className="px-6 py-4 -mt-2">
        <div className="max-w-md mx-auto space-y-3">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            Ranking por NPS
          </h3>

          {instrutores
            .sort((a, b) => b.nps - a.nps)
            .map((instrutor, index) => {
              const npsBadge = getNPSBadge(instrutor.nps);
              return (
                <Card key={instrutor.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      {/* Ranking */}
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                        index === 0 ? "bg-amber-100 text-amber-700" :
                        index === 1 ? "bg-gray-100 text-gray-700" :
                        index === 2 ? "bg-orange-100 text-orange-700" :
                        "bg-muted text-muted-foreground"
                      )}>
                        {index + 1}º
                      </div>

                      {/* Avatar */}
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={instrutor.foto} />
                        <AvatarFallback className="bg-amber-100 text-amber-600">
                          {instrutor.nome.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>

                      {/* Info */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{instrutor.nome}</h3>
                          <div className="flex items-center gap-1">
                            <span className={cn("text-2xl font-bold", getNPSColor(instrutor.nps))}>
                              {instrutor.nps}
                            </span>
                            {instrutor.tendencia === "up" && <TrendingUp className="w-4 h-4 text-emerald-500" />}
                            {instrutor.tendencia === "down" && <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="w-4 h-4 text-emerald-500" />
                            {instrutor.promotores}
                          </div>
                          <div className="flex items-center gap-1">
                            <ThumbsDown className="w-4 h-4 text-red-500" />
                            {instrutor.detratores}
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4 text-blue-500" />
                            {instrutor.comentarios}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Promotores vs Detratores</span>
                            <span>{instrutor.totalAvaliacoes} avaliações</span>
                          </div>
                          <div className="h-2 rounded-full bg-muted overflow-hidden flex">
                            <div 
                              className="h-full bg-emerald-500" 
                              style={{ width: `${(instrutor.promotores / instrutor.totalAvaliacoes) * 100}%` }}
                            />
                            <div 
                              className="h-full bg-gray-300" 
                              style={{ width: `${((instrutor.totalAvaliacoes - instrutor.promotores - instrutor.detratores) / instrutor.totalAvaliacoes) * 100}%` }}
                            />
                            <div 
                              className="h-full bg-red-500" 
                              style={{ width: `${(instrutor.detratores / instrutor.totalAvaliacoes) * 100}%` }}
                            />
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
