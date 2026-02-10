import { useState, useEffect } from "react";
import { ComplianceBanner } from "@/components/layout/ComplianceBanner";
import { ActiveLessonBanner } from "@/components/instrutor/ActiveLessonBanner";
import { useActiveLessonBanner } from "@/hooks/useActiveLessonBanner";
import { InstructorBottomNav } from "@/components/layout/InstructorBottomNav";
import { PremiumActivationModal } from "@/components/instrutor/PremiumActivationModal";
import { WithdrawModal } from "@/components/instrutor/WithdrawModal";
import { BankAccountSetup } from "@/components/instrutor/BankAccountSetup";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Wallet, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownLeft,
  Clock,
  CheckCircle2,
  Crown,
  Calendar,
  Download,
  Filter,
  ChevronRight,
  QrCode,
  Banknote,
  Car,
  Loader2,
  Hourglass,
  AlertCircle,
  Camera
} from "lucide-react";

export default function InstrutorGanhos() {
  const { activeLesson } = useActiveLessonBanner();
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showBankSetup, setShowBankSetup] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  
  // Real balance from Pagar.me
  const [balance, setBalance] = useState<{ available: number; waitingFunds: number } | null>(null);
  const [hasRecipient, setHasRecipient] = useState(false);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [recipientStatus, setRecipientStatus] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [loadingKyc, setLoadingKyc] = useState(false);

  // Real withdrawal history
  const [saques, setSaques] = useState<Array<{ id: string; valor: number; status: string; created_at: string; transfer_id: string | null }>>([]);
  const [loadingSaques, setLoadingSaques] = useState(false);
  const WITHDRAWAL_FEE = 3.67;

  // Handle KYC verification for affiliation status
  const handleVerifyIdentity = async () => {
    setLoadingKyc(true);
    try {
      const { data, error } = await supabase.functions.invoke("start-kyc");
      
      if (error) {
        console.error("Error getting KYC link:", error);
        return;
      }

      // Already active - refresh balance
      if (data?.status === "already_active") {
        fetchBalance();
        return;
      }

      // KYC is being processed by the financial institution
      if (data?.error === "kyc_processing") {
        console.log("KYC is being processed, try again later");
        return;
      }

      // Recipient was refused - needs re-registration
      if (data?.error === "recipient_refused") {
        console.log("Recipient refused, needs bank re-registration");
        return;
      }

      // Open KYC verification URL
      if (data?.kyc_url) {
        const fullUrl = data.kyc_url.startsWith("http") ? data.kyc_url : `https://${data.kyc_url}`;
        window.open(fullUrl, "_blank");
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoadingKyc(false);
    }
  };

  // Fetch real balance from Pagar.me (hybrid: API + local DB fallback)
  const fetchBalance = async () => {
    setLoadingBalance(true);
    try {
      const { data, error } = await supabase.functions.invoke("get-instructor-balance-pagarme");
      
      if (error) {
        console.error("Error fetching balance:", error);
        setHasRecipient(false);
        return;
      }

      if (data?.needsSetup) {
        setHasRecipient(false);
      } else if (data?.balance) {
        setBalance({
          available: data.balance.available,
          waitingFunds: data.balance.waitingFunds,
        });
        setHasRecipient(true);
      }

      // Handle recipient status for activation warnings
      if (data?.recipientStatus) {
        setRecipientStatus(data.recipientStatus);
      }
      if (data?.message) {
        setStatusMessage(data.message);
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoadingBalance(false);
    }
  };

  useEffect(() => {
    fetchBalance();
    fetchSaques();
  }, []);

  const fetchSaques = async () => {
    setLoadingSaques(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: instrutor } = await supabase
        .from("instrutores")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!instrutor) return;

      const { data, error } = await supabase
        .from("saques")
        .select("id, valor, status, created_at, transfer_id")
        .eq("instrutor_id", instrutor.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (!error) setSaques(data || []);
    } catch (err) {
      console.error("Error fetching saques:", err);
    } finally {
      setLoadingSaques(false);
    }
  };

  const saldo = {
    disponivel: balance?.available ?? 0,
    pendente: balance?.waitingFunds ?? 0,
    totalMes: 4850,
    taxaPaga: 1358,
    taxaAtual: isPremium ? 18 : 28,
  };

  const proximaAula = {
    aluno: "Milena Costa",
    data: "Hoje",
    hora: "14:00",
    valor: 100,
    liquido: isPremium ? 82 : 72,
  };

  const historicoPixRecebido = [
    { id: 1, valor: 500, data: "10/12/2025", banco: "Nubank", status: "concluido" },
    { id: 2, valor: 800, data: "05/12/2025", banco: "Nubank", status: "concluido" },
    { id: 3, valor: 650, data: "28/11/2025", banco: "Nubank", status: "concluido" },
  ];

  const transacoes = [
    {
      id: 1,
      tipo: "entrada",
      descricao: "Aula com Maria Santos",
      valor: 120,
      taxa: 33.60,
      liquido: 86.40,
      data: "10/12/2025",
      hora: "15:30",
      status: "concluido",
    },
    {
      id: 2,
      tipo: "entrada",
      descricao: "Aula com João Pereira",
      valor: 120,
      taxa: 33.60,
      liquido: 86.40,
      data: "10/12/2025",
      hora: "12:00",
      status: "concluido",
    },
    {
      id: 3,
      tipo: "saque",
      descricao: "Transferência Pix",
      valor: 500,
      data: "09/12/2025",
      hora: "18:00",
      status: "concluido",
    },
    {
      id: 4,
      tipo: "entrada",
      descricao: "Aula com Ana Costa",
      valor: 120,
      taxa: 33.60,
      liquido: 86.40,
      data: "09/12/2025",
      hora: "10:00",
      status: "pendente",
    },
  ];

  const resumoMensal = {
    aulasRealizadas: 89,
    horasTotais: 89,
    ganhoBruto: 6208,
    taxaTotal: isPremium ? Math.round(6208 * 0.18) : 1358,
    ganhoLiquido: isPremium ? Math.round(6208 * 0.82) : 4850,
  };

  return (
    <div className="app-container pb-24">
      <ComplianceBanner />
      
      <div className="px-4 py-6 page-enter space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">Meus Ganhos</h1>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-1" />
            Filtrar
          </Button>
        </div>

        {/* Active Lesson Banner */}
        {activeLesson && <ActiveLessonBanner lesson={activeLesson} />}

        {/* Status Alert for Account Activation */}
        {recipientStatus && recipientStatus !== "active" && statusMessage && (
          recipientStatus === "affiliation" ? (
            <Alert className="border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20">
              <Camera className="w-4 h-4 text-emerald-600" />
              <AlertDescription className="text-emerald-700 dark:text-emerald-300">
                <div className="flex flex-col gap-3">
                  <span>{statusMessage}</span>
                  <Button
                    onClick={handleVerifyIdentity}
                    disabled={loadingKyc}
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white w-fit"
                  >
                    {loadingKyc ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Gerando link...
                      </>
                    ) : (
                      <>
                        <Camera className="w-4 h-4 mr-2" />
                        Verificar Identidade Agora
                      </>
                    )}
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="border-destructive/50 bg-destructive/10">
              <AlertCircle className="w-4 h-4 text-destructive" />
              <AlertDescription className="text-destructive">
                {statusMessage}
              </AlertDescription>
            </Alert>
          )
        )}

        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 shadow-card gradient-primary text-primary-foreground col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Saldo Disponível</p>
                <p className="text-3xl font-bold mt-1">
                  {loadingBalance ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                    </span>
                  ) : (
                    `R$ ${saldo.disponivel.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                  )}
                </p>
                <p className="text-xs opacity-80 mt-1">Liberado para saque</p>
              </div>
              <Button 
                size="sm" 
                variant="secondary" 
                className="bg-white/20 hover:bg-white/30 text-white border-0"
                onClick={() => setShowWithdrawModal(true)}
                disabled={loadingBalance}
              >
                <ArrowUpRight className="w-4 h-4 mr-1" />
                Sacar
              </Button>
            </div>
          </Card>
          
          <Card className="p-4 shadow-card">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <span className="text-sm text-muted-foreground">Pendente</span>
            </div>
            <p className="text-xl font-bold text-foreground">
              {loadingBalance ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                `R$ ${saldo.pendente.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
              )}
            </p>
            <p className="text-xs text-muted-foreground">Liberação em 24h</p>
          </Card>
          
          <Card className="p-4 shadow-card">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Este mês</span>
            </div>
            <p className="text-xl font-bold text-foreground">R$ {saldo.totalMes.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Líquido</p>
          </Card>
        </div>

        {!isPremium && (
          <Card className="p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/20">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20">
                <Crown className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">Economize com Premium!</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Com a taxa atual de {saldo.taxaAtual}%, você pagou <span className="font-semibold text-destructive">R${saldo.taxaPaga}</span> este mês.
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Com Premium (18%), economia de <span className="font-semibold text-primary">R${Math.round(saldo.taxaPaga * 0.36)}</span>!
                </p>
                <Button 
                  size="sm" 
                  className="mt-3 bg-amber-500 hover:bg-amber-600 text-white"
                  onClick={() => setShowPremiumModal(true)}
                >
                  <Crown className="w-4 h-4 mr-1" />
                  Ativar Premium R$89/mês
                </Button>
              </div>
            </div>
          </Card>
        )}

        <Card className="p-4 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Calendar className="w-5 h-5 text-secondary" />
              Resumo de Dezembro
            </h3>
            <Button variant="ghost" size="sm">
              <Download className="w-4 h-4 mr-1" />
              PDF
            </Button>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Aulas realizadas</span>
              <span className="font-semibold text-foreground">{resumoMensal.aulasRealizadas}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Ganho bruto</span>
              <span className="font-semibold text-foreground">R$ {resumoMensal.ganhoBruto.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Taxa ({saldo.taxaAtual}%)</span>
              <span className="font-semibold text-destructive">- R$ {resumoMensal.taxaTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-2 bg-primary/5 rounded-lg px-2 -mx-2">
              <span className="text-sm font-semibold text-foreground">Ganho líquido</span>
              <span className="font-bold text-primary text-lg">R$ {resumoMensal.ganhoLiquido.toLocaleString()}</span>
            </div>
          </div>
        </Card>

        <Tabs defaultValue="todas" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="todas">Todas</TabsTrigger>
            <TabsTrigger value="entradas">Entradas</TabsTrigger>
            <TabsTrigger value="saques">Saques</TabsTrigger>
          </TabsList>
          
          <TabsContent value="todas" className="space-y-3">
            {transacoes.map((tx) => (
              <Card key={tx.id} className="p-4 shadow-soft">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${tx.tipo === "entrada" ? "bg-primary/10" : "bg-secondary/10"}`}>
                    {tx.tipo === "entrada" ? (
                      <ArrowDownLeft className="w-5 h-5 text-primary" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5 text-secondary" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-foreground text-sm">{tx.descricao}</p>
                      <p className={`font-bold ${tx.tipo === "entrada" ? "text-primary" : "text-foreground"}`}>
                        {tx.tipo === "entrada" ? "+" : "-"} R$ {tx.tipo === "entrada" ? tx.liquido : tx.valor}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-muted-foreground">{tx.data}</span>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${tx.status === "concluido" ? "bg-primary/10 text-primary border-0" : "bg-amber-500/10 text-amber-600 border-0"}`}
                      >
                        {tx.status === "concluido" ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                        {tx.status === "concluido" ? "Concluído" : "Pendente"}
                      </Badge>
                    </div>
                  </div>
                  
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </Card>
            ))}
          </TabsContent>
          
          <TabsContent value="entradas" className="space-y-3">
            {transacoes.filter(tx => tx.tipo === "entrada").map((tx) => (
              <Card key={tx.id} className="p-4 shadow-soft">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <ArrowDownLeft className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground text-sm">{tx.descricao}</p>
                    <span className="text-xs text-muted-foreground">{tx.data}</span>
                  </div>
                  <p className="font-bold text-primary">+ R$ {tx.liquido}</p>
                </div>
              </Card>
            ))}
          </TabsContent>
          
          <TabsContent value="saques" className="space-y-3">
            {loadingSaques ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : saques.length === 0 ? (
              <Card className="p-6 shadow-soft text-center">
                <p className="text-muted-foreground">Nenhum saque realizado ainda.</p>
              </Card>
            ) : (
              saques.map((saque) => {
                const bruto = saque.valor / 100;
                const liquido = bruto - WITHDRAWAL_FEE;
                const date = new Date(saque.created_at!);
                const statusConfig = saque.status === "processado"
                  ? { label: "Processado", className: "bg-primary/10 text-primary border-0", icon: <CheckCircle2 className="w-3 h-3 mr-1" /> }
                  : saque.status === "pendente"
                  ? { label: "Pendente", className: "bg-amber-500/10 text-amber-600 border-0", icon: <Clock className="w-3 h-3 mr-1" /> }
                  : { label: "Falhou", className: "bg-destructive/10 text-destructive border-0", icon: <AlertCircle className="w-3 h-3 mr-1" /> };

                return (
                  <Card key={saque.id} className="p-4 shadow-soft">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-secondary/10">
                        <ArrowUpRight className="w-5 h-5 text-secondary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-foreground text-sm">Transferência Pix</p>
                          <p className="font-bold text-foreground">
                            R$ {liquido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-muted-foreground">
                            {date.toLocaleDateString("pt-BR")} • Bruto: R$ {bruto.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} • Taxa: R$ {WITHDRAWAL_FEE.toFixed(2)}
                          </span>
                          <Badge variant="outline" className={statusConfig.className}>
                            {statusConfig.icon}
                            {statusConfig.label}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </TabsContent>
        </Tabs>

        {/* Próxima Aula - Previsão de Ganho */}
        <Card className="p-4 shadow-card bg-gradient-to-r from-[#4CAF50]/5 to-primary/5 border-[#4CAF50]/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-[#4CAF50]/20">
              <Car className="w-5 h-5 text-[#4CAF50]" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">Próxima Aula</p>
              <p className="text-xs text-muted-foreground">{proximaAula.data} às {proximaAula.hora}</p>
            </div>
          </div>
          <div className="flex justify-between items-center p-3 bg-background/50 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Aluno: {proximaAula.aluno}</p>
              <p className="text-sm text-muted-foreground">Valor: R$ {proximaAula.valor}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Você recebe</p>
              <p className="text-xl font-bold text-[#4CAF50]">R$ {proximaAula.liquido}</p>
            </div>
          </div>
        </Card>

        {/* Histórico Pix Recebidos */}
        <Card className="p-4 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <QrCode className="w-5 h-5 text-[#4CAF50]" />
              Histórico Pix Recebidos
            </h3>
          </div>
          <div className="space-y-3">
            {historicoPixRecebido.map((pix) => (
              <div key={pix.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="p-2 rounded-full bg-[#4CAF50]/10">
                  <Banknote className="w-4 h-4 text-[#4CAF50]" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground text-sm">R$ {pix.valor}</p>
                  <p className="text-xs text-muted-foreground">{pix.data} • {pix.banco}</p>
                </div>
                <Badge className="bg-[#4CAF50]/10 text-[#4CAF50] border-0">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Recebido
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Premium Modal */}
      <PremiumActivationModal
        open={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        onActivate={() => setIsPremium(true)}
        currentTax={28}
        taxPaidThisMonth={saldo.taxaPaga}
      />

      {/* Withdraw Modal */}
      <WithdrawModal
        open={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        availableBalance={saldo.disponivel}
        hasRecipient={hasRecipient}
        onSetupBank={() => {
          setShowWithdrawModal(false);
          setShowBankSetup(true);
        }}
        onSuccess={() => {
          fetchBalance();
        }}
      />

      {/* Bank Setup Modal */}
      <BankAccountSetup
        open={showBankSetup}
        onClose={() => setShowBankSetup(false)}
        onSuccess={() => {
          setHasRecipient(true);
          fetchBalance();
        }}
      />

      <InstructorBottomNav />
    </div>
  );
}