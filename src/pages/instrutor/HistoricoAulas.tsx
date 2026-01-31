import { useState } from "react";
import { ComplianceBanner } from "@/components/layout/ComplianceBanner";
import { InstructorBottomNav } from "@/components/layout/InstructorBottomNav";
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
  TrendingUp,
  Timer,
  MessageCircle,
  Star,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAulasConcluidas } from "@/hooks/useAulaAuditoria";
import { AuditTrail } from "@/components/aula/AuditTrail";
import { GPSValidationMap } from "@/components/aula/GPSValidationMap";
import { LessonRatingDisplay } from "@/components/history/LessonRatingDisplay";
import { generateAulaReportPDF } from "@/lib/aulaReportPDF";

export default function HistoricoAulas() {
  const navigate = useNavigate();
  const { aulas, loading } = useAulasConcluidas("instrutor");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownloadPDF = async (aula: typeof aulas[0]) => {
    setDownloadingId(aula.id);
    try {
      await generateAulaReportPDF({
        aula,
        participantName: aula.aluno_nome || "Aluno",
        role: "instrutor",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setDownloadingId(null);
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

  const mediaMinutos = aulas.length > 0
    ? aulas.reduce((acc, a) => {
        if (a.aula_inicio && a.aula_fim) {
          return acc + (new Date(a.aula_fim).getTime() - new Date(a.aula_inicio).getTime()) / 60000;
        }
        return acc + a.duracao_minutos;
      }, 0) / aulas.length
    : 0;

  const taxaValidacao = aulas.length > 0
    ? (aulas.filter((a) => a.qr_validado).length / aulas.length) * 100
    : 0;

  return (
    <div className="app-container pb-24">
      <ComplianceBanner />

      <div className="px-4 py-6 page-enter space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link to="/instrutor/dashboard">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground">Histórico de Aulas</h1>
            <p className="text-sm text-muted-foreground">Auditoria completa das suas aulas</p>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-3 text-center">
            <div className="flex items-center justify-center mb-1">
              <Timer className="w-4 h-4 text-primary mr-1" />
            </div>
            <p className="text-lg font-bold text-foreground">{totalHoras.toFixed(1)}h</p>
            <p className="text-xs text-muted-foreground">Total ministrado</p>
          </Card>
          <Card className="p-3 text-center">
            <div className="flex items-center justify-center mb-1">
              <TrendingUp className="w-4 h-4 text-secondary mr-1" />
            </div>
            <p className="text-lg font-bold text-foreground">{mediaMinutos.toFixed(0)}min</p>
            <p className="text-xs text-muted-foreground">Média por aula</p>
          </Card>
          <Card className="p-3 text-center">
            <div className="flex items-center justify-center mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-1" />
            </div>
            <p className="text-lg font-bold text-foreground">{taxaValidacao.toFixed(0)}%</p>
            <p className="text-xs text-muted-foreground">Taxa validação</p>
          </Card>
        </div>

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
            <p className="text-sm text-muted-foreground">
              Suas aulas validadas aparecerão aqui
            </p>
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
                      {aula.aluno_foto ? (
                        <img
                          src={aula.aluno_foto}
                          alt={aula.aluno_nome}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                          <span className="text-sm font-semibold text-muted-foreground">
                            {(aula.aluno_nome || "A").charAt(0)}
                          </span>
                        </div>
                      )}

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-semibold text-foreground truncate">
                            {aula.aluno_nome}
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
                          <span className="font-semibold text-foreground">
                            R${aula.valor.toFixed(0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="px-4 pb-4 space-y-4">
                    {/* Location */}
                    {aula.ponto_encontro && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground pb-4 border-b">
                        <MapPin className="w-4 h-4" />
                        <span>{aula.ponto_encontro}</span>
                      </div>
                    )}

                    {/* Rating Display */}
                    {aula.avaliacao && (
                      <LessonRatingDisplay
                        nota={aula.avaliacao.nota}
                        comentario={aula.avaliacao.comentario}
                        dataAvaliacao={aula.avaliacao.created_at}
                        isOwn={false}
                      />
                    )}

                    {/* View Chat Button */}
                    {aula.mensagens_count && aula.mensagens_count > 0 && (
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => navigate('/instrutor/chat', { state: { openAulaId: aula.id } })}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        <span className="flex-1 text-left">Ver Conversa</span>
                        <span className="text-xs text-muted-foreground">
                          {aula.mensagens_count} {aula.mensagens_count === 1 ? 'mensagem' : 'mensagens'}
                        </span>
                      </Button>
                    )}

                    {/* Audit Trail */}
                    <div>
                      <h4 className="font-semibold text-sm text-foreground mb-3">
                        Trilha de Auditoria
                      </h4>
                      <AuditTrail
                        eventos={aula.auditoria}
                        valor={aula.valor}
                      />
                    </div>

                    {/* GPS Map */}
                    <div>
                      <h4 className="font-semibold text-sm text-foreground mb-3">
                        Validações GPS
                      </h4>
                      <GPSValidationMap eventos={aula.auditoria} />
                    </div>

                    {/* Download PDF */}
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleDownloadPDF(aula)}
                      disabled={downloadingId === aula.id}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {downloadingId === aula.id ? "Gerando PDF..." : "Baixar Relatório PDF"}
                    </Button>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </div>

      <InstructorBottomNav />
    </div>
  );
}
