import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Car, Bike, Truck, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ComplianceBanner } from "@/components/layout/ComplianceBanner";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { alunoStep1Schema, validateCPF } from "@/lib/validations";

const categories = [
  { id: "ACC", label: "ACC", description: "Autorização para Conduzir Ciclomotor", icon: Bike },
  { id: "A", label: "A", description: "Motocicleta", icon: Bike },
  { id: "B", label: "B", description: "Carro (até 8 passageiros)", icon: Car },
  { id: "AB", label: "A + B", description: "Moto e Carro", icon: Car },
  { id: "C", label: "C", description: "Caminhão", icon: Truck },
  { id: "D", label: "D", description: "Ônibus", icon: Truck },
  { id: "E", label: "E", description: "Veículo articulado", icon: Truck },
];

const goals = [
  { id: "primeira_habilitacao", label: "Primeira Habilitação", description: "Nunca tive CNH" },
  { id: "adicao_categoria", label: "Adição de Categoria", description: "Já tenho CNH e quero adicionar" },
  { id: "mudanca_categoria", label: "Mudança de Categoria", description: "Quero mudar minha categoria" },
  { id: "renovacao", label: "Renovação", description: "Preciso renovar minha CNH" },
];

type FormErrors = {
  name?: string;
  cpf?: string;
};

export default function AlunoOnboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [cpf, setCpf] = useState("");
  const [name, setName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [useOwnCar, setUseOwnCar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingExisting, setCheckingExisting] = useState(true);
  const [errors, setErrors] = useState<FormErrors>({});

  // Check if user already has aluno registration
  useEffect(() => {
    const checkExistingAluno = async () => {
      if (!user) {
        setCheckingExisting(false);
        return;
      }
      
      const { data } = await supabase
        .from("alunos")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (data) {
        navigate("/aluno", { replace: true });
      } else {
        setCheckingExisting(false);
      }
    };
    
    checkExistingAluno();
  }, [user, navigate]);

  if (checkingExisting) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    return numbers
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpf(formatCPF(e.target.value));
    if (errors.cpf) setErrors({ ...errors, cpf: undefined });
  };

  const validateStep1 = (): boolean => {
    setErrors({});
    
    try {
      alunoStep1Schema.parse({ name, cpf });
      return true;
    } catch (error: any) {
      if (error.errors) {
        const newErrors: FormErrors = {};
        error.errors.forEach((err: any) => {
          const field = err.path[0] as keyof FormErrors;
          newErrors[field] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const canProceed = () => {
    if (step === 1) return cpf.length === 14 && name.length > 2;
    if (step === 2) return selectedGoal !== null;
    if (step === 3) return selectedCategory !== null;
    if (step === 4) return true;
    return false;
  };

  const handleNext = async () => {
    if (step === 1 && !validateStep1()) {
      toast({
        variant: "destructive",
        title: "Dados inválidos",
        description: "Por favor, corrija os erros antes de continuar.",
      });
      return;
    }

    if (step < 4) {
      setStep(step + 1);
    } else {
      // Save to database
      if (!user) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Você precisa estar logado para continuar.",
        });
        navigate("/auth?type=aluno");
        return;
      }

      setLoading(true);
      
      try {
        // Update profile with CPF
        const { error: profileError } = await supabase
          .from("profiles")
          .update({ cpf: cpf.replace(/\D/g, ""), full_name: name.trim() })
          .eq("id", user.id);

        if (profileError) throw profileError;

        // Create aluno record
        const { error: alunoError } = await supabase
          .from("alunos")
          .insert({
            user_id: user.id,
            objetivo: selectedGoal as "primeira_habilitacao" | "adicao_categoria" | "renovacao" | "mudanca_categoria",
            categoria_pretendida: selectedCategory as "ACC" | "A" | "B" | "AB" | "C" | "D" | "E",
            possui_carro_proprio: useOwnCar,
          });

        if (alunoError) {
          if (alunoError.code === "23505") {
            // Already exists, update instead
            const { error: updateError } = await supabase
              .from("alunos")
              .update({
                objetivo: selectedGoal as "primeira_habilitacao" | "adicao_categoria" | "renovacao" | "mudanca_categoria",
                categoria_pretendida: selectedCategory as "ACC" | "A" | "B" | "AB" | "C" | "D" | "E",
                possui_carro_proprio: useOwnCar,
              })
              .eq("user_id", user.id);
            
            if (updateError) throw updateError;
          } else {
            throw alunoError;
          }
        }

        // Add aluno role
        await supabase
          .from("user_roles")
          .upsert({ user_id: user.id, role: "aluno" as const }, { onConflict: "user_id,role" });

        toast({
          title: "Cadastro concluído!",
          description: "Bem-vindo ao CNH 360.",
        });

        navigate("/aluno");
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Erro ao salvar",
          description: error.message || "Tente novamente.",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Compliance Banner */}
      <ComplianceBanner variant="full" />

      {/* Header */}
      <header className="px-6 pt-4 pb-4">
        <div className="max-w-md mx-auto flex items-center gap-4">
          <button
            onClick={() => step > 1 ? setStep(step - 1) : navigate("/")}
            className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={cn(
                    "h-1.5 flex-1 rounded-full transition-all duration-300",
                    s <= step ? "bg-primary" : "bg-muted"
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 px-6 pb-32">
        <div className="max-w-md mx-auto">
          {/* Step 1: Personal Data */}
          {step === 1 && (
            <div className="animate-fade-in">
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Vamos começar! 🚗
              </h1>
              <p className="text-muted-foreground mb-8">
                Informe seus dados para criar sua conta
              </p>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Seu nome completo
                  </label>
                  <Input
                    placeholder="Digite seu nome"
                    value={name}
                    maxLength={100}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors({ ...errors, name: undefined });
                    }}
                    className={cn("h-14 text-lg rounded-xl", errors.name && "border-destructive")}
                  />
                  {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    CPF
                  </label>
                  <Input
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={handleCPFChange}
                    maxLength={14}
                    className={cn("h-14 text-lg rounded-xl tracking-wide", errors.cpf && "border-destructive")}
                  />
                  {errors.cpf && <p className="text-sm text-destructive mt-1">{errors.cpf}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Goal */}
          {step === 2 && (
            <div className="animate-fade-in">
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Qual seu objetivo?
              </h1>
              <p className="text-muted-foreground mb-8">
                Selecione o que melhor descreve sua situação
              </p>

              <div className="space-y-3">
                {goals.map((goal) => (
                  <button
                    key={goal.id}
                    onClick={() => setSelectedGoal(goal.id)}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200",
                      selectedGoal === goal.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                      selectedGoal === goal.id
                        ? "border-primary bg-primary"
                        : "border-muted-foreground"
                    )}>
                      {selectedGoal === goal.id && (
                        <Check className="w-4 h-4 text-primary-foreground" />
                      )}
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-foreground">{goal.label}</h3>
                      <p className="text-sm text-muted-foreground">{goal.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Category */}
          {step === 3 && (
            <div className="animate-fade-in">
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Escolha a categoria
              </h1>
              <p className="text-muted-foreground mb-8">
                Qual categoria de CNH você deseja?
              </p>

              <div className="grid grid-cols-2 gap-3">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={cn(
                        "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200",
                        selectedCategory === cat.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
                        selectedCategory === cat.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      )}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="text-center">
                        <h3 className="font-bold text-lg text-foreground">{cat.label}</h3>
                        <p className="text-[10px] text-muted-foreground leading-tight">{cat.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 4: Own Car Option */}
          {step === 4 && (
            <div className="animate-fade-in">
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Usar carro próprio? 🚙
              </h1>
              <p className="text-muted-foreground mb-8">
                Nova lei permite usar seu veículo nas aulas práticas
              </p>

              <div className="space-y-4">
                <button
                  onClick={() => setUseOwnCar(true)}
                  className={cn(
                    "w-full p-5 rounded-2xl border-2 transition-all duration-200",
                    useOwnCar
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-14 h-14 rounded-xl flex items-center justify-center",
                      useOwnCar ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}>
                      <Car className="w-7 h-7" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">Sim, usar meu carro</h3>
                        <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                          20% OFF
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">Economize usando seu veículo</p>
                    </div>
                    <div className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                      useOwnCar ? "border-primary bg-primary" : "border-muted-foreground"
                    )}>
                      {useOwnCar && <Check className="w-4 h-4 text-primary-foreground" />}
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setUseOwnCar(false)}
                  className={cn(
                    "w-full p-5 rounded-2xl border-2 transition-all duration-200",
                    !useOwnCar
                      ? "border-secondary bg-secondary/5"
                      : "border-border hover:border-secondary/50"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-14 h-14 rounded-xl flex items-center justify-center",
                      !useOwnCar ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground"
                    )}>
                      <Car className="w-7 h-7" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-semibold text-foreground">Não, usar carro do instrutor</h3>
                      <p className="text-sm text-muted-foreground">Veículo adaptado para aulas</p>
                    </div>
                    <div className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                      !useOwnCar ? "border-secondary bg-secondary" : "border-muted-foreground"
                    )}>
                      {!useOwnCar && <Check className="w-4 h-4 text-secondary-foreground" />}
                    </div>
                  </div>
                </button>
              </div>

              {/* Info Box */}
              <div className="mt-6 p-4 bg-muted/50 rounded-xl">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-foreground text-sm">Res. CONTRAN 1.020/2025</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      A nova lei permite o uso do veículo próprio do aluno nas aulas práticas, com desconto de até 20%.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background to-transparent safe-bottom">
        <div className="max-w-md mx-auto">
          <Button
            variant="hero"
            size="xl"
            className="w-full"
            disabled={!canProceed() || loading}
            onClick={handleNext}
          >
            {loading ? "Salvando..." : step === 4 ? "Começar a usar" : "Continuar"}
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
