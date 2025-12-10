import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Car, Bike, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const categories = [
  { id: "acc", label: "ACC", description: "Autorização para Conduzir Ciclomotor", icon: Bike },
  { id: "a", label: "A", description: "Motocicleta", icon: Bike },
  { id: "b", label: "B", description: "Carro (até 8 passageiros)", icon: Car },
  { id: "ab", label: "A + B", description: "Moto e Carro", icon: Car },
  { id: "c", label: "C", description: "Caminhão", icon: Truck },
  { id: "d", label: "D", description: "Ônibus", icon: Truck },
  { id: "e", label: "E", description: "Veículo articulado", icon: Truck },
];

const goals = [
  { id: "primeira", label: "Primeira Habilitação", description: "Nunca tive CNH" },
  { id: "adicao", label: "Adição de Categoria", description: "Já tenho CNH e quero adicionar" },
  { id: "mudanca", label: "Mudança de Categoria", description: "Quero mudar minha categoria" },
  { id: "reciclagem", label: "Reciclagem", description: "Preciso reciclar minha CNH" },
];

export default function AlunoOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [cpf, setCpf] = useState("");
  const [name, setName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);

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
  };

  const canProceed = () => {
    if (step === 1) return cpf.length === 14 && name.length > 2;
    if (step === 2) return selectedGoal !== null;
    if (step === 3) return selectedCategory !== null;
    return false;
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      navigate("/aluno");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="px-6 pt-6 pb-4 safe-top">
        <div className="max-w-md mx-auto flex items-center gap-4">
          <button
            onClick={() => step > 1 ? setStep(step - 1) : navigate("/")}
            className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <div className="flex gap-2">
              {[1, 2, 3].map((s) => (
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
                    onChange={(e) => setName(e.target.value)}
                    className="h-14 text-lg rounded-xl"
                  />
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
                    className="h-14 text-lg rounded-xl tracking-wide"
                  />
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
        </div>
      </div>

      {/* Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background to-transparent safe-bottom">
        <div className="max-w-md mx-auto">
          <Button
            variant="hero"
            size="xl"
            className="w-full"
            disabled={!canProceed()}
            onClick={handleNext}
          >
            {step === 3 ? "Começar a usar" : "Continuar"}
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
