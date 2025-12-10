import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Car, GraduationCap, Building2, ChevronRight, Shield, Zap, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ComplianceBanner } from "@/components/layout/ComplianceBanner";
import { cn } from "@/lib/utils";

export default function Index() {
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const userTypes = [
    {
      id: "aluno",
      icon: GraduationCap,
      title: "Sou Aluno",
      description: "Quero tirar ou renovar minha CNH",
      color: "primary",
      path: "/auth?type=aluno",
    },
    {
      id: "instrutor",
      icon: Car,
      title: "Sou Instrutor",
      description: "Quero dar aulas e aumentar minha renda",
      color: "secondary",
      path: "/auth?type=instrutor",
    },
    {
      id: "autoescola",
      icon: Building2,
      title: "Sou Autoescola",
      description: "Quero captar alunos e gerenciar turmas",
      color: "accent",
      path: "/auth?type=autoescola",
    },
  ];

  const features = [
    { icon: Zap, text: "Apenas 2h de aula prática obrigatória" },
    { icon: Shield, text: "Instrutores verificados pelo DETRAN" },
    { icon: Users, text: "Use seu próprio carro nas aulas" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Compliance Banner */}
      <ComplianceBanner variant="full" />

      {/* Hero Section */}
      <div className="gradient-hero text-primary-foreground px-6 pt-12 pb-12 safe-top">
        <div className={cn(
          "max-w-md mx-auto transition-all duration-700",
          showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
          {/* Logo */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center">
              <Car className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">CNH 360</h1>
              <p className="text-primary-foreground/80 text-sm">O iFood das autoescolas</p>
            </div>
          </div>

          {/* Headline */}
          <h2 className="text-3xl font-bold leading-tight mb-4">
            Sua habilitação mais rápida, barata e transparente
          </h2>
          <p className="text-primary-foreground/90 text-base mb-6">
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
      <div className="flex-1 px-6 -mt-6">
        <div className="max-w-md mx-auto">
          <div className={cn(
            "bg-card rounded-3xl shadow-elevated p-6 transition-all duration-500",
            showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
          style={{ transitionDelay: "400ms" }}
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Como você quer usar o CNH 360?
            </h3>

            <div className="space-y-3">
              {userTypes.map((type, index) => {
                const Icon = type.icon;
                const isSecondary = type.color === "secondary";
                
                return (
                  <button
                    key={type.id}
                    onClick={() => navigate(type.path)}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200",
                      "hover:border-primary/50 hover:bg-muted/50 active:scale-[0.98]",
                      "border-border bg-background"
                    )}
                    style={{ animationDelay: `${500 + index * 100}ms` }}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      isSecondary ? "bg-secondary/10 text-secondary" : "bg-primary/10 text-primary"
                    )}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="font-semibold text-foreground">{type.title}</h4>
                      <p className="text-sm text-muted-foreground">{type.description}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* City Pilot Badge - Inline */}
          <div className={cn(
            "flex justify-center mt-6 transition-all duration-500",
            showContent ? "opacity-100" : "opacity-0"
          )}
          style={{ transitionDelay: "600ms" }}
          >
            <div className="bg-foreground/90 text-background px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              Disponível em Araçatuba/SP
            </div>
          </div>

          {/* Footer - Login */}
          <div className={cn(
            "text-center py-8 transition-all duration-500",
            showContent ? "opacity-100" : "opacity-0"
          )}
          style={{ transitionDelay: "700ms" }}
          >
            <p className="text-sm text-muted-foreground mb-3">
              Já tem uma conta?
            </p>
            <Button 
              variant="outline" 
              size="lg"
              className="font-semibold"
              onClick={() => navigate("/auth")}
            >
              Fazer login
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
