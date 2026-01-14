import { useState, useRef } from 'react';
import { Upload, X, FileText, Image, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface UploadCertificadoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function UploadCertificadoModal({ open, onOpenChange, onSuccess }: UploadCertificadoModalProps) {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validar tipo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error('Formato inválido. Aceitos: JPG, PNG, WebP ou PDF');
      return;
    }

    // Validar tamanho (5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo: 5MB');
      return;
    }

    setFile(selectedFile);

    // Preview para imagens
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);

    try {
      // Obter usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Você precisa estar logado');
        return;
      }

      // Obter aluno_id
      const { data: aluno } = await supabase
        .from('alunos')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!aluno) {
        toast.error('Perfil de aluno não encontrado');
        return;
      }

      // Extensão do arquivo
      const ext = file.name.split('.').pop();
      const fileName = `${user.id}/certificado_teorico_${Date.now()}.${ext}`;

      // Upload para Storage
      const { error: uploadError } = await supabase.storage
        .from('certificados')
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        console.error('Erro no upload:', uploadError);
        toast.error('Erro ao enviar arquivo. Tente novamente.');
        return;
      }

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('certificados')
        .getPublicUrl(fileName);

      // Atualizar progresso_renach
      const { error: updateError } = await supabase
        .from('progresso_renach')
        .update({
          certificado_teorico_url: publicUrl,
          certificado_teorico_enviado_em: new Date().toISOString(),
          prova_teorica_detran_aprovada: true,
          exame_teorico_resultado: 'aprovado'
        })
        .eq('aluno_id', aluno.id);

      if (updateError) {
        console.error('Erro ao atualizar progresso:', updateError);
        toast.error('Erro ao registrar aprovação. Tente novamente.');
        return;
      }

      setUploadSuccess(true);
      toast.success('Certificado enviado com sucesso!');
      
      // Chamar callback de sucesso
      onSuccess?.();

    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro inesperado. Tente novamente.');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setFile(null);
      setPreview(null);
      setUploadSuccess(false);
      onOpenChange(false);
    }
  };

  const handleGoToPractical = () => {
    handleClose();
    navigate('/aluno/buscar');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {uploadSuccess ? (
          // Tela de sucesso
          <div className="text-center py-6">
            <div className="w-20 h-20 bg-[#00c853]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-[#00c853]" />
            </div>
            
            <h2 className="text-xl font-bold text-foreground mb-2">
              Prova aprovada! 🎉
            </h2>
            
            <p className="text-muted-foreground mb-6">
              Parabéns pela aprovação no exame teórico do DETRAN! 
              Agora você pode agendar suas aulas práticas no app.
            </p>

            <div className="space-y-3">
              <Button
                onClick={handleGoToPractical}
                className="w-full bg-[#00c853] hover:bg-[#00a843] h-12"
              >
                🚗 Agendar Primeira Aula Prática
              </Button>
              
              <Button
                onClick={handleClose}
                variant="outline"
                className="w-full"
              >
                Voltar ao Dashboard
              </Button>
            </div>
          </div>
        ) : (
          // Formulário de upload
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#00c853]" />
                Enviar Certificado da Prova Teórica
              </DialogTitle>
              <DialogDescription>
                Faça upload do comprovante de aprovação do DETRAN para liberar as aulas práticas.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Área de upload */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`
                  border-2 border-dashed rounded-xl p-6 text-center cursor-pointer
                  transition-colors
                  ${file 
                    ? 'border-[#00c853] bg-[#00c853]/5' 
                    : 'border-muted-foreground/30 hover:border-[#00c853]/50 hover:bg-muted/50'
                  }
                `}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {file ? (
                  <div className="space-y-3">
                    {preview ? (
                      <img 
                        src={preview} 
                        alt="Preview" 
                        className="w-32 h-32 object-cover rounded-lg mx-auto"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-[#00c853]/10 rounded-lg flex items-center justify-center mx-auto">
                        <FileText className="w-8 h-8 text-[#00c853]" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-foreground text-sm truncate max-w-[200px] mx-auto">
                        {file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                        setPreview(null);
                      }}
                      className="text-destructive"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Remover
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto">
                      <Image className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        Arraste o arquivo ou clique aqui
                      </p>
                      <p className="text-xs text-muted-foreground">
                        JPG, PNG, WebP ou PDF (máx. 5MB)
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
                <p>
                  📋 Envie o certificado ou resultado oficial do exame teórico do DETRAN.
                  Ao confirmar, sua etapa "Exame Teórico" será marcada como concluída.
                </p>
              </div>

              {/* Botões */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={uploading}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={!file || uploading}
                  className="flex-1 bg-[#00c853] hover:bg-[#00a843]"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Enviar Comprovante
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
