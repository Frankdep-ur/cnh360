import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Upload, Car, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function InstrutorOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [cpf, setCpf] = useState("");
  const [name, setName] = useState("");
  const [detranCredential, setDetranCredential] = useState("");
  const [cnh, setCnh] = useState("");
  const [carModel, setCarModel] = useState("");
  const [carPlate, setCarPlate] = useState("");
  const [transmission, setTransmission] = useState<"manual" | "auto" | null>(null);

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    return numbers
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
  };

  const canProceed = () => {
    if (step === 1) return cpf.length === 14 && name.length > 2;
    if (step === 2) return detranCredential.length > 0 && cnh.length > 0;
    if (step === 3) return carModel.length > 0 && carPlate.length > 0 && transmission !== null;
    return false;
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      navigate("/instrutor");
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
                    s <= step ? "bg-secondary" : "bg-muted"
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
                Seja um instrutor! 🎓
              </h1>
              <p className="text-muted-foreground mb-8">
                Aumente sua renda dando aulas práticas
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
                    onChange={(e) => setCpf(formatCPF(e.target.value))}
                    maxLength={14}
                    className="h-14 text-lg rounded-xl tracking-wide"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Credentials */}
          {step === 2 && (
            <div className="animate-fade-in">
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Credenciamento
              </h1>
              <p className="text-muted-foreground mb-8">
                Precisamos validar seu cadastro no DETRAN
              </p>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Número do Credenciamento DETRAN
                  </label>
                  <Input
                    placeholder="Ex: 123456789"
                    value={detranCredential}
                    onChange={(e) => setDetranCredential(e.target.value)}
                    className="h-14 text-lg rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Número da CNH
                  </label>
                  <Input
                    placeholder="Ex: 00000000000"
                    value={cnh}
                    onChange={(e) => setCnh(e.target.value)}
                    className="h-14 text-lg rounded-xl"
                  />
                </div>

                <div className="bg-secondary/10 rounded-2xl p-4 flex items-start gap-3">
                  <Shield className="w-5 h-5 text-secondary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Validação automática</p>
                    <p className="text-xs text-muted-foreground">
                      Seus dados serão verificados junto ao DETRAN para garantir a segurança dos alunos
                    </p>
                  </div>
                </div>

                <button className="w-full p-4 border-2 border-dashed border-border rounded-2xl flex flex-col items-center gap-2 hover:border-secondary/50 transition-colors">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Upload do documento (opcional)
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Vehicle */}
          {step === 3 && (
            <div className="animate-fade-in">
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Seu veículo
              </h1>
              <p className="text-muted-foreground mb-8">
                Cadastre o carro que você usará nas aulas
              </p>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Modelo do veículo
                  </label>
                  <Input
                    placeholder="Ex: VW Polo 2023"
                    value={carModel}
                    onChange={(e) => setCarModel(e.target.value)}
                    className="h-14 text-lg rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Placa
                  </label>
                  <Input
                    placeholder="ABC-1234"
                    value={carPlate}
                    onChange={(e) => setCarPlate(e.target.value.toUpperCase())}
                    className="h-14 text-lg rounded-xl uppercase"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-3 block">
                    Câmbio
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setTransmission("manual")}
                      className={cn(
                        "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2",
                        transmission === "manual"
                          ? "border-secondary bg-secondary/5"
                          : "border-border hover:border-secondary/50"
                      )}
                    >
                      <Car className={cn(
                        "w-8 h-8",
                        transmission === "manual" ? "text-secondary" : "text-muted-foreground"
                      )} />
                      <span className="font-medium">Manual</span>
                    </button>
                    <button
                      onClick={() => setTransmission("auto")}
                      className={cn(
                        "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2",
                        transmission === "auto"
                          ? "border-secondary bg-secondary/5"
                          : "border-border hover:border-secondary/50"
                      )}
                    >
                      <Car className={cn(
                        "w-8 h-8",
                        transmission === "auto" ? "text-secondary" : "text-muted-foreground"
                      )} />
                      <span className="font-medium">Automático</span>
                    </button>
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
            variant="hero-secondary"
            size="xl"
            className="w-full"
            disabled={!canProceed()}
            onClick={handleNext}
          >
            {step === 3 ? "Começar a dar aulas" : "Continuar"}
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
