

# Eliminar fotos genericas em todo o app (aluno e instrutor)

## Resumo

O componente `ProfilePhotoUpload` ja esta correto com as 3 opcoes (adicionar, alterar, remover) tanto no perfil do aluno quanto do instrutor. O problema restante sao as diversas telas do app que exibem fotos de instrutores/alunos sem fallback adequado -- quando nao ha foto, a imagem pode aparecer quebrada ou vazia.

## O que ja esta funcionando

- `AlunoPerfil.tsx` -- ProfilePhotoUpload com 3 opcoes e userName
- `InstrutorPerfil.tsx` -- ProfilePhotoUpload com 3 opcoes e userName
- `AutoescolaPerfil.tsx` -- ProfilePhotoUpload com 3 opcoes e userName
- `AlunoDashboard.tsx` -- Fallback com iniciais no header
- `InstructorCard.tsx` -- Fallback com iniciais

## Telas que precisam de correcao (fallback com iniciais)

Todas as telas abaixo exibem fotos de instrutores ou alunos sem tratamento para quando `foto` for `null`. Vou adicionar fallback com iniciais (circulo colorido com letras) em cada uma:

| Arquivo | Linha | Contexto |
|---------|-------|----------|
| `AgendarAula.tsx` | ~526 | Foto do instrutor no resumo de agendamento -- sem fallback nenhum |
| `AlunoAgenda.tsx` | ~271 | Foto do instrutor na lista de aulas agendadas |
| `AlunoChat.tsx` | ~261 | Foto do instrutor na lista de conversas |
| `AulaConfirmada.tsx` | ~184 | Foto do instrutor na confirmacao de aula |
| `AulaConfirmadaById.tsx` | ~369 | Foto do instrutor no detalhe da aula |
| `AulaSolicitada.tsx` | ~260 | Foto do instrutor na aula solicitada |
| `InstrutorPerfil.tsx` (aluno) | ~137 | Foto do instrutor no perfil publico |
| `MeuHistorico.tsx` | ~232 | Foto do instrutor no historico |
| `RastrearInstrutor.tsx` | ~316 | Foto do instrutor no rastreamento (ja tem fallback com emoji, trocar por iniciais) |
| `ValidacaoAula.tsx` | ~145 | Foto do instrutor na validacao |

## Implementacao

### 1. Criar helper reutilizavel para iniciais

Criar um pequeno componente `InitialsAvatar` ou funcao utilitaria em `src/components/ui/InitialsAvatar.tsx` para evitar duplicacao de codigo:

```text
Props: name (string), size (string como "w-12 h-12"), className
Renderiza: circulo com cor baseada no nome + iniciais em branco
```

### 2. Atualizar cada tela

Em cada arquivo listado acima, substituir o padrao:

```text
ANTES:
<img src={foto} ... />

DEPOIS:
{foto ? (
  <img src={foto} ... />
) : (
  <InitialsAvatar name={nome} size="w-12 h-12" />
)}
```

### 3. AgendarAula.tsx (caso especial)

Neste arquivo, a foto e usada diretamente sem condicional. Adicionar verificacao para quando `instructor.photo` for null/vazio.

## Resultado esperado

- Nenhuma imagem quebrada em lugar nenhum do app
- Quando nao houver foto, aparece circulo colorido com iniciais do nome
- Consistencia visual em todas as telas
- Zero fotos genericas ou placeholders externos

