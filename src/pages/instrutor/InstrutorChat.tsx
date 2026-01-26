import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ComplianceBanner } from "@/components/layout/ComplianceBanner";
import { InstructorBottomNav } from "@/components/layout/InstructorBottomNav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Clock,
  ChevronRight,
  MessagesSquare
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChatView } from "@/components/chat/ChatView";

interface Conversa {
  aula_id: string;
  aluno_id: string;
  aluno_user_id: string;
  aluno_nome: string | null;
  aluno_foto: string | null;
  data_hora: string;
  status: string;
  ultima_mensagem: string | null;
  ultima_mensagem_hora: string | null;
  mensagens_nao_lidas: number;
}

export default function InstrutorChat() {
  const { user } = useAuth();
  const location = useLocation();
  const [conversas, setConversas] = useState<Conversa[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAulaId, setSelectedAulaId] = useState<string | null>(null);

  // Abrir chat automaticamente se vier com openAulaId no state
  useEffect(() => {
    const openAulaId = location.state?.openAulaId as string | undefined;
    if (openAulaId && !loading && conversas.length > 0) {
      const conversaExiste = conversas.find(c => c.aula_id === openAulaId);
      if (conversaExiste) {
        setSelectedAulaId(openAulaId);
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state, loading, conversas]);

  useEffect(() => {
    if (!user) return;

    const fetchConversas = async () => {
      setLoading(true);
      
      // First get the instrutor id
      const { data: instrutor } = await supabase
        .from('instrutores')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!instrutor) {
        setLoading(false);
        return;
      }

      // Fetch aulas that can have chat (confirmada or em_andamento)
      const { data: aulasData, error } = await supabase
        .from('aulas')
        .select(`
          id,
          data_hora,
          status,
          aluno_id
        `)
        .eq('instrutor_id', instrutor.id)
        .in('status', ['confirmada', 'em_andamento'])
        .order('data_hora', { ascending: false });

      if (error) {
        console.error('Error fetching aulas:', error);
        setLoading(false);
        return;
      }

      // Get aluno info and last message for each aula
      const conversasData = await Promise.all(
        (aulasData || []).map(async (aula) => {
          // Get aluno info from view that instructor can access
          const { data: alunoData } = await supabase
            .from('alunos_seguros')
            .select('user_id, full_name, avatar_url')
            .eq('id', aula.aluno_id)
            .single();

          // Get last message
          const { data: mensagemData } = await supabase
            .from('mensagens_aula')
            .select('content, created_at, sender_id')
            .eq('aula_id', aula.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          // Count unread messages (messages from aluno)
          const { count } = await supabase
            .from('mensagens_aula')
            .select('*', { count: 'exact', head: true })
            .eq('aula_id', aula.id)
            .neq('sender_id', user.id);

          return {
            aula_id: aula.id,
            aluno_id: aula.aluno_id,
            aluno_user_id: alunoData?.user_id || '',
            aluno_nome: alunoData?.full_name || 'Aluno',
            aluno_foto: alunoData?.avatar_url,
            data_hora: aula.data_hora,
            status: aula.status,
            ultima_mensagem: mensagemData?.content || null,
            ultima_mensagem_hora: mensagemData?.created_at || null,
            mensagens_nao_lidas: count || 0
          };
        })
      );

      setConversas(conversasData);
      setLoading(false);
    };

    fetchConversas();
  }, [user]);

  const selectedConversa = conversas.find(c => c.aula_id === selectedAulaId);

  if (selectedAulaId && selectedConversa) {
    return (
      <ChatView 
        aulaId={selectedAulaId} 
        contactName={selectedConversa.aluno_nome || 'Aluno'}
        contactPhoto={selectedConversa.aluno_foto}
        onBack={() => setSelectedAulaId(null)} 
        isInstructor
      />
    );
  }

  return (
    <div className="app-container pb-24">
      <ComplianceBanner />
      
      <div className="px-4 py-6 page-enter space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">Conversas</h1>
        </div>

        {/* Lista de Conversas */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-4 shadow-card">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : conversas.length === 0 ? (
          <Card className="p-8 shadow-card text-center">
            <MessagesSquare className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-semibold text-foreground mb-1">Nenhuma conversa ativa</h3>
            <p className="text-sm text-muted-foreground">
              Você poderá conversar com alunos quando tiver aulas confirmadas
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {conversas.map((conversa) => (
              <Card 
                key={conversa.aula_id} 
                className="p-4 shadow-card cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setSelectedAulaId(conversa.aula_id)}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {conversa.aluno_foto ? (
                      <img 
                        src={conversa.aluno_foto} 
                        alt={conversa.aluno_nome || 'Aluno'}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-lg font-semibold text-muted-foreground">
                          {(conversa.aluno_nome || 'A').charAt(0)}
                        </span>
                      </div>
                    )}
                    {conversa.status === 'em_andamento' && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-card" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4 className="font-semibold text-foreground">{conversa.aluno_nome}</h4>
                      {conversa.ultima_mensagem_hora && (
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(conversa.ultima_mensagem_hora), { 
                            locale: ptBR, 
                            addSuffix: false 
                          })}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-muted-foreground truncate flex-1">
                        {conversa.ultima_mensagem || 'Nenhuma mensagem ainda'}
                      </p>
                      {conversa.mensagens_nao_lidas > 0 && (
                        <Badge className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 min-w-[20px] text-center">
                          {conversa.mensagens_nao_lidas}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Clock className="w-3 h-3" />
                      <span>Aula: {format(new Date(conversa.data_hora), "dd/MM 'às' HH:mm", { locale: ptBR })}</span>
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <InstructorBottomNav />
    </div>
  );
}
