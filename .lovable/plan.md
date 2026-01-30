

# Plano: Persistência de Estado e Redirecionamento Automático para Aulas

## Problema Identificado

O sistema atual trata o QR Code como uma **tela estática** em vez de um **estado persistente da aula**. Isso causa os seguintes problemas:

### Para o Aluno:
- O QR Code aparece em tela cheia ✅
- Mas o aluno fica **travado sem ações** (não pode atualizar ou cancelar)
- Se reabrir o app, precisa navegar manualmente

### Para o Instrutor:
- Se sair do app e voltar, **perde o ponto de escaneamento**
- Não é redirecionado automaticamente para a câmera
- Precisa navegar manualmente até a aula

## Solução Proposta

### 1. Hook Global para Instrutor: `useGlobalInstructorLessonMonitor.ts`

Similar ao hook do aluno, este hook irá:
- Monitorar aulas ativas do instrutor em tempo real
- Detectar quando há uma aula em `aguardando_confirmacao` com `aluno_pronto_para_aula = true`
- Redirecionar automaticamente para a tela de escaneamento de QR

```text
┌─────────────────────────────────────────────────────────────┐
│  INSTRUTOR ABRE O APP                                       │
│                                                             │
│  Hook verifica: Tenho aula em aguardando_confirmacao?       │
│     │                                                       │
│     ├─► SIM + aluno_pronto = true                          │
│     │      → Redireciona para /instrutor/aula/:id          │
│     │      → Abre scanner de QR automaticamente            │
│     │                                                       │
│     ├─► SIM + aluno_pronto = false                         │
│     │      → Redireciona para /instrutor/aula/:id          │
│     │      → Mostra "Aguardando confirmação do aluno"       │
│     │                                                       │
│     └─► NÃO                                                 │
│           → Fluxo normal do dashboard                       │
└─────────────────────────────────────────────────────────────┘
```

### 2. Componente Global para Instrutor: `GlobalInstructorQRScanner.tsx`

- Montado no `App.tsx` (como o modal do aluno)
- Quando `aluno_pronto_para_aula = true`, exibe modal de scanner em tela cheia
- Prioridade máxima (z-[9999])
- Persiste mesmo que o instrutor navegue para outra página

### 3. Melhorias no Modal do Aluno (`LessonStartConfirmationModal.tsx`)

Adicionar opções de ação quando estiver exibindo o QR Code:

```text
┌────────────────────────────────────────────┐
│                                            │
│     📱 Mostre este QR Code                 │
│                                            │
│     ┌──────────────────────┐              │
│     │     [QR CODE]        │              │
│     │                      │              │
│     └──────────────────────┘              │
│                                            │
│     Expira em: 2:45                        │
│     ⏳ Aguardando instrutor escanear...    │
│                                            │
│  ┌────────────────────────────────────┐   │  ← NOVO
│  │  🔄 Atualizar QR Code              │   │
│  └────────────────────────────────────┘   │
│                                            │
│  ┌────────────────────────────────────┐   │  ← NOVO
│  │  ❌ Cancelar aula                  │   │
│  └────────────────────────────────────┘   │
│                                            │
└────────────────────────────────────────────┘
```

### 4. Fluxo de Estados Persistente

O estado da aula determina **automaticamente** a tela de ambos:

```text
ESTADO DA AULA          │ APP ALUNO               │ APP INSTRUTOR
────────────────────────┼─────────────────────────┼─────────────────────────
confirmada              │ Página normal           │ Botão "Em Rota"
em_rota                 │ Rastrear instrutor      │ Mapa + "Cheguei"
aguardando_confirmacao  │ Modal bloqueante        │ Aguardando confirmação
  + aluno_pronto=false  │   "Confirmar início"    │   
aguardando_confirmacao  │ Modal com QR Code       │ Modal com Scanner QR
  + aluno_pronto=true   │   (com ações)           │   (abre automaticamente)
em_andamento            │ Cronômetro              │ Cronômetro + Finalizar
aguardando_qr           │ QR Code final           │ Scanner QR final
concluida               │ Sucesso                 │ Sucesso
```

---

## Arquivos a Criar

### 1. `src/hooks/useGlobalInstructorLessonMonitor.ts`

Hook que monitora aulas ativas do instrutor e retorna:
- `activeLesson` - aula que precisa de atenção
- `needsQRScan` - se o aluno já confirmou e espera scan
- `aulaId` - ID para navegação/ação

### 2. `src/components/aula/GlobalInstructorQRScanner.tsx`

Componente modal que:
- Detecta quando `aluno_pronto_para_aula = true`
- Exibe scanner de QR em tela cheia
- Fecha automaticamente quando aula muda para `em_andamento`

---

## Arquivos a Modificar

### 1. `src/App.tsx`

Adicionar o componente `GlobalInstructorQRScanner` junto ao `GlobalLessonConfirmationModal`

### 2. `src/components/aula/LessonStartConfirmationModal.tsx`

Adicionar:
- Botão "Atualizar QR Code" (chama ação `regenerar_qr_inicio`)
- Botão "Cancelar aula" (com confirmação)
- Status mais claro do estado atual

### 3. `src/hooks/useLessonWorkflow.ts`

Adicionar nova action: `regenerar_qr_inicio`

### 4. `supabase/functions/lesson-workflow/index.ts`

Adicionar handler para `regenerar_qr_inicio` que:
- Gera novo QR Code de início
- Atualiza `qr_code_inicio_data` e `qr_code_inicio_expires_at`

---

## Comportamento Esperado

### Cenário: Instrutor sai e volta ao app

1. Instrutor clicou "Cheguei" → status = `aguardando_confirmacao`
2. Instrutor fecha o app
3. Aluno confirma presença → `aluno_pronto_para_aula = true`
4. Instrutor reabre o app
5. **NOVO**: Hook detecta estado e abre scanner automaticamente
6. Instrutor escaneia QR → aula inicia

### Cenário: Aluno precisa regenerar QR

1. Aluno confirmou presença → exibe QR Code
2. QR expira (5 minutos)
3. **NOVO**: Aluno clica "Atualizar QR Code"
4. Backend gera novo QR
5. Aluno mostra novo QR para instrutor

### Cenário: Aluno quer cancelar

1. Aluno confirmou presença → exibe QR Code
2. **NOVO**: Aluno clica "Cancelar aula"
3. Modal de confirmação aparece
4. Se confirmar, aula é cancelada e ambos são notificados

---

## Seção Técnica

### Estrutura do `useGlobalInstructorLessonMonitor.ts`

```typescript
interface UseGlobalInstructorLessonMonitorReturn {
  activeLesson: {
    id: string;
    status: string;
    aluno_nome: string;
    aluno_foto: string | null;
    aluno_pronto_para_aula: boolean;
    qr_code_inicio_data: string | null;
  } | null;
  needsQRScan: boolean;
  isScanning: boolean;
  scanQR: (qrData: string) => Promise<boolean>;
}
```

### Lógica de Detecção

```typescript
// No hook do instrutor
const checkForActiveLesson = async () => {
  const { data: aulas } = await supabase
    .from('aulas')
    .select('*')
    .eq('instrutor_id', instrutorId)
    .in('status', ['aguardando_confirmacao', 'em_andamento', 'aguardando_qr'])
    .order('data_hora', { ascending: true })
    .limit(1);
    
  if (aulas?.length > 0) {
    const aula = aulas[0];
    setActiveLesson(aula);
    
    // Se aluno pronto e status aguardando, precisa escanear
    if (aula.status === 'aguardando_confirmacao' && aula.aluno_pronto_para_aula) {
      setNeedsQRScan(true);
    }
  }
};
```

### Nova Action: `regenerar_qr_inicio`

```typescript
case "regenerar_qr_inicio":
  if (!isAluno) throw "Apenas aluno pode regenerar QR de início";
  if (aula.status !== "aguardando_confirmacao") throw "Status inválido";
  if (!aula.aluno_pronto_para_aula) throw "Aluno não confirmou presença";
  
  // Gerar novo QR
  const novoQRInicio = JSON.stringify({
    type: "inicio",
    aulaId: aula_id,
    timestamp: new Date().toISOString(),
    hash: await generateHash(...)
  });
  
  updateData = {
    qr_code_inicio_data: novoQRInicio,
    qr_code_inicio_expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString()
  };
```

### Prioridade de Z-Index

- `GlobalLessonConfirmationModal` (aluno): z-[9999]
- `GlobalInstructorQRScanner` (instrutor): z-[9999]
- Ambos usam `position: fixed` e `inset-0`

---

## Resumo das Mudanças

| Componente | Mudança | Impacto |
|------------|---------|---------|
| `useGlobalInstructorLessonMonitor.ts` | **CRIAR** | Instrutor é redirecionado automaticamente |
| `GlobalInstructorQRScanner.tsx` | **CRIAR** | Scanner abre sozinho quando aluno confirma |
| `App.tsx` | **MODIFICAR** | Montar componente global do instrutor |
| `LessonStartConfirmationModal.tsx` | **MODIFICAR** | Adicionar botões de ação para aluno |
| `useLessonWorkflow.ts` | **MODIFICAR** | Nova action `regenerar_qr_inicio` |
| `lesson-workflow/index.ts` | **MODIFICAR** | Handler para regenerar QR de início |

