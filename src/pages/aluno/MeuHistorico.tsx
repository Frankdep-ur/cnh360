import { useState } from "react";
import { ComplianceBanner } from "@/components/layout/ComplianceBanner";
import { BottomNav } from "@/components/layout/BottomNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Clock,
  MapPin,
  CheckCircle2,
  Calendar,
  Download,
  FileText,
  ChevronLeft,
  Award,
  GraduationCap,
  Star,
} from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAulasConcluidas } from "@/hooks/useAulaAuditoria";
import { AuditTrail } from "@/components/aula/AuditTrail";
import { generateAulaReportPDF, generateCertificadoHorasPDF } from "@/lib/aulaReportPDF";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export default function MeuHistorico() {
  const { user } = useAuth();
  const { aulas, loading } = useAulasConcluidas("aluno");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadingCertificado, setDownloadingCertificado] = useState(false);
  const [alunoInfo, setAlunoInfo] = useState<{ nome: string; categoria: string } | null>(null);

  useEffect(() => {
    const fetchAlunoInfo = async () => {
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      const { data: aluno } = await supabase
        .from("alunos")
        .select("categoria_pretendida")
        .eq("user_id", user.id)
        .single();

      if (profile && aluno) {
        setAlunoInfo({
          nome: profile.full_name || "Aluno",
          categoria: aluno.categoria_pretendida,
        });
      }
    };

    fetchAlunoInfo();
  }, [user]);

  const handleDownloadPDF = async (aula: typeof aulas[0]) => {
    setDownloadingId(aula.id);
    try {
      await generateAulaReportPDF({
        aula,
        participantName: aula.instrutor_nome || "Instrutor",
        role: "aluno",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDownloadCertificado = async () => {
    if (!alunoInfo) return;
    setDownloadingCertificado(true);
    try {
      await generateCertificadoHorasPDF(
        {
          nome: alunoInfo.nome,
          horas: Math.round(totalHoras),
          categoria: alunoInfo.categoria,
        },
        aulas
      );
    } catch (error) {
      console.error("Error generating certificate:", error);
    } finally {
      setDownloadingCertificado(false);
    }
  };

  // Calculate statistics
  const totalHoras = aulas.reduce((acc, a) => {
    if (a.aula_inicio && a.aula_fim) {
      const duracao = (new Date(a.aula_fim).getTime() - new Date(a.aula_inicio).getTime()) / 3600000;
      return acc + duracao;
    }
    return acc + a.duracao_minutos / 60;
  }, 0);

  const horasNecessarias = 2; // Res. 1.020/2025 minimum
  const progressoPorcentagem = Math.min((totalHoras / horasNecessarias) * 100, 100);

  return (
    <div className="app-container pb-24">
      <ComplianceBanner />

      <div className="px-4 py-6 page-enter space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link to="/aluno/dashboard">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground">Meu Histórico</h1>
            <p className="text-sm text-muted-foreground">Aulas práticas concluídas</p>
          </div>
        </div>

        {/* Progress Card */}
        <Card className="p-4 bg-gradient-to-r from-primary/10 to-emerald-500/10 border-primary/20">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <GraduationCap className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-1">Progresso para CNH</h3>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${progressoPorcentagem}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-primary">{progressoPorcentagem.toFixed(0)}%</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {totalHoras.toFixed(1)}h de {horasNecessarias}h mínimas (Res. 1.020/2025)
              </p>
            </div>
          </div>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 text-center">
            <Award className="w-6 h-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold text-foreground">{aulas.length}</p>
            <p className="text-xs text-muted-foreground">Aulas concluídas</p>
          </Card>
          <Card className="p-4 text-center">
            <Clock className="w-6 h-6 mx-auto mb-2 text-secondary" />
            <p className="text-2xl font-bold text-foreground">{totalHoras.toFixed(1)}h</p>
            <p className="text-xs text-muted-foreground">Horas validadas</p>
          </Card>
        </div>

        {/* Certificate Download */}
        {aulas.length > 0 && (
          <Button
            variant="outline"
            className="w-full border-primary text-primary"
            onClick={handleDownloadCertificado}
            disabled={downloadingCertificado}
          >
            <Download className="w-4 h-4 mr-2" />
            {downloadingCertificado ? "Gerando..." : "Baixar Certificado de Horas"}
          </Button>
        )}

        {/* Lessons list */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-4">
                <div className="flex gap-3">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : aulas.length === 0 ? (
          <Card className="p-8 text-center">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-semibold text-foreground mb-1">Nenhuma aula concluída</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Suas aulas validadas aparecerão aqui
            </p>
            <Link to="/aluno/buscar">
              <Button className="gradient-primary text-primary-foreground">
                Buscar instrutor
              </Button>
            </Link>
          </Card>
        ) : (
          <Accordion type="single" collapsible className="space-y-3">
            {aulas.map((aula) => {
              const dataAula = new Date(aula.data_hora);
              const duracaoReal = aula.aula_inicio && aula.aula_fim
                ? Math.round((new Date(aula.aula_fim).getTime() - new Date(aula.aula_inicio).getTime()) / 60000)
                : aula.duracao_minutos;

              return (
                <AccordionItem
                  key={aula.id}
                  value={aula.id}
                  className="border rounded-xl overflow-hidden bg-card"
                >
                  <AccordionTrigger className="px-4 py-3 hover:no-underline">
                    <div className="flex items-center gap-3 text-left w-full">
                      {/* Avatar */}
                      {aula.instrutor_foto ? (
                        <img
                          src={aula.instrutor_foto}
                          alt={aula.instrutor_nome}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                          <span className="text-sm font-semibold text-muted-foreground">
                            {(aula.instrutor_nome || "I").charAt(0)}
                          </span>
                        </div>
                      )}

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-semibold text-foreground truncate">
                            {aula.instrutor_nome}
                          </span>
                          {aula.qr_validado && (
                            <Badge className="bg-emerald-100 text-emerald-700 text-xs">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Validada
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(dataAula, "dd/MM/yy", { locale: ptBR })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {duracaoReal}min
                          </span>
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="px-4 pb-4">
                    {/* Location */}
                    {aula.ponto_encontro && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4 pb-4 border-b">
                        <MapPin className="w-4 h-4" />
                        <span>{aula.ponto_encontro}</span>
                      </div>
                    )}

                    {/* Audit Trail */}
                    <div className="mb-4">
                      <h4 className="font-semibold text-sm text-foreground mb-3">
                        Trilha de Auditoria
                      </h4>
                      <AuditTrail eventos={aula.auditoria} />
                    </div>

                    {/* Download PDF */}
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleDownloadPDF(aula)}
                      disabled={downloadingId === aula.id}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {downloadingId === aula.id ? "Gerando PDF..." : "Baixar Comprovante"}
                    </Button>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
