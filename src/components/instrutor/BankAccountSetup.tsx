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

// Bancos que EXIGEM dígito verificador de agência (opcional na maioria)
// NOTA: A maioria dos bancos brasileiros NÃO tem dígito de agência
// Apenas alguns bancos tradicionais usam isso (e mesmo assim é raro)
const BANKS_REQUIRING_AGENCY_DV: string[] = [
  // Lista vazia - dígito de agência é OPCIONAL para todos os bancos
  // A Pagar.me valida isso automaticamente
];

// Bancos onde o dígito de agência é comum (mas não obrigatório)
const BANKS_WITH_COMMON_AGENCY_DV = [
  "001", // Banco do Brasil - alguns usam
  "033", // Santander - alguns usam
];

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
  birthdate?: string;
}

export function BankAccountSetup({ open, onClose, onSuccess, existingRecipientId }: BankAccountSetupProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  
  // Split verification state
  const [splitEnabled, setSplitEnabled] = useState<boolean | null>(null);
  const [checkingSplit, setCheckingSplit] = useState(true);
  
  // Form data
  const [holderType, setHolderType] = useState<"individual" | "company">("individual");
  const [documentNumber, setDocumentNumber] = useState("");
  const [holderName, setHolderName] = useState("");
  const [email, setEmail] = useState("");
  
  // Campos adicionais obrigatórios para pessoa física (Pagar.me V5)
  const [birthdate, setBirthdate] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("3000");
  const [professionalOccupation, setProfessionalOccupation] = useState("instrutor_transito");
  
  // Address loaded from profile
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [hasAddress, setHasAddress] = useState(false);
  
  // Bank account - OBRIGATÓRIO para saques automáticos
  const [bankCode, setBankCode] = useState("");
  const [agencia, setAgencia] = useState("");
  const [agenciaDv, setAgenciaDv] = useState("");
  const [conta, setConta] = useState("");
  const [contaDv, setContaDv] = useState("");
  const [accountType, setAccountType] = useState<"checking" | "savings">("checking");

  // Check Split/Marketplace status when modal opens
  const checkSplitEnabled = async () => {
    setCheckingSplit(true);
    try {
      console.log("[BankAccountSetup] Checking if Split/Marketplace is enabled...");
      const { data, error } = await supabase.functions.invoke("check-pagarme-split-enabled");
      
      if (error) {
        console.error("[BankAccountSetup] Error checking Split:", error);
        setSplitEnabled(null); // Indeterminate - allow form to show
      } else {
        console.log("[BankAccountSetup] Split check result:", data);
        setSplitEnabled(data?.enabled ?? false);
      }
    } catch (err) {
      console.error("[BankAccountSetup] Exception checking Split:", err);
      setSplitEnabled(null); // Indeterminate - allow form to show
    } finally {
      setCheckingSplit(false);
    }
  };

  // Load user data on mount
  useEffect(() => {
    if (open) {
      checkSplitEnabled();
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
      .select("full_name, cpf, phone, cidade, estado")
      .eq("id", user?.id)
      .maybeSingle();

    if (profile) {
      if (profile.full_name) setHolderName(profile.full_name);
      if (profile.cpf) setDocumentNumber(formatDocument(profile.cpf, "individual"));
      if (profile.cidade) setCity(profile.cidade);
      if (profile.estado) setState(profile.estado);
      setHasAddress(!!(profile.cidade && profile.estado));
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
        errors.birthdate = "Informe a data de nascimento";
      } else {
        // Validar idade mínima (18 anos)
        const birth = new Date(birthdate);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
          age--;
        }
        if (age < 18) {
          errors.birthdate = "Você deve ter pelo menos 18 anos";
        }
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

    // Dígito de agência é OPCIONAL - não exigir mais
    // A Pagar.me valida automaticamente se o banco precisa ou não
    if (false && bankCode && BANKS_REQUIRING_AGENCY_DV.includes(bankCode) && !agenciaDv) {
      const bankName = SUPPORTED_BANKS.find(b => b.code === bankCode)?.name || bankCode;
      errors.agencia = `O ${bankName} exige o dígito verificador da agência`;
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
        // Address from profile (simplified - just city/state for Pagar.me)
        address: holderType === "individual" ? {
          street: "Rua Principal",
          streetNumber: "1",
          neighborhood: "Centro",
          city: city.trim(),
          state: state.trim().toUpperCase(),
          zipCode: "00000000", // Will be filled by Pagar.me
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
      toast.success("Dados enviados pra Pagar.me!", {
        description: "Aguarde aprovação (pode levar alguns minutos). Você receberá seus pagamentos automaticamente após aprovação.",
        duration: 6000,
      });

      setTimeout(() => {
        onSuccess?.();
        onClose();
        setStatus("idle");
      }, 2000);

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
          {/* Split/Marketplace verification loading */}
          {checkingSplit && (
            <div className="p-4 bg-muted/50 rounded-lg flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Verificando configuração do sistema...</span>
            </div>
          )}

          {/* Split not enabled - blocking error */}
          {splitEnabled === false && !checkingSplit && (
            <div className="p-4 bg-destructive/10 border border-destructive/40 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-destructive mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-destructive">Sistema em Configuração</p>
                  <p className="text-sm text-destructive/80 mt-1">
                    A funcionalidade de recebimentos ainda não está habilitada. 
                    Entre em contato com o suporte do CNH360 para ativar.
                  </p>
                  <Button variant="outline" size="sm" className="mt-3" onClick={onClose}>
                    Fechar
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Main form content - only show when Split is enabled or indeterminate */}
          {splitEnabled !== false && !checkingSplit && (
            <>
              {existingRecipientId && (
                <div className="p-3 bg-[#4CAF50]/10 rounded-lg flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#4CAF50]" />
                  <span className="text-sm text-[#4CAF50]">Dados bancários já configurados</span>
                </div>
              )}

              {/* Address info from profile */}
              {hasAddress && (
                <div className="p-3 bg-secondary/10 rounded-lg flex items-center gap-2">
                  <Info className="w-4 h-4 text-secondary" />
                  <span className="text-sm text-secondary">
                    Localização: <strong>{city} - {state}</strong>
                  </span>
                </div>
              )}

              {!hasAddress && holderType === "individual" && (
                <div className="p-3 bg-amber-500/15 border border-amber-500/40 rounded-lg flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-amber-700 dark:text-amber-300">
                    Complete seu cadastro de instrutor primeiro para informar sua cidade.
                  </span>
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
            <div className="space-y-2">
              <Label>Data de Nascimento *</Label>
              <Input
                type="date"
                value={birthdate}
                onChange={(e) => {
                  setBirthdate(e.target.value);
                  clearFieldError("birthdate");
                }}
                max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                className={fieldErrors.birthdate ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              {fieldErrors.birthdate && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {fieldErrors.birthdate}
                </p>
              )}
              <p className="text-xs text-muted-foreground">Você deve ter pelo menos 18 anos</p>
            </div>
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
                <Label className="text-muted-foreground">
                  Dígito
                </Label>
                <Input
                  value={agenciaDv}
                  onChange={(e) => {
                    setAgenciaDv(e.target.value.replace(/\D/g, ""));
                    clearFieldError("agencia");
                  }}
                  placeholder="-"
                  maxLength={1}
                />
              </div>
            </div>
            {/* Hint: dígito de agência é opcional */}
            <p className="text-xs text-muted-foreground -mt-2 flex items-center gap-1">
              <Info className="w-3 h-3" />
              A maioria das agências <strong>não tem dígito</strong>. Deixe vazio se não tiver.
            </p>
            {fieldErrors.agencia && (
              <p className="text-xs text-destructive flex items-center gap-1">
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
            disabled={status === "loading" || (!hasAddress && holderType === "individual")}
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
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
