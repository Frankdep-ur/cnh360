import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, MessageSquare, Send, Search, Bot, 
  User, Clock, CheckCheck, Plus
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AutoescolaBottomNav } from "@/components/layout/AutoescolaBottomNav";
import { cn } from "@/lib/utils";

interface Conversa {
  id: string;
  aluno: string;
  foto: string;
  ultimaMensagem: string;
  horario: Date;
  naoLidas: number;
  isAutomatica: boolean;
}

interface MensagemAutomatica {
  id: string;
  titulo: string;
  gatilho: string;
  ativa: boolean;
}

export default function AutoescolaComunicacao() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"conversas" | "automaticas">("conversas");
  const [searchTerm, setSearchTerm] = useState("");

  // Mock conversas
  const conversas: Conversa[] = [
    { id: "1", aluno: "Maria Silva", foto: "", ultimaMensagem: "Obrigada! Vou fazer o simulado agora", horario: new Date(), naoLidas: 0, isAutomatica: false },
    { id: "2", aluno: "João Santos", foto: "", ultimaMensagem: "Qual horário tem disponível amanhã?", horario: new Date(Date.now() - 1800000), naoLidas: 2, isAutomatica: false },
    { id: "3", aluno: "Ana Oliveira", foto: "", ultimaMensagem: "[Automática] Lembrete: sua prova é amanhã!", horario: new Date(Date.now() - 3600000), naoLidas: 0, isAutomatica: true },
    { id: "4", aluno: "Carlos Pereira", foto: "", ultimaMensagem: "Preciso remarcar minha aula", horario: new Date(Date.now() - 7200000), naoLidas: 1, isAutomatica: false },
  ];

  const mensagensAutomaticas: MensagemAutomatica[] = [
    { id: "1", titulo: "Boas-vindas", gatilho: "Novo cadastro", ativa: true },
    { id: "2", titulo: "Lembrete de aula", gatilho: "24h antes da aula", ativa: true },
    { id: "3", titulo: "Lembrete de prova", gatilho: "48h antes da prova", ativa: true },
    { id: "4", titulo: "Pós-prova (aprovado)", gatilho: "Após aprovação", ativa: true },
    { id: "5", titulo: "Pós-prova (reprovado)", gatilho: "Após reprovação", ativa: false },
    { id: "6", titulo: "Aniversário", gatilho: "Data de nascimento", ativa: false },
  ];

  const getTimeAgo = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  const filteredConversas = conversas.filter(c => 
    c.aluno.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <h1 className="text-2xl font-bold">Comunicação</h1>
              <p className="text-white/80">{conversas.filter(c => c.naoLidas > 0).length} mensagens não lidas</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <MessageSquare className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 py-4 -mt-2">
        <div className="max-w-md mx-auto">
          <div className="flex gap-2 bg-muted p-1 rounded-xl mb-4">
            {[
              { key: "conversas", label: "Conversas", icon: MessageSquare },
              { key: "automaticas", label: "Automáticas", icon: Bot },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as typeof activeTab)}
                  className={cn(
                    "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2",
                    activeTab === tab.key
                      ? "bg-card shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {activeTab === "conversas" && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Buscar conversa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-6">
        <div className="max-w-md mx-auto space-y-3">
          {activeTab === "conversas" ? (
            <>
              {filteredConversas.map((conversa) => (
                <Card 
                  key={conversa.id} 
                  className="hover:shadow-md transition-shadow cursor-pointer"
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={conversa.foto} />
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {conversa.aluno.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold">{conversa.aluno}</h3>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {getTimeAgo(conversa.horario)}
                            </span>
                            {conversa.naoLidas > 0 && (
                              <Badge className="bg-blue-500 text-white text-xs px-1.5 py-0.5">
                                {conversa.naoLidas}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className={cn(
                          "text-sm truncate",
                          conversa.naoLidas > 0 ? "text-foreground font-medium" : "text-muted-foreground"
                        )}>
                          {conversa.isAutomatica && <Bot className="w-3 h-3 inline mr-1" />}
                          {conversa.ultimaMensagem}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button className="w-full" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Nova mensagem em massa
              </Button>
            </>
          ) : (
            <>
              {mensagensAutomaticas.map((msg) => (
                <Card key={msg.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center",
                          msg.ativa ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-400"
                        )}>
                          <Bot className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{msg.titulo}</h3>
                          <p className="text-sm text-muted-foreground">
                            Gatilho: {msg.gatilho}
                          </p>
                        </div>
                      </div>
                      <Badge 
                        variant={msg.ativa ? "default" : "secondary"}
                        className={msg.ativa ? "bg-emerald-500" : ""}
                      >
                        {msg.ativa ? "Ativa" : "Inativa"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Card className="border-dashed border-2 cursor-pointer hover:border-blue-400 transition-colors">
                <CardContent className="py-6 flex flex-col items-center justify-center text-muted-foreground">
                  <Plus className="w-8 h-8 mb-2" />
                  <span className="font-medium">Criar mensagem automática</span>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>

      <AutoescolaBottomNav />
    </div>
  );
}
