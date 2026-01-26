
# Plano: Modificar Tela "Proxima aula" no AlunoDashboard

## Resumo
Simplificar a seção "Próxima aula" no dashboard do aluno após o pagamento ser confirmado:
- **Remover**: botões "Ver Rota", "Iniciar Aula" e "Compartilhar Localização"
- **Adicionar**: botão único e destacado "Enviar Mensagem ao Instrutor" que abre o chat

---

## Arquivo a Modificar

| Arquivo | Modificacao |
|---------|-------------|
| `src/pages/aluno/AlunoDashboard.tsx` | Linhas 519-576 (seção de botões após pagamento) |

---

## Mudancas Detalhadas

### 1. Remover Componentes

Remover da seção "Próxima aula" (após `isPaid` ser true):

- **LocationShareButton** (linhas 520-528) - compartilhamento de localização
- **RouteMapCard** (linhas 530-538) - mapa de rota
- **Botão "Ver Rota"** (linhas 565-568)
- **Botão "Iniciar Aula"** (linhas 569-573)

### 2. Adicionar Novo Botao

Substituir os botões removidos por um único botão verde:

```
┌─────────────────────────────────────────────────────────┐
│  [💬]  Enviar Mensagem ao Instrutor                    │
└─────────────────────────────────────────────────────────┘
```

**Especificacoes:**
- **Cor**: Verde `#4CAF50` (mesmo tom do botão Pagar)
- **Icone**: `MessageCircle` do Lucide
- **Largura**: Full width (`w-full`)
- **Acao**: Navegar para `/aluno/chat` com `state: { openAulaId: proximaAula.id }`

### 3. Fluxo de Navegacao

Ao clicar no botão:
```typescript
navigate('/aluno/chat', { state: { openAulaId: proximaAula.id } });
```

O componente `AlunoChat.tsx` já está preparado para receber `openAulaId` via `location.state` e abrir automaticamente a conversa correta (linhas 41-51).

---

## Resultado Visual

### ANTES (apos pagamento confirmado):
```
┌─ Proxima aula ────────────────────────────────────────┐
│  [Foto] Nome Instrutor ★4.9         Hoje 12:00        │
│  📍 Local: Casa da tia              🕐 60 min         │
│                                                        │
│  [📍 Compartilhar Localização]                        │
│                                                        │
│  [ Ver Rota ]    [ Iniciar Aula ]                     │
└───────────────────────────────────────────────────────┘
```

### DEPOIS (apos pagamento confirmado):
```
┌─ Proxima aula ────────────────────────────────────────┐
│  [Foto] Nome Instrutor ★4.9         Hoje 12:00        │
│  📍 Local: Casa da tia              🕐 60 min         │
│                                                        │
│  [💬 Enviar Mensagem ao Instrutor]  ← VERDE           │
└───────────────────────────────────────────────────────┘
```

---

## Detalhes Tecnicos

### Import Necessario
Adicionar `MessageCircle` ao import do Lucide (linha 3):
```typescript
import { 
  // ...existing imports...
  MessageCircle  // adicionar
} from "lucide-react";
```

### Codigo do Novo Botao
```typescript
{isPaid ? (
  <Button 
    className="w-full bg-[#4CAF50] hover:bg-[#45a049] text-white"
    onClick={() => navigate('/aluno/chat', { 
      state: { openAulaId: proximaAula.id } 
    })}
  >
    <MessageCircle className="w-4 h-4 mr-2" />
    Enviar Mensagem ao Instrutor
  </Button>
) : (
  // ...botões de pagamento mantidos...
)}
```

---

## Secoes Removidas

Toda a seção de compartilhamento de localização (linhas 519-538) sera removida:
- Condicional `!locationShared` com `LocationShareButton`
- Componente `RouteMapCard`

Isso simplifica a tela para focar apenas na comunicação com o instrutor nesta fase inicial.

---

## Checklist de Implementacao

- [ ] Adicionar `MessageCircle` ao import do Lucide
- [ ] Remover seção `LocationShareButton` / `RouteMapCard` (linhas 519-538)
- [ ] Substituir botões "Ver Rota" e "Iniciar Aula" por botão único "Enviar Mensagem ao Instrutor"
- [ ] Implementar navegação para `/aluno/chat` com `openAulaId` no state
- [ ] Testar abertura automática do chat correto
- [ ] Verificar responsividade em mobile
