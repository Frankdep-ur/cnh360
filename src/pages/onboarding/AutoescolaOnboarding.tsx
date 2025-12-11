import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Upload, CheckCircle, ArrowLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import {
  autoescolaStep1Schema,
  autoescolaStep2Schema,
  autoescolaStep3Schema,
} from "@/lib/validations";

type FormErrors = {
  cnpj?: string;
  razaoSocial?: string;
  nomeFantasia?: string;
  credencialDetran?: string;
  responsavel?: string;
  email?: string;
  whatsapp?: string;
};

export default function AutoescolaOnboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [checkingExisting, setCheckingExisting] = useState(true);
  const [errors, setErrors] = useState<FormErrors>({});

  // Check if user already has autoescola registration
  useEffect(() => {
    const checkExistingAutoescola = async () => {
      if (!user) {
        setCheckingExisting(false);
        return;
      }
      
      const { data } = await supabase
        .from("autoescolas")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (data) {
        navigate("/autoescola", { replace: true });
      } else {
        setCheckingExisting(false);
      }
    };
    
    checkExistingAutoescola();
  }, [user, navigate]);

  if (checkingExisting) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }
  const [formData, setFormData] = useState({
    cnpj: "",
    razaoSocial: "",
    nomeFantasia: "",
    credencialDetran: "",
    responsavel: "",
    email: "",
    whatsapp: "",
    cidade: "Araçatuba",
    estado: "SP",
  });
  const [credencialUploaded, setCredencialUploaded] = useState(false);

  const formatCNPJ = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .slice(0, 18);
  };

  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .slice(0, 15);
  };

  const validateStep = (currentStep: number): boolean => {
    setErrors({});
    
    try {
      if (currentStep === 1) {
        autoescolaStep1Schema.parse({
          cnpj: formData.cnpj,
          razaoSocial: formData.razaoSocial,
          nomeFantasia: formData.nomeFantasia || undefined,
        });
      } else if (currentStep === 2) {
        autoescolaStep2Schema.parse({
          credencialDetran: formData.credencialDetran,
        });
      } else if (currentStep === 3) {
        autoescolaStep3Schema.parse({
          responsavel: formData.responsavel,
          email: formData.email,
          whatsapp: formData.whatsapp,
        });
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

  const handleStepChange = (newStep: number) => {
    if (newStep > step && !validateStep(step)) {
      toast({
        title: "Dados inválidos",
        description: "Por favor, corrija os erros antes de continuar.",
        variant: "destructive",
      });
      return;
    }
    setStep(newStep);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setCredencialUploaded(true);
      toast({
        title: "Credencial enviada!",
        description: "Documento recebido com sucesso.",
      });
    } else {
      toast({
        title: "Formato inválido",
        description: "Por favor, envie um arquivo PDF.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (!validateStep(3)) {
      toast({
        title: "Dados inválidos",
        description: "Por favor, corrija os erros antes de continuar.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    try {
      // Inserir role de autoescola
      await supabase.from("user_roles").insert({
        user_id: user.id,
        role: "autoescola",
      });

      // Criar registro de autoescola
      await supabase.from("autoescolas").insert({
        user_id: user.id,
        cnpj: formData.cnpj.replace(/\D/g, ""),
        razao_social: formData.razaoSocial.trim(),
        nome_fantasia: formData.nomeFantasia.trim() || null,
        credencial_detran: formData.credencialDetran.trim(),
        email: formData.email.trim().toLowerCase(),
        telefone: formData.whatsapp.replace(/\D/g, ""),
        cidade: formData.cidade,
        estado: formData.estado,
      });

      toast({
        title: "Cadastro concluído!",
        description: "Bem-vindo ao CNH 360 Autoescolas.",
      });

      navigate("/autoescola");
    } catch (error) {
      console.error("Erro no cadastro:", error);
      toast({
        title: "Erro no cadastro",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white px-6 py-8 safe-top">
        <div className="max-w-md mx-auto">
          <button 
            onClick={() => step > 1 ? setStep(step - 1) : navigate("/")}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </button>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Cadastro Autoescola</h1>
              <p className="text-white/80 text-sm">Passo {step} de 3</p>
            </div>
          </div>

          {/* Progress */}
          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={cn(
                  "flex-1 h-1.5 rounded-full transition-all",
                  s <= step ? "bg-white" : "bg-white/30"
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6 -mt-4">
        <div className="max-w-md mx-auto">
          <Card className="shadow-elevated">
            <CardContent className="pt-6">
              {step === 1 && (
                <div className="space-y-4">
                  <CardHeader className="px-0 pt-0">
                    <CardTitle className="text-lg">Dados da Empresa</CardTitle>
                  </CardHeader>

                  <div className="space-y-2">
                    <Label htmlFor="cnpj">CNPJ</Label>
                    <Input
                      id="cnpj"
                      placeholder="00.000.000/0000-00"
                      value={formData.cnpj}
                      onChange={(e) => {
                        setFormData({ ...formData, cnpj: formatCNPJ(e.target.value) });
                        if (errors.cnpj) setErrors({ ...errors, cnpj: undefined });
                      }}
                      className={errors.cnpj ? "border-destructive" : ""}
                    />
                    {errors.cnpj && <p className="text-sm text-destructive">{errors.cnpj}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="razaoSocial">Razão Social</Label>
                    <Input
                      id="razaoSocial"
                      placeholder="Nome da empresa"
                      maxLength={200}
                      value={formData.razaoSocial}
                      onChange={(e) => {
                        setFormData({ ...formData, razaoSocial: e.target.value });
                        if (errors.razaoSocial) setErrors({ ...errors, razaoSocial: undefined });
                      }}
                      className={errors.razaoSocial ? "border-destructive" : ""}
                    />
                    {errors.razaoSocial && <p className="text-sm text-destructive">{errors.razaoSocial}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
                    <Input
                      id="nomeFantasia"
                      placeholder="Como é conhecida"
                      maxLength={200}
                      value={formData.nomeFantasia}
                      onChange={(e) =>
                        setFormData({ ...formData, nomeFantasia: e.target.value })
                      }
                    />
                  </div>

                  <Button
                    className="w-full bg-emerald-500 hover:bg-emerald-600"
                    onClick={() => handleStepChange(2)}
                    disabled={!formData.cnpj || !formData.razaoSocial}
                  >
                    Continuar
                  </Button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <CardHeader className="px-0 pt-0">
                    <CardTitle className="text-lg">Credencial DETRAN</CardTitle>
                  </CardHeader>

                  <div className="space-y-2">
                    <Label htmlFor="credencial">Número da Credencial</Label>
                    <Input
                      id="credencial"
                      placeholder="Ex: CFC-SP-12345"
                      maxLength={50}
                      value={formData.credencialDetran}
                      onChange={(e) => {
                        setFormData({ ...formData, credencialDetran: e.target.value });
                        if (errors.credencialDetran) setErrors({ ...errors, credencialDetran: undefined });
                      }}
                      className={errors.credencialDetran ? "border-destructive" : ""}
                    />
                    {errors.credencialDetran && <p className="text-sm text-destructive">{errors.credencialDetran}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Upload da Credencial (PDF)</Label>
                    <div
                      className={cn(
                        "border-2 border-dashed rounded-xl p-6 text-center transition-all",
                        credencialUploaded
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-border hover:border-emerald-400"
                      )}
                    >
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="credencial-file"
                      />
                      <label
                        htmlFor="credencial-file"
                        className="cursor-pointer flex flex-col items-center gap-2"
                      >
                        {credencialUploaded ? (
                          <>
                            <CheckCircle className="w-10 h-10 text-emerald-500" />
                            <span className="text-emerald-600 font-medium">
                              Credencial enviada!
                            </span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-10 h-10 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              Clique para enviar PDF
                            </span>
                          </>
                        )}
                      </label>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-emerald-500 hover:bg-emerald-600"
                    onClick={() => handleStepChange(3)}
                    disabled={!formData.credencialDetran}
                  >
                    Continuar
                  </Button>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <CardHeader className="px-0 pt-0">
                    <CardTitle className="text-lg">Dados do Responsável</CardTitle>
                  </CardHeader>

                  <div className="space-y-2">
                    <Label htmlFor="responsavel">Nome Completo</Label>
                    <Input
                      id="responsavel"
                      placeholder="Seu nome"
                      maxLength={100}
                      value={formData.responsavel}
                      onChange={(e) => {
                        setFormData({ ...formData, responsavel: e.target.value });
                        if (errors.responsavel) setErrors({ ...errors, responsavel: undefined });
                      }}
                      className={errors.responsavel ? "border-destructive" : ""}
                    />
                    {errors.responsavel && <p className="text-sm text-destructive">{errors.responsavel}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@autoescola.com"
                      maxLength={255}
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        if (errors.email) setErrors({ ...errors, email: undefined });
                      }}
                      className={errors.email ? "border-destructive" : ""}
                    />
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                    <Input
                      id="whatsapp"
                      placeholder="(00) 00000-0000"
                      value={formData.whatsapp}
                      onChange={(e) => {
                        setFormData({ ...formData, whatsapp: formatPhone(e.target.value) });
                        if (errors.whatsapp) setErrors({ ...errors, whatsapp: undefined });
                      }}
                      className={errors.whatsapp ? "border-destructive" : ""}
                    />
                    {errors.whatsapp && <p className="text-sm text-destructive">{errors.whatsapp}</p>}
                  </div>

                  <Button
                    className="w-full bg-emerald-500 hover:bg-emerald-600"
                    onClick={handleSubmit}
                    disabled={loading || !formData.responsavel || !formData.email || !formData.whatsapp}
                  >
                    {loading ? "Finalizando..." : "Finalizar Cadastro"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Benefits */}
          <div className="mt-6 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
            <h4 className="font-semibold text-emerald-800 mb-2">
              Benefícios CNH 360 para Autoescolas
            </h4>
            <ul className="space-y-2 text-sm text-emerald-700">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                15% de comissão por aluno captado
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                20% sobre aulas de MEIs alocados
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Gestão completa de turmas híbridas
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
