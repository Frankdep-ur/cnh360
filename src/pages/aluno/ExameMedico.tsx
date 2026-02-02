import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Stethoscope, MessageCircle, CheckCircle2 } from "lucide-react";
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
    window.open('https://wa.me/5518981288372', '_blank');
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

          {/* WhatsApp Button */}
          <Button
            onClick={openWhatsApp}
            className="w-full h-14 text-lg font-bold gap-3 shadow-lg hover:shadow-xl transition-all"
            style={{ backgroundColor: '#00BFFF' }}
          >
            <MessageCircle className="w-6 h-6" />
            Agendar pelo WhatsApp Agora
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
