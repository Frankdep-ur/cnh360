
# Retorno do Instrutor a Aula Ativa - Banner Global de Aula em Andamento

## Problema Identificado

Quando o instrutor sai do app durante uma aula ativa (status `em_andamento`) e volta, nao existe nenhum mecanismo que o redirecione ou avise que ele tem uma aula acontecendo. O dashboard so mostra aulas `pendente`, e o monitor global so detecta `aguardando_confirmacao` e `aguardando_qr`.

**Confirmacao:** Existe uma aula `em_andamento` agora no banco de dados (ID: 60a1227c) com `aula_inicio` registrado mas sem forma do instrutor acessar pelo dashboard.

## Solucao

Criar um **banner flutuante global** que aparece em QUALQUER pagina do instrutor quando existe uma aula ativa. Este banner persiste ate a aula ser concluida e leva o instrutor diretamente para a pagina de gerenciamento da aula.

### O que sera feito

**1. Novo hook: `useActiveLessonBanner`**

Um hook leve que detecta aulas em qualquer status "ativo" do instrutor:
- `confirmada` (aceita, pronta para iniciar rota)
- `em_rota` (instrutor a caminho)
- `aguardando_confirmacao` (instrutor chegou)
- `em_andamento` (aula acontecendo - o caso principal)
- `aguardando_qr` (finalizando)

O hook retorna os dados da aula ativa (id, status, aluno_nome, aula_inicio) para exibicao no banner.

**2. Novo componente: `ActiveLessonBanner`**

Um banner fixo no topo da tela com:
- Indicador pulsante de aula ao vivo
- Nome do aluno
- Status atual (ex: "Em Andamento - 45min")
- Timer em tempo real mostrando quanto tempo decorreu
- Botao "Retomar" que navega para `/instrutor/aula/:aulaId`

O banner tera visual de urgencia (fundo gradiente com animacao pulsante) para ser impossivel de ignorar.

**3. Integracao no `InstrutorDashboard`**

O banner aparecera no topo do dashboard, acima de todos os outros cards, com z-index alto para garantir visibilidade.

**4. Integracao no `InstructorBottomNav`**

Adicionar um indicador visual (ponto pulsante vermelho) no icone "Aulas" da barra inferior quando houver uma aula ativa, sinalizando que o instrutor precisa retornar.

---

## Secao Tecnica

### Arquivos novos

| Arquivo | Descricao |
|---------|-----------|
| `src/hooks/useActiveLessonBanner.ts` | Hook que monitora aulas ativas do instrutor via query + realtime |
| `src/components/instrutor/ActiveLessonBanner.tsx` | Componente visual do banner flutuante |

### Arquivos modificados

| Arquivo | Mudanca |
|---------|---------|
| `src/pages/instrutor/InstrutorDashboard.tsx` | Adicionar o `ActiveLessonBanner` no topo |
| `src/components/layout/InstructorBottomNav.tsx` | Adicionar ponto pulsante no icone Aulas quando ha aula ativa |

### Hook: useActiveLessonBanner

```text
- Verifica se o usuario logado e instrutor (busca instrutores.id)
- Query na tabela aulas com status IN ('confirmada','em_rota','aguardando_confirmacao','em_andamento','aguardando_qr')
- Retorna a aula mais recente/prioritaria
- Subscription Realtime para atualizacao automatica
- Polling de 5s como fallback
- Retorna: { activeLesson, isLoading }
```

### Componente: ActiveLessonBanner

Visual por status:
- `confirmada`: fundo azul, "Aula confirmada - Iniciar rota"
- `em_rota`: fundo azul com animacao, "A caminho do aluno"
- `aguardando_confirmacao`: fundo amarelo, "Aguardando aluno confirmar"
- `em_andamento`: fundo verde pulsante, "AULA AO VIVO - XX:XX" (timer)
- `aguardando_qr`: fundo roxo, "Finalize - Escanear QR"

O banner navega para `/instrutor/aula/:aulaId` ao ser clicado.

### InstructorBottomNav

- Importar `useActiveLessonBanner`
- Quando `activeLesson` existe, mostrar um circulo vermelho pulsante sobre o icone "Aulas"
- Isso funciona como notificacao visual persistente

### Prioridade de status

Se houver multiplas aulas ativas (raro), a prioridade e:
1. `em_andamento` (mais urgente)
2. `aguardando_qr`
3. `aguardando_confirmacao`
4. `em_rota`
5. `confirmada`
