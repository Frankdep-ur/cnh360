
# Plano: Implementar Status de "Mensagem Lida" no Chat

## Problema Atual

Quando o instrutor (Lucas Felipe) abre o chat e visualiza as mensagens da aluna (Milena), ela não sabe que ele leu. Falta o recurso de confirmação de leitura, similar ao WhatsApp (dois checks azuis).

## Fluxo Desejado

```text
┌─────────────────────────────────────────────────────────────────┐
│  ALUNO MILENA                                                    │
│  Envia mensagem: "Olá, tudo bem?"                               │
│  Status: ✓ (enviada)                                             │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
              ┌─────────────────────────────────┐
              │ Tabela: mensagens_aula          │
              │ ├── read_at: NULL               │
              └─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  INSTRUTOR LUCAS FELIPE                                          │
│  Abre o chat → Mensagens são marcadas como lidas                │
│  read_at = timestamp atual                                       │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
              ┌─────────────────────────────────┐
              │ Tabela: mensagens_aula          │
              │ ├── read_at: 2026-01-26 15:30   │
              └─────────────────────────────────┘
                                │
                                ▼ (realtime)
┌─────────────────────────────────────────────────────────────────┐
│  ALUNO MILENA                                                    │
│  Vê atualização em tempo real                                    │
│  Status: ✓✓ (lida) - com indicador visual                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Alterações Necessárias

### 1. Migração de Banco de Dados

Adicionar coluna `read_at` na tabela `mensagens_aula`:

```sql
-- Adicionar coluna para marcar quando a mensagem foi lida
ALTER TABLE public.mensagens_aula 
ADD COLUMN read_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Adicionar índice para consultas de mensagens não lidas
CREATE INDEX idx_mensagens_aula_read_at ON public.mensagens_aula(aula_id, read_at);

-- Habilitar realtime para updates na tabela (se ainda não estiver)
ALTER PUBLICATION supabase_realtime ADD TABLE public.mensagens_aula;
```

### 2. Atualizar Hook useTripChat

Modificar o hook para:
- Incluir o campo `read_at` nas mensagens
- Adicionar função `markMessagesAsRead` para marcar mensagens como lidas
- Escutar eventos `UPDATE` além de `INSERT` para atualizar status em tempo real

```typescript
interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at: string | null;  // NOVO
  isOwn: boolean;
}

interface UseTripChatReturn {
  messages: Message[];
  loading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  markMessagesAsRead: () => Promise<void>;  // NOVO
}
```

### 3. Atualizar ChatView

Modificar o componente para:
- Chamar `markMessagesAsRead()` quando abrir o chat e quando novas mensagens chegarem
- Exibir indicador visual de "lida" nas mensagens enviadas pelo usuário
- Usar ícone de duplo check (CheckCheck) do Lucide

```typescript
// Indicador visual nas mensagens próprias
<span className="text-[10px] text-muted-foreground mt-1 px-1 flex items-center gap-1">
  {format(new Date(msg.created_at), 'HH:mm', { locale: ptBR })}
  {msg.isOwn && (
    msg.read_at ? (
      <CheckCheck className="w-3 h-3 text-blue-500" />  // Lida
    ) : (
      <Check className="w-3 h-3" />  // Enviada
    )
  )}
</span>
```

### 4. Corrigir Contador de Não Lidas

Atualizar as páginas de listagem de conversas para contar apenas mensagens realmente não lidas:

**InstrutorChat.tsx e AlunoChat.tsx:**
```typescript
// Contar mensagens não lidas (do outro usuário E sem read_at)
const { count } = await supabase
  .from('mensagens_aula')
  .select('*', { count: 'exact', head: true })
  .eq('aula_id', aula.id)
  .neq('sender_id', user.id)
  .is('read_at', null);  // NOVO: apenas não lidas
```

---

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| Migração SQL | Adicionar coluna `read_at` |
| `src/hooks/useTripChat.ts` | Adicionar `markMessagesAsRead()` e escutar updates |
| `src/components/chat/ChatView.tsx` | Chamar mark as read + exibir indicador visual |
| `src/pages/instrutor/InstrutorChat.tsx` | Corrigir contador com filtro `read_at` |
| `src/pages/aluno/AlunoChat.tsx` | Corrigir contador com filtro `read_at` |

---

## Detalhes Técnicos

### Função markMessagesAsRead

```typescript
const markMessagesAsRead = useCallback(async () => {
  if (!aulaId || !user) return;
  
  // Marcar como lidas apenas mensagens do OUTRO usuário
  const { error } = await supabase
    .from('mensagens_aula')
    .update({ read_at: new Date().toISOString() })
    .eq('aula_id', aulaId)
    .neq('sender_id', user.id)
    .is('read_at', null);
    
  if (error) {
    console.error('Error marking messages as read:', error);
  }
}, [aulaId, user]);
```

### Realtime para Updates

```typescript
const channel = supabase
  .channel(`chat-${aulaId}`)
  .on(
    'postgres_changes',
    {
      event: '*',  // INSERT e UPDATE
      schema: 'public',
      table: 'mensagens_aula',
      filter: `aula_id=eq.${aulaId}`,
    },
    (payload) => {
      if (payload.eventType === 'INSERT') {
        // Adicionar nova mensagem
      } else if (payload.eventType === 'UPDATE') {
        // Atualizar read_at da mensagem existente
        setMessages(prev => prev.map(m => 
          m.id === payload.new.id 
            ? { ...m, read_at: payload.new.read_at }
            : m
        ));
      }
    }
  )
  .subscribe();
```

---

## Resultado Esperado

Após implementação:

1. **Aluna Milena** envia mensagem → aparece ✓ (enviada)
2. **Instrutor Lucas Felipe** abre o chat
3. Sistema marca automaticamente as mensagens como lidas (`read_at = now()`)
4. **Aluna Milena** vê em tempo real: ✓✓ azul (lida)
5. Contador de não lidas mostra corretamente apenas mensagens novas
