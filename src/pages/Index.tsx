import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Car, GraduationCap, Building2, ChevronRight, Shield, Zap, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ComplianceBanner } from "@/components/layout/ComplianceBanner";
import { BannerModoTransicao } from "@/components/transicao/BannerModoTransicao";
import { ContadorTransicao } from "@/components/transicao/ContadorTransicao";
import { useModoTransicao } from "@/contexts/ModoTransicaoContext";
import { cn } from "@/lib/utils";

export default function Index() {
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);
  const { modo, isSP, config } = useModoTransicao();

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
      description: modo === "nova_lei" 
        ? "Instrutor MEI ou de autoescola" 
        : "Quero dar aulas e aumentar minha renda",
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

  // Features baseadas no modo selecionado
  const featuresNovaLei = [
    { icon: Zap, text: "Apenas 2h de aula prática obrigatória" },
    { icon: Shield, text: "Instrutores MEI verificados pelo DETRAN" },
    { icon: Users, text: "Use seu próprio carro nas aulas" },
  ];

  const featuresModoAtual = [
    { icon: Clock, text: "20-25h de aula prática obrigatória" },
    { icon: Shield, text: "Instrutores de CFC verificados" },
    { icon: Building2, text: "Veículo da autoescola" },
  ];

  const features = modo === "nova_lei" ? featuresNovaLei : (modo === "atual" ? featuresModoAtual : featuresNovaLei);

  // Headline baseada no modo
  const getHeadline = () => {
    if (modo === "nova_lei") {
      return {
        title: "Sua CNH por R$ 799",
        subtitle: "Nova Lei CONTRAN 1.020: apenas 2 horas de aula prática!"
      };
    }
    if (modo === "atual") {
      return {
        title: "Sua habilitação completa",
        subtitle: "Processo tradicional com 20-25h de aula prática"
      };
    }
    return {
      title: "Sua habilitação mais rápida, barata e transparente",
      subtitle: "Aproveite a nova lei CONTRAN 1.020: agora você precisa de apenas 2 horas de aula prática!"
    };
  };

  const headline = getHeadline();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Compliance Banner */}
      <ComplianceBanner variant="full" />

      {/* Banner Transição SP - Aparece se em SP e não tem modo selecionado */}
      {isSP && !modo && (
        <BannerModoTransicao showFullBanner={true} />
      )}

      {/* Hero Section */}
      <div className={cn(
        "text-primary-foreground px-6 pt-12 pb-12 safe-top",
        modo === "nova_lei" ? "gradient-primary" : modo === "atual" ? "gradient-secondary" : "gradient-hero"
      )}>
        <div className={cn(
          "max-w-md mx-auto transition-all duration-700",
          showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
          {/* Header com Logo e Contador */}
          <div className="flex items-start justify-between mb-6">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center">
                <Car className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">CNH 360</h1>
                <p className="text-primary-foreground/80 text-sm">O iFood das autoescolas</p>
              </div>
            </div>

            {/* Contador de Transição - Compacto no header */}
            {isSP && modo && (
              <div className="bg-primary-foreground/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <p className="text-xs font-medium text-primary-foreground">
                  {config.label}
                </p>
              </div>
            )}
          </div>

          {/* Headline */}
          <h2 className="text-3xl font-bold leading-tight mb-4">
            {headline.title}
          </h2>
          <p className="text-primary-foreground/90 text-base mb-6">
            {headline.subtitle}
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

          {/* Preço destacado */}
          {modo && (
            <div className={cn(
              "mt-6 p-4 rounded-2xl bg-primary-foreground/10 backdrop-blur-sm",
              "transition-all duration-500",
              showContent ? "opacity-100" : "opacity-0"
            )}
            style={{ transitionDelay: "500ms" }}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-primary-foreground/80">Preço médio</span>
                <span className="text-2xl font-bold">
                  {modo === "nova_lei" 
                    ? `R$ ${config.precoSugerido.min}` 
                    : `R$ ${config.precoSugerido.min} - ${config.precoSugerido.max}`
                  }
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Indicador de modo selecionado - Banner compacto */}
      {isSP && modo && (
        <div className={cn(
          "mx-4 -mt-4 mb-2 p-3 rounded-xl border flex items-center justify-between",
          modo === "nova_lei" 
            ? "bg-primary/5 border-primary/20" 
            : "bg-secondary/5 border-secondary/20"
        )}>
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-2 h-2 rounded-full animate-pulse",
              modo === "nova_lei" ? "bg-primary" : "bg-secondary"
            )} />
            <span className="text-sm font-medium">
              Você está no {config.label}
            </span>
          </div>
          <ContadorTransicao compact />
        </div>
      )}

      {/* User Type Selection */}
      <div className="flex-1 px-6 -mt-2">
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

          {/* Botão para trocar modo */}
          {isSP && modo && (
            <div className={cn(
              "flex justify-center mt-4 transition-all duration-500",
              showContent ? "opacity-100" : "opacity-0"
            )}
            style={{ transitionDelay: "550ms" }}
            >
              <Button 
                variant="ghost" 
                size="sm"
                className="text-muted-foreground"
                onClick={() => {
                  // Abrir modal ou navegar para configurações
                  const novoModo = modo === "nova_lei" ? "atual" : "nova_lei";
                  // Aqui você pode adicionar um modal de confirmação
                }}
              >
                Mudar para {modo === "nova_lei" ? "Modo Tradicional" : "Modo Nova Lei"}
              </Button>
            </div>
          )}

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
