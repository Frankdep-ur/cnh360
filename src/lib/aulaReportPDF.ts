import jsPDF from "jspdf";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AulaComAuditoria, AuditoriaEvento } from "@/hooks/useAulaAuditoria";

interface ReportData {
  aula: AulaComAuditoria;
  participantName: string;
  role: "instrutor" | "aluno";
}

const eventoLabels: Record<string, string> = {
  em_rota: "Instrutor em rota",
  cheguei: "Instrutor chegou",
  confirmacao_aluno: "Aluno confirmou presença",
  inicio: "Aula iniciada",
  fim: "Aula finalizada",
  qr_validado: "QR Code validado",
};

export async function generateAulaReportPDF({ aula, participantName, role }: ReportData): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = margin;

  // Helper function to add text
  const addText = (text: string, x: number, y: number, options?: { fontSize?: number; fontStyle?: "normal" | "bold"; color?: [number, number, number] }) => {
    doc.setFontSize(options?.fontSize || 10);
    doc.setFont("helvetica", options?.fontStyle || "normal");
    if (options?.color) {
      doc.setTextColor(...options.color);
    } else {
      doc.setTextColor(0, 0, 0);
    }
    doc.text(text, x, y);
  };

  // Header
  addText("CNH360", margin, yPos, { fontSize: 24, fontStyle: "bold", color: [0, 200, 83] });
  addText("Relatório de Aula Prática", pageWidth - margin - 60, yPos, { fontSize: 12, color: [100, 100, 100] });
  yPos += 15;

  // Divider
  doc.setDrawColor(0, 200, 83);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 15;

  // Lesson info section
  addText("INFORMAÇÕES DA AULA", margin, yPos, { fontSize: 12, fontStyle: "bold" });
  yPos += 10;

  const aulaDate = new Date(aula.data_hora);
  const info = [
    { label: "Data:", value: format(aulaDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) },
    { label: "Horário agendado:", value: format(aulaDate, "HH:mm", { locale: ptBR }) },
    { label: "Duração prevista:", value: `${aula.duracao_minutos} minutos` },
    { label: "Local:", value: aula.ponto_encontro || "Não informado" },
    { label: "Valor:", value: `R$ ${aula.valor.toFixed(2).replace(".", ",")}` },
    { label: role === "instrutor" ? "Aluno:" : "Instrutor:", value: participantName },
  ];

  // Calculate actual duration
  if (aula.aula_inicio && aula.aula_fim) {
    const inicio = new Date(aula.aula_inicio);
    const fim = new Date(aula.aula_fim);
    const duracaoReal = Math.round((fim.getTime() - inicio.getTime()) / 60000);
    info.push({ label: "Duração real:", value: `${duracaoReal} minutos` });
    info.push({ label: "Início real:", value: format(inicio, "HH:mm:ss", { locale: ptBR }) });
    info.push({ label: "Fim real:", value: format(fim, "HH:mm:ss", { locale: ptBR }) });
  }

  info.forEach(({ label, value }) => {
    addText(label, margin, yPos, { fontStyle: "bold" });
    addText(value, margin + 45, yPos);
    yPos += 7;
  });

  yPos += 10;

  // Status section
  addText("STATUS DA VALIDAÇÃO", margin, yPos, { fontSize: 12, fontStyle: "bold" });
  yPos += 10;

  const statusColor: [number, number, number] = aula.qr_validado ? [0, 150, 50] : [200, 50, 50];
  const statusText = aula.qr_validado ? "✓ AULA VALIDADA COM SUCESSO" : "✗ AULA NÃO VALIDADA";
  addText(statusText, margin, yPos, { fontSize: 14, fontStyle: "bold", color: statusColor });
  yPos += 15;

  // Audit trail section
  if (aula.auditoria && aula.auditoria.length > 0) {
    addText("TRILHA DE AUDITORIA", margin, yPos, { fontSize: 12, fontStyle: "bold" });
    yPos += 10;

    // Table header
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPos - 5, pageWidth - margin * 2, 8, "F");
    addText("Evento", margin + 2, yPos, { fontStyle: "bold" });
    addText("Horário", margin + 60, yPos, { fontStyle: "bold" });
    addText("GPS", margin + 100, yPos, { fontStyle: "bold" });
    yPos += 8;

    aula.auditoria.forEach((evento: AuditoriaEvento) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = margin;
      }

      const eventLabel = eventoLabels[evento.evento] || evento.evento;
      const eventTime = format(new Date(evento.timestamp), "HH:mm:ss");
      const gps = evento.latitude && evento.longitude
        ? `${evento.latitude.toFixed(4)}, ${evento.longitude.toFixed(4)}`
        : "N/A";

      addText(eventLabel, margin + 2, yPos);
      addText(eventTime, margin + 60, yPos);
      addText(gps, margin + 100, yPos, { fontSize: 8 });

      yPos += 7;
    });
  }

  yPos += 15;

  // Digital signature section
  addText("ASSINATURA DIGITAL", margin, yPos, { fontSize: 12, fontStyle: "bold" });
  yPos += 10;

  // Generate a simple hash for verification
  const hashData = `${aula.id}-${aula.data_hora}-${aula.qr_validado}`;
  const hashCode = Array.from(hashData)
    .reduce((hash, char) => ((hash << 5) - hash + char.charCodeAt(0)) | 0, 0)
    .toString(16);

  addText(`ID da Aula: ${aula.id}`, margin, yPos, { fontSize: 8, color: [100, 100, 100] });
  yPos += 5;
  addText(`Hash de verificação: ${hashCode}`, margin, yPos, { fontSize: 8, color: [100, 100, 100] });
  yPos += 5;
  addText(`Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR })}`, margin, yPos, { fontSize: 8, color: [100, 100, 100] });
  yPos += 15;

  // Footer
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, 280, pageWidth - margin, 280);
  addText(
    "Este documento é gerado automaticamente pelo CNH360 e possui validade legal.",
    margin,
    287,
    { fontSize: 8, color: [100, 100, 100] }
  );
  addText(
    "Para verificar a autenticidade, acesse cnh360.app/verificar",
    margin,
    292,
    { fontSize: 8, color: [100, 100, 100] }
  );

  // Save the PDF
  const fileName = `aula_${format(aulaDate, "yyyy-MM-dd")}_${aula.id.substring(0, 8)}.pdf`;
  doc.save(fileName);
}

export async function generateCertificadoHorasPDF(
  aluno: { nome: string; horas: number; categoria: string },
  aulas: AulaComAuditoria[]
): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = 40;

  // Header
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 200, 83);
  doc.text("CNH360", pageWidth / 2, yPos, { align: "center" });
  yPos += 15;

  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text("Certificado de Horas Práticas", pageWidth / 2, yPos, { align: "center" });
  yPos += 30;

  // Content
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  
  const text = `Certificamos que ${aluno.nome} completou ${aluno.horas} horas de aulas práticas de direção veicular para a categoria ${aluno.categoria}, conforme exigido pelo DETRAN, através da plataforma CNH360.`;
  
  const splitText = doc.splitTextToSize(text, pageWidth - margin * 2);
  doc.text(splitText, pageWidth / 2, yPos, { align: "center" });
  yPos += 40;

  // Summary
  doc.setFont("helvetica", "bold");
  doc.text("Resumo das Aulas:", margin, yPos);
  yPos += 10;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  const totalMinutos = aulas.reduce((acc, a) => {
    if (a.aula_inicio && a.aula_fim) {
      const duracao = (new Date(a.aula_fim).getTime() - new Date(a.aula_inicio).getTime()) / 60000;
      return acc + duracao;
    }
    return acc + a.duracao_minutos;
  }, 0);

  doc.text(`Total de aulas: ${aulas.length}`, margin, yPos);
  yPos += 7;
  doc.text(`Total de horas: ${Math.round(totalMinutos / 60)} horas e ${Math.round(totalMinutos % 60)} minutos`, margin, yPos);
  yPos += 7;
  doc.text(`Todas as aulas validadas via GPS e QR Code`, margin, yPos);
  yPos += 30;

  // Date and signature
  doc.setFontSize(10);
  doc.text(`Emitido em: ${format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}`, margin, yPos);
  yPos += 30;

  doc.line(margin, yPos, margin + 80, yPos);
  yPos += 5;
  doc.setFontSize(8);
  doc.text("Assinatura Digital CNH360", margin, yPos);

  // Footer
  doc.setTextColor(100, 100, 100);
  doc.text(
    "Este documento é gerado automaticamente e pode ser verificado em cnh360.app/verificar",
    pageWidth / 2,
    280,
    { align: "center" }
  );

  doc.save(`certificado_horas_${format(new Date(), "yyyy-MM-dd")}.pdf`);
}
