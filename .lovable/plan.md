

## Corrigir: Separação por cidade não aparece

### O problema
A implementação do código está correta. A separação não aparece porque **seu perfil de aluno não tem cidade cadastrada**. Quando a cidade do aluno é `null`, o sistema mostra todos os instrutores juntos (comportamento correto de fallback).

Dados atuais no banco:
- Apenas 2 pessoas têm cidade: Frank Alexandre e Cleia Santos (ambos "Pereira Barreto")
- Todos os outros perfis (incluindo o seu como aluno) têm `cidade = null`

### O que fazer

**1. Atualizar seu perfil de aluno com uma cidade para teste**
- Executar um SQL para definir a cidade do seu perfil como "Pereira Barreto" (para testar a separação com os 2 instrutores que têm essa cidade)

**2. Corrigir o cast desnecessário no código**
- Linha 119: trocar `(inst as any).cidade` por `inst.cidade` (o tipo já foi atualizado no schema)

**3. Adicionar campo de cidade na tela de perfil do aluno**
- Na tela `AlunoPerfil.tsx`, adicionar um campo para o aluno informar sua cidade
- Isso garante que novos alunos possam definir a cidade e ver a separação automaticamente

### Arquivos modificados

| Arquivo | Alteração |
|---------|-----------|
| SQL (update direto) | Definir cidade do seu perfil para teste |
| `src/pages/aluno/BuscarInstrutores.tsx` | Remover cast `(inst as any)` na linha 119 |
| `src/pages/aluno/AlunoPerfil.tsx` | Adicionar campo "Cidade" no formulário de perfil |

### Resultado
Após definir a cidade no perfil, a tela de busca vai mostrar:
- Seção "Na sua cidade" com instrutores da mesma cidade
- Seção "Outras regiões" com os demais agrupados por cidade
