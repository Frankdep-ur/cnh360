
# Plano: Histórico Detalhado de Aulas com Auditoria GPS

## 1. Relatório Completo das Mudanças Implementadas

### Resumo Executivo

Foi implementado um **sistema completo de fluxo de aula anti-fraude** na CNH360, onde todas as etapas são controladas, validadas e registradas para garantir segurança e integridade das aulas práticas.

---

### Alterações no Banco de Dados

**Novos campos na tabela `aulas`:**

| Campo | Tipo | Propósito |
|-------|------|-----------|
| `aluno_confirmou_chegada` | boolean | Registro de confirmação física do aluno |
| `aula_inicio` | timestamptz | Timestamp exato do início do cronômetro |
| `aula_fim` | timestamptz | Timestamp exato do fim da aula |
| `qr_code_data` | text | Hash criptografado para validação QR |
| `qr_code_expires_at` | timestamptz | Expiração do QR Code (5 min) |
| `qr_validado` | boolean | Confirmação de validação por QR |

**Novo campo na tabela `mensagens_aula`:**

| Campo | Tipo | Propósito |
|-------|------|-----------|
| `is_system` | boolean | Identifica mensagens automáticas do sistema |

**Novos valores no enum `status_aula`:**

- `em_rota` - Instrutor a caminho
- `aguardando_confirmacao` - Instrutor chegou, aguardando aluno
- `aguardando_qr` - Aula finalizada, aguardando scan QR

**Índices criados:**

- `idx_aulas_status` - Performance em queries por status
- `idx_aulas_instrutor_status` - Performance em queries do instrutor

---

### Nova Edge Function: `lesson-workflow`

Uma função centralizada que controla todas as transições de status com validações de segurança:

| Ação | Quem executa | Validação | Resultado |
|------|--------------|-----------|-----------|
| `em_rota` | Instrutor | status = 'confirmada' | Inicia rastreamento GPS, notifica aluno |
| `cheguei` | Instrutor | status = 'em_rota' | Registra chegada, solicita confirmação |
| `confirmar_chegada` | Aluno | status = 'aguardando_confirmacao' | Libera início da aula |
| `iniciar_aula` | Instrutor | aluno_confirmou = true | Inicia cronômetro sincronizado |
| `finalizar_aula` | Instrutor | tempo >= duração | Gera QR Code criptografado |
| `validar_qr` | Instrutor | QR válido e não expirado | Conclui aula, libera pagamento |

**Validações de segurança implementadas:**

1. Verificação JWT em todas as chamadas
2. Verificação se usuário é participante da aula
3. Validação de status correto para cada transição
4. Verificação de tempo mínimo antes de finalizar (90% da duração)
5. QR Code expira em 5 minutos
6. Hash SHA-256 para validação de QR

---

### Novos Componentes Frontend

**Componentes criados:**

| Componente | Função |
|------------|--------|
| `src/components/qr/QRCodeDisplay.tsx` | Exibe QR Code dinâmico com timer de expiração |
| `src/components/qr/QRCodeScanner.tsx` | Scanner de câmera usando html5-qrcode |
| `src/components/chat/SystemMessage.tsx` | Mensagens automáticas estilizadas |
| `src/components/aula/AulaTimer.tsx` | Cronômetro visual sincronizado |

**Hooks criados:**

| Hook | Função |
|------|--------|
| `src/hooks/useAulaTimer.ts` | Gerencia cronômetro com sync Realtime |
| `src/hooks/useLessonWorkflow.ts` | Interface para Edge Function |

---

### Páginas Refatoradas

**Instrutor - `AulaEmAndamento.tsx`:**
- Barra de progresso visual (5 etapas)
- Botões condicionais por status
- Mapa com rastreamento GPS
- Cronômetro sincronizado
- Scanner QR integrado
- Chat com mensagens do sistema

**Aluno - `AulaConfirmadaById.tsx`:**
- Status visual dinâmico
- Botão "Confirmar Chegada"
- Cronômetro sincronizado
- Exibição do QR Code
- Integração com chat

---

### Fluxo de Notificações

Todas as notificações são **in-app** através de:

1. **Mensagens automáticas no chat** - Ambos veem
2. **Notificações no sino** - Via tabela `notifications`
3. **Push notifications** - Via `send-push-notification`

**WhatsApp usado apenas para pagamentos** - Enviado via Z-API quando aula é concluída.

---

### Proteções Anti-Fraude Implementadas

| Proteção | Implementação |
|----------|---------------|
| Início sem confirmação | `aluno_confirmou_chegada` obrigatório |
| Finalização precoce | Backend valida `tempo >= 90% duração` |
| QR Code expirado | Campo `qr_code_expires_at` (5 min) |
| QR Code falsificado | Hash SHA-256 validado no backend |
| Pagamento indevido | Só libera após `validar_qr` |
| Rastreamento GPS | Localização salva em `localizacao_tempo_real` |

---

## 2. Plano: Histórico de Auditoria Detalhado

### Objetivo

Criar uma tabela e interface para armazenar e visualizar o histórico completo de cada aula com:
- Timestamps de cada etapa
- Localização GPS de validações
- Dados do cronômetro real
- Informações de pagamento
- Trilha de auditoria completa

---

### Etapa 1: Nova Tabela de Auditoria

**Criar tabela `aulas_auditoria`:**

```text
id                  UUID PRIMARY KEY
aula_id             UUID REFERENCES aulas(id)
evento              TEXT (em_rota, cheguei, confirmacao_aluno, inicio, fim, qr_validado)
timestamp           TIMESTAMPTZ
latitude            NUMERIC
longitude           NUMERIC
precisao_metros     NUMERIC
device_info         JSONB
user_id             UUID (quem disparou o evento)
dados_adicionais    JSONB (tempo decorrido, hash QR, etc.)
created_at          TIMESTAMPTZ
```

**Índices:**
- `idx_auditoria_aula_id` - Busca por aula
- `idx_auditoria_timestamp` - Ordenação cronológica

**RLS:**
- Participantes podem visualizar auditoria da própria aula
- Inserção apenas via service role (Edge Function)

---

### Etapa 2: Atualizar Edge Function

Modificar `lesson-workflow` para registrar cada transição na tabela de auditoria com:
- Captura de GPS no momento da ação
- Device info (user agent, plataforma)
- Timestamp preciso
- Dados contextuais (tempo no cronômetro, etc.)

---

### Etapa 3: Nova Página de Histórico do Instrutor

**Arquivo:** `src/pages/instrutor/HistoricoAulas.tsx`

**Funcionalidades:**
- Lista de aulas concluídas com filtros (data, aluno)
- Card expandível para cada aula com:
  - Timeline visual de eventos
  - Mapa com pontos GPS
  - Duração real vs agendada
  - Status de pagamento
  - Botão para exportar PDF

---

### Etapa 4: Nova Página de Histórico do Aluno

**Arquivo:** `src/pages/aluno/MeuHistorico.tsx`

**Funcionalidades:**
- Lista de aulas realizadas
- Detalhes de cada aula:
  - Instrutor
  - Data/hora real
  - Duração registrada
  - Horas acumuladas para CNH
- Certificado de horas práticas (PDF)

---

### Etapa 5: Componente de Timeline de Auditoria

**Arquivo:** `src/components/aula/AuditTrail.tsx`

Exibe visualmente cada etapa:

```text
┌────────────────────────────────────────────────────┐
│  🚗 Em Rota                         14:00:32      │
│     GPS: -23.5505, -46.6333 (±15m)                │
├────────────────────────────────────────────────────┤
│  📍 Chegou no local                 14:22:15      │
│     GPS: -23.5510, -46.6340 (±8m)                 │
├────────────────────────────────────────────────────┤
│  ✅ Aluno confirmou                 14:23:01      │
│     Tempo de espera: 46 segundos                  │
├────────────────────────────────────────────────────┤
│  🎓 Aula iniciada                   14:23:45      │
│     Cronômetro ativado                            │
├────────────────────────────────────────────────────┤
│  ⏱️ Aula finalizada                 15:24:02      │
│     Duração: 60min 17seg                          │
├────────────────────────────────────────────────────┤
│  📱 QR validado                     15:25:10      │
│     Hash: 7a3f...b2c1                             │
├────────────────────────────────────────────────────┤
│  💰 Pagamento liberado              15:25:12      │
│     Valor: R$ 80,00                               │
└────────────────────────────────────────────────────┘
```

---

### Etapa 6: Componente de Mapa com Validações GPS

**Arquivo:** `src/components/aula/GPSValidationMap.tsx`

Exibe mapa estático com marcadores:
- Ponto de encontro agendado
- Local real de chegada
- Variação de posição durante aula (se houver)

---

### Etapa 7: Exportação de Relatório PDF

**Arquivo:** `src/lib/aulaReportPDF.ts`

Gera PDF com:
- Dados completos da aula
- Timeline de eventos
- Mapa com validações GPS
- Assinatura digital (hash da auditoria)
- QR Code de verificação

---

### Etapa 8: Dashboard de Estatísticas

Adicionar cards no `InstrutorDashboard` e `AlunoDashboard`:

**Para instrutor:**
- Total de horas ministradas
- Média de duração vs agendado
- Taxa de conclusão

**Para aluno:**
- Horas práticas acumuladas
- Progresso para CNH
- Próximas etapas

---

### Arquivos a Criar

| Arquivo | Descrição |
|---------|-----------|
| Migration SQL | Tabela `aulas_auditoria` + índices + RLS |
| `src/pages/instrutor/HistoricoAulas.tsx` | Histórico completo do instrutor |
| `src/pages/aluno/MeuHistorico.tsx` | Histórico completo do aluno |
| `src/components/aula/AuditTrail.tsx` | Timeline visual de eventos |
| `src/components/aula/GPSValidationMap.tsx` | Mapa com pontos GPS |
| `src/lib/aulaReportPDF.ts` | Geração de PDF |
| `src/hooks/useAulaAuditoria.ts` | Hook para buscar auditoria |

---

### Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `supabase/functions/lesson-workflow/index.ts` | Inserir registros de auditoria |
| `src/pages/instrutor/InstrutorAulas.tsx` | Link para detalhes de auditoria |
| `src/pages/instrutor/InstrutorDashboard.tsx` | Cards de estatísticas |
| `src/pages/aluno/AlunoDashboard.tsx` | Horas acumuladas e histórico |
| `src/App.tsx` | Novas rotas |

---

### Ordem de Implementação

1. **Migration** - Criar tabela `aulas_auditoria`
2. **Atualizar lesson-workflow** - Registrar eventos de auditoria
3. **Hook useAulaAuditoria** - Buscar dados de auditoria
4. **Componente AuditTrail** - Timeline visual
5. **Componente GPSValidationMap** - Mapa com pontos
6. **Página HistoricoAulas (Instrutor)** - Interface completa
7. **Página MeuHistorico (Aluno)** - Interface completa
8. **Geração de PDF** - Relatório exportável
9. **Atualizar dashboards** - Estatísticas
10. **Testes E2E** - Validar fluxo completo
