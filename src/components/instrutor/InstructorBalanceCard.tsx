import { useState } from "react";
import { Wallet, RefreshCw, TrendingUp, Clock, ArrowUpRight, AlertCircle, Hourglass, Camera, Loader2, Building2, ExternalLink, CheckCircle2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { openExternalLink } from "@/lib/openExternalLink";

interface BalanceData {
  available: number;
  waitingFunds: number;
  transferred: number;
  currency: string;
}

interface InstructorBalanceCardProps {
  hasRecipient: boolean;
  onSetupClick?: () => void;
  onReRegisterClick?: () => void;
}

export function InstructorBalanceCard({ hasRecipient, onSetupClick, onReRegisterClick }: InstructorBalanceCardProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingKyc, setLoadingKyc] = useState(false);
  const [balance, setBalance] = useState<BalanceData | null>(null);
  const [recipientStatus, setRecipientStatus] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const formatCurrency = (value: number, currency: string = "BRL") => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency,
    }).format(value);
  };

  const fetchBalance = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke(
        "get-instructor-balance-pagarme"
      );

      if (invokeError) {
        throw new Error("Erro ao consultar saldo");
      }

      if (data?.error) {
        if (data.needsSetup) {
          setError("Configure seus dados bancários para ver o saldo");
        } else {
          throw new Error(data.error);
        }
        return;
      }

      if (data?.balance) {
        setBalance(data.balance);
        setLastUpdated(new Date());
      }

      if (data?.recipientStatus) {
        setRecipientStatus(data.recipientStatus);
      }

      if (data?.message) {
        setStatusMessage(data.message);
      }
    } catch (err: any) {
      console.error("[InstructorBalanceCard] Error:", err);
      setError("Saldo não disponível agora");
      toast({
        variant: "destructive",
        title: "Erro",
        description: err.message || "Não foi possível consultar o saldo",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyIdentity = async () => {
    setLoadingKyc(true);
    setError(null);

    try {
      // Call start-kyc Edge Function
      const { data, error: invokeError } = await supabase.functions.invoke(
        "start-kyc"
      );

      if (invokeError) {
        throw new Error("Erro ao iniciar verificação");
      }

      // Handle already active
      if (data?.status === "already_active") {
        toast({
          title: "Conta já verificada! ✅",
          description: "Você pode fazer saques normalmente.",
        });
        fetchBalance();
        return;
      }

      // Handle recipient not found
      if (data?.error === "recipient_not_found") {
        toast({
          variant: "destructive",
          title: "Dados bancários não configurados",
          description: "Configure seus dados bancários primeiro.",
        });
        return;
      }

      // Handle KYC link generation failure
      if (data?.error === "kyc_link_failed") {
        toast({
          variant: "destructive",
          title: "Erro ao gerar link",
          description: "Erro ao gerar link de verificação. Tente novamente ou contate suporte CNH360.",
        });
        return;
      }

      // Handle any other error
      if (data?.error) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: data.message || "Erro ao gerar link de verificação. Tente novamente ou contate suporte CNH360.",
        });
        return;
      }

      // Success - open KYC URL directly in app
      if (data?.kyc_url) {
        const sourceLabel = data.source === "cached" ? "(link salvo)" : "";
        toast({
          title: "Verificação iniciada! 📸",
          description: `Complete a verificação facial na tela que vai abrir. ${sourceLabel}`,
          duration: 5000,
        });
        
        // Open KYC URL using the external link helper (works in PWA/WebView)
        openExternalLink(data.kyc_url);
        return;
      }

      // Fallback error
      toast({
        variant: "destructive",
        title: "Erro inesperado",
        description: "Não foi possível iniciar a verificação.",
      });

    } catch (err: any) {
      console.error("[InstructorBalanceCard] KYC Error:", err);
      toast({
        variant: "destructive",
        title: "Erro",
        description: err.message || "Não foi possível iniciar a verificação",
      });
    } finally {
      setLoadingKyc(false);
    }
  };

  // If no recipient configured, show setup prompt
  if (!hasRecipient) {
    return (
      <div className="bg-card rounded-2xl shadow-card p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-secondary" />
          </div>
          <h3 className="font-semibold text-foreground">Saldo</h3>
        </div>
        
        <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-900/20">
          <AlertCircle className="w-4 h-4 text-amber-600" />
          <AlertDescription className="text-amber-700 dark:text-amber-300">
            Configure seus dados bancários para visualizar seu saldo e receber pagamentos.
          </AlertDescription>
        </Alert>
        
        {onSetupClick && (
          <Button 
            variant="outline" 
            className="w-full mt-3"
            onClick={onSetupClick}
          >
            Configurar dados bancários
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl shadow-card p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-secondary" />
          </div>
          <h3 className="font-semibold text-foreground">Saldo</h3>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={fetchBalance}
          disabled={loading}
          className="h-8 w-8"
        >
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
        </Button>
      </div>

      {/* Status Alert for Affiliation/Refused/Suspended */}
      {recipientStatus && recipientStatus !== "active" && statusMessage && (
        <Alert className={cn(
          "mb-4",
          recipientStatus === "affiliation" && "border-amber-200 bg-amber-50 dark:bg-amber-900/20",
          recipientStatus === "refused" && "border-destructive/50 bg-destructive/10",
          recipientStatus === "suspended" && "border-destructive/50 bg-destructive/10"
        )}>
          {recipientStatus === "affiliation" ? (
            <Hourglass className="w-4 h-4 text-amber-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-destructive" />
          )}
          <AlertDescription className={cn(
            recipientStatus === "affiliation" && "text-amber-700 dark:text-amber-300",
            (recipientStatus === "refused" || recipientStatus === "suspended") && "text-destructive"
          )}>
            {statusMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Re-register button when refused */}
      {recipientStatus === "refused" && onReRegisterClick && (
        <Button
          variant="outline"
          className="w-full mb-4 border-destructive text-destructive hover:bg-destructive/10"
          onClick={onReRegisterClick}
        >
          <Building2 className="w-4 h-4 mr-2" />
          Recadastrar dados bancários
        </Button>
      )}

      {/* KYC Verification Banner - Show for affiliation OR not_started */}
      {(recipientStatus === "affiliation" || (!recipientStatus && hasRecipient)) && (
        <div className="mb-4 p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-800 flex items-center justify-center flex-shrink-0">
              <Camera className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-emerald-800 dark:text-emerald-200 mb-1">
                Verificação de Identidade
              </h4>
              <p className="text-sm text-emerald-700 dark:text-emerald-300 mb-3">
                {recipientStatus === "affiliation" 
                  ? "Verificação em análise. Caso não tenha completado, clique abaixo para iniciar."
                  : "Complete a verificação facial para liberar seus saques."}
              </p>
              <Button
                onClick={handleVerifyIdentity}
                disabled={loadingKyc}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {loadingKyc ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Gerando link...
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Verificar identidade agora
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {!balance && !loading && !error && (
        <Button 
          variant="outline" 
          className="w-full"
          onClick={fetchBalance}
        >
          <Wallet className="w-4 h-4 mr-2" />
          Consultar saldo
        </Button>
      )}

      {loading && (
        <div className="space-y-3">
          <Skeleton className="h-10 w-32" />
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        </div>
      )}

      {error && !loading && (
        <Alert variant="destructive" className="mb-3">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {balance && !loading && (
        <div className="space-y-4">
          {/* Available Balance - Main */}
          <div className="bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-xl p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <TrendingUp className="w-4 h-4" />
              Disponível para saque
            </div>
            <div className="text-2xl font-bold text-secondary">
              {formatCurrency(balance.available, balance.currency)}
            </div>
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <Clock className="w-3 h-3" />
                {recipientStatus === "affiliation" ? "Pendente (ativação)" : "A receber"}
              </div>
              <div className="font-semibold text-foreground">
                {formatCurrency(balance.waitingFunds, balance.currency)}
              </div>
              {recipientStatus === "affiliation" && balance.waitingFunds > 0 && (
                <p className="text-xs text-amber-600 mt-1">Liberação em 48h</p>
              )}
            </div>
            
            <div className="bg-muted/50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <ArrowUpRight className="w-3 h-3" />
                Já transferido
              </div>
              <div className="font-semibold text-foreground">
                {formatCurrency(balance.transferred, balance.currency)}
              </div>
            </div>
          </div>

          {/* Last Updated */}
          {lastUpdated && (
            <p className="text-xs text-center text-muted-foreground">
              Atualizado {lastUpdated.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
