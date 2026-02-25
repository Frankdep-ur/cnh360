import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Car, GraduationCap, Building2, ChevronRight, Shield, Zap, Users, LogOut, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ComplianceBanner } from "@/components/layout/ComplianceBanner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export default function Index() {
  const navigate = useNavigate();
  const {
    user,
    signOut,
    loading: authLoading
  } = useAuth();
  const [showContent, setShowContent] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);

  // Redirecionar usuários autenticados
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setCheckingProfile(false);
      return;
    }

    const checkProfile = async () => {
      try {
        const { data: aluno } = await supabase
          .from("alunos")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();
        if (aluno) { navigate("/aluno", { replace: true }); return; }

        const { data: instrutor } = await supabase
          .from("instrutores")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();
        if (instrutor) { navigate("/instrutor", { replace: true }); return; }

        const { data: autoescola } = await supabase
          .from("autoescolas")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();
        if (autoescola) { navigate("/autoescola", { replace: true }); return; }

        // Sem perfil → completar onboarding
        navigate("/auth", { replace: true });
      } catch (error) {
        console.error("Erro ao verificar perfil:", error);
        setCheckingProfile(false);
      }
    };

    checkProfile();
  }, [user, authLoading, navigate]);

  // Animação de entrada simples
  useEffect(() => {
    if (!authLoading && !checkingProfile) {
      const timer = setTimeout(() => setShowContent(true), 100);
      return () => clearTimeout(timer);
    }
  }, [authLoading, checkingProfile]);
  const handleLogout = async () => {
    try {
      await signOut();
      window.location.href = "/";
    } catch (error) {
      console.error("Erro ao sair:", error);
      window.location.href = "/";
    }
  };
  const userTypes = [{
    id: "aluno",
    icon: GraduationCap,
    title: "Sou Aluno",
    description: "Quero tirar ou renovar minha CNH",
    color: "primary",
    path: "/auth?type=aluno"
  }, {
    id: "instrutor",
    icon: Car,
    title: "Sou Instrutor",
    description: "Quero dar aulas e aumentar minha renda",
    color: "secondary",
    path: "/auth?type=instrutor"
  }, {
    id: "autoescola",
    icon: Building2,
    title: "Sou Autoescola",
    description: "Quero captar alunos e gerenciar turmas",
    color: "accent",
    path: "/auth?type=autoescola"
  }];
  const features = [{
    icon: Zap,
    text: "Agende aulas de forma rápida e fácil"
  }, {
    icon: Shield,
    text: "Instrutores verificados pelo DETRAN"
  }, {
    icon: Users,
    text: "Conecte-se com os melhores profissionais"
  }];
  if (authLoading || checkingProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  return <div className="min-h-screen bg-background flex flex-col">
      {/* Compliance Banner */}
      <ComplianceBanner variant="full" />
      {/* Hero Section */}
      <div className="gradient-hero text-primary-foreground px-6 pt-12 pb-12 safe-top">
        <div className={cn("max-w-md mx-auto transition-all duration-700", showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")}>
          {/* Header com Logo */}
          <div className="flex items-start justify-between mb-6">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center">
                <Car className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">CNH 360</h1>
                
              </div>
            </div>

            {/* Logout Button when logged in */}
            {user && <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary-foreground/20 hover:bg-primary-foreground/30 transition-colors text-sm font-medium">
                <LogOut className="w-4 h-4" />
                Sair
              </button>}
          </div>

          {/* Headline */}
          <h2 className="text-3xl font-bold leading-tight mb-4">
            Sua habilitação mais rápida, barata e transparente
          </h2>
          <p className="text-primary-foreground/90 text-base mb-6">
            Encontre instrutores qualificados e agende suas aulas com facilidade
          </p>

          {/* Features */}
          <div className="space-y-3">
            {features.map((feature, index) => <div key={index} className={cn("flex items-center gap-3 transition-all duration-500", showContent ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4")} style={{
            transitionDelay: `${200 + index * 100}ms`
          }}>
                <div className="w-8 h-8 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
                  <feature.icon className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">{feature.text}</span>
              </div>)}
          </div>
        </div>
      </div>

      {/* User Type Selection */}
      <div className="flex-1 px-6 -mt-2">
        <div className="max-w-md mx-auto">
          <div className={cn("bg-card rounded-3xl shadow-elevated p-6 transition-all duration-500", showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8")} style={{
          transitionDelay: "400ms"
        }}>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Como você quer usar o CNH 360?
            </h3>

            <div className="space-y-3">
              {userTypes.map((type, index) => {
              const Icon = type.icon;
              const isSecondary = type.color === "secondary";
              return <button key={type.id} onClick={() => navigate(type.path)} className={cn("w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200", "hover:border-primary/50 hover:bg-muted/50 active:scale-[0.98]", "border-border bg-background")} style={{
                animationDelay: `${500 + index * 100}ms`
              }}>
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", isSecondary ? "bg-secondary/10 text-secondary" : "bg-primary/10 text-primary")}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="font-semibold text-foreground">{type.title}</h4>
                      <p className="text-sm text-muted-foreground">{type.description}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </button>;
            })}
            </div>
          </div>


          {/* Footer - Login */}
          <div className={cn("text-center py-8 transition-all duration-500", showContent ? "opacity-100" : "opacity-0")} style={{
          transitionDelay: "700ms"
        }}>
            <p className="text-sm text-muted-foreground mb-3">
              Já tem uma conta?
            </p>
            <Button variant="outline" size="lg" className="font-semibold" onClick={() => navigate("/auth")}>
              Fazer login
            </Button>
          </div>

          {/* Legal Links */}
          <div className={cn("flex flex-col items-center gap-4 pb-8 transition-all duration-500", showContent ? "opacity-100" : "opacity-0")} style={{
          transitionDelay: "800ms"
        }}>
            <div className="flex justify-center gap-6">
              <button onClick={() => navigate("/politica-de-privacidade")} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Política de Privacidade
              </button>
              <button onClick={() => navigate("/termos-de-uso")} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Termos de Uso
              </button>
            </div>
            <a href="mailto:360cnh@gmail.com" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              Contato: 360cnh@gmail.com
            </a>
          </div>
        </div>
      </div>

      {/* Botão Flutuante WhatsApp */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => {
                const phone = "5518981288372";
                const message = encodeURIComponent("Olá! Gostaria de saber mais sobre a CNH360.");
                window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
              }}
            className={cn(
              "fixed bottom-6 right-6 z-50",
              "w-14 h-14 rounded-full",
              "bg-[#25D366] hover:bg-[#20bd5a]",
              "flex items-center justify-center",
              "shadow-lg hover:shadow-xl",
              "transition-all duration-300",
              "hover:scale-110",
              "animate-bounce-subtle",
              showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
              style={{ transitionDelay: "900ms" }}
              aria-label="Falar no WhatsApp"
            >
              <MessageCircle className="w-7 h-7 text-white" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="left" className="bg-foreground text-background">
            <p>Fale conosco</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>;
}