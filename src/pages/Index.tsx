import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Car, Shield, Zap, Users } from "lucide-react";
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

      {/* CTA Section */}
      <div className="flex-1 px-6 -mt-8">
        <div className="max-w-md mx-auto">
          <div className={cn(
            "bg-card rounded-3xl shadow-elevated p-8 transition-all duration-500",
            showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
          style={{ transitionDelay: "400ms" }}
          >
            <h3 className="text-xl font-bold text-foreground mb-2 text-center">
              Comece sua jornada
            </h3>
            <p className="text-muted-foreground text-center mb-6">
              Cadastre-se gratuitamente e tire sua CNH
            </p>

            <Button
              onClick={() => navigate("/auth")}
              className="w-full h-14 rounded-2xl text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all"
            >
              Começar agora
            </Button>

            <p className="text-xs text-muted-foreground text-center mt-4">
              Ao continuar, você concorda com nossos Termos de Uso e Política de Privacidade
            </p>
          </div>

          {/* City Pilot Badge */}
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
        </div>
      </div>
    </div>
  );
}