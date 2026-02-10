import { useState, useEffect } from "react";
import { Loader2, Banknote, Building2, AlertTriangle, Check, ArrowRight, RefreshCw, CheckCircle2, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const WITHDRAWAL_FEE = 3.67;

interface BankData {
  holderName: string;
  document: string;
}

interface RecentWithdrawalInfo {
  valor: number;
  created_at: string;
  unlockAt: Date;
}

interface WithdrawModalProps {
  open: boolean;
  onClose: () => void;
  availableBalance: number;
  hasRecipient: boolean;
  onSetupBank?: () => void;
  onSuccess?: () => void;
}

export function WithdrawModal({ 
  open, 
  onClose, 
  availableBalance, 
  hasRecipient,
  onSetupBank,
  onSuccess 
}: WithdrawModalProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [bankData, setBankData] = useState<BankData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [recentWithdrawal, setRecentWithdrawal] = useState<RecentWithdrawalInfo | null>(null);
  const [checkingRecent, setCheckingRecent] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Reset status and check recent withdrawals when modal opens
  useEffect(() => {
    if (open) {
      setStatus("idle");
      setLoading(false);
      setErrorMessage(null);
      setRecentWithdrawal(null);
      if (hasRecipient) {
        loadBankData();
        checkRecentWithdrawals();
      }
    }
  }, [open, hasRecipient]);

  // Cooldown timer
  useEffect(() => {
    if (!cooldownUntil) {
      setCooldownSeconds(0);
      return;
    }

    const tick = () => {
      const remaining = Math.ceil((cooldownUntil - Date.now()) / 1000);
      if (remaining <= 0) {
        setCooldownUntil(null);
        setCooldownSeconds(0);
      } else {
        setCooldownSeconds(remaining);
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [cooldownUntil]);

  const checkRecentWithdrawals = async () => {
    setCheckingRecent(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: instrutor } = await supabase
        .from("instrutores")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!instrutor) return;

      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
      const { data: recentSaques } = await supabase
        .from("saques")
        .select("id, valor, created_at, status")
        .eq("instrutor_id", instrutor.id)
        .eq("status", "processado")
        .gte("created_at", twoHoursAgo)
        .order("created_at", { ascending: false })
        .limit(1);

      if (recentSaques && recentSaques.length > 0) {
        const saque = recentSaques[0];
        const saqueTime = new Date(saque.created_at);
        const unlockAt = new Date(saqueTime.getTime() + 2 * 60 * 60 * 1000);
        
        if (unlockAt > new Date()) {
          setRecentWithdrawal({
            valor: saque.valor / 100,
            created_at: saque.created_at,
            unlockAt,
          });
        }
      }
    } catch (err) {
      console.error("[WithdrawModal] Error checking recent withdrawals:", err);
    } finally {
      setCheckingRecent(false);
    }
  };

  const loadBankData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, cpf")
      .eq("id", user.id)
      .maybeSingle();

    if (profile) {
      setBankData({
        holderName: profile.full_name || "Titular",
        document: profile.cpf 
          ? `***.***.${profile.cpf.slice(-5, -2)}-**` 
          : "***.***.***-**",
      });
    }
  };

  const isCoolingDown = cooldownUntil !== null && Date.now() < cooldownUntil;

  const handleWithdraw = async () => {
    setStatus("loading");
    setLoading(true);
    setErrorMessage(null);

    try {
      const { data, error } = await supabase.functions.invoke(
        "request-manual-transfer-pagarme"
      );

      if (error) {
        const msg = error.message || "";
        if (msg.includes("non-2xx") || msg.includes("edge function")) {
          throw new Error("Não foi possível processar o saque. Tente novamente em alguns minutos.");
        }
        if (msg.includes("Failed to fetch") || msg.includes("network")) {
          throw new Error("Erro de conexão. Verifique sua internet e tente novamente.");
        }
        throw new Error(msg || "Erro ao solicitar saque");
      }

      if (data?.recentWithdrawal) {
        setRecentWithdrawal({
          valor: 0,
          created_at: data.lastWithdrawalAt,
          unlockAt: new Date(data.unlockAt),
        });
        setStatus("idle");
        setLoading(false);
        return;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (!data?.success) {
        throw new Error("Resposta inesperada do servidor. Tente novamente.");
      }

      setStatus("success");
      const net = (data.amount || availableBalance) - WITHDRAWAL_FEE;
      toast.success("Saque solicitado com sucesso!", {
        description: `${formatCurrency(net > 0 ? net : 0)} será creditado em até 1 dia útil (taxa: ${formatCurrency(WITHDRAWAL_FEE)}).`,
      });

      setTimeout(() => {
        onSuccess?.();
        onClose();
        setStatus("idle");
      }, 2500);

    } catch (err: any) {
      setStatus("error");
      const friendlyMsg = err.message || "Erro ao solicitar saque. Tente novamente.";
      setErrorMessage(friendlyMsg);
      
      toast.error("Falha na solicitação de saque", {
        description: friendlyMsg,
      });

      setCooldownUntil(Date.now() + 60_000);
      setLoading(false);
    }
  };

  const netAmount = availableBalance - WITHDRAWAL_FEE;
  const insufficientForFee = availableBalance <= WITHDRAWAL_FEE;
  const blockedByRecent = recentWithdrawal !== null;

  // Success state
  if (status === "success") {
    return (
      <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-20 h-20 rounded-full bg-[#4CAF50] flex items-center justify-center mb-4 animate-in zoom-in duration-300">
              <Check className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Saque Solicitado!</h2>
            <p className="text-muted-foreground text-center text-sm px-4">
              O valor líquido de <strong>{formatCurrency(netAmount)}</strong> será transferido para sua conta em até 1 dia útil.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              (Taxa de saque: {formatCurrency(WITHDRAWAL_FEE)})
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // No bank account registered
  if (!hasRecipient) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Banknote className="w-5 h-5 text-primary" />
              Sacar Saldo
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <Alert className="border-destructive/50 bg-destructive/10">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <AlertDescription className="text-destructive">
                Você precisa cadastrar sua conta bancária para sacar seu saldo.
              </AlertDescription>
            </Alert>
            
            <p className="text-sm text-muted-foreground mt-4">
              Para receber seus ganhos, cadastre uma conta bancária em seu nome. 
              Os saques são processados em até 1 dia útil.
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={onSetupBank} className="flex-1">
              <Building2 className="w-4 h-4 mr-2" />
              Cadastrar Conta
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Format remaining time for recent withdrawal block
  const getTimeRemaining = () => {
    if (!recentWithdrawal) return "";
    const remaining = recentWithdrawal.unlockAt.getTime() - Date.now();
    if (remaining <= 0) return "";
    const mins = Math.ceil(remaining / 60000);
    if (mins >= 60) {
      const hrs = Math.floor(mins / 60);
      const restMins = mins % 60;
      return `${hrs}h${restMins > 0 ? ` ${restMins}min` : ""}`;
    }
    return `${mins} min`;
  };

  // Main withdraw modal
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!loading && !v) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Banknote className="w-5 h-5 text-[#4CAF50]" />
            Sacar Saldo Disponível
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Recent withdrawal block */}
          {blockedByRecent && (
            <div className="p-4 rounded-xl bg-[#4CAF50]/10 border border-[#4CAF50]/30 space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#4CAF50]" />
                <span className="font-semibold text-[#4CAF50]">Saque já realizado!</span>
              </div>
              <p className="text-sm text-foreground">
                Seu último saque de <strong>{formatCurrency(recentWithdrawal.valor)}</strong> foi processado em{" "}
                {new Date(recentWithdrawal.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}.
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>Próximo saque disponível em {getTimeRemaining()}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                O valor será creditado em sua conta em até 1 dia útil.
              </p>
            </div>
          )}

          {/* Amount breakdown - show even when blocked for transparency */}
          {!blockedByRecent && (
            <div className="bg-gradient-to-br from-[#4CAF50]/10 to-[#4CAF50]/5 rounded-xl p-5 border border-[#4CAF50]/20 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Saldo disponível</span>
                <span className="text-lg font-semibold text-foreground">{formatCurrency(availableBalance)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Taxa de saque</span>
                <span className="text-sm font-medium text-destructive">-{formatCurrency(WITHDRAWAL_FEE)}</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between items-center">
                <span className="text-sm font-semibold text-foreground">Você receberá</span>
                <span className={cn("text-2xl font-bold", insufficientForFee ? "text-destructive" : "text-[#4CAF50]")}>
                  {insufficientForFee ? formatCurrency(0) : formatCurrency(netAmount)}
                </span>
              </div>
            </div>
          )}

          {/* Insufficient balance warning */}
          {!blockedByRecent && insufficientForFee && (
            <Alert className="border-destructive/50 bg-destructive/10">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <AlertDescription className="text-destructive text-sm">
                Saldo insuficiente para cobrir a taxa de saque (R$ 3,67). Acumule mais saldo antes de sacar.
              </AlertDescription>
            </Alert>
          )}

          {/* Error message */}
          {errorMessage && status === "error" && (
            <Alert className="border-destructive/50 bg-destructive/10">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <AlertDescription className="text-destructive text-sm">
                {errorMessage}
                {isCoolingDown && (
                  <span className="block mt-1 text-xs text-muted-foreground">
                    Tente novamente em {cooldownSeconds}s
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Bank account info */}
          {!blockedByRecent && bankData && (
            <div className="bg-muted/50 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Conta de destino</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-muted-foreground text-xs">Titular</p>
                  <p className="font-medium text-foreground text-sm truncate">{bankData.holderName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">CPF/CNPJ</p>
                  <p className="font-medium text-foreground text-sm">{bankData.document}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground pt-1 border-t border-border">
                Conta bancária cadastrada em seu perfil
              </p>
            </div>
          )}

          {/* Info banner */}
          {!blockedByRecent && (
            <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2">
                <span>⏱️</span>
                O valor será creditado em sua conta em até 1 dia útil após a solicitação.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button 
              variant="outline" 
              onClick={onClose} 
              className="flex-1"
              disabled={loading}
            >
              {blockedByRecent ? "Fechar" : "Cancelar"}
            </Button>
            {!blockedByRecent && (
              <Button 
                onClick={handleWithdraw} 
                className={cn(
                  "flex-1 text-white",
                  "bg-[#4CAF50] hover:bg-[#43A047]"
                )}
                disabled={loading || availableBalance <= 0 || isCoolingDown || insufficientForFee || checkingRecent}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : isCoolingDown ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Aguarde {cooldownSeconds}s
                  </>
                ) : (
                  <>
                    Confirmar Saque
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}