import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { z } from "zod";
import { Car, GraduationCap, Building2, ArrowLeft, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { lovable } from "@/integrations/lovable/index";

// Ícone do Google com cores oficiais
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const emailSchema = z.string().email("Email inválido");
const passwordSchema = z.string().min(6, "Senha deve ter no mínimo 6 caracteres");
const nameSchema = z.string().min(2, "Nome deve ter no mínimo 2 caracteres");

type UserType = "aluno" | "instrutor" | "autoescola" | null;
type AuthMode = "login" | "signup";
type Step = "select-type" | "form";

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user, signIn, signUp, loading: authLoading } = useAuth();
  
  const [userType, setUserType] = useState<UserType>(null);
  const [mode, setMode] = useState<AuthMode>("login");
  const [step, setStep] = useState<Step>("select-type");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; name?: string }>({});
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Get userType from query params if present

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao entrar com Google",
          description: error.message,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao entrar com Google",
        description: "Tente novamente.",
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const type = params.get("type");
    if (type === "aluno" || type === "instrutor" || type === "autoescola") {
      setUserType(type);
      setStep("form");
    }
  }, [location.search]);

  // Redirect after login/signup when user is authenticated
  useEffect(() => {
    if (user && !authLoading && userType && !isRedirecting) {
      checkProfileAndRedirect();
    }
  }, [user, authLoading, userType, isRedirecting]);

  const checkProfileAndRedirect = async () => {
    if (!user || !userType || isRedirecting) return;
    
    setIsRedirecting(true);

    try {
      // Check if user has a profile for the selected type
      if (userType === "aluno") {
        const { data: aluno } = await supabase
          .from("alunos")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();
        
        if (aluno) {
          navigate("/aluno", { replace: true });
        } else {
          navigate("/onboarding/aluno", { replace: true });
        }
      } else if (userType === "instrutor") {
        const { data: instrutor } = await supabase
          .from("instrutores")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();
        
        if (instrutor) {
          navigate("/instrutor", { replace: true });
        } else {
          navigate("/onboarding/instrutor", { replace: true });
        }
      } else if (userType === "autoescola") {
        const { data: autoescola } = await supabase
          .from("autoescolas")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();
        
        if (autoescola) {
          navigate("/autoescola", { replace: true });
        } else {
          navigate("/onboarding/autoescola", { replace: true });
        }
      }
    } catch (error) {
      console.error("Error checking profile:", error);
      // Fallback to onboarding
      navigate(`/onboarding/${userType}`, { replace: true });
    }
  };

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

  const handleSelectType = (type: "aluno" | "instrutor" | "autoescola") => {
    setUserType(type);
    setStep("form");
  };

  const handleBack = () => {
    if (step === "form") {
      setStep("select-type");
      setUserType(null);
    } else {
      navigate("/");
    }
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
          } else if (error.message.toLowerCase().includes("weak") || error.message.toLowerCase().includes("password") || error.message.toLowerCase().includes("guess")) {
            toast({
              variant: "destructive",
              title: "Senha muito comum",
              description: "Essa senha é muito usada e não é segura. Tente adicionar números ou caracteres diferentes. Ex: MinhaSenh@123",
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

  // Handle quick login without selecting profile type first
  const handleQuickLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: typeof errors = {};
    
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }
    
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message;
    }
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    
    setLoading(true);
    
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setErrors({ email: "Credenciais inválidas. Verifique seu email e senha." });
          toast({
            variant: "destructive",
            title: "Credenciais inválidas",
            description: "Verifique seu email e senha.",
          });
        } else {
          setErrors({ email: error.message });
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
      
      // After successful login, check all profile types and redirect to the correct one
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        // Check aluno
        const { data: aluno } = await supabase.from("alunos").select("id").eq("user_id", currentUser.id).maybeSingle();
        if (aluno) {
          navigate("/aluno", { replace: true });
          return;
        }
        
        // Check instrutor
        const { data: instrutor } = await supabase.from("instrutores").select("id").eq("user_id", currentUser.id).maybeSingle();
        if (instrutor) {
          navigate("/instrutor", { replace: true });
          return;
        }
        
        // Check autoescola
        const { data: autoescola } = await supabase.from("autoescolas").select("id").eq("user_id", currentUser.id).maybeSingle();
        if (autoescola) {
          navigate("/autoescola", { replace: true });
          return;
        }
        
        // No profile found, let user select type for onboarding
        toast({
          title: "Selecione seu perfil",
          description: "Complete seu cadastro escolhendo seu perfil abaixo.",
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

  // Step 1: Select user type with quick login form
  if (step === "select-type") {
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

        <div className="flex-1 px-6 pb-8 overflow-y-auto">
          <div className="max-w-md mx-auto w-full">
            
            {/* Quick Login Form - shown only in login mode */}
            {mode === "login" && (
              <div className="mb-8">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Entre na sua conta
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    Acesse com seu email e senha
                  </p>
                </div>

                <form onSubmit={handleQuickLogin} className="space-y-4">
                  {/* Google Sign In Button - Destacado */}
                  <Button
                    type="button"
                    size="xl"
                    className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-primary shadow-md hover:shadow-lg transition-all duration-200"
                    disabled={googleLoading || loading}
                    onClick={handleGoogleSignIn}
                  >
                    {googleLoading ? (
                      "Conectando..."
                    ) : (
                      <>
                        <GoogleIcon />
                        Continuar com Google
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Rápido e seguro
                  </p>

                  <div className="relative my-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-4 text-muted-foreground">
                        ou entre com email
                      </span>
                    </div>
                  </div>

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
                    variant="hero"
                    size="xl"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? "Entrando..." : "Entrar"}
                  </Button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => navigate("/recuperar-senha")}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      Esqueci minha senha
                    </button>
                  </div>
                </form>
                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-4 text-muted-foreground">
                      ou crie uma conta
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Profile Selection Title - shown only in signup mode or after separator */}
            {mode === "signup" && (
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Selecione seu perfil
                </h2>
                <p className="text-muted-foreground">
                  Escolha como você quer usar o app
                </p>
              </div>
            )}

            {mode === "login" && (
              <div className="text-center mb-6">
                <p className="text-sm text-muted-foreground">
                  Selecione seu perfil para criar uma conta
                </p>
              </div>
            )}

            {/* User Type Cards */}
            <div className="space-y-4">
              <button
                onClick={() => handleSelectType("aluno")}
                className="w-full flex items-center gap-4 p-5 rounded-2xl border-2 border-border hover:border-primary bg-card hover:bg-primary/5 transition-all"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Car className="w-7 h-7 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-foreground text-lg">Sou Aluno</h3>
                  <p className="text-sm text-muted-foreground">
                    Quero aprender a dirigir e tirar minha CNH
                  </p>
                </div>
              </button>

              <button
                onClick={() => handleSelectType("instrutor")}
                className="w-full flex items-center gap-4 p-5 rounded-2xl border-2 border-border hover:border-secondary bg-card hover:bg-secondary/5 transition-all"
              >
                <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <GraduationCap className="w-7 h-7 text-secondary" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-foreground text-lg">Sou Instrutor</h3>
                  <p className="text-sm text-muted-foreground">
                    Quero dar aulas e gerenciar meus alunos
                  </p>
                </div>
              </button>

              <button
                onClick={() => handleSelectType("autoescola")}
                className="w-full flex items-center gap-4 p-5 rounded-2xl border-2 border-border hover:border-emerald-500 bg-card hover:bg-emerald-500/5 transition-all"
              >
                <div className="w-14 h-14 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Building2 className="w-7 h-7 text-emerald-500" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-foreground text-lg">Sou Autoescola</h3>
                  <p className="text-sm text-muted-foreground">
                    Quero gerenciar minha autoescola e alunos
                  </p>
                </div>
              </button>
            </div>

            {/* Toggle Mode */}
            <div className="mt-8 text-center pb-4">
              <button
                onClick={() => setMode(mode === "login" ? "signup" : "login")}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {mode === "login" ? (
                  <>
                    Primeira vez?{" "}
                    <span className="font-semibold text-primary">Criar conta</span>
                  </>
                ) : (
                  <>
                    Já tem conta?{" "}
                    <span className="font-semibold text-primary">Entrar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Auth form
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="px-6 pt-6 pb-4 safe-top">
        <div className="max-w-md mx-auto flex items-center gap-4">
          <button
            onClick={handleBack}
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
          {/* Selected Type Badge */}
          <div className="flex justify-center mb-6">
            <div className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full",
              userType === "aluno" ? "bg-primary/10 text-primary" :
              userType === "instrutor" ? "bg-secondary/10 text-secondary" :
              "bg-emerald-500/10 text-emerald-500"
            )}>
              {userType === "aluno" && <Car className="w-4 h-4" />}
              {userType === "instrutor" && <GraduationCap className="w-4 h-4" />}
              {userType === "autoescola" && <Building2 className="w-4 h-4" />}
              <span className="font-medium text-sm capitalize">{userType}</span>
            </div>
          </div>

          {/* Form Title */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-foreground">
              {mode === "signup" ? "Informe seus dados" : "Entre na sua conta"}
            </h2>
          </div>

          {/* Auth Form */}
          {/* Google Sign In Button - Destacado */}
          <div className="mb-6">
            <Button
              type="button"
              size="xl"
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-primary shadow-md hover:shadow-lg transition-all duration-200"
              disabled={googleLoading || loading}
              onClick={handleGoogleSignIn}
            >
              {googleLoading ? (
                "Conectando..."
              ) : (
                <>
                  <GoogleIcon />
                  Continuar com Google
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Rápido e seguro
            </p>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-4 text-muted-foreground">
                  ou entre com email
                </span>
              </div>
            </div>
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

            {mode === "login" && (
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => navigate("/recuperar-senha")}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Esqueceu sua senha?
                </button>
              </div>
            )}
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
