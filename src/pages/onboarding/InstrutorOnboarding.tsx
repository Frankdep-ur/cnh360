import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Upload, Car, Shield, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import {
  instrutorStep1Schema,
  instrutorStep2Schema,
  instrutorStep3Schema,
  validateCPF,
} from "@/lib/validations";

type FormErrors = {
  name?: string;
  cpf?: string;
  cep?: string;
  streetNumber?: string;
  detranCredential?: string;
  cnh?: string;
  carModel?: string;
  carPlate?: string;
  transmission?: string;
};

const TOTAL_STEPS = 4;

export default function InstrutorOnboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [cpf, setCpf] = useState("");
  const [name, setName] = useState("");
  
  // Step 2 - Address
  const [cep, setCep] = useState("");
  const [street, setStreet] = useState("");
  const [streetNumber, setStreetNumber] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [loadingCep, setLoadingCep] = useState(false);
  
  // Step 3 - Credentials
  const [detranCredential, setDetranCredential] = useState("");
  const [cnh, setCnh] = useState("");
  
  // Step 4 - Vehicle
  const [carModel, setCarModel] = useState("");
  const [carPlate, setCarPlate] = useState("");
  const [transmission, setTransmission] = useState<"manual" | "automatico" | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [checkingExisting, setCheckingExisting] = useState(true);
  const [errors, setErrors] = useState<FormErrors>({});

  // Check if user already has instrutor registration
  useEffect(() => {
    const checkExistingInstrutor = async () => {
      if (!user) {
        setCheckingExisting(false);
        return;
      }
      
      const { data } = await supabase
        .from("instrutores")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (data) {
        navigate("/instrutor", { replace: true });
      } else {
        setCheckingExisting(false);
      }
    };
    
    checkExistingInstrutor();
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

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    return numbers.replace(/(\d{5})(\d)/, "$1-$2").slice(0, 9);
  };

  // Fetch address by CEP
  const fetchAddressByCep = async (cepValue: string) => {
    const cleanCep = cepValue.replace(/\D/g, "");
    if (cleanCep.length !== 8) return;
    
    setLoadingCep(true);
    setErrors(prev => ({ ...prev, cep: undefined }));
    
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();
      
      if (data.erro) {
        setErrors(prev => ({ ...prev, cep: "CEP não encontrado" }));
        return;
      }
      
      if (data.logradouro) setStreet(data.logradouro);
      if (data.bairro) setNeighborhood(data.bairro);
      if (data.localidade) setCity(data.localidade);
      if (data.uf) setState(data.uf);
      
      toast({
        title: "Endereço encontrado!",
        description: `${data.localidade} - ${data.uf}`,
      });
    } catch (error) {
      console.error("[InstrutorOnboarding] CEP lookup error:", error);
      setErrors(prev => ({ ...prev, cep: "Erro ao buscar CEP" }));
    } finally {
      setLoadingCep(false);
    }
  };

  const handleCepChange = (value: string) => {
    const formatted = formatCEP(value);
    setCep(formatted);
    
    const cleanCep = formatted.replace(/\D/g, "");
    if (cleanCep.length === 8) {
      fetchAddressByCep(cleanCep);
    }
  };

  const validateStep = (currentStep: number): boolean => {
    setErrors({});
    
    try {
      if (currentStep === 1) {
        instrutorStep1Schema.parse({ name, cpf });
      } else if (currentStep === 2) {
        // Validate address
        if (cep.replace(/\D/g, "").length !== 8) {
          setErrors({ cep: "CEP inválido" });
          return false;
        }
        if (!city || !state) {
          setErrors({ cep: "Busque o endereço pelo CEP" });
          return false;
        }
        if (!streetNumber.trim()) {
          setErrors({ streetNumber: "Informe o número" });
          return false;
        }
      } else if (currentStep === 3) {
        instrutorStep2Schema.parse({ detranCredential, cnh });
      } else if (currentStep === 4) {
        instrutorStep3Schema.parse({ carModel, carPlate, transmission });
      }
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
    if (step === 2) return cep.replace(/\D/g, "").length === 8 && city.length > 0 && streetNumber.length > 0;
    if (step === 3) return detranCredential.length > 0 && cnh.length > 0;
    if (step === 4) return carModel.length > 0 && carPlate.length > 0 && transmission !== null;
    return false;
  };

  const handleNext = async () => {
    if (!validateStep(step)) {
      toast({
        variant: "destructive",
        title: "Dados inválidos",
        description: "Por favor, corrija os erros antes de continuar.",
      });
      return;
    }

    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    } else {
      // Save to database
      if (!user) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Você precisa estar logado para continuar.",
        });
        navigate("/auth?type=instrutor");
        return;
      }

      setLoading(true);

      try {
        // Update profile with CPF and address
        const { error: profileError } = await supabase
          .from("profiles")
          .update({ 
            cpf: cpf.replace(/\D/g, ""), 
            full_name: name.trim(),
            cidade: city.trim(),
            estado: state.trim().toUpperCase()
          })
          .eq("id", user.id);

        if (profileError) throw profileError;

        // Create instrutor record
        const { data: instrutorData, error: instrutorError } = await supabase
          .from("instrutores")
          .insert({
            user_id: user.id,
            credencial_detran: detranCredential.trim(),
            cnh_numero: cnh.trim(),
            cnh_categoria: "B" as const,
            cnh_validade: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          })
          .select()
          .single();

        if (instrutorError) {
          if (instrutorError.code === "23505") {
            // Already exists, get existing
            const { data: existingInstrutor, error: fetchError } = await supabase
              .from("instrutores")
              .select()
              .eq("user_id", user.id)
              .single();

            if (fetchError) throw fetchError;

            // Update existing
            const { error: updateError } = await supabase
              .from("instrutores")
              .update({
                credencial_detran: detranCredential.trim(),
                cnh_numero: cnh.trim(),
              })
              .eq("id", existingInstrutor.id);

            if (updateError) throw updateError;

            // Update or create vehicle
            await supabase
              .from("veiculos")
              .upsert({
                instrutor_id: existingInstrutor.id,
                modelo: carModel.trim(),
                placa: carPlate.trim().toUpperCase(),
                transmissao: transmission,
                categoria: "B" as const,
              }, { onConflict: "instrutor_id" });
          } else {
            throw instrutorError;
          }
        } else {
          // Create vehicle for new instrutor
          await supabase
            .from("veiculos")
            .insert({
              instrutor_id: instrutorData.id,
              modelo: carModel.trim(),
              placa: carPlate.trim().toUpperCase(),
              transmissao: transmission!,
              categoria: "B" as const,
            });
        }

        // Add instrutor role
        await supabase
          .from("user_roles")
          .upsert({ user_id: user.id, role: "instrutor" as const }, { onConflict: "user_id,role" });

        toast({
          title: "Cadastro concluído!",
          description: "Bem-vindo ao CNH 360, instrutor!",
        });

        navigate("/instrutor");
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
              {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((s) => (
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
                    onChange={(e) => {
                      setCpf(formatCPF(e.target.value));
                      if (errors.cpf) setErrors({ ...errors, cpf: undefined });
                    }}
                    maxLength={14}
                    className={cn("h-14 text-lg rounded-xl tracking-wide", errors.cpf && "border-destructive")}
                  />
                  {errors.cpf && <p className="text-sm text-destructive mt-1">{errors.cpf}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Address */}
          {step === 2 && (
            <div className="animate-fade-in">
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Onde você mora? 📍
              </h1>
              <p className="text-muted-foreground mb-8">
                Informe seu endereço de residência
              </p>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    CEP
                  </label>
                  <div className="relative">
                    <Input
                      placeholder="00000-000"
                      value={cep}
                      onChange={(e) => handleCepChange(e.target.value)}
                      maxLength={9}
                      className={cn("h-14 text-lg rounded-xl pr-12", errors.cep && "border-destructive")}
                    />
                    {loadingCep && (
                      <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-muted-foreground" />
                    )}
                  </div>
                  {errors.cep && <p className="text-sm text-destructive mt-1">{errors.cep}</p>}
                  <p className="text-xs text-muted-foreground mt-1">
                    Digite o CEP para preencher automaticamente
                  </p>
                </div>

                {city && (
                  <div className="p-4 bg-secondary/10 rounded-2xl space-y-3 animate-fade-in">
                    <div className="flex items-center gap-2 text-secondary">
                      <MapPin className="w-5 h-5" />
                      <span className="font-medium">{city} - {state}</span>
                    </div>
                    
                    {street && (
                      <div className="text-sm text-muted-foreground">
                        {street}{neighborhood && `, ${neighborhood}`}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          Número *
                        </label>
                        <Input
                          placeholder="123"
                          value={streetNumber}
                          onChange={(e) => {
                            setStreetNumber(e.target.value);
                            if (errors.streetNumber) setErrors({ ...errors, streetNumber: undefined });
                          }}
                          className={cn("h-12 rounded-xl", errors.streetNumber && "border-destructive")}
                        />
                        {errors.streetNumber && <p className="text-xs text-destructive mt-1">{errors.streetNumber}</p>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Credentials */}
          {step === 3 && (
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
                    maxLength={50}
                    onChange={(e) => {
                      setDetranCredential(e.target.value);
                      if (errors.detranCredential) setErrors({ ...errors, detranCredential: undefined });
                    }}
                    className={cn("h-14 text-lg rounded-xl", errors.detranCredential && "border-destructive")}
                  />
                  {errors.detranCredential && <p className="text-sm text-destructive mt-1">{errors.detranCredential}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Número da CNH
                  </label>
                  <Input
                    placeholder="Ex: 00000000000"
                    value={cnh}
                    maxLength={11}
                    onChange={(e) => {
                      setCnh(e.target.value.replace(/\D/g, ""));
                      if (errors.cnh) setErrors({ ...errors, cnh: undefined });
                    }}
                    className={cn("h-14 text-lg rounded-xl", errors.cnh && "border-destructive")}
                  />
                  {errors.cnh && <p className="text-sm text-destructive mt-1">{errors.cnh}</p>}
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

          {/* Step 4: Vehicle */}
          {step === 4 && (
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
                    maxLength={50}
                    onChange={(e) => {
                      setCarModel(e.target.value);
                      if (errors.carModel) setErrors({ ...errors, carModel: undefined });
                    }}
                    className={cn("h-14 text-lg rounded-xl", errors.carModel && "border-destructive")}
                  />
                  {errors.carModel && <p className="text-sm text-destructive mt-1">{errors.carModel}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Placa
                  </label>
                  <Input
                    placeholder="ABC-1234"
                    value={carPlate}
                    maxLength={10}
                    onChange={(e) => {
                      setCarPlate(e.target.value.toUpperCase());
                      if (errors.carPlate) setErrors({ ...errors, carPlate: undefined });
                    }}
                    className={cn("h-14 text-lg rounded-xl uppercase", errors.carPlate && "border-destructive")}
                  />
                  {errors.carPlate && <p className="text-sm text-destructive mt-1">{errors.carPlate}</p>}
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
                      onClick={() => setTransmission("automatico")}
                      className={cn(
                        "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2",
                        transmission === "automatico"
                          ? "border-secondary bg-secondary/5"
                          : "border-border hover:border-secondary/50"
                      )}
                    >
                      <Car className={cn(
                        "w-8 h-8",
                        transmission === "automatico" ? "text-secondary" : "text-muted-foreground"
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
            disabled={!canProceed() || loading}
            onClick={handleNext}
          >
            {loading ? "Salvando..." : step === TOTAL_STEPS ? "Começar a dar aulas" : "Continuar"}
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
