import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Stethoscope, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function ExameMedico() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [exameConcluido, setExameConcluido] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Load current status
  useEffect(() => {
    const loadStatus = async () => {
      if (!user) return;

      try {
        const { data: aluno } = await supabase
          .from('alunos')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (aluno) {
          const { data: progresso } = await supabase
            .from('progresso_renach')
            .select('exame_medico_concluido')
            .eq('aluno_id', aluno.id)
            .maybeSingle();

          if (progresso?.exame_medico_concluido) {
            setExameConcluido(true);
          }
        }
      } catch (error) {
        console.error('Error loading exam status:', error);
      } finally {
        setInitialLoading(false);
      }
    };

    loadStatus();
  }, [user]);

  const handleCheckboxChange = async (checked: boolean) => {
    if (!checked || !user) return;
    
    setLoading(true);
    try {
      // Get aluno_id
      const { data: aluno, error: alunoError } = await supabase
        .from('alunos')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (alunoError || !aluno) {
        toast.error('Erro ao buscar dados do aluno');
        setLoading(false);
        return;
      }

      // Check if progresso_renach exists, create if not
      const { data: existingProgress } = await supabase
        .from('progresso_renach')
        .select('id')
        .eq('aluno_id', aluno.id)
        .maybeSingle();

      if (!existingProgress) {
        // Create new progress record
        const { error: insertError } = await supabase
          .from('progresso_renach')
          .insert({ 
            aluno_id: aluno.id, 
            exame_medico_concluido: true 
          });

        if (insertError) {
          console.error('Insert error:', insertError);
          toast.error('Erro ao salvar progresso');
          setLoading(false);
          return;
        }
      } else {
        // Update existing record
        const { error: updateError } = await supabase
          .from('progresso_renach')
          .update({ exame_medico_concluido: true })
          .eq('aluno_id', aluno.id);

        if (updateError) {
          console.error('Update error:', updateError);
          toast.error('Erro ao atualizar progresso');
          setLoading(false);
          return;
        }
      }

      setExameConcluido(true);
      toast.success('Exames marcados como concluídos!', {
        description: 'Parabéns por completar esta etapa!'
      });
      
      // Redirect after a short delay
      setTimeout(() => navigate('/aluno'), 1500);
    } catch (error) {
      console.error('Error saving exam status:', error);
      toast.error('Erro ao salvar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const openWhatsApp = () => {
    const mensagem = encodeURIComponent(
      "Oi! Vim do app CNH360 e quero ajuda pra agendar o exame médico e psicológico pra minha CNH"
    );
    window.open(`https://wa.me/5518981288372?text=${mensagem}`, '_blank');
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background border-b border-border px-4 py-4">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/aluno')}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">
            Exame Médico e Psicológico
          </h1>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-6">
        <div className="max-w-md mx-auto space-y-6">
          {/* Icon and Title */}
          <div className="text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-pink-100 flex items-center justify-center mb-4">
              <Stethoscope className="w-10 h-10 text-pink-600" />
            </div>
            <h2 className="text-xl font-bold text-foreground">
              Guia Rápido para Exame Médico e Psicológico
            </h2>
          </div>

          {/* Info Card */}
          <Card className="border-2 border-[#00BFFF]/30">
            <CardContent className="p-5">
              <h3 className="font-semibold text-foreground mb-3 text-lg">
                O que é isso?
              </h3>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>
                  Essa etapa é <strong className="text-foreground">obrigatória</strong> pra sua CNH e super rápida! 
                </p>
                <p>
                  O <strong className="text-foreground">exame médico</strong> verifica sua saúde geral (como visão e pressão), 
                  e o <strong className="text-foreground">psicológico</strong> avalia atenção e reações.
                </p>
                <p>
                  São feitos em clínicas credenciadas pelo DETRAN-SP, geralmente no mesmo dia, 
                  e duram uns <strong className="text-foreground">30-60 minutos cada</strong>.
                </p>
                <p className="text-primary font-medium">
                  Pronto pra agendar? Nossa equipe te ajuda com tudo: passos, docs, custos e marcação. É fácil e rápido!
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Motivational Text */}
          <p className="text-center text-foreground font-semibold">
            Quanto antes fizer, mais rápido você avança pras{" "}
            <span className="text-primary">"aulas práticas"</span>!
          </p>

          {/* WhatsApp Button */}
          <Button
            onClick={openWhatsApp}
            className="w-full h-14 text-base font-bold gap-3 shadow-lg hover:shadow-xl transition-all"
            style={{ backgroundColor: '#25D366' }}
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Fale com a gente no WhatsApp pra agendar!
          </Button>

          {/* Checkbox Card */}
          <Card className={`border-2 transition-all ${exameConcluido ? 'border-green-500 bg-green-50' : 'border-border'}`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="exame-concluido"
                  checked={exameConcluido}
                  onCheckedChange={handleCheckboxChange}
                  disabled={loading || exameConcluido}
                  className="mt-1 h-5 w-5"
                />
                <div className="flex-1">
                  <label
                    htmlFor="exame-concluido"
                    className={`font-medium cursor-pointer ${exameConcluido ? 'text-green-700' : 'text-foreground'}`}
                  >
                    {exameConcluido ? (
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        Exames concluídos e aprovados!
                      </span>
                    ) : (
                      'Já fiz os exames e foram aprovados'
                    )}
                  </label>
                  {!exameConcluido && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Marque apenas quando tiver sido aprovado nos exames
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Loading indicator */}
          {loading && (
            <div className="text-center text-sm text-muted-foreground">
              Salvando...
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
