import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Car, Mail, Lock, User, Eye, EyeOff, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

type AuthMode = "login" | "signup" | "forgot" | "reset" | "forgot-success";

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { signIn, signUp, resetPassword, updatePassword, loading: authLoading } = useAuth();
  
  const [mode, setMode] = useState<AuthMode>("login");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Form fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Check URL params for reset mode
  useEffect(() => {
    const urlMode = searchParams.get("mode");
    if (urlMode === "reset") {
      setMode("reset");
    }
  }, [searchParams]);

  const resetForm = () => {
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Login validation
    if (mode === "login") {
      if (!email || !password) {
        toast({
          variant: "destructive",
          title: "Campos obrigatórios",
          description: "Preencha e-mail e senha",
        });
        return;
      }
    }

    // Signup validation
    if (mode === "signup") {
      if (!fullName || !email || !password || !confirmPassword) {
        toast({
          variant: "destructive",
          title: "Campos obrigatórios",
          description: "Preencha todos os campos",
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

    // Forgot password validation
    if (mode === "forgot") {
      if (!email) {
        toast({
          variant: "destructive",
          title: "E-mail obrigatório",
          description: "Digite seu e-mail para recuperar a senha",
        });
        return;
      }
    }

    // Reset password validation
    if (mode === "reset") {
      if (!password || !confirmPassword) {
        toast({
          variant: "destructive",
          title: "Campos obrigatórios",
          description: "Preencha a nova senha",
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
      if (mode === "login") {
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
      } else if (mode === "signup") {
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
      } else if (mode === "forgot") {
        const { error } = await resetPassword(email);
        if (error) {
          toast({
            variant: "destructive",
            title: "Erro ao enviar",
            description: error.message,
          });
        } else {
          setMode("forgot-success");
        }
      } else if (mode === "reset") {
        const { error } = await updatePassword(password);
        if (error) {
          toast({
            variant: "destructive",
            title: "Erro ao redefinir",
            description: error.message,
          });
        } else {
          toast({
            title: "Senha alterada!",
            description: "Sua senha foi redefinida com sucesso.",
          });
          setMode("login");
          resetForm();
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return <LoadingScreen message="Carregando..." />;
  }

  const getHeaderContent = () => {
    switch (mode) {
      case "login":
        return {
          title: "Bem-vindo de volta!",
          subtitle: "Entre para continuar sua jornada"
        };
      case "signup":
        return {
          title: "Crie sua conta",
          subtitle: "Comece sua habilitação agora mesmo"
        };
      case "forgot":
        return {
          title: "Esqueceu a senha?",
          subtitle: "Enviaremos um link de recuperação"
        };
      case "forgot-success":
        return {
          title: "E-mail enviado!",
          subtitle: "Verifique sua caixa de entrada"
        };
      case "reset":
        return {
          title: "Nova senha",
          subtitle: "Crie sua nova senha de acesso"
        };
    }
  };

  const headerContent = getHeaderContent();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="gradient-hero text-primary-foreground px-6 pt-12 pb-20 safe-top">
        <div className="max-w-md mx-auto">
          {/* Back button for forgot/reset modes */}
          {(mode === "forgot" || mode === "reset" || mode === "forgot-success") && (
            <button
              onClick={() => {
                setMode("login");
                resetForm();
              }}
              className="flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground mb-4 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar ao login</span>
            </button>
          )}

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

          <h2 className="text-2xl font-bold">{headerContent.title}</h2>
          <p className="text-primary-foreground/80 mt-1">{headerContent.subtitle}</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="flex-1 px-6 -mt-10">
        <div className="max-w-md mx-auto">
          <div className="bg-card rounded-3xl shadow-elevated p-6">
            
            {/* Forgot Password Success */}
            {mode === "forgot-success" && (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Verifique seu e-mail
                </h3>
                <p className="text-muted-foreground text-sm mb-6">
                  Enviamos um link de recuperação para <strong className="text-foreground">{email}</strong>. 
                  Clique no link para criar uma nova senha.
                </p>
                <p className="text-muted-foreground text-xs mb-4">
                  Não recebeu? Verifique sua pasta de spam.
                </p>
                <Button
                  onClick={() => {
                    setMode("login");
                    resetForm();
                  }}
                  variant="outline"
                  className="w-full h-12 rounded-xl"
                >
                  Voltar ao login
                </Button>
              </div>
            )}

            {/* Login / Signup / Forgot / Reset Forms */}
            {mode !== "forgot-success" && (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name - Only for signup */}
                {mode === "signup" && (
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

                {/* Email - Not for reset mode */}
                {mode !== "reset" && (
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
                )}

                {/* Password - For login, signup, and reset */}
                {(mode === "login" || mode === "signup" || mode === "reset") && (
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-foreground font-medium">
                      {mode === "reset" ? "Nova senha" : "Senha"}
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
                )}

                {/* Forgot password link - Only for login */}
                {mode === "login" && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setMode("forgot");
                        resetForm();
                      }}
                      className="text-sm text-primary hover:underline"
                    >
                      Esqueceu sua senha?
                    </button>
                  </div>
                )}

                {/* Confirm Password - For signup and reset */}
                {(mode === "signup" || mode === "reset") && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-foreground font-medium">
                      Confirmar {mode === "reset" ? "nova " : ""}senha
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
                  {isSubmitting ? (
                    mode === "login" ? "Entrando..." :
                    mode === "signup" ? "Criando conta..." :
                    mode === "forgot" ? "Enviando..." :
                    "Salvando..."
                  ) : (
                    mode === "login" ? "Entrar" :
                    mode === "signup" ? "Criar conta" :
                    mode === "forgot" ? "Enviar link de recuperação" :
                    "Redefinir senha"
                  )}
                </Button>
              </form>
            )}

            {/* Toggle Login/Signup - Only for login and signup modes */}
            {(mode === "login" || mode === "signup") && (
              <div className="mt-6 text-center">
                <p className="text-muted-foreground">
                  {mode === "login" ? "Não tem conta?" : "Já tem uma conta?"}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === "login" ? "signup" : "login");
                    resetForm();
                  }}
                  className="text-primary font-semibold hover:underline mt-1"
                >
                  {mode === "login" ? "Cadastre-se agora" : "Fazer login"}
                </button>
              </div>
            )}

            {/* Terms */}
            {mode !== "forgot-success" && (
              <p className="text-xs text-muted-foreground text-center mt-6">
                Ao continuar, você concorda com nossos Termos de Uso e Política de Privacidade
              </p>
            )}
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
