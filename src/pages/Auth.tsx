import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { z } from "zod";
import { Car, GraduationCap, Building2, ArrowLeft, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const emailSchema = z.string().email("Email inválido");
const passwordSchema = z.string().min(6, "Senha deve ter no mínimo 6 caracteres");
const nameSchema = z.string().min(2, "Nome deve ter no mínimo 2 caracteres");

type UserType = "aluno" | "instrutor" | "autoescola";
type AuthMode = "login" | "signup";

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user, signIn, signUp, loading: authLoading } = useAuth();
  
  const [userType, setUserType] = useState<UserType>("aluno");
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; name?: string }>({});

  // Get userType from query params if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const type = params.get("type");
    if (type === "aluno" || type === "instrutor" || type === "autoescola") {
      setUserType(type);
    }
  }, [location.search]);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      // Check if user has completed onboarding - for now redirect to onboarding
      navigate(`/onboarding/${userType}`);
    }
  }, [user, authLoading, navigate, userType]);

  const validate = () => {
    const newErrors: typeof errors = {};
    
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }
    
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message;
    }
    
    if (mode === "signup") {
      const nameResult = nameSchema.safeParse(name);
      if (!nameResult.success) {
        newErrors.name = nameResult.error.errors[0].message;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setLoading(true);
    
    try {
      if (mode === "signup") {
        const { error } = await signUp(email, password, name);
        
        if (error) {
          if (error.message.includes("already registered")) {
            toast({
              variant: "destructive",
              title: "Email já cadastrado",
              description: "Tente fazer login ou use outro email.",
            });
          } else {
            toast({
              variant: "destructive",
              title: "Erro ao criar conta",
              description: error.message,
            });
          }
          return;
        }
        
        toast({
          title: "Conta criada!",
          description: "Redirecionando para o cadastro...",
        });
        
        // Will redirect via useEffect when user state updates
      } else {
        const { error } = await signIn(email, password);
        
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast({
              variant: "destructive",
              title: "Credenciais inválidas",
              description: "Verifique seu email e senha.",
            });
          } else {
            toast({
              variant: "destructive",
              title: "Erro ao entrar",
              description: error.message,
            });
          }
          return;
        }
        
        toast({
          title: "Bem-vindo de volta!",
          description: "Entrando na sua conta...",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="px-6 pt-6 pb-4 safe-top">
        <div className="max-w-md mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-foreground">
            {mode === "login" ? "Entrar" : "Criar conta"}
          </h1>
        </div>
      </header>

      <div className="flex-1 px-6 pb-8">
        <div className="max-w-md mx-auto">
          {/* User Type Selector */}
          <div className="grid grid-cols-3 gap-2 mb-8">
            <button
              onClick={() => setUserType("aluno")}
              className={cn(
                "flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all",
                userType === "aluno"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                userType === "aluno" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>
                <Car className="w-5 h-5" />
              </div>
              <span className={cn(
                "font-medium text-sm",
                userType === "aluno" ? "text-primary" : "text-muted-foreground"
              )}>
                Aluno
              </span>
            </button>

            <button
              onClick={() => setUserType("instrutor")}
              className={cn(
                "flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all",
                userType === "instrutor"
                  ? "border-secondary bg-secondary/5"
                  : "border-border hover:border-secondary/50"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                userType === "instrutor" ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground"
              )}>
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className={cn(
                "font-medium text-sm",
                userType === "instrutor" ? "text-secondary" : "text-muted-foreground"
              )}>
                Instrutor
              </span>
            </button>

            <button
              onClick={() => setUserType("autoescola")}
              className={cn(
                "flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all",
                userType === "autoescola"
                  ? "border-emerald-500 bg-emerald-500/5"
                  : "border-border hover:border-emerald-500/50"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                userType === "autoescola" ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"
              )}>
                <Building2 className="w-5 h-5" />
              </div>
              <span className={cn(
                "font-medium text-sm",
                userType === "autoescola" ? "text-emerald-500" : "text-muted-foreground"
              )}>
                Autoescola
              </span>
            </button>
          </div>

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Nome completo
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-14 pl-12 rounded-xl"
                  />
                </div>
                {errors.name && (
                  <p className="text-destructive text-sm mt-1">{errors.name}</p>
                )}
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-14 pl-12 rounded-xl"
                />
              </div>
              {errors.email && (
                <p className="text-destructive text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-14 pl-12 pr-12 rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-destructive text-sm mt-1">{errors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              variant={userType === "aluno" ? "hero" : userType === "instrutor" ? "hero-secondary" : "default"}
              size="xl"
              className={cn("w-full mt-6", userType === "autoescola" && "bg-emerald-500 hover:bg-emerald-600 text-white")}
              disabled={loading}
            >
              {loading ? "Carregando..." : mode === "login" ? "Entrar" : "Criar conta"}
            </Button>
          </form>

          {/* Toggle Mode */}
          <div className="mt-6 text-center">
            <button
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {mode === "login" ? (
                <>
                  Não tem conta?{" "}
                  <span className={cn(
                    "font-semibold",
                    userType === "aluno" ? "text-primary" : userType === "instrutor" ? "text-secondary" : "text-emerald-500"
                  )}>
                    Criar agora
                  </span>
                </>
              ) : (
                <>
                  Já tem conta?{" "}
                  <span className={cn(
                    "font-semibold",
                    userType === "aluno" ? "text-primary" : userType === "instrutor" ? "text-secondary" : "text-emerald-500"
                  )}>
                    Entrar
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
