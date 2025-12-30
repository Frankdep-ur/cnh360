import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { ArrowLeft, Lock, Eye, EyeOff, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const passwordSchema = z.string().min(6, "Senha deve ter no mínimo 6 caracteres");

export default function RedefinirSenha() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});
  const [hasSession, setHasSession] = useState(false);

  // Check if user has a valid session from the reset link
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setHasSession(true);
      }
    };
    
    // Listen for auth state changes (user coming from email link)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' && session) {
        setHasSession(true);
      }
    });
    
    checkSession();
    
    return () => subscription.unsubscribe();
  }, []);

  const validate = () => {
    const newErrors: typeof errors = {};
    
    const result = passwordSchema.safeParse(password);
    if (!result.success) {
      newErrors.password = result.error.errors[0].message;
    }
    
    if (password !== confirmPassword) {
      newErrors.confirm = "As senhas não coincidem";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao redefinir senha",
          description: error.message,
        });
        return;
      }
      
      setSuccess(true);
      toast({
        title: "Senha redefinida!",
        description: "Sua senha foi atualizada com sucesso.",
      });
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate("/auth");
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="px-6 pt-6 pb-4 safe-top">
          <div className="max-w-md mx-auto flex items-center gap-4">
            <h1 className="text-xl font-bold text-foreground">Senha Redefinida</h1>
          </div>
        </header>

        <div className="flex-1 px-6 pb-8 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Senha atualizada!
            </h2>
            <p className="text-muted-foreground mb-8">
              Sua senha foi redefinida com sucesso. Você será redirecionado para o login.
            </p>
            <Button
              variant="hero"
              size="lg"
              onClick={() => navigate("/auth")}
              className="w-full"
            >
              Ir para login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!hasSession) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="px-6 pt-6 pb-4 safe-top">
          <div className="max-w-md mx-auto flex items-center gap-4">
            <button
              onClick={() => navigate("/auth")}
              className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-foreground">Redefinir Senha</h1>
          </div>
        </header>

        <div className="flex-1 px-6 pb-8 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              Link inválido ou expirado
            </h2>
            <p className="text-muted-foreground mb-6">
              O link de redefinição de senha é inválido ou já expirou. Solicite um novo link.
            </p>
            <Button
              variant="hero"
              size="lg"
              onClick={() => navigate("/recuperar-senha")}
              className="w-full"
            >
              Solicitar novo link
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-6 pt-6 pb-4 safe-top">
        <div className="max-w-md mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate("/auth")}
            className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-foreground">Redefinir Senha</h1>
        </div>
      </header>

      <div className="flex-1 px-6 pb-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              Crie uma nova senha
            </h2>
            <p className="text-muted-foreground">
              Digite sua nova senha abaixo.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Nova senha
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

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Confirmar nova senha
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-14 pl-12 pr-12 rounded-xl"
                />
              </div>
              {errors.confirm && (
                <p className="text-destructive text-sm mt-1">{errors.confirm}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="hero"
              size="xl"
              className="w-full mt-6"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Redefinindo...
                </>
              ) : (
                "Redefinir senha"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}