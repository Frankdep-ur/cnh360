import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Car, Mail, Lock, User, Eye, EyeOff, GraduationCap, UserCheck, Building2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const userTypeConfig = {
  aluno: { icon: GraduationCap, title: "Aluno", color: "bg-primary" },
  instrutor: { icon: UserCheck, title: "Instrutor", color: "bg-blue-500" },
  autoescola: { icon: Building2, title: "Autoescola", color: "bg-amber-500" },
};

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tipo = searchParams.get("tipo") as keyof typeof userTypeConfig | null;
  const { toast } = useToast();
  const { signIn, signUp, loading: authLoading, user, userRole, roleLoading, setUserRole } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Form fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const typeInfo = tipo && userTypeConfig[tipo] ? userTypeConfig[tipo] : null;

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && !roleLoading && user) {
      if (userRole) {
        const dashboardRoutes: Record<string, string> = {
          aluno: "/aluno",
          instrutor: "/instrutor",
          autoescola: "/autoescola",
          admin: "/admin",
        };
        navigate(dashboardRoutes[userRole] || "/aluno");
      } else if (tipo) {
        // Set role and navigate
        setUserRole(tipo as "aluno" | "instrutor" | "autoescola").then(({ error }) => {
          if (!error) {
            const onboardingRoutes: Record<string, string> = {
              aluno: "/onboarding/aluno",
              instrutor: "/onboarding/instrutor",
              autoescola: "/onboarding/autoescola",
            };
            navigate(onboardingRoutes[tipo] || "/selecionar-tipo");
          }
        });
      } else {
        navigate("/selecionar-tipo");
      }
    }
  }, [user, userRole, authLoading, roleLoading, tipo, navigate, setUserRole]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Preencha todos os campos",
      });
      return;
    }

    if (!isLogin) {
      if (!fullName) {
        toast({
          variant: "destructive",
          title: "Nome obrigatório",
          description: "Informe seu nome completo",
        });
        return;
      }
      if (password !== confirmPassword) {
        toast({
          variant: "destructive",
          title: "Senhas não conferem",
          description: "As senhas digitadas são diferentes",
        });
        return;
      }
      if (password.length < 6) {
        toast({
          variant: "destructive",
          title: "Senha muito curta",
          description: "A senha deve ter pelo menos 6 caracteres",
        });
        return;
      }
    }

    setIsSubmitting(true);
    
    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            variant: "destructive",
            title: "Erro ao entrar",
            description: error.message === "Invalid login credentials" 
              ? "E-mail ou senha incorretos" 
              : error.message,
          });
        }
      } else {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          if (error.message.includes("already registered")) {
            toast({
              variant: "destructive",
              title: "E-mail já cadastrado",
              description: "Este e-mail já está em uso. Tente fazer login.",
            });
          } else {
            toast({
              variant: "destructive",
              title: "Erro ao cadastrar",
              description: error.message,
            });
          }
        } else {
          toast({
            title: "Conta criada!",
            description: "Bem-vindo ao CNH 360!",
          });
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return <LoadingScreen message="Carregando..." />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="gradient-hero text-primary-foreground px-6 pt-12 pb-20 safe-top">
        <div className="max-w-md mx-auto">
          {/* Back Button */}
          <button 
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar</span>
          </button>

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

          {/* Type Badge */}
          {typeInfo && (
            <div className="flex items-center gap-3 mb-4">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white", typeInfo.color)}>
                <typeInfo.icon className="w-5 h-5" />
              </div>
              <span className="text-primary-foreground/90 font-medium">
                Cadastro como {typeInfo.title}
              </span>
            </div>
          )}

          <h2 className="text-2xl font-bold">
            {isLogin ? "Bem-vindo de volta!" : "Crie sua conta"}
          </h2>
          <p className="text-primary-foreground/80 mt-1">
            {isLogin 
              ? "Entre para continuar sua jornada" 
              : "Comece sua habilitação agora mesmo"}
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="flex-1 px-6 -mt-10">
        <div className="max-w-md mx-auto">
          <div className="bg-card rounded-3xl shadow-elevated p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name - Only for signup */}
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-foreground font-medium">
                    Nome completo
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Seu nome completo"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-10 h-12 rounded-xl border-border/50 focus:border-primary"
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground font-medium">
                  E-mail
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 rounded-xl border-border/50 focus:border-primary"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground font-medium">
                  Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 rounded-xl border-border/50 focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password - Only for signup */}
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-foreground font-medium">
                    Confirmar senha
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 pr-10 h-12 rounded-xl border-border/50 focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-14 rounded-2xl text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all mt-6"
              >
                {isSubmitting 
                  ? (isLogin ? "Entrando..." : "Criando conta...") 
                  : (isLogin ? "Entrar" : "Criar conta")}
              </Button>
            </form>

            {/* Toggle Login/Signup */}
            <div className="mt-6 text-center">
              <p className="text-muted-foreground">
                {isLogin ? "Não tem conta?" : "Já tem uma conta?"}
              </p>
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setPassword("");
                  setConfirmPassword("");
                }}
                className="text-primary font-semibold hover:underline mt-1"
              >
                {isLogin ? "Cadastre-se agora" : "Fazer login"}
              </button>
            </div>

            {/* Terms */}
            <p className="text-xs text-muted-foreground text-center mt-6">
              Ao continuar, você concorda com nossos Termos de Uso e Política de Privacidade
            </p>
          </div>

          {/* City Badge */}
          <div className="flex justify-center mt-6 mb-8">
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
