import { useState, useEffect } from "react";
import { Building2, Check, Loader2, Landmark, AlertTriangle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { validateCPF, validateCNPJ } from "@/lib/validations";

interface BankAccountSetupProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  existingRecipientId?: string | null;
}

// Bancos SUPORTADOS pela Pagar.me para saques automáticos
// NOTA: Bancos digitais como PicPay, Stone e Neon NÃO são suportados
const SUPPORTED_BANKS = [
  { code: "001", name: "Banco do Brasil" },
  { code: "033", name: "Santander" },
  { code: "104", name: "Caixa Econômica" },
  { code: "237", name: "Bradesco" },
  { code: "341", name: "Itaú" },
  { code: "260", name: "Nubank" },
  { code: "077", name: "Inter" },
  { code: "336", name: "C6 Bank" },
  { code: "290", name: "PagBank" },
  { code: "756", name: "Sicoob" },
  { code: "748", name: "Sicredi" },
  { code: "422", name: "Safra" },
  { code: "212", name: "Banco Original" },
];

// Bancos NÃO suportados (para exibir aviso se usuário mencionar)
const UNSUPPORTED_BANKS = ["380", "197", "655"]; // PicPay, Stone, Neon

type Status = "idle" | "loading" | "success" | "error";

// Interface para erros específicos de campo
interface FieldErrors {
  documentNumber?: string;
  agencia?: string;
  conta?: string;
  contaDv?: string;
  holderName?: string;
  email?: string;
  bankCode?: string;
}

export function BankAccountSetup({ open, onClose, onSuccess, existingRecipientId }: BankAccountSetupProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  
  // Form data
  const [holderType, setHolderType] = useState<"individual" | "company">("individual");
  const [documentNumber, setDocumentNumber] = useState("");
  const [holderName, setHolderName] = useState("");
  const [email, setEmail] = useState("");
  
  // Campos adicionais obrigatórios para pessoa física (Pagar.me V5)
  const [birthdate, setBirthdate] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("3000");
  const [professionalOccupation, setProfessionalOccupation] = useState("instrutor_transito");
  
  // Endereço (obrigatório para pessoa física)
  const [street, setStreet] = useState("");
  const [streetNumber, setStreetNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [loadingCep, setLoadingCep] = useState(false);
  const [cepError, setCepError] = useState("");
  
  // Bank account - OBRIGATÓRIO para saques automáticos
  const [bankCode, setBankCode] = useState("");
  const [agencia, setAgencia] = useState("");
  const [agenciaDv, setAgenciaDv] = useState("");
  const [conta, setConta] = useState("");
  const [contaDv, setContaDv] = useState("");
  const [accountType, setAccountType] = useState<"checking" | "savings">("checking");

  // Load user data on mount
  useEffect(() => {
    if (open) {
      loadUserData();
      setStatus("idle");
      setErrorMessage("");
      setFieldErrors({});
    }
  }, [open]);

  // Clear field error when user types
  const clearFieldError = (field: keyof FieldErrors) => {
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const loadUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email) {
      setEmail(user.email);
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, cpf, phone")
      .eq("id", user?.id)
      .maybeSingle();

    if (profile) {
      if (profile.full_name) setHolderName(profile.full_name);
      if (profile.cpf) setDocumentNumber(formatDocument(profile.cpf, "individual"));
    }
  };

  // Busca automática de endereço por CEP via ViaCEP
  const fetchAddressByCep = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length !== 8) return;
    
    setLoadingCep(true);
    setCepError("");
    
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();
      
      if (data.erro) {
        setCepError("CEP não encontrado");
        return;
      }
      
      // Preencher campos automaticamente
      if (data.logradouro) setStreet(data.logradouro);
      if (data.bairro) setNeighborhood(data.bairro);
      if (data.localidade) setCity(data.localidade);
      if (data.uf) setState(data.uf);
      
      toast.success("Endereço encontrado!", {
        description: `${data.localidade} - ${data.uf}`,
      });
    } catch (error) {
      console.error("[BankAccountSetup] CEP lookup error:", error);
      setCepError("Erro ao buscar CEP. Tente novamente.");
    } finally {
      setLoadingCep(false);
    }
  };

  // Handler para formatação e busca automática do CEP
  const handleCepChange = (value: string) => {
    // Formatar CEP: 00000-000
    const formatted = value.replace(/\D/g, "")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .slice(0, 9);
    
    setZipCode(formatted);
    setCepError("");
    
    // Buscar quando tiver 8 dígitos
    const cleanCep = formatted.replace(/\D/g, "");
    if (cleanCep.length === 8) {
      fetchAddressByCep(cleanCep);
    }
  };

  const formatDocument = (value: string, type: "individual" | "company") => {
    const numbers = value.replace(/\D/g, "");
    if (type === "individual") {
      // CPF: 000.000.000-00
      return numbers
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})/, "$1-$2")
        .slice(0, 14);
    } else {
      // CNPJ: 00.000.000/0000-00
      return numbers
        .replace(/(\d{2})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1/$2")
        .replace(/(\d{4})(\d{1,2})/, "$1-$2")
        .slice(0, 18);
    }
  };

  const validateForm = (): string | null => {
    const errors: FieldErrors = {};
    
    // Validate holder info
    if (!holderName || holderName.trim().length < 3) {
      errors.holderName = "Nome deve ter pelo menos 3 caracteres";
    }

    const cleanDoc = documentNumber.replace(/\D/g, "");
    if (holderType === "individual") {
      if (cleanDoc.length !== 11) {
        errors.documentNumber = "CPF deve ter 11 dígitos";
      } else if (!validateCPF(cleanDoc)) {
        errors.documentNumber = "CPF inválido. Verifique os números digitados.";
      }
      
      // Validar campos obrigatórios para pessoa física
      if (!birthdate) {
        return "Informe a data de nascimento";
      }
      if (!street || !streetNumber || !neighborhood || !city || !state || !zipCode) {
        return "Preencha todos os campos do endereço";
      }
    } else {
      if (cleanDoc.length !== 14) {
        errors.documentNumber = "CNPJ deve ter 14 dígitos";
      } else if (!validateCNPJ(cleanDoc)) {
        errors.documentNumber = "CNPJ inválido. Verifique os números digitados.";
      }
    }

    if (!email || !email.includes("@")) {
      errors.email = "E-mail inválido";
    }

    // Validate bank data
    if (!bankCode) {
      errors.bankCode = "Selecione o banco";
    }

    if (!agencia || agencia.length < 1) {
      errors.agencia = "Informe a agência";
    }

    if (!conta || conta.length < 1) {
      errors.conta = "Informe o número da conta";
    }

    if (!contaDv) {
      errors.contaDv = "Informe o dígito";
    }

    setFieldErrors(errors);
    
    // Return first error message for general display
    const firstError = Object.values(errors)[0];
    return firstError || null;
  };

  const handleSubmit = async () => {
    setStatus("loading");
    setErrorMessage("");

    try {
      // Validate form
      const validationError = validateForm();
      if (validationError) {
        throw new Error(validationError);
      }

      const payload = {
        type: holderType,
        documentNumber: documentNumber.replace(/\D/g, ""),
        name: holderName.trim(),
        email: email.trim().toLowerCase(),
        // Campos adicionais obrigatórios para pessoa física
        birthdate: holderType === "individual" ? birthdate : undefined,
        monthlyIncome: holderType === "individual" ? parseInt(monthlyIncome) * 100 : undefined, // Em centavos
        professionalOccupation: holderType === "individual" ? professionalOccupation : undefined,
        address: holderType === "individual" ? {
          street: street.trim(),
          streetNumber: streetNumber.trim(),
          complement: complement.trim() || undefined,
          neighborhood: neighborhood.trim(),
          city: city.trim(),
          state: state.trim().toUpperCase(),
          zipCode: zipCode.replace(/\D/g, ""),
        } : undefined,
        // Dados bancários
        bankCode,
        agencia: agencia.replace(/\D/g, ""),
        agenciaDv: agenciaDv?.replace(/\D/g, "") || "",
        conta: conta.replace(/\D/g, ""),
        contaDv: contaDv || "",
        accountType,
      };

      console.log("[BankAccountSetup] Submitting payload:", { 
        ...payload, 
        documentNumber: payload.documentNumber.slice(0, 4) + "***" 
      });

      const { data, error } = await supabase.functions.invoke("create-instructor-recipient-pagarme", {
        body: payload,
      });

      console.log("[BankAccountSetup] Response:", { data, error });

      if (error) {
        console.error("[BankAccountSetup] Invoke error:", error);
        throw new Error(error.message || "Erro ao configurar dados bancários");
      }

      if (data?.error) {
        console.error("[BankAccountSetup] API error:", data.error);
        throw new Error(data.error);
      }

      setStatus("success");
      toast.success("Dados bancários configurados!", {
        description: "Você receberá seus pagamentos automaticamente",
      });

      setTimeout(() => {
        onSuccess?.();
        onClose();
        setStatus("idle");
      }, 1500);

    } catch (error: any) {
      console.error("[BankAccountSetup] Error:", error);
      setStatus("error");
      
      let friendlyMessage = error.message;
      const newFieldErrors: FieldErrors = {};
      
      // Map technical errors to user-friendly messages with field highlighting
      const errorLower = error.message.toLowerCase();
      
      if (errorLower.includes("authorization") || errorLower.includes("denied") || errorLower.includes("autenticação")) {
        friendlyMessage = "Erro de configuração do sistema. Por favor, entre em contato com o suporte.";
      } else if (errorLower.includes("edge function") || errorLower.includes("conexão")) {
        friendlyMessage = "Erro de conexão. Tente novamente em alguns segundos.";
      } else if (errorLower.includes("agência") || errorLower.includes("branch")) {
        friendlyMessage = "Número da agência inválido. Verifique se digitou corretamente.";
        newFieldErrors.agencia = friendlyMessage;
      } else if (errorLower.includes("dígito") && (errorLower.includes("conta") || errorLower.includes("account"))) {
        friendlyMessage = "Dígito verificador da conta incorreto. Verifique no seu extrato ou cartão.";
        newFieldErrors.contaDv = friendlyMessage;
      } else if (errorLower.includes("conta") || errorLower.includes("account_number")) {
        friendlyMessage = "Número da conta inválido. Verifique se digitou corretamente.";
        newFieldErrors.conta = friendlyMessage;
      } else if (errorLower.includes("cpf") || errorLower.includes("cnpj") || errorLower.includes("document")) {
        friendlyMessage = "CPF/CNPJ inválido ou não corresponde ao titular da conta bancária.";
        newFieldErrors.documentNumber = friendlyMessage;
      } else if (errorLower.includes("já está") || errorLower.includes("already") || errorLower.includes("exists")) {
        friendlyMessage = "Esta conta bancária já está vinculada a outro recebedor.";
      } else if (errorLower.includes("banco") || errorLower.includes("bank")) {
        friendlyMessage = "Código do banco inválido ou não suportado.";
        newFieldErrors.bankCode = friendlyMessage;
      } else if (errorLower.includes("titular") || errorLower.includes("holder")) {
        friendlyMessage = "Nome do titular não confere com os dados da conta bancária.";
        newFieldErrors.holderName = friendlyMessage;
      }
      
      setFieldErrors(prev => ({ ...prev, ...newFieldErrors }));
      setErrorMessage(friendlyMessage);
      toast.error("Erro ao configurar", {
        description: friendlyMessage,
      });
    }
  };

  if (status === "success") {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-20 h-20 rounded-full bg-[#4CAF50] flex items-center justify-center mb-4 animate-in zoom-in duration-300">
              <Check className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Configurado!</h2>
            <p className="text-muted-foreground text-center">
              Seus pagamentos serão depositados automaticamente
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Landmark className="w-5 h-5 text-primary" />
            Configurar Recebimento
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {existingRecipientId && (
            <div className="p-3 bg-[#4CAF50]/10 rounded-lg flex items-center gap-2">
              <Check className="w-4 h-4 text-[#4CAF50]" />
              <span className="text-sm text-[#4CAF50]">Dados bancários já configurados</span>
            </div>
          )}

          {/* Holder Type */}
          <div className="space-y-2">
            <Label>Tipo de conta</Label>
            <Select value={holderType} onValueChange={(v) => setHolderType(v as "individual" | "company")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="individual">Pessoa Física (CPF)</SelectItem>
                <SelectItem value="company">Pessoa Jurídica (CNPJ)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Document */}
          <div className="space-y-2">
            <Label>{holderType === "individual" ? "CPF *" : "CNPJ *"}</Label>
            <Input
              value={documentNumber}
              onChange={(e) => {
                setDocumentNumber(formatDocument(e.target.value, holderType));
                clearFieldError("documentNumber");
              }}
              placeholder={holderType === "individual" ? "000.000.000-00" : "00.000.000/0000-00"}
              maxLength={holderType === "individual" ? 14 : 18}
              className={fieldErrors.documentNumber ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {fieldErrors.documentNumber && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {fieldErrors.documentNumber}
              </p>
            )}
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label>Nome {holderType === "company" ? "da empresa *" : "completo *"}</Label>
            <Input
              value={holderName}
              onChange={(e) => setHolderName(e.target.value)}
              placeholder={holderType === "company" ? "Razão social" : "Seu nome completo"}
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label>E-mail *</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
            />
          </div>

          {/* Campos adicionais para Pessoa Física */}
          {holderType === "individual" && (
            <>
              {/* Data de Nascimento */}
              <div className="space-y-2">
                <Label>Data de Nascimento *</Label>
                <Input
                  type="date"
                  value={birthdate}
                  onChange={(e) => setBirthdate(e.target.value)}
                  max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                />
                <p className="text-xs text-muted-foreground">Você deve ter pelo menos 18 anos</p>
              </div>

              {/* Endereço */}
              <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Info className="w-4 h-4" />
                  Endereço Residencial
                </div>
                
                <div className="space-y-2">
                  <Label>CEP *</Label>
                  <div className="relative">
                    <Input
                      value={zipCode}
                      onChange={(e) => handleCepChange(e.target.value)}
                      placeholder="00000-000"
                      maxLength={9}
                      className={cepError ? "border-destructive focus-visible:ring-destructive pr-10" : "pr-10"}
                    />
                    {loadingCep && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                  {cepError && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {cepError}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Digite o CEP para preencher o endereço automaticamente
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Rua/Avenida *</Label>
                  <Input
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="Nome da rua"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label>Número *</Label>
                    <Input
                      value={streetNumber}
                      onChange={(e) => setStreetNumber(e.target.value)}
                      placeholder="123"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Complemento</Label>
                    <Input
                      value={complement}
                      onChange={(e) => setComplement(e.target.value)}
                      placeholder="Apto 10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Bairro *</Label>
                  <Input
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    placeholder="Centro"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label>Cidade *</Label>
                    <Input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="São Paulo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Estado *</Label>
                    <Input
                      value={state}
                      onChange={(e) => setState(e.target.value.toUpperCase().slice(0, 2))}
                      placeholder="SP"
                      maxLength={2}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Aviso importante sobre bancos não suportados */}
          <div className="p-3 bg-amber-500/15 border border-amber-500/40 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-700 dark:text-amber-300">
                <p className="font-semibold">⚠️ PicPay, Stone e Neon NÃO são suportados</p>
                <p className="mt-1 text-xs">
                  Para receber automaticamente, use bancos como <strong>Nubank</strong>, <strong>Inter</strong>, <strong>PagBank</strong>, Itaú, Bradesco ou Banco do Brasil.
                </p>
                <p className="mt-2 text-xs opacity-80">
                  Chaves PIX também não funcionam para saques automáticos. Informe os dados completos da conta.
                </p>
              </div>
            </div>
          </div>

          {/* Dados bancários - Obrigatório */}
          <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Building2 className="w-4 h-4" />
              Dados Bancários
            </div>

            {/* Bank */}
            <div className="space-y-2">
              <Label>Banco *</Label>
              <Select value={bankCode} onValueChange={setBankCode}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o banco" />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_BANKS.map((bank) => (
                    <SelectItem key={bank.code} value={bank.code}>
                      {bank.code} - {bank.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Info className="w-3 h-3" />
                PicPay, Stone e Neon não são suportados para saques
              </p>
            </div>

            {/* Agency */}
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2 space-y-2">
                <Label>Agência *</Label>
                <Input
                  value={agencia}
                  onChange={(e) => {
                    setAgencia(e.target.value.replace(/\D/g, ""));
                    clearFieldError("agencia");
                  }}
                  placeholder="0000"
                  maxLength={5}
                  className={fieldErrors.agencia ? "border-destructive focus-visible:ring-destructive" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label>Dígito</Label>
                <Input
                  value={agenciaDv}
                  onChange={(e) => setAgenciaDv(e.target.value.replace(/\D/g, ""))}
                  placeholder="0"
                  maxLength={1}
                />
              </div>
            </div>
            {fieldErrors.agencia && (
              <p className="text-xs text-destructive flex items-center gap-1 -mt-2">
                <AlertTriangle className="w-3 h-3" />
                {fieldErrors.agencia}
              </p>
            )}

            {/* Account */}
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2 space-y-2">
                <Label>Conta *</Label>
                <Input
                  value={conta}
                  onChange={(e) => {
                    setConta(e.target.value.replace(/\D/g, ""));
                    clearFieldError("conta");
                  }}
                  placeholder="00000000"
                  maxLength={12}
                  className={fieldErrors.conta ? "border-destructive focus-visible:ring-destructive" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label>Dígito *</Label>
                <Input
                  value={contaDv}
                  onChange={(e) => {
                    setContaDv(e.target.value);
                    clearFieldError("contaDv");
                  }}
                  placeholder="0"
                  maxLength={2}
                  className={fieldErrors.contaDv ? "border-destructive focus-visible:ring-destructive" : ""}
                />
              </div>
            </div>
            {(fieldErrors.conta || fieldErrors.contaDv) && (
              <p className="text-xs text-destructive flex items-center gap-1 -mt-2">
                <AlertTriangle className="w-3 h-3" />
                {fieldErrors.conta || fieldErrors.contaDv}
              </p>
            )}

            {/* Account Type */}
            <div className="space-y-2">
              <Label>Tipo de conta *</Label>
              <Select value={accountType} onValueChange={(v) => setAccountType(v as "checking" | "savings")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="checking">Conta Corrente</SelectItem>
                  <SelectItem value="savings">Conta Poupança</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Error Message */}
          {status === "error" && errorMessage && (
            <div className="p-3 bg-destructive/10 rounded-lg flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
              <span className="text-sm text-destructive">{errorMessage}</span>
            </div>
          )}

          {/* Info */}
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">
              🔒 Seus dados são criptografados e processados de forma segura pela Pagar.me (Stone).
              Os pagamentos são transferidos automaticamente após cada aula confirmada.
            </p>
          </div>

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={status === "loading"}
            className="w-full"
            size="lg"
          >
            {status === "loading" ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Configurando...
              </>
            ) : existingRecipientId ? (
              "Atualizar dados"
            ) : (
              "Salvar dados bancários"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
