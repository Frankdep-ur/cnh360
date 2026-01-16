import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function EnviarCertificado() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Formato inválido", {
        description: "Envie uma imagem (JPEG, PNG, WebP) ou PDF"
      });
      return;
    }

    // Validar tamanho (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Arquivo muito grande", {
        description: "O tamanho máximo é 5MB"
      });
      return;
    }

    setSelectedFile(file);

    // Criar preview para imagens
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;

    setIsUploading(true);

    try {
      // Buscar aluno_id
      const { data: aluno } = await supabase
        .from('alunos')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!aluno) {
        toast.error("Erro ao identificar aluno");
        return;
      }

      // Gerar nome único para o arquivo
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${aluno.id}/certificado_teorico_${Date.now()}.${fileExt}`;

      // Upload para o bucket de certificados
      const { error: uploadError } = await supabase.storage
        .from('certificados')
        .upload(fileName, selectedFile, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast.error("Erro no upload", {
          description: "Tente novamente em alguns instantes"
        });
        return;
      }

      // Obter URL pública do arquivo
      const { data: urlData } = supabase.storage
        .from('certificados')
        .getPublicUrl(fileName);

      // Atualizar progresso_renach com URL do certificado
      const { error: updateError } = await supabase
        .from('progresso_renach')
        .upsert({
          aluno_id: aluno.id,
          certificado_teorico_url: urlData.publicUrl,
          certificado_teorico_enviado_em: new Date().toISOString(),
          prova_teorica_detran_aprovada: false // Aguardando validação
        }, {
          onConflict: 'aluno_id'
        });

      if (updateError) {
        console.error('Update error:', updateError);
        toast.error("Erro ao salvar dados");
        return;
      }

      setUploadSuccess(true);
      toast.success("Certificado enviado com sucesso!", {
        description: "Aguarde a validação para liberar as aulas práticas"
      });

    } catch (error) {
      console.error('Error:', error);
      toast.error("Erro ao enviar certificado");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-4 sticky top-0 z-10">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/aluno')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">
            Enviar Certificado do Exame Teórico
          </h1>
        </div>
      </header>

      <div className="px-4 py-6 max-w-md mx-auto">
        {uploadSuccess ? (
          // Sucesso do upload
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="pt-6 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">
                Certificado Enviado!
              </h2>
              <p className="text-muted-foreground mb-6">
                Seu certificado foi recebido e está em análise. 
                Você receberá uma notificação quando for validado.
              </p>
              <Button 
                onClick={() => navigate('/aluno')}
                className="w-full"
              >
                Voltar ao Dashboard
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Instruções */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-foreground mb-1">
                    Por que preciso enviar o certificado?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Para iniciar as aulas práticas, é necessário comprovar a aprovação 
                    no exame teórico do DETRAN. Envie uma foto ou PDF do seu certificado.
                  </p>
                </div>
              </div>
            </div>

            {/* Upload Card */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  className="hidden"
                  onChange={handleFileSelect}
                />

                {!selectedFile ? (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 hover:bg-muted/50 transition-all"
                  >
                    <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="font-medium text-foreground mb-1">
                      Clique para selecionar o arquivo
                    </p>
                    <p className="text-sm text-muted-foreground">
                      JPEG, PNG, WebP ou PDF (máx 5MB)
                    </p>
                  </button>
                ) : (
                  <div className="space-y-4">
                    {/* Preview */}
                    {previewUrl ? (
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="w-full h-48 object-contain rounded-lg bg-muted"
                      />
                    ) : (
                      <div className="w-full h-32 bg-muted rounded-lg flex items-center justify-center">
                        <FileText className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}

                    {/* File info */}
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium text-sm text-foreground truncate max-w-[200px]">
                            {selectedFile.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedFile(null);
                          setPreviewUrl(null);
                        }}
                      >
                        Trocar
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="w-full"
              size="lg"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Enviar Certificado
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground mt-4">
              Após o envio, seu certificado será analisado em até 24 horas.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
