

# Adicionar opcao de remover foto de perfil

## Resumo

Modificar o componente `ProfilePhotoUpload` para permitir tres acoes: adicionar, alterar e remover foto. Ao clicar na foto existente, exibir um menu com opcoes. Ao remover, apagar do storage e limpar o campo no banco de dados, voltando ao avatar padrao com iniciais.

## Alteracoes

### 1. Atualizar a interface do componente (`ProfilePhotoUpload.tsx`)

- Alterar `onPhotoUploaded` para aceitar `string | null` (para suportar remocao)
- Adicionar estado `showMenu` para controlar exibicao do menu de opcoes
- Quando o usuario clicar na foto (e ja tiver foto), mostrar menu com:
  - "Alterar foto" (abre seletor de arquivo)
  - "Remover foto" (executa remocao)
  - "Cancelar" (fecha menu)
- Quando nao tiver foto, clicar abre direto o seletor de arquivo (comportamento atual)

### 2. Implementar funcao `handleRemovePhoto`

- Remover arquivos do bucket `avatars` (todos os formatos possiveis do usuario)
- Atualizar `profiles.avatar_url` para `null` no banco
- Atualizar estado local `previewUrl` para `null`
- Chamar `onPhotoUploaded(null)` para notificar o componente pai
- Exibir toast de confirmacao

### 3. Exibir avatar padrao com iniciais

- Adicionar prop opcional `userName` ao componente
- Quando nao houver foto, exibir circulo colorido com as iniciais do nome
- Gerar cor de fundo baseada no nome (para consistencia visual)

### 4. Atualizar componentes pais

Atualizar a assinatura de `handlePhotoUploaded` nos tres arquivos que usam o componente, para aceitar `string | null`:

| Arquivo | Mudanca |
|---------|---------|
| `src/pages/aluno/AlunoPerfil.tsx` | `handlePhotoUploaded(url: string \| null)` + passar `userName` |
| `src/pages/instrutor/InstrutorPerfil.tsx` | `handlePhotoUploaded(url: string \| null)` + passar `userName` |
| `src/pages/autoescola/AutoescolaPerfil.tsx` | `handlePhotoUploaded(url: string \| null)` + passar `userName` |

## Detalhes tecnicos

### Menu de opcoes

Usar um `DropdownMenu` (Radix) posicionado sobre a foto, ativado ao clicar na imagem quando ja existe foto. Contera tres itens: "Alterar foto", "Remover foto" (em vermelho) e "Cancelar".

### Funcao de remocao

```text
handleRemovePhoto:
  1. setUploading(true)
  2. supabase.storage.from("avatars").remove([userId/avatar.jpg, .png, .jpeg, .webp])
  3. supabase.from("profiles").update({ avatar_url: null }).eq("id", userId)
  4. setPreviewUrl(null)
  5. onPhotoUploaded(null)
  6. toast("Foto removida")
  7. setUploading(false)
```

### Avatar com iniciais

```text
Sem foto -> Exibir circulo com iniciais (ex: "CA" para "Carlos Almeida")
Cor de fundo gerada a partir do hash do nome para consistencia
```

### Cache do instrutor

O trigger `sync_profile_to_instrutor_cache` ja existe no banco e automaticamente atualiza `instrutores_publico_cache.foto` quando `profiles.avatar_url` muda, entao nenhuma mudanca de backend e necessaria.

