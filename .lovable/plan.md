
# Plano: Confirmação Ativa do Aluno com QR Code no Início da Aula

## Problema Identificado

Atualmente o fluxo permite:
- O instrutor iniciar a aula apenas verificando `aluno_confirmou_chegada = true`
- O aluno confirmar presença com um simples clique em botão
- Não há validação de presença física real (QR Code) no INÍCIO

Isso cria risco de fraude onde:
- Instrutor pode iniciar aula sem o aluno estar presente
- Aluno pode confirmar sem estar no local
- Não há consentimento explícito em tela cheia

---

## Solução Proposta

### Novo Fluxo Anti-Fraude

```text
┌─────────────────────────────────────────────────────────────┐
│  1. INSTRUTOR CHEGA NO LOCAL                                │
│     Instrutor clica "Cheguei"                               │
│     → status = "aguardando_confirmacao"                     │
│     → Gera QR Code de INÍCIO (qr_code_inicio_data)          │
└─────────────────────────┬───────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  2. ALUNO RECEBE NOTIFICAÇÃO EM TELA CHEIA                  │
│     Modal bloqueante aparece automaticamente:               │
│     "Seu instrutor está pronto para iniciar a aula!"        │
│     [Confirmar início] [Não estou no local]                 │
│     → Aluno NÃO pode usar o app sem responder               │
└─────────────────────────┬───────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  3. ALUNO CONFIRMA → VÊ SEU QR CODE                         │
│     Ao clicar "Confirmar início":                           │
│     → aluno_pronto_para_aula = true                         │
│     → Exibe QR Code exclusivo para o instrutor escanear     │
└─────────────────────────┬───────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  4. INSTRUTOR ESCANEIA QR DO ALUNO                          │
│     Instrutor usa câmera para ler QR Code                   │
│     → Valida hash + expiração                               │
│     → qr_inicio_validado = true                             │
│     → status = "em_andamento"                               │
│     → Cronômetro inicia                                     │
└─────────────────────────┬───────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  5. AULA EM ANDAMENTO (fluxo existente)                     │
│     Cronômetro sincronizado                                 │
│     → Finalização gera QR Code de FIM                       │
│     → Instrutor escaneia para concluir                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Componentes a Criar/Modificar

### 1. Novo Componente: `LessonStartConfirmationModal.tsx`

Modal em tela cheia (z-index máximo) que:
- Aparece automaticamente quando `status = "aguardando_confirmacao"`
- Bloqueia toda interação com o app
- Mostra dados da aula (instrutor, valor, local)
- Botões: "Confirmar início" e "Não estou no local"
- Após confirmar, exibe QR Code para o instrutor escanear

### 2. Modificação: `lesson-workflow` Edge Function

Adicionar nova action: `solicitar_inicio_aula`
- Gera QR Code de início (SHA-256 com timestamp)
- Salva em `qr_code_inicio_data` e `qr_code_inicio_expires_at`
- Envia notificação push para o aluno

Adicionar nova action: `confirmar_inicio_aluno`
- Marca `aluno_pronto_para_aula = true`
- Notifica instrutor que pode escanear QR

Modificar action: `iniciar_aula`
- Agora requer: escanear QR Code do aluno (não apenas `aluno_confirmou_chegada`)
- Valida `qr_code_inicio_data` do aluno
- Só então muda status para `em_andamento`

### 3. Modificação: `AulaConfirmadaById.tsx` (Aluno)

- Detectar mudança para `status = "aguardando_confirmacao"`
- Abrir `LessonStartConfirmationModal` automaticamente
- Após confirmação, exibir QR Code de início

### 4. Modificação: `AulaEmAndamento.tsx` (Instrutor)

- Quando `status = "aguardando_confirmacao"`:
  - Mostrar "Aguardando aluno confirmar"
  - Quando `aluno_pronto_para_aula = true`:
    - Mostrar botão "Escanear QR do Aluno"
    - Abrir `QRCodeScanner`
    - Após scan válido, aula inicia

### 5. Migração de Banco de Dados

Adicionar colunas à tabela `aulas`:
```sql
ALTER TABLE aulas ADD COLUMN qr_code_inicio_data TEXT;
ALTER TABLE aulas ADD COLUMN qr_code_inicio_expires_at TIMESTAMPTZ;
ALTER TABLE aulas ADD COLUMN qr_inicio_validado BOOLEAN DEFAULT FALSE;
ALTER TABLE aulas ADD COLUMN aluno_pronto_para_aula BOOLEAN DEFAULT FALSE;
```

---

## Comportamento do Modal Bloqueante

### Regras de Exibição

| Condição | Ação |
|----------|------|
| `status = "aguardando_confirmacao"` E `aluno_pronto_para_aula = false` | Modal aparece em tela cheia |
| Aluno clica "Confirmar início" | Modal muda para exibir QR Code |
| Aluno clica "Não estou no local" | Evento registrado, modal fecha, aula não inicia |
| Instrutor escaneia QR válido | Modal fecha, aula inicia |

### Design do Modal

```text
┌────────────────────────────────────────────┐
│                                            │
│     🚗  Instrutor chegou!                  │
│                                            │
│     [Foto do instrutor]                    │
│     Frank Alexandre                        │
│     está pronto para sua aula              │
│                                            │
│     📍 Av. Brasil, 1200                    │
│     💰 R$ 10,00                            │
│     ⏱️  50 minutos                         │
│                                            │
│  ┌────────────────────────────────────┐   │
│  │  ✅ Confirmar início da aula       │   │
│  └────────────────────────────────────┘   │
│                                            │
│  ┌────────────────────────────────────┐   │
│  │  ❌ Não estou no local             │   │
│  └────────────────────────────────────┘   │
│                                            │
└────────────────────────────────────────────┘
```

Após confirmar:

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
│                                            │
│     O instrutor irá escanear este          │
│     código para iniciar a aula             │
│                                            │
│     ⏳ Aguardando scan...                  │
│                                            │
└────────────────────────────────────────────┘
```

---

## Registro de Eventos

### Tabela `aulas_auditoria`

| Evento | Disparado por | Dados |
|--------|---------------|-------|
| `instrutor_pronto` | Instrutor | GPS, timestamp |
| `aluno_confirmou_inicio` | Aluno | GPS, timestamp |
| `aluno_recusou_inicio` | Aluno | Motivo, timestamp |
| `qr_inicio_escaneado` | Instrutor | Hash QR, timestamp |
| `aula_iniciada` | Sistema | Ambos validados |

---

## Arquivos a Criar/Modificar

### Novos Arquivos
1. `src/components/aula/LessonStartConfirmationModal.tsx` - Modal bloqueante em tela cheia

### Modificações
1. `supabase/functions/lesson-workflow/index.ts` - Adicionar actions e validação de QR início
2. `src/pages/aluno/AulaConfirmadaById.tsx` - Integrar modal e exibir QR de início
3. `src/pages/instrutor/AulaEmAndamento.tsx` - Adicionar scanner de QR para iniciar
4. `src/hooks/useLessonWorkflow.ts` - Adicionar novas actions

### Migração SQL
```sql
-- Adicionar campos para QR Code de início
ALTER TABLE aulas 
ADD COLUMN IF NOT EXISTS qr_code_inicio_data TEXT,
ADD COLUMN IF NOT EXISTS qr_code_inicio_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS qr_inicio_validado BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS aluno_pronto_para_aula BOOLEAN DEFAULT FALSE;
```

---

## Fluxo Resumido

1. **Instrutor chega** → Clica "Cheguei" → Status muda → QR de início gerado
2. **Aluno recebe modal bloqueante** → Deve confirmar ou recusar
3. **Aluno confirma** → Exibe QR Code exclusivo
4. **Instrutor escaneia QR** → Aula inicia com validação mútua
5. **Cronômetro roda** → Final com QR Code (fluxo existente)

**Sem QR Code no início = Sem aula**
**Sem confirmação do aluno = Sem aula**

---

## Seção Técnica

### Estrutura do QR Code de Início

```json
{
  "type": "inicio",
  "aulaId": "uuid-da-aula",
  "timestamp": "2026-01-29T10:30:00Z",
  "hash": "sha256-hash-com-secret",
  "version": 2
}
```

### Validação no Backend

```typescript
// Validar QR de início
case "validar_qr_inicio":
  if (!isInstrutor) throw "Apenas instrutor";
  if (aula.status !== "aguardando_confirmacao") throw "Status inválido";
  if (!aula.aluno_pronto_para_aula) throw "Aluno não confirmou";
  
  const scannedQR = JSON.parse(qr_data);
  if (scannedQR.type !== "inicio") throw "QR inválido";
  if (new Date(aula.qr_code_inicio_expires_at) < new Date()) throw "QR expirado";
  // Validar hash...
  
  updateData = {
    status: "em_andamento",
    qr_inicio_validado: true,
    aula_inicio: new Date().toISOString()
  };
```

### Prioridade do Modal

```typescript
// Z-index máximo para garantir bloqueio
className="fixed inset-0 z-[9999] bg-background"

// Prevenir scroll e interação com app
useEffect(() => {
  if (showModal) {
    document.body.style.overflow = 'hidden';
  }
  return () => { document.body.style.overflow = ''; };
}, [showModal]);
```
