import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Car, GraduationCap, Building2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type RoleOption = "aluno" | "instrutor" | "autoescola";

export default function SelecionarTipo() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading, userRole, roleLoading, setUserRole, signOut } = useAuth();
  const [showContent, setShowContent] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleOption | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Redirect if not logged in or already has role
  useEffect(() => {
    if (!loading && !roleLoading) {
      if (!user) {
        navigate("/");
      } else if (userRole) {
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

  const handleSelectRole = async (role: RoleOption) => {
    setSelectedRole(role);
    setIsSaving(true);

    try {
      const { error } = await setUserRole(role);

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao salvar",
          description: error.message,
        });
        setSelectedRole(null);
        return;
      }

      toast({
        title: "Tipo de conta definido!",
        description: "Redirecionando para o dashboard...",
      });

      // Navigate to onboarding for the selected role
      setTimeout(() => {
        navigate(`/onboarding/${role}`);
      }, 500);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const roleOptions = [
    {
      id: "aluno" as RoleOption,
      icon: GraduationCap,
      title: "Sou Aluno",
      description: "Quero tirar ou renovar minha CNH",
      gradient: "from-[#00BFFF] to-[#003087]",
      iconBg: "bg-[#00BFFF]",
    },
    {
      id: "instrutor" as RoleOption,
      icon: Car,
      title: "Sou Instrutor",
      description: "Quero dar aulas e aumentar minha renda",
      gradient: "from-[#003087] to-[#00BFFF]",
      iconBg: "bg-[#003087]",
    },
    {
      id: "autoescola" as RoleOption,
      icon: Building2,
      title: "Sou Autoescola",
      description: "Quero captar alunos e gerenciar turmas",
      gradient: "from-[#00BFFF] to-[#003087]",
      iconBg: "bg-[#00BFFF]",
    },
  ];

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#003087] to-[#00BFFF] flex flex-col">
      {/* Header with user info */}
      <header className="px-6 pt-8 pb-4 safe-top">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {user?.user_metadata?.avatar_url && (
              <img
                src={user.user_metadata.avatar_url}
                alt="Foto de perfil"
                className="w-12 h-12 rounded-full border-2 border-white/30"
              />
            )}
            <div className="text-white">
              <p className="text-sm opacity-80">Bem-vindo(a),</p>
              <p className="font-semibold">
                {user?.user_metadata?.full_name || user?.user_metadata?.name || "Usuário"}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            className="text-white/80 hover:text-white hover:bg-white/10"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 px-6 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full">
          <div className={cn(
            "text-center mb-8 transition-all duration-500",
            showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}>
            <h1 className="text-3xl font-bold text-white mb-2">
              Como você quer usar o CNH 360?
            </h1>
            <p className="text-white/80">
              Selecione seu tipo de conta para continuar
            </p>
          </div>

          {/* Role Cards */}
          <div className="space-y-4">
            {roleOptions.map((option, index) => {
              const Icon = option.icon;
              const isSelected = selectedRole === option.id;

              return (
                <button
                  key={option.id}
                  onClick={() => handleSelectRole(option.id)}
                  disabled={isSaving}
                  className={cn(
                    "w-full bg-white rounded-3xl p-6 flex items-center gap-4 transition-all duration-300",
                    "hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                  )}
                  style={{ transitionDelay: `${200 + index * 100}ms` }}
                >
                  <div className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center text-white",
                    option.iconBg
                  )}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-xl font-bold text-[#003087]">{option.title}</h3>
                    <p className="text-muted-foreground">{option.description}</p>
                  </div>
                  {isSelected && isSaving && (
                    <div className="w-6 h-6 border-2 border-[#00BFFF] border-t-transparent rounded-full animate-spin" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className={cn(
        "px-6 pb-8 text-center transition-all duration-500",
        showContent ? "opacity-100" : "opacity-0"
      )}
      style={{ transitionDelay: "600ms" }}
      >
        <p className="text-white/60 text-sm">
          Essa escolha não pode ser alterada depois
        </p>
      </div>
    </div>
  );
}