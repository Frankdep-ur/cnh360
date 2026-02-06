
# Correcao: Banner de Aula Ativa Global + Botao "Finalizar" Quebrado

## Problemas Encontrados

### Problema 1: Botao "Finalizar" vai para pagina errada
Na pagina "Minhas Aulas" (`InstrutorAulas.tsx`), quando uma aula esta `em_andamento`, o botao "Finalizar" leva para `/instrutor/validar-aula` -- uma pagina **deprecada** que tenta redirecionar, mas como nao recebe o ID da aula como parametro, simplesmente volta para o dashboard. Resultado: o instrutor nunca consegue acessar a tela de aula ao vivo por ali.

O botao "Chat" da mesma aula tambem esta errado -- leva para `/instrutor/a-caminho/${aula.id}` (pagina de rota), quando deveria ir para `/instrutor/aula/${aula.id}` (pagina de gerenciamento da aula em andamento).

### Problema 2: Banner so aparece no Dashboard
O banner de aula ativa foi colocado **apenas** no `InstrutorDashboard`. Se o instrutor estiver em qualquer outra pagina (Aulas, Agenda, Chat, Perfil), ele nao ve o banner. Quando ele fecha o app e reabre, pode cair em qualquer dessas paginas e nao saber que tem uma aula rolando.

## Solucao

### 1. Corrigir links na pagina de Aulas

No `InstrutorAulas.tsx`, para aulas com status `em_andamento`:
- Botao "Finalizar" muda de `/instrutor/validar-aula` para `/instrutor/aula/${aula.id}`
- Botao "Chat" muda de `/instrutor/a-caminho/${aula.id}` para `/instrutor/aula/${aula.id}` (a pagina de aula ja tem chat integrado)

Tambem adicionar botoes de acao para status `aguardando_confirmacao`, `em_rota` e `aguardando_qr` que estao faltando -- todos direcionando para `/instrutor/aula/${aula.id}`.

### 2. Adicionar banner em TODAS as paginas do instrutor

Adicionar o `ActiveLessonBanner` nas seguintes paginas:
- `InstrutorAulas.tsx` (Minhas Aulas)
- `InstrutorAgenda.tsx` (Agenda)
- `InstrutorChat.tsx` (Chat)
- `InstrutorPerfil.tsx` (Perfil)
- `InstrutorGanhos.tsx` (Ganhos)

Assim, nao importa onde o instrutor esteja, o banner verde pulsante com "AULA AO VIVO" estara visivel e clicavel.

---

## Secao Tecnica

### InstrutorAulas.tsx - Correcoes

Mudanca nos botoes de acao (linhas 328-343):

Antes:
```text
{aula.status === "em_andamento" && (
  <Link to={`/instrutor/a-caminho/${aula.id}`}>  // ERRADO
    Chat
  </Link>
  <Link to="/instrutor/validar-aula">  // ERRADO - sem aulaId
    Finalizar
  </Link>
)}
```

Depois:
```text
{aula.status === "em_andamento" && (
  <Link to={`/instrutor/aula/${aula.id}`}>
    Retomar Aula
  </Link>
)}
```

Adicionar tratamento para outros status ativos:
```text
{["aguardando_confirmacao", "em_rota", "aguardando_qr"].includes(aula.status) && (
  <Link to={`/instrutor/aula/${aula.id}`}>
    Gerenciar
  </Link>
)}
```

Tambem importar e adicionar o `ActiveLessonBanner` no topo da pagina.

### Paginas do instrutor que receberao o banner

Cada pagina recebera:
```text
import { ActiveLessonBanner } from "@/components/instrutor/ActiveLessonBanner";
import { useActiveLessonBanner } from "@/hooks/useActiveLessonBanner";

// Dentro do componente:
const { activeLesson } = useActiveLessonBanner();

// No JSX, logo apos o header:
{activeLesson && <ActiveLessonBanner lesson={activeLesson} />}
```

Arquivos modificados:
- `src/pages/instrutor/InstrutorAulas.tsx` (banner + links corrigidos)
- `src/pages/instrutor/InstrutorAgenda.tsx` (banner)
- `src/pages/instrutor/InstrutorChat.tsx` (banner)
- `src/pages/instrutor/InstrutorPerfil.tsx` (banner)
- `src/pages/instrutor/InstrutorGanhos.tsx` (banner)
