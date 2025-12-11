import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Car, Shield, Zap, Users, GraduationCap, UserCheck, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ComplianceBanner } from "@/components/layout/ComplianceBanner";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export default function Index() {
  const navigate = useNavigate();
  const { user, loading, userRole, roleLoading } = useAuth();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Redirect logged in users
  useEffect(() => {
    if (!loading && !roleLoading && user) {
      if (!userRole) {
        navigate("/selecionar-tipo");
      } else {
        const dashboardRoutes: Record<string, string> = {
          aluno: "/aluno",
          instrutor: "/instrutor",
          autoescola: "/autoescola",
          admin: "/admin",
        };
        navigate(dashboardRoutes[userRole] || "/aluno");
      }
    }
  }, [user, loading, userRole, roleLoading, navigate]);

  const features = [
    { icon: Zap, text: "Apenas 2h de aula prática obrigatória" },
    { icon: Shield, text: "Instrutores verificados pelo DETRAN" },
    { icon: Users, text: "Use seu próprio carro nas aulas" },
    { icon: Car, text: "EAD 100% grátis e flexível" },
  ];

  const userTypes = [
    { 
      id: "aluno", 
      icon: GraduationCap, 
      title: "Sou Aluno", 
      description: "Quero tirar ou renovar minha CNH",
      color: "bg-primary"
    },
    { 
      id: "instrutor", 
      icon: UserCheck, 
      title: "Sou Instrutor", 
      description: "Quero dar aulas e ganhar mais",
      color: "bg-blue-500"
    },
    { 
      id: "autoescola", 
      icon: Building2, 
      title: "Sou Autoescola", 
      description: "Quero gerenciar minha autoescola",
      color: "bg-amber-500"
    },
  ];

  if (loading) {
    return <LoadingScreen message="Carregando..." />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ComplianceBanner variant="full" />

      {/* Hero Section */}
      <div className="gradient-hero text-primary-foreground px-6 pt-12 pb-16 safe-top">
        <div className={cn(
          "max-w-md mx-auto transition-all duration-700",
          showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center">
              <Car className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">CNH 360</h1>
              <p className="text-primary-foreground/80 text-sm">O iFood das autoescolas</p>
            </div>
          </div>

          {/* Headline */}
          <h2 className="text-3xl font-bold leading-tight mb-4">
            Sua habilitação mais rápida, barata e transparente
          </h2>
          <p className="text-primary-foreground/90 text-base mb-8">
            Aproveite a nova lei CONTRAN 1.020: agora você precisa de apenas 2 horas de aula prática!
          </p>

          {/* Features */}
          <div className="space-y-3">
            {features.map((feature, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-center gap-3 transition-all duration-500",
                  showContent ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                )}
                style={{ transitionDelay: `${200 + index * 100}ms` }}
              >
                <div className="w-8 h-8 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
                  <feature.icon className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Type Selection */}
      <div className="flex-1 px-6 -mt-8">
        <div className="max-w-md mx-auto">
          <div className={cn(
            "bg-card rounded-3xl shadow-elevated p-6 transition-all duration-500",
            showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
          style={{ transitionDelay: "400ms" }}
          >
            <h3 className="text-xl font-bold text-foreground mb-2 text-center">
              Como você quer usar o CNH 360?
            </h3>
            <p className="text-muted-foreground text-center mb-6">
              Selecione seu perfil para começar
            </p>

            <div className="space-y-3">
              {userTypes.map((type, index) => (
                <Button
                  key={type.id}
                  onClick={() => navigate(`/auth?tipo=${type.id}`)}
                  variant="outline"
                  className={cn(
                    "w-full h-auto py-4 px-4 rounded-2xl border-2 hover:border-primary/50 transition-all duration-300 flex items-center gap-4 justify-start",
                    showContent ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
                  )}
                  style={{ transitionDelay: `${500 + index * 100}ms` }}
                >
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white", type.color)}>
                    <type.icon className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-foreground">{type.title}</p>
                    <p className="text-sm text-muted-foreground">{type.description}</p>
                  </div>
                </Button>
              ))}
            </div>

            <p className="text-xs text-muted-foreground text-center mt-6">
              Ao continuar, você concorda com nossos Termos de Uso e Política de Privacidade
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}