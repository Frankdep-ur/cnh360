

# Plano: Correção do Fluxo Real de Aula Aluno-Instrutor

## Diagnóstico dos Problemas Identificados

### 1. Dados Hardcoded/Genéricos na Página `ValidarAulaInstrutor.tsx`
A página `src/pages/instrutor/ValidarAulaInstrutor.tsx` usa dados **completamente estáticos**:
```typescript
const aula = {
  aluno: "Maria Santos",
  foto: "https://images.unsplash.com/...", // Foto stock
  duracao: 60,
  local: "Av. Brasil, 1200...",
  valor: 120, // Valor fixo, não reflete R$10 real
};
```

**Dados Reais na Aula ID `12253018...`:**
- Aluno: MILENA SANTOS (não Maria Santos)
- Valor: R$10,00 (não R$120)
- Instrutor: Frank Alexandre
- Foto do aluno: Existe no storage, não está sendo usada

### 2. Texto "RENACH" Indesejado
Múltiplas referências a "RENACH" que não devem aparecer:
- `ValidarAulaInstrutor.tsx` linha 84: "Validação RENACH"
- `ValidarAulaInstrutor.tsx` linha 121: "Para registrar a aula no RENACH..."
- `ValidarAulaInstrutor.tsx` linha 255: "Registro RENACH"
- `ValidarAulaInstrutor.tsx` linha 295: "enviada para o RENACH"

### 3. Check-in do Aluno é Visual, Não Funcional
A página `ValidarAulaInstrutor.tsx` simula check-in com `setTimeout`:
```typescript
const handleScanQR = () => {
  setTimeout(() => {
    setQrValidado(true);
  }, 1000);
};
```
**Não há conexão real** com o banco de dados ou QR Code do aluno.

### 4. QR Code Não Aparece
O fluxo REAL usa `AulaEmAndamento.tsx` que já implementa QR Code corretamente, mas:
- A página `ValidarAulaInstrutor.tsx` não está integrada
- A rota `/instrutor/validar-aula` aponta para a página estática antiga
- O sistema de navegação manda para a página errada

### 5. Taxa Errada (28% vs 50%)
`ValidarAulaInstrutor.tsx` linha 325 mostra taxa de 28%, mas o sistema real usa 50/50 split.

---

## Solução Proposta

### Fase 1: Remover Página Obsoleta e Ajustar Rotas

**Ação:** Deprecar `ValidarAulaInstrutor.tsx` e redirecionar para `AulaEmAndamento.tsx`

A página `AulaEmAndamento.tsx` já implementa corretamente:
- Busca dados reais do banco (aluno, valor, foto)
- Fluxo de QR Code funcional
- Check-in real do aluno
- Cronômetro sincronizado

### Fase 2: Corrigir Textos "RENACH"

| Texto Atual | Texto Correto |
|-------------|---------------|
| "Aula Registrada! A aula foi validada e enviada para o RENACH" | "Aula Validada! A aula foi registrada com sucesso" |
| "Validação RENACH" | "Validação da Aula" |
| "Registro RENACH" | "Registro da Aula" |
| "Para registrar a aula no RENACH..." | "Para validar a aula..." |

### Fase 3: Corrigir Taxa de 28% para 50%

No resumo financeiro, mostrar:
- Valor bruto: R$ X
- Taxa da plataforma (50%): - R$ Y
- Você recebe (50%): R$ Z

### Fase 4: Garantir Fluxo de QR Code Bidirecional

O fluxo já existe em `AulaEmAndamento.tsx` e `AulaConfirmadaById.tsx`:

```text
INÍCIO DA AULA:
  Aluno confirma chegada via app (botão)
  └─> aluno_confirmou_chegada = true
  └─> Libera botão "Iniciar Aula" no instrutor

DURANTE A AULA:
  Cronômetro sincronizado via Realtime
  
FINALIZAÇÃO:
  Instrutor clica "Finalizar Aula"
  └─> Gera QR Code dinâmico (SHA-256 + expiração 5min)
  └─> Aluno vê QR Code em AulaConfirmadaById
  └─> Instrutor escaneia com QRCodeScanner
  └─> valida_qr → status="concluida" → capture-payment
```

---

## Arquivos a Modificar

### 1. `src/App.tsx` (Rotas)
- Redirecionar `/instrutor/validar-aula` para `/instrutor/aula/:aulaId`

### 2. `src/pages/instrutor/ValidarAulaInstrutor.tsx`
- Converter para componente de redirecionamento OU
- Reconstruir para buscar dados reais do banco

### 3. `src/pages/instrutor/AulaEmAndamento.tsx`
- Remover referências a "RENACH" se houver
- Corrigir cálculo de taxa para 50%

### 4. `src/pages/aluno/AulaConfirmadaById.tsx`
- Garantir que QR Code aparece corretamente após "aguardando_qr"

### 5. `src/pages/aluno/ValidacaoAula.tsx`
- Remover textos "RENACH"
- Converter simulações para ações reais

### 6. `src/pages/instrutor/InstrutorACaminho.tsx`
- Redirecionar para `AulaEmAndamento.tsx` em vez de `validar-aula`

---

## Fluxo Corrigido (Diagrama)

```text
┌─────────────────────────────────────────────────────────────┐
│                    PAGAMENTO APROVADO                       │
│  Aluno paga → aula.status = "confirmada"                    │
│  aula.payment_confirmed = true                              │
│  aula.valor = R$10,00 (valor REAL pago)                     │
└─────────────────────────┬───────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                 INSTRUTOR A CAMINHO                         │
│  Instrutor clica "Estou a caminho"                          │
│  → status = "em_rota"                                       │
│  → GPS do instrutor compartilhado em tempo real             │
│  → Aluno recebe notificação + pode rastrear                 │
└─────────────────────────┬───────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                  INSTRUTOR CHEGOU                           │
│  Instrutor clica "Cheguei no local"                         │
│  → status = "aguardando_confirmacao"                        │
│  → Aluno recebe notificação para confirmar                  │
└─────────────────────────┬───────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────┐
│            CHECK-IN DO ALUNO (REAL)                         │
│  Aluno clica "Confirmar Chegada"                            │
│  → aluno_confirmou_chegada = true                           │
│  → Instrutor recebe liberação para iniciar                  │
└─────────────────────────┬───────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                  AULA EM ANDAMENTO                          │
│  Instrutor clica "Iniciar Aula"                             │
│  → status = "em_andamento"                                  │
│  → aula_inicio = NOW()                                      │
│  → Cronômetro ativado (sincronizado ambos os lados)         │
└─────────────────────────┬───────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────┐
│               FINALIZAÇÃO + QR CODE                         │
│  Instrutor clica "Finalizar" (após 90% do tempo)            │
│  → status = "aguardando_qr"                                 │
│  → qr_code_data = { hash SHA-256, expires in 5min }         │
│  → ALUNO vê QR Code no app (AulaConfirmadaById)             │
│  → INSTRUTOR escaneia QR Code do aluno (QRCodeScanner)      │
└─────────────────────────┬───────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                 AULA VALIDADA                               │
│  QR validado com sucesso                                    │
│  → status = "concluida"                                     │
│  → qr_validado = true                                       │
│  → Pagamento capturado (capture-payment-pagarme)            │
│  → Split 50/50 aplicado                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Resumo das Mudanças

| Problema | Solução |
|----------|---------|
| Dados genéricos (Maria Santos, R$120) | Usar dados reais do banco (MILENA SANTOS, R$10) |
| Foto stock do Unsplash | Usar `profiles.avatar_url` real |
| Texto "RENACH" | Substituir por "Aula validada com sucesso" |
| Check-in simulado | Usar `aluno_confirmou_chegada` real |
| QR Code não aparece | Garantir navegação para AulaEmAndamento/AulaConfirmadaById |
| Taxa 28% | Corrigir para 50% (split real) |
| Página ValidarAulaInstrutor obsoleta | Deprecar e redirecionar |

---

## Seção Técnica

### Arquivos Principais Afetados

1. **`src/App.tsx`** - Ajustar rotas
2. **`src/pages/instrutor/ValidarAulaInstrutor.tsx`** - Reconstruir ou deprecar
3. **`src/pages/instrutor/AulaEmAndamento.tsx`** - Ajustar textos e taxa
4. **`src/pages/instrutor/InstrutorACaminho.tsx`** - Corrigir navegação
5. **`src/pages/aluno/ValidacaoAula.tsx`** - Remover RENACH
6. **`src/components/aula/AulaTimer.tsx`** - Verificar sincronização

### Edge Function Já Correta

O `lesson-workflow` já implementa toda a lógica correta:
- Validação de status sequencial
- Geração de QR Code com SHA-256
- Captura de pagamento após QR validado
- Audit trail com GPS

O problema é apenas que a **página antiga** (`ValidarAulaInstrutor.tsx`) não usa a edge function - ela simula tudo localmente.

