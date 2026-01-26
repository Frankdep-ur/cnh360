# Plano: Modificar Tela "Proxima aula" no AlunoDashboard

## Status: ✅ CONCLUÍDO

## Resumo
Simplificar a seção "Próxima aula" no dashboard do aluno após o pagamento ser confirmado:
- **Removido**: botões "Ver Rota", "Iniciar Aula" e "Compartilhar Localização"
- **Adicionado**: botão único e destacado "Enviar Mensagem ao Instrutor" que abre o chat

---

## Alterações Realizadas

### 1. Imports Atualizados
- ✅ Adicionado `MessageCircle` ao import do Lucide
- ✅ Removido `Navigation` (não mais utilizado)
- ✅ Removidas importações de `LocationShareButton` e `RouteMapCard`

### 2. Estados Removidos
- ✅ `locationShared` - não mais necessário
- ✅ `sharedLocation` - não mais necessário

### 3. Componentes Removidos da UI
- ✅ `LocationShareButton` - compartilhamento de localização
- ✅ `RouteMapCard` - mapa de rota
- ✅ Botão "Ver Rota"
- ✅ Botão "Iniciar Aula"

### 4. Novo Botão Implementado
```typescript
<Button 
  className="w-full bg-[#4CAF50] hover:bg-[#45a049] text-white"
  onClick={() => navigate('/aluno/chat', { 
    state: { openAulaId: proximaAula.id } 
  })}
>
  <MessageCircle className="w-4 h-4 mr-2" />
  Enviar Mensagem ao Instrutor
</Button>
```

---

## Resultado Visual

### ANTES (após pagamento confirmado):
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

### DEPOIS (após pagamento confirmado):
```
┌─ Proxima aula ────────────────────────────────────────┐
│  [Foto] Nome Instrutor ★4.9         Hoje 12:00        │
│  📍 Local: Casa da tia              🕐 60 min         │
│                                                        │
│  [💬 Enviar Mensagem ao Instrutor]  ← VERDE           │
└───────────────────────────────────────────────────────┘
```

---

## Checklist de Implementação

- [x] Adicionar `MessageCircle` ao import do Lucide
- [x] Remover `Navigation` do import (não utilizado)
- [x] Remover imports de `LocationShareButton` e `RouteMapCard`
- [x] Remover estados `locationShared` e `sharedLocation`
- [x] Remover seção `LocationShareButton` / `RouteMapCard`
- [x] Substituir botões "Ver Rota" e "Iniciar Aula" por botão único "Enviar Mensagem ao Instrutor"
- [x] Implementar navegação para `/aluno/chat` com `openAulaId` no state
