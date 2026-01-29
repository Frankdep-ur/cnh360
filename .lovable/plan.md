# Plano: Correção do Fluxo Real de Aula Aluno-Instrutor

## ✅ STATUS: IMPLEMENTADO

Data: 2026-01-29

---

## Mudanças Realizadas

### 1. ValidarAulaInstrutor.tsx - DEPRECADO ✅
- Convertido para componente de redirecionamento
- Redireciona automaticamente para `/instrutor/aula/:aulaId`
- Dados genéricos removidos

### 2. InstrutorACaminho.tsx - CORRIGIDO ✅
- Navegação corrigida de `/instrutor/validar-aula?aulaId=` para `/instrutor/aula/:aulaId`
- Fluxo agora usa a página funcional AulaEmAndamento

### 3. ValidacaoAula.tsx - CORRIGIDO ✅
- Textos "RENACH" removidos:
  - "Registro Automático RENACH" → "Registro Automático"
  - "registrada automaticamente no sistema do DETRAN" → "registrada automaticamente no sistema"
  - "GPS ativo • Registrando no RENACH" → "GPS ativo • Registrando aula"
  - "Log RENACH" → "Registro da aula"

### 4. AulaEmAndamento.tsx - JÁ FUNCIONAL ✅
- Já implementa corretamente:
  - Busca dados reais do banco (aluno, valor, foto)
  - Fluxo de QR Code via lesson-workflow
  - Check-in real do aluno (aluno_confirmou_chegada)
  - Cronômetro sincronizado via Realtime
  - Taxa de 50% implementada na edge function

### 5. AulaConfirmadaById.tsx - JÁ FUNCIONAL ✅
- QR Code aparece corretamente quando status = "aguardando_qr"
- Exibe dados reais do aluno e instrutor

---

## Fluxo Final Implementado

```
PAGAMENTO APROVADO
  ↓
INSTRUTOR "Estou a caminho" → status = "em_rota"
  ↓
INSTRUTOR "Cheguei no local" → status = "aguardando_confirmacao"
  ↓
ALUNO "Confirmar Chegada" → aluno_confirmou_chegada = true
  ↓
INSTRUTOR "Iniciar Aula" → status = "em_andamento" + cronômetro
  ↓
INSTRUTOR "Finalizar Aula" (após 90%) → status = "aguardando_qr" + QR gerado
  ↓
INSTRUTOR escaneia QR do ALUNO → validar_qr → status = "concluida"
  ↓
PAGAMENTO CAPTURADO (capture-payment-pagarme) → Split 50/50
```

---

## Arquivos Modificados

1. `src/pages/instrutor/ValidarAulaInstrutor.tsx` - Redirecionamento
2. `src/pages/instrutor/InstrutorACaminho.tsx` - Navegação corrigida
3. `src/pages/aluno/ValidacaoAula.tsx` - Textos RENACH removidos
