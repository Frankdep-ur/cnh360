import { useState, useEffect } from "react";
import { Building2, Check, Loader2, Landmark, AlertTriangle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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

export function BankAccountSetup({ open, onClose, onSuccess, existingRecipientId }: BankAccountSetupProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  
  // Form data
  const [holderType, setHolderType] = useState<"individual" | "company">("individual");
  const [documentNumber, setDocumentNumber] = useState("");
  const [holderName, setHolderName] = useState("");
  const [email, setEmail] = useState("");
  
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
    }
  }, [open]);

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
    // Validate holder info
    if (!holderName || holderName.trim().length < 3) {
      return "Nome do titular deve ter pelo menos 3 caracteres";
    }

    const cleanDoc = documentNumber.replace(/\D/g, "");
    if (holderType === "individual" && cleanDoc.length !== 11) {
      return "CPF deve ter 11 dígitos";
    }
    if (holderType === "company" && cleanDoc.length !== 14) {
      return "CNPJ deve ter 14 dígitos";
    }

    if (!email || !email.includes("@")) {
      return "E-mail inválido";
    }

    // Validate bank data
    if (!bankCode) {
      return "Selecione o banco";
    }

    if (!agencia || agencia.length < 1) {
      return "Informe a agência";
    }

    if (!conta || conta.length < 1) {
      return "Informe o número da conta";
    }

    if (!contaDv) {
      return "Informe o dígito verificador da conta";
    }

    return null;
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
      
      // Map technical errors to user-friendly messages
      if (error.message.includes("Authorization") || error.message.includes("denied")) {
        friendlyMessage = "Erro de configuração do sistema. Por favor, entre em contato com o suporte.";
      } else if (error.message.includes("Edge Function")) {
        friendlyMessage = "Erro de conexão. Tente novamente em alguns segundos.";
      }
      
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
              onChange={(e) => setDocumentNumber(formatDocument(e.target.value, holderType))}
              placeholder={holderType === "individual" ? "000.000.000-00" : "00.000.000/0000-00"}
              maxLength={holderType === "individual" ? 14 : 18}
            />
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

          {/* Aviso importante sobre PIX */}
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-amber-700 dark:text-amber-300">
              <p className="font-medium">Importante: Conta bancária obrigatória</p>
              <p className="mt-1">
                A Pagar.me exige conta bancária completa para saques automáticos. 
                Chave PIX não é suportada para transferências automáticas.
              </p>
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
                  onChange={(e) => setAgencia(e.target.value.replace(/\D/g, ""))}
                  placeholder="0000"
                  maxLength={5}
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

            {/* Account */}
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2 space-y-2">
                <Label>Conta *</Label>
                <Input
                  value={conta}
                  onChange={(e) => setConta(e.target.value.replace(/\D/g, ""))}
                  placeholder="00000000"
                  maxLength={12}
                />
              </div>
              <div className="space-y-2">
                <Label>Dígito *</Label>
                <Input
                  value={contaDv}
                  onChange={(e) => setContaDv(e.target.value)}
                  placeholder="0"
                  maxLength={2}
                />
              </div>
            </div>

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
