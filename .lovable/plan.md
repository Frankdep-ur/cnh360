
# Plano: Sincronização Global do Fluxo de Finalização de Aula

## Diagnóstico do Problema

O sistema atual possui dois fluxos de QR Code:

| Fluxo | Status | Aluno | Instrutor |
|-------|--------|-------|-----------|
| **INÍCIO** (✅ Funciona) | `aguardando_confirmacao` | Modal global bloqueante | Scanner global automático |
| **FINALIZAÇÃO** (❌ Quebrado) | `aguardando_qr` | **Só aparece se estiver na página da aula** | Scanner manual na página |

### O Que Está Faltando

1. **Para o ALUNO**: Não existe um monitor global que detecte quando a aula entra em `aguardando_qr` e exiba o QR Code de finalização em tela cheia.

2. **Para o INSTRUTOR**: O `useGlobalInstructorLessonMonitor` monitora apenas `aguardando_confirmacao`, não monitora `aguardando_qr` para o scan de finalização.

3. **Persistência**: Se o aluno ou instrutor sair do app durante o status `aguardando_qr`, não há redirecionamento automático ao voltar.

---

## Solução: Espelhar o Fluxo de Início para o Fluxo de Fim

Vamos criar componentes e hooks paralelos para a finalização:

```text
┌──────────────────────────────────────────────────────────────────────────┐
│  INÍCIO DA AULA (já existe)      │  FINALIZAÇÃO (a criar)               │
├──────────────────────────────────┼───────────────────────────────────────┤
│  useGlobalLessonMonitor          │  useGlobalLessonFinalizationMonitor   │
│  GlobalLessonConfirmationModal   │  GlobalLessonFinalizationModal        │
│  LessonStartConfirmationModal    │  LessonEndConfirmationModal           │
├──────────────────────────────────┼───────────────────────────────────────┤
│  useGlobalInstructorLessonMonitor│  (expandir para incluir aguardando_qr)│
│  GlobalInstructorQRScanner       │  (expandir para incluir fase de fim)  │
└──────────────────────────────────┴───────────────────────────────────────┘
```

---

## Arquivos a Criar

### 1. `src/hooks/useGlobalLessonFinalizationMonitor.ts`

Hook para o ALUNO que monitora aulas em status `aguardando_qr`:

- Detecta quando a aula muda para `aguardando_qr`
- Fornece os dados do QR Code de finalização (`qr_code_data`)
- Permite regenerar o QR Code se expirar
- Usa Realtime + polling como fallback

### 2. `src/components/aula/GlobalLessonFinalizationModal.tsx`

Componente global para o ALUNO montado no `App.tsx`:

- Modal fullscreen bloqueante (z-[9999])
- Exibe QR Code de finalização em tela cheia
- Mostra contador de expiração
- Botão "Atualizar QR Code"
- Aguarda o instrutor escanear para fechar automaticamente

### 3. `src/components/aula/LessonEndConfirmationModal.tsx`

Componente UI do modal de finalização:

- QR Code grande e claro
- Mensagem "Mostre para o instrutor validar a aula"
- Countdown de expiração
- Botão para regenerar QR
- Animação de "Aguardando escaneamento..."

---

## Arquivos a Modificar

### 1. `src/hooks/useGlobalInstructorLessonMonitor.ts`

Expandir para também monitorar status `aguardando_qr`:

```typescript
// Atual: só monitora 'aguardando_confirmacao'
.in('status', ['aguardando_confirmacao'])

// Modificar para:
.in('status', ['aguardando_confirmacao', 'aguardando_qr'])
```

Adicionar lógica para distinguir:
- `aguardando_confirmacao` + `aluno_pronto = true` → Scan de INÍCIO
- `aguardando_qr` → Scan de FINALIZAÇÃO

### 2. `src/components/aula/GlobalInstructorQRScanner.tsx`

Expandir para suportar dois modos de escaneamento:

- Modo INÍCIO: valida `qr_code_inicio_data` → chama `validar_qr_inicio`
- Modo FINALIZAÇÃO: valida `qr_code_data` → chama `validar_qr`

Adicionar indicação visual clara de qual fase está:
- "Escanear para INICIAR aula" (modo início)
- "Escanear para CONCLUIR aula" (modo fim)

### 3. `src/App.tsx`

Adicionar o novo componente global:

```tsx
<GlobalLessonConfirmationModal />     {/* Já existe - início */}
<GlobalLessonFinalizationModal />     {/* NOVO - fim */}
<GlobalInstructorQRScanner />         {/* Já existe - expandir */}
```

### 4. `src/hooks/useLessonWorkflow.ts`

Verificar se a action `regenerar_qr` (para o aluno regenerar QR de fim) está disponível. Atualmente só o instrutor pode regenerar - precisamos permitir que o aluno também regenere.

### 5. `supabase/functions/lesson-workflow/index.ts`

Adicionar nova action `regenerar_qr_aluno` que permite ao ALUNO regenerar o QR de finalização:

```typescript
case "regenerar_qr_aluno":
  if (!isAluno) throw "Apenas aluno pode regenerar";
  if (aula.status !== "aguardando_qr") throw "Status inválido";
  // Gerar novo qr_code_data e qr_code_expires_at
```

---

## Fluxo Completo de Finalização

```text
[Instrutor]                    [Sistema]                    [Aluno]
     |                              |                           |
     |--"Finalizar aula"---------->|                           |
     |  (90% duração mínima)       |                           |
     |                              |--status = aguardando_qr   |
     |                              |--qr_code_data gerado      |
     |                              |--Notificação push-------->|
     |                              |                           |
     |                              |<--Hook detecta mudança----|
     |                              |--Modal fullscreen-------->|
     |                              |                           |--QR Code exibido
     |                              |                           |
     |<--Hook detecta status=qr----|                           |
     |--Scanner abre automatico    |                           |
     |                              |                           |
     |--Scan QR-------------------->|                           |
     |                              |--validar_qr               |
     |                              |--status = concluida       |
     |                              |--capture-payment-pagarme  |
     |                              |--Split 50/50              |
     |                              |--Notificação pagamento--->|
     |                              |                           |
     |<--"Pagamento liberado!"-----|--Modal fecha              |
```

---

## Persistência de Estado

### Cenário: Aluno sai do app durante `aguardando_qr`

1. Instrutor clica "Finalizar" → status = `aguardando_qr`
2. Modal aparece para o aluno com QR
3. **Aluno fecha o app**
4. Aluno reabre o app
5. **NOVO**: `useGlobalLessonFinalizationMonitor` detecta aula em `aguardando_qr`
6. Modal reabre automaticamente com QR Code
7. Se expirou, botão "Atualizar" gera novo QR

### Cenário: Instrutor sai do app durante `aguardando_qr`

1. Instrutor clicou "Finalizar" → status = `aguardando_qr`
2. **Instrutor fecha o app**
3. Instrutor reabre o app
4. **NOVO**: `useGlobalInstructorLessonMonitor` detecta aula em `aguardando_qr`
5. Scanner de finalização abre automaticamente
6. Instrutor escaneia → aula concluída

---

## Liberação de Pagamento

O fluxo de pagamento já está implementado corretamente:

1. `validar_qr` (instrutor escaneia QR de fim)
2. `releasePayment = true`
3. Chama `capture-payment-pagarme`
4. Pagar.me captura a transação
5. Split 50/50 aplicado automaticamente
6. Notificação enviada ao instrutor (in-app + WhatsApp)
7. Saldo atualizado no dashboard

---

## Interface do Aluno - Modal de Finalização

```text
┌────────────────────────────────────────────┐
│           🎓 Aula finalizada!              │
│                                            │
│    Mostre o QR Code para o instrutor       │
│                                            │
│     ┌──────────────────────┐              │
│     │     [QR CODE]        │              │
│     │    (finalização)     │              │
│     └──────────────────────┘              │
│                                            │
│     ⏱️ Expira em: 3:45                    │
│     ⏳ Aguardando instrutor escanear...    │
│                                            │
│  ┌────────────────────────────────────┐   │
│  │  🔄 Atualizar QR Code              │   │
│  └────────────────────────────────────┘   │
│                                            │
│  🔒 A validação garante o pagamento       │
│     correto ao instrutor                   │
└────────────────────────────────────────────┘
```

---

## Interface do Instrutor - Scanner de Finalização

```text
┌────────────────────────────────────────────┐
│  🎯 Concluir Aula                    [X]   │
├────────────────────────────────────────────┤
│                                            │
│     ┌──────────────────┐                  │
│     │   [Foto Aluno]   │                  │
│     └──────────────────┘                  │
│     João Silva                             │
│     ✅ Aula de 50 min concluída           │
│                                            │
│     💰 Valor: R$ 10,00                    │
│     📍 Local: Centro - Rua X              │
│                                            │
├────────────────────────────────────────────┤
│  ⏱️ QR expira em 4:32                     │
│                                            │
│  ┌────────────────────────────────────┐   │
│  │  📷 Escanear QR para CONCLUIR      │   │
│  └────────────────────────────────────┘   │
│                                            │
│  Após o scan, o pagamento será liberado    │
└────────────────────────────────────────────┘
```

---

## Resumo das Mudanças

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `useGlobalLessonFinalizationMonitor.ts` | **CRIAR** | Monitora `aguardando_qr` para o aluno |
| `GlobalLessonFinalizationModal.tsx` | **CRIAR** | Modal fullscreen com QR de fim |
| `LessonEndConfirmationModal.tsx` | **CRIAR** | UI do modal de finalização |
| `useGlobalInstructorLessonMonitor.ts` | **MODIFICAR** | Adicionar monitoramento de `aguardando_qr` |
| `GlobalInstructorQRScanner.tsx` | **MODIFICAR** | Adicionar modo de finalização |
| `App.tsx` | **MODIFICAR** | Adicionar `GlobalLessonFinalizationModal` |
| `useLessonWorkflow.ts` | **MODIFICAR** | Adicionar action `regenerar_qr_aluno` |
| `lesson-workflow/index.ts` | **MODIFICAR** | Handler para `regenerar_qr_aluno` |

---

## Seção Técnica

### Estrutura do `useGlobalLessonFinalizationMonitor.ts`

```typescript
interface UseGlobalLessonFinalizationMonitorReturn {
  activeLesson: {
    id: string;
    status: string;
    qr_code_data: string | null;
    qr_code_expires_at: string | null;
    instrutor_nome: string;
    instrutor_foto: string | null;
    valor: number;
    duracao_minutos: number;
  } | null;
  isRefreshing: boolean;
  refreshQR: () => Promise<void>;
}
```

### Lógica de Detecção

```typescript
const checkForFinalizationLesson = async () => {
  const { data: aulas } = await supabase
    .from('aulas')
    .select('*')
    .eq('aluno_id', alunoId)
    .eq('status', 'aguardando_qr')  // <- Diferença do hook de início
    .order('data_hora', { ascending: true })
    .limit(1);
    
  if (aulas?.length > 0) {
    setActiveLesson(aulas[0]);
  }
};
```

### Nova Action: `regenerar_qr_aluno`

```typescript
case "regenerar_qr_aluno":
  if (!isAluno) throw "Apenas aluno pode regenerar QR de fim";
  if (aula.status !== "aguardando_qr") throw "Status inválido";
  
  // Gerar novo QR de finalização
  const novoQRFim = JSON.stringify({
    aulaId: aula_id,
    timestamp: new Date().toISOString(),
    hash: await generateHash(...),
    version: 1
  });
  
  updateData = {
    qr_code_data: novoQRFim,
    qr_code_expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString()
  };
```

### Distinção no Scanner do Instrutor

```typescript
// No useGlobalInstructorLessonMonitor
const scanType = useMemo(() => {
  if (activeLesson?.status === 'aguardando_confirmacao' && activeLesson.aluno_pronto_para_aula) {
    return 'inicio';  // Escanear qr_code_inicio_data
  }
  if (activeLesson?.status === 'aguardando_qr') {
    return 'fim';  // Escanear qr_code_data
  }
  return null;
}, [activeLesson]);
```

