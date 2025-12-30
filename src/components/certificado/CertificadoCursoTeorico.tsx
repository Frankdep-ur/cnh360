import { useRef, useState } from "react";
import { 
  Award, 
  Download, 
  Calendar, 
  User, 
  BookOpen, 
  ShieldCheck, 
  Loader2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "sonner";

interface CertificadoCursoTeoricoProps {
  nomeAluno: string;
  dataConlusao: Date;
  horasCompletadas?: number;
}

export function CertificadoCursoTeorico({
  nomeAluno,
  dataConlusao,
  horasCompletadas = 45,
}: CertificadoCursoTeoricoProps) {
  const certificadoRef = useRef<HTMLDivElement>(null);
  const [gerando, setGerando] = useState(false);

  const handleDownload = async () => {
    if (!certificadoRef.current) return;

    setGerando(true);
    try {
      // Capturar o certificado como imagem
      const canvas = await html2canvas(certificadoRef.current, {
        scale: 2, // Melhor qualidade
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      // Criar PDF em formato paisagem A4
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calcular dimensões mantendo proporção
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      
      const finalWidth = imgWidth * ratio;
      const finalHeight = imgHeight * ratio;
      
      // Centralizar no PDF
      const x = (pdfWidth - finalWidth) / 2;
      const y = (pdfHeight - finalHeight) / 2;

      pdf.addImage(imgData, "PNG", x, y, finalWidth, finalHeight);
      
      // Gerar nome do arquivo
      const nomeArquivo = `certificado_curso_teorico_${format(dataConlusao, "yyyy-MM-dd")}.pdf`;
      pdf.save(nomeArquivo);
      
      toast.success("Certificado baixado com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao gerar o certificado. Tente novamente.");
    } finally {
      setGerando(false);
    }
  };

  const dataFormatada = format(dataConlusao, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  const codigoCertificado = `CTB-${Date.now().toString(36).toUpperCase()}`;

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Botão de Download */}
      <div className="flex justify-end mb-4 print:hidden">
        <Button onClick={handleDownload} className="gap-2" disabled={gerando}>
          {gerando ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Gerando PDF...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Baixar Certificado (PDF)
            </>
          )}
        </Button>
      </div>

      {/* Certificado */}
      <div
        ref={certificadoRef}
        className="relative bg-gradient-to-br from-card via-card to-primary/5 border-4 border-primary/30 rounded-3xl p-8 md:p-12 shadow-2xl overflow-hidden print:shadow-none"
      >
        {/* Padrão decorativo de fundo */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-32 h-32 border-8 border-primary rounded-full -translate-x-16 -translate-y-16" />
          <div className="absolute bottom-0 right-0 w-48 h-48 border-8 border-secondary rounded-full translate-x-24 translate-y-24" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <Award className="w-96 h-96 text-primary" />
          </div>
        </div>

        {/* Conteúdo */}
        <div className="relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground mb-4">
              <Award className="w-10 h-10" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-primary tracking-wide">
              CERTIFICADO DE CONCLUSÃO
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">Curso Teórico para Condutores</p>
          </div>

          {/* Selo de autenticidade */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-primary">Conteúdo alinhado ao CTB/CONTRAN</span>
            </div>
          </div>

          {/* Corpo principal */}
          <div className="text-center space-y-6 mb-10">
            <p className="text-lg text-muted-foreground">Certificamos que</p>
            
            <div className="py-4 border-b-2 border-t-2 border-primary/20">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground uppercase tracking-wider">
                {nomeAluno}
              </h2>
            </div>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              concluiu com êxito o <strong className="text-foreground">Curso Teórico EAD para Condutores</strong>, 
              cumprindo todas as exigências do programa de formação de condutores conforme 
              as diretrizes do Código de Trânsito Brasileiro (CTB) e resoluções do CONTRAN.
            </p>
          </div>

          {/* Informações do curso */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            <div className="flex flex-col items-center p-4 bg-muted/50 rounded-xl">
              <BookOpen className="w-6 h-6 text-primary mb-2" />
              <span className="text-sm text-muted-foreground">Carga Horária</span>
              <span className="font-bold text-foreground">{horasCompletadas} horas</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-muted/50 rounded-xl">
              <Calendar className="w-6 h-6 text-primary mb-2" />
              <span className="text-sm text-muted-foreground">Data de Conclusão</span>
              <span className="font-bold text-foreground">{dataFormatada}</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-muted/50 rounded-xl">
              <User className="w-6 h-6 text-primary mb-2" />
              <span className="text-sm text-muted-foreground">Modalidade</span>
              <span className="font-bold text-foreground">EAD - Online</span>
            </div>
          </div>

          {/* Módulos concluídos */}
          <div className="bg-muted/30 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-foreground mb-4 text-center">Módulos Concluídos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-muted-foreground">Legislação de Trânsito</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-muted-foreground">Direção Defensiva</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-muted-foreground">Primeiros Socorros</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-muted-foreground">Meio Ambiente e Cidadania</span>
              </div>
              <div className="flex items-center gap-2 md:col-span-2 md:justify-center">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-muted-foreground">Noções de Mecânica Básica</span>
              </div>
            </div>
          </div>

          {/* Código do certificado */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Código de autenticação: <span className="font-mono font-medium">{codigoCertificado}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
