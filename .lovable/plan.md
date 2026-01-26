
# Plano: Fluxo de Aula Anti-Fraude CNH360 (Notificações In-App)

## Visão Geral

Implementar um fluxo de aula completo com múltiplas camadas de validação anti-fraude, onde todas as notificações ocorrem **dentro do aplicativo** através de:
1. **Mensagens automáticas no chat** da aula (aparecem para ambos)
2. **Notificações no sino** (NotificationBell)
3. **Push notifications** do navegador

O WhatsApp (Z-API) será usado **apenas para pagamentos**.

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                      FLUXO ANTI-FRAUDE CNH360 (In-App)                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  INSTRUTOR                              ALUNO                               │
│  ─────────                              ─────                               │
│                                                                             │
│  [1] Clica "Em Rota" ───────────────→  Notificação no sino +                │
│      status: 'em_rota'                  Msg automática no chat:             │
│                                         "🚗 Instrutor a caminho!"           │
│                                                                             │
│  [2] Clica "Cheguei" ───────────────→  Notificação no sino +                │
│      status: 'aguardando_confirmacao'   Msg automática no chat:             │
│                                         "📍 Instrutor chegou! Confirme."    │
│                                                                             │
│                            ←────────── [3] Clica "Confirmar Chegada"        │
│  Notificação no sino +                  aluno_confirmou_chegada: true       │
│  Msg automática no chat:                                                    │
│  "✅ Aluno confirmou presença!"                                             │
│                                                                             │
│  [4] Clica "Iniciar Aula" ──────────→  Cronômetro sincronizado inicia       │
│      status: 'em_andamento'             Msg automática no chat:             │
│      aula_inicio: timestamp             "🎓 Aula iniciada!"                 │
│                                                                             │
│  [5] (Cronômetro >= duração_minutos)                                        │
│      Botão "Finalizar" liberado                                             │
│                                                                             │
│  [6] Clica "Finalizar Aula" ────────→  QR Code dinâmico gerado             │
│      status: 'aguardando_qr'            Msg automática no chat:             │
│                                         "📱 Mostre o QR Code!"              │
│                                                                             │
│  [7] Escaneia QR do aluno                                                   │
│      Valida no backend                                                      │
│      status: 'concluida'                                                    │
│      ↓                                                                      │
│  PAGAMENTO LIBERADO + Notificação                                           │
│                                                                             │
│  [8] Msg no chat + WhatsApp ────────→  Msg no chat + WhatsApp              │
│      (pagamento apenas)                 (pagamento apenas)                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Etapa 1: Alterações no Banco de Dados

### Novos campos na tabela `aulas`:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `aluno_confirmou_chegada` | boolean | Aluno confirmou chegada do instrutor |
| `aula_inicio` | timestamptz | Momento exato que o cronômetro iniciou |
| `aula_fim` | timestamptz | Momento que o instrutor finalizou |
| `qr_code_data` | text | Hash único para validação do QR Code |
| `qr_code_expires_at` | timestamptz | Expiração do QR Code (5 minutos) |
| `qr_validado` | boolean | QR Code foi escaneado e validado |

### Novo campo na tabela `mensagens_aula`:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `is_system` | boolean | Indica se é mensagem automática do sistema |

### Novos valores no enum `status_aula`:

Adicionar:
- `em_rota` - Instrutor saiu e está a caminho
- `aguardando_confirmacao` - Instrutor chegou, aguardando aluno confirmar
- `aguardando_qr` - Aula finalizada, aguardando scan do QR

### RLS para mensagens do sistema:

Nova política que permite inserção de mensagens com `is_system = true` via service role (Edge Function).

---

## Etapa 2: Nova Edge Function - `lesson-workflow`

Edge Function centralizada para gerenciar todas as transições de status da aula com validações de segurança e envio de notificações in-app.

**Arquivo:** `supabase/functions/lesson-workflow/index.ts`

**Ações suportadas:**

| Ação | Quem chama | Validação | Resultado |
|------|------------|-----------|-----------|
| `em_rota` | Instrutor | status = 'confirmada' | status → 'em_rota', notificação + msg chat para aluno |
| `cheguei` | Instrutor | status = 'em_rota' | status → 'aguardando_confirmacao', notificação + msg chat para aluno |
| `confirmar_chegada` | Aluno | status = 'aguardando_confirmacao' | aluno_confirmou_chegada = true, notificação + msg chat para instrutor |
| `iniciar_aula` | Instrutor | aluno_confirmou_chegada = true | status → 'em_andamento', aula_inicio = now(), msg chat |
| `finalizar_aula` | Instrutor | tempo >= duração | status → 'aguardando_qr', gera qr_code_data, msg chat para aluno |
| `validar_qr` | Instrutor | QR válido e não expirado | status → 'concluida', libera pagamento, msg chat + WhatsApp |

**Cada ação:**
1. Valida autenticação JWT
2. Verifica se usuário é participante da aula
3. Valida status correto para transição
4. Atualiza banco de dados
5. Insere mensagem automática no chat (usando service role)
6. Insere notificação no sino para o outro participante
7. Envia push notification

---

## Etapa 3: Mensagens Automáticas no Chat

### Solução técnica para mensagens do sistema:

1. Adicionar campo `is_system` boolean na tabela `mensagens_aula`
2. Criar política RLS que permite service role inserir mensagens com `is_system = true`
3. Para `sender_id`, usar o ID do participante que disparou a ação (ex: instrutor clica "Em Rota" → sender_id = instrutor, mas is_system = true)
4. Frontend exibe mensagens com `is_system = true` com estilo diferenciado (fundo colorido, ícone do sistema)

### Mensagens automáticas:

| Momento | Mensagem no Chat |
|---------|------------------|
| Em rota | "🚗 **CNH360:** Instrutor está a caminho! ETA: X minutos" |
| Chegou | "📍 **CNH360:** Instrutor chegou no local. Confirme sua presença no app." |
| Aluno confirmou | "✅ **CNH360:** Aluno confirmou presença. Instrutor pode iniciar a aula." |
| Aula iniciada | "🎓 **CNH360:** Aula iniciada! Cronômetro ativado." |
| Aula finalizada | "📱 **CNH360:** Aula finalizada! Aluno, mostre o QR Code para o instrutor." |
| QR validado | "🎉 **CNH360:** Aula concluída com sucesso! Pagamento liberado." |

---

## Etapa 4: Instalar Bibliotecas QR Code

Adicionar ao `package.json`:
- `qrcode.react` - Gerar QR Codes no app do aluno
- `html5-qrcode` - Scanner de câmera no app do instrutor

---

## Etapa 5: Componentes Novos

### `src/components/qr/QRCodeDisplay.tsx`
Exibe QR Code dinâmico com dados criptografados da aula.

### `src/components/qr/QRCodeScanner.tsx`
Modal com câmera para escanear QR Code usando html5-qrcode.

### `src/components/chat/SystemMessage.tsx`
Componente para exibir mensagens automáticas do sistema com estilo diferenciado.

### `src/components/aula/AulaTimer.tsx`
Cronômetro visual grande que mostra tempo decorrido da aula.

---

## Etapa 6: Refatorar Página do Instrutor

### Atualizar: `src/pages/instrutor/InstrutorACaminho.tsx`

Transformar em página completa de gerenciamento da aula com:

1. **Barra de progresso de etapas** (Em rota → Chegou → Aguardando → Em aula → Finalizado)

2. **Botões sequenciais condicionais:**
   - "Em Rota" (status = 'confirmada')
   - "Cheguei!" (status = 'em_rota')
   - "Iniciar Aula" (aluno_confirmou_chegada = true)
   - Cronômetro visual (status = 'em_andamento')
   - "Finalizar Aula" (tempo >= duração)
   - Scanner QR (status = 'aguardando_qr')

3. **Card do aluno** com foto, nome, local

4. **Chat integrado** (TripChat)

5. **Mapa** quando em rota

### Nova rota: `/instrutor/aula/:aulaId`

Redirecionar de `InstrutorACaminho` para esta nova página unificada.

---

## Etapa 7: Refatorar Página do Aluno

### Atualizar: `src/pages/aluno/AulaConfirmadaById.tsx`

Adicionar estados visuais e interações:

1. **Status "Em Rota"**
   - Mostrar mapa com localização do instrutor (já existe)
   - Badge "Instrutor a caminho"
   - Botão "Rastrear instrutor"

2. **Status "Aguardando Confirmação"**
   - Card destacado: "Instrutor chegou!"
   - Botão grande: "Confirmar Chegada" ← **NOVO**

3. **Status "Em Andamento"**
   - Cronômetro sincronizado em tempo real
   - Exibir tempo decorrido
   - Chat disponível

4. **Status "Aguardando QR"**
   - Gerar QR Code dinâmico com qrcode.react ← **NOVO**
   - Dados: { aulaId, timestamp, hash }
   - Instruções: "Mostre este QR para o instrutor"
   - Timer de expiração (5 min)

5. **Status "Concluída"**
   - Celebração visual
   - Resumo da aula
   - Botão para avaliar

---

## Etapa 8: Hook do Cronômetro

### Novo: `src/hooks/useAulaTimer.ts`

```text
Funcionalidade:
- Calcula tempo decorrido: now() - aula_inicio
- Atualiza a cada segundo no frontend
- Sincroniza via Supabase Realtime (observa updates na aula)
- Backend valida tempo real ao finalizar
```

---

## Etapa 9: Fluxo de Liberação de Pagamento

### No `lesson-workflow` ação `validar_qr`:

1. Verificar QR válido e não expirado
2. Atualizar status para 'concluida'
3. Chamar `capture-payment-pagarme` (já existe)
4. Registrar em tabela `pagamentos`
5. Inserir mensagem final no chat
6. Inserir notificação no sino para ambos
7. Enviar WhatsApp via Z-API **apenas para o pagamento**

---

## Etapa 10: Atualizar ChatView

### Modificar: `src/components/chat/ChatView.tsx`

Adicionar suporte para mensagens do sistema:
- Detectar `is_system = true`
- Renderizar com estilo diferenciado (fundo colorido, centralizado, sem foto de remetente)
- Exibir ícone do CNH360

---

## Arquivos a Criar

| Arquivo | Descrição |
|---------|-----------|
| `supabase/functions/lesson-workflow/index.ts` | Edge Function central |
| `src/components/qr/QRCodeDisplay.tsx` | Exibir QR no app do aluno |
| `src/components/qr/QRCodeScanner.tsx` | Scanner no app do instrutor |
| `src/components/chat/SystemMessage.tsx` | Mensagem automática estilizada |
| `src/components/aula/AulaTimer.tsx` | Cronômetro visual |
| `src/hooks/useAulaTimer.ts` | Hook para cronômetro |
| `src/pages/instrutor/AulaEmAndamento.tsx` | Página unificada de aula (instrutor) |

---

## Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `src/pages/aluno/AulaConfirmadaById.tsx` | Adicionar confirmação, cronômetro, QR |
| `src/components/chat/ChatView.tsx` | Suporte a mensagens do sistema |
| `src/hooks/useTripChat.ts` | Suporte a campo is_system |
| `src/App.tsx` | Adicionar nova rota |
| `supabase/config.toml` | Registrar lesson-workflow |
| `package.json` | Adicionar qrcode.react e html5-qrcode |

---

## Resumo das Proteções Anti-Fraude

| Proteção | Implementação |
|----------|---------------|
| Instrutor não pode iniciar sem aluno confirmar | `aluno_confirmou_chegada` obrigatório |
| Não pode finalizar antes do tempo | Backend valida `aula_fim - aula_inicio >= duracao` |
| QR Code expira em 5 minutos | Campo `qr_code_expires_at` |
| QR Code único por aula | Hash criptografado com `aulaId + timestamp + secret` |
| Pagamento só libera após QR validado | Captura chamada dentro de `validar_qr` |
| Todas transições notificadas | Mensagens no chat + sino + push |

---

## Seção Técnica

### Estrutura do QR Code Data:

```text
{
  "aulaId": "uuid",
  "timestamp": "2026-01-26T14:30:00Z",
  "hash": "sha256(aulaId + timestamp + SECRET_KEY)",
  "version": 1
}
```

### Validação do QR no Backend:

```text
1. Parse JSON do QR escaneado
2. Verificar se aulaId corresponde
3. Verificar se não expirou (now < qr_code_expires_at)
4. Recalcular hash e comparar
5. Se válido: atualizar status, liberar pagamento
```

### Inserção de mensagens do sistema:

A Edge Function usa `SUPABASE_SERVICE_ROLE_KEY` para inserir mensagens com `is_system = true`, bypassing RLS que requer `sender_id = auth.uid()`.

### Config da Edge Function:

```text
[functions.lesson-workflow]
verify_jwt = true
```

---

## Ordem de Implementação

1. **Migration do banco** - Adicionar campos e enum
2. **Atualizar RLS mensagens** - Permitir inserção de system messages
3. **Edge Function lesson-workflow** - Lógica central
4. **Instalar libs QR** - qrcode.react + html5-qrcode
5. **Componente SystemMessage** - Estilo de mensagem automática
6. **Atualizar ChatView** - Suporte a is_system
7. **Componentes QR** - Display + Scanner
8. **Hook useAulaTimer** - Cronômetro
9. **Página instrutor AulaEmAndamento** - Interface completa
10. **Atualizar página aluno** - Confirmação + QR
11. **Atualizar rotas** - App.tsx
12. **Testar fluxo completo** - E2E
