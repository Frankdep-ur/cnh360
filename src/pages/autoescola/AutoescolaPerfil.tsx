import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Building2, MapPin, Phone, Mail, 
  FileText, Settings, LogOut, Crown, ChevronRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AutoescolaBottomNav } from "@/components/layout/AutoescolaBottomNav";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export default function AutoescolaPerfil() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  // Mock dados
  const autoescola = {
    nome: "Autoescola Araçatuba",
    cnpj: "12.345.678/0001-90",
    credencial: "CFC-SP-12345",
    cidade: "Araçatuba",
    estado: "SP",
    telefone: "(18) 3621-1234",
    email: "contato@autoescola.com",
    responsavel: "João da Silva",
    plano: "Gratuito",
  };

  const menuItems = [
    { icon: Building2, label: "Dados da empresa", path: "/autoescola/configuracoes/empresa" },
    { icon: FileText, label: "Credencial DETRAN", path: "/autoescola/configuracoes/credencial" },
    { icon: Crown, label: "Upgrade para Premium", path: "/autoescola/planos", highlight: true },
    { icon: Settings, label: "Configurações", path: "/autoescola/configuracoes" },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate("/");
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
          
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16 border-2 border-white/30">
              <AvatarFallback className="bg-white/20 text-white text-xl">
                {autoescola.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl font-bold">{autoescola.nome}</h1>
              <div className="flex items-center gap-2 mt-1">
                <MapPin className="w-4 h-4 text-white/80" />
                <span className="text-white/80">{autoescola.cidade}-{autoescola.estado}</span>
              </div>
            </div>
          </div>

          {/* Plano Badge */}
          <div className="mt-4 p-3 bg-white/10 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-sm text-white/80">Plano atual</p>
              <p className="font-semibold">{autoescola.plano}</p>
            </div>
            <Button 
              size="sm" 
              className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0"
              onClick={() => navigate("/autoescola/planos")}
            >
              <Crown className="w-4 h-4 mr-1" />
              Upgrade
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-4 -mt-2">
        <div className="max-w-md mx-auto space-y-4">
          {/* Info Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Informações da empresa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">CNPJ</span>
                <span className="text-sm font-medium">{autoescola.cnpj}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">Credencial DETRAN</span>
                <span className="text-sm font-medium">{autoescola.credencial}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">Responsável</span>
                <span className="text-sm font-medium">{autoescola.responsavel}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">Telefone</span>
                <span className="text-sm font-medium">{autoescola.telefone}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">E-mail</span>
                <span className="text-sm font-medium">{autoescola.email}</span>
              </div>
            </CardContent>
          </Card>

          {/* Menu Items */}
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-xl transition-all",
                        item.highlight 
                          ? "bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100"
                          : "hover:bg-muted/50"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center",
                        item.highlight 
                          ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white"
                          : "bg-emerald-100 text-emerald-600"
                      )}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={cn(
                        "flex-1 text-left font-medium",
                        item.highlight && "text-amber-700"
                      )}>
                        {item.label}
                      </span>
                      <ChevronRight className={cn(
                        "w-5 h-5",
                        item.highlight ? "text-amber-500" : "text-muted-foreground"
                      )} />
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Logout */}
          <Button 
            variant="outline" 
            className="w-full text-red-600 border-red-200 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair da conta
          </Button>
        </div>
      </div>

      <AutoescolaBottomNav />
    </div>
  );
}
