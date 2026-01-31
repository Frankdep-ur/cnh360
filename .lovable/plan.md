
# Plano: Sistema Completo de Histórico e Persistência de Dados

## Diagnóstico Completo

### Problemas Identificados

| Problema | Causa | Impacto |
|----------|-------|---------|
| **Conversas desaparecem** | Chat só mostra aulas com status `confirmada` ou `em_andamento` | Histórico de conversas perdido após conclusão |
| **Feedbacks não visíveis** | Página de histórico não exibe avaliações | Alunos não veem feedbacks que deixaram |
| **Instrutor sem histórico de chat** | Mesmo filtro de status `confirmada`/`em_andamento` | Instrutor não acessa conversas passadas |
| **Dados estão completos no DB** | ✅ Mensagens e avaliações estão salvas | Problema é de **visualização**, não de armazenamento |

### Evidências do Banco de Dados

```text
Mensagens por status de aula:
- concluida: 13 mensagens ✅ (dados existem)
- em_rota: 6 mensagens
- cancelada: 5 mensagens
- confirmada: 0 mensagens
- pendente: 0 mensagens

Avaliações salvas: 2 ✅ (com comentários)
Trilha de auditoria: 18 eventos ✅ (completa)
```

**Conclusão**: Os dados estão sendo armazenados corretamente. O problema é que as **interfaces de chat e histórico não exibem dados de aulas concluídas**.

---

## Solução Proposta

### 1. Expandir Acesso ao Chat para Aulas Concluídas

Atualmente o chat filtra apenas `['confirmada', 'em_andamento']`. Precisamos adicionar `'concluida'` para preservar o histórico.

```text
┌──────────────────────────────────────────────────────────────┐
│  ANTES: Chat só disponível durante a aula                    │
│  .in('status', ['confirmada', 'em_andamento'])               │
├──────────────────────────────────────────────────────────────┤
│  DEPOIS: Chat disponível também após conclusão               │
│  .in('status', ['confirmada', 'em_andamento', 'concluida'])  │
└──────────────────────────────────────────────────────────────┘
```

### 2. Adicionar Visualização de Avaliações no Histórico

A página `MeuHistorico.tsx` e `HistoricoAulas.tsx` não mostram as avaliações. Vamos adicionar:

- Nota (estrelas) que o aluno deu
- Comentário do feedback
- Data da avaliação

### 3. Separar Conversas Ativas de Histórico

Criar abas ou seções para organizar melhor:

```text
┌─────────────────────────────────────────────────────────────┐
│  📱 TELA DE CHAT                                            │
│                                                             │
│  ┌─────────────────┐ ┌─────────────────┐                   │
│  │   ✉️ Ativas     │ │   📚 Histórico  │                   │
│  └─────────────────┘ └─────────────────┘                   │
│                                                             │
│  [Lista de conversas filtradas por aba selecionada]         │
└─────────────────────────────────────────────────────────────┘
```

### 4. Adicionar Seção de Feedback no Histórico de Aulas

```text
┌────────────────────────────────────────────┐
│  Aula com João Silva - 31/01              │
│  ✅ Validada | 50 min                      │
├────────────────────────────────────────────┤
│  🏆 Sua Avaliação                          │
│  ⭐⭐⭐⭐⭐ (5/5)                          │
│  "Ótimo. Me ajudou muitíssimo"            │
│  Enviada em 31/01/2026                     │
├────────────────────────────────────────────┤
│  💬 Ver Conversa                    [>]   │
├────────────────────────────────────────────┤
│  📋 Trilha de Auditoria             [v]   │
└────────────────────────────────────────────┘
```

---

## Arquivos a Modificar

### 1. `src/pages/aluno/AlunoChat.tsx`

**Mudanças:**
- Adicionar `'concluida'` ao filtro de status
- Adicionar abas "Ativas" / "Histórico"
- Distinguir visualmente aulas concluídas (read-only para novas mensagens)

### 2. `src/pages/instrutor/InstrutorChat.tsx`

**Mudanças:**
- Adicionar `'concluida'` ao filtro de status
- Adicionar abas "Ativas" / "Histórico"
- Distinguir visualmente aulas concluídas

### 3. `src/pages/aluno/MeuHistorico.tsx`

**Mudanças:**
- Buscar avaliação associada à aula
- Exibir nota e comentário na expansão do accordion
- Adicionar botão para ver conversa completa

### 4. `src/pages/instrutor/HistoricoAulas.tsx`

**Mudanças:**
- Buscar avaliação recebida para cada aula
- Exibir nota e comentário do aluno
- Adicionar botão para ver conversa completa

### 5. `src/hooks/useAulaAuditoria.ts`

**Mudanças:**
- Expandir `AulaComAuditoria` para incluir avaliação
- Buscar dados da tabela `avaliacoes` junto com auditoria

### 6. `src/components/chat/ChatView.tsx`

**Mudanças:**
- Adicionar prop `readOnly` para aulas concluídas
- Esconder input de mensagem quando read-only
- Mostrar banner informativo "Esta conversa está arquivada"

---

## Arquivos a Criar

### 1. `src/components/history/LessonRatingDisplay.tsx`

Componente para exibir avaliação de forma consistente:

```typescript
interface LessonRatingDisplayProps {
  nota: number;
  comentario: string | null;
  dataAvaliacao: string;
}
```

### 2. `src/components/history/ChatHistoryButton.tsx`

Botão para abrir histórico de chat de uma aula específica:

```typescript
interface ChatHistoryButtonProps {
  aulaId: string;
  participantName: string;
  participantPhoto: string | null;
}
```

---

## Fluxo de Dados Corrigido

```text
[Banco de Dados]
      │
      ├── mensagens_aula (todas as mensagens) ───────────────────┐
      │                                                          │
      ├── avaliacoes (feedbacks) ────────────────────────────────┤
      │                                                          │
      ├── aulas_auditoria (trilha de eventos) ───────────────────┤
      │                                                          ▼
      │                                              ┌─────────────────────┐
      │                                              │  INTERFACE UNIFICADA│
      │                                              ├─────────────────────┤
      │                                              │  • Chat (ativo/hist)│
      │                                              │  • Avaliação         │
      │                                              │  • Auditoria GPS     │
      │                                              │  • Comprovante PDF   │
      │                                              └─────────────────────┘
      │
[Aulas concluídas agora visíveis em todas as interfaces]
```

---

## Persistência e Integridade

### Verificações a Implementar

1. **Contador de mensagens por aula** - Exibir "15 mensagens" no histórico
2. **Indicador de avaliação pendente** - Se não avaliou, mostrar "Avaliar"
3. **Ordenação por data** - Mais recentes primeiro
4. **Cache local** - Usar React Query para cache inteligente

### Políticas RLS Existentes

As políticas já permitem acesso correto:

```sql
-- mensagens_aula: Participantes podem ver mensagens
USING (EXISTS (SELECT 1 FROM aulas a JOIN alunos al ... WHERE al.user_id = auth.uid() OR i.user_id = auth.uid()))

-- avaliacoes: Público pode ver todas
USING (true)
```

**Não há necessidade de alterar RLS** - o problema é apenas na camada de UI.

---

## Interface Atualizada do Aluno - Chat

```text
┌────────────────────────────────────────────┐
│  Conversas                                 │
│                                            │
│  ┌────────────┐ ┌────────────┐            │
│  │ 🔔 Ativas  │ │ 📚 Arquivo │            │
│  └────────────┘ └────────────┘            │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │ 👤 Ricardo (Instrutor)               │ │
│  │ ✅ Aula concluída                    │ │
│  │ Última: "Ótimo trabalho hoje!"       │ │
│  │ 📝 15 mensagens                      │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │ 👤 Ana (Instrutora)                  │ │
│  │ ✅ Aula concluída                    │ │
│  │ Última: "Até a próxima!"             │ │
│  │ 📝 8 mensagens                       │ │
│  └──────────────────────────────────────┘ │
└────────────────────────────────────────────┘
```

---

## Interface Atualizada - Histórico com Feedback

```text
┌────────────────────────────────────────────┐
│  ◀ Meu Histórico                           │
│                                            │
│  📊 Progresso para CNH                     │
│  ████████████░░░░ 75%                      │
│  15h de 20h mínimas                        │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │ 👤 Ricardo Gomes       31/01 ✅      │ │
│  │    50 min | R$ 80                    │ │
│  └──────────────────────────────────────┘ │
│    ▼ Detalhes                              │
│  ┌──────────────────────────────────────┐ │
│  │ 🏆 Minha Avaliação                   │ │
│  │ ⭐⭐⭐⭐⭐ Excelente                   │ │
│  │ "Ótimo. Me ajudou muitíssimo"        │ │
│  │ 31/01/2026 às 20:50                  │ │
│  ├──────────────────────────────────────┤ │
│  │ 💬 Ver Conversa (15 mensagens)   [>] │ │
│  ├──────────────────────────────────────┤ │
│  │ 📋 Trilha de Auditoria           [v] │ │
│  │    • 19:08 - Instrutor a caminho     │ │
│  │    • 19:08 - Instrutor chegou        │ │
│  │    • 19:21 - Aula iniciada           │ │
│  │    • 20:16 - Aula finalizada         │ │
│  │    • 20:49 - QR Code validado        │ │
│  ├──────────────────────────────────────┤ │
│  │ 📥 Baixar Comprovante                │ │
│  └──────────────────────────────────────┘ │
└────────────────────────────────────────────┘
```

---

## Resumo das Mudanças

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `AlunoChat.tsx` | **MODIFICAR** | Adicionar status `concluida` + abas |
| `InstrutorChat.tsx` | **MODIFICAR** | Adicionar status `concluida` + abas |
| `MeuHistorico.tsx` | **MODIFICAR** | Exibir avaliação + botão ver conversa |
| `HistoricoAulas.tsx` | **MODIFICAR** | Exibir avaliação + botão ver conversa |
| `useAulaAuditoria.ts` | **MODIFICAR** | Incluir dados de avaliação |
| `ChatView.tsx` | **MODIFICAR** | Adicionar modo read-only |
| `LessonRatingDisplay.tsx` | **CRIAR** | Componente de exibição de avaliação |
| `ChatHistoryButton.tsx` | **CRIAR** | Botão para abrir histórico de chat |

---

## Seção Técnica

### Estrutura de Dados Expandida

```typescript
// useAulaAuditoria.ts - Nova interface
interface AulaComAuditoria {
  id: string;
  data_hora: string;
  duracao_minutos: number;
  status: string;
  valor: number;
  // ... campos existentes
  
  // NOVOS CAMPOS
  avaliacao?: {
    nota: number;
    comentario: string | null;
    created_at: string;
  } | null;
  mensagens_count?: number;
}
```

### Query para Buscar Avaliações

```typescript
// No useAulasConcluidas
const { data: avaliacaoData } = await supabase
  .from("avaliacoes")
  .select("nota, comentario, created_at")
  .eq("aula_id", aula.id)
  .single();

// Contar mensagens
const { count: mensagensCount } = await supabase
  .from("mensagens_aula")
  .select("*", { count: "exact", head: true })
  .eq("aula_id", aula.id);
```

### Abas no Chat

```typescript
type ChatTab = 'ativas' | 'historico';

const [activeTab, setActiveTab] = useState<ChatTab>('ativas');

// Filtro baseado na aba
const filteredConversas = conversas.filter(c => {
  if (activeTab === 'ativas') {
    return ['confirmada', 'em_andamento', 'em_rota', 'aguardando_confirmacao'].includes(c.status);
  } else {
    return c.status === 'concluida';
  }
});
```

### ChatView Read-Only

```typescript
interface ChatViewProps {
  aulaId: string;
  // ... outros props
  readOnly?: boolean;
}

// No componente
{readOnly ? (
  <div className="p-3 border-t bg-muted/50 text-center">
    <p className="text-sm text-muted-foreground">
      📚 Esta conversa está arquivada
    </p>
  </div>
) : (
  <div className="p-3 border-t">
    {/* Input normal */}
  </div>
)}
```

---

## Benefícios Esperados

1. **Histórico completo** - Todas as conversas preservadas e acessíveis
2. **Feedbacks visíveis** - Alunos veem suas avaliações anteriores
3. **Instrutores informados** - Veem feedback recebido de cada aula
4. **Integridade garantida** - Dados já existem, apenas precisam ser exibidos
5. **Experiência profissional** - Organização clara entre ativo/histórico
