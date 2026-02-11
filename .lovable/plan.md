

## Filtrar Instrutores por Cidade do Aluno

### Como vai funcionar

A tela de busca de instrutores sera dividida em duas secoes:

1. **"Instrutores na sua cidade"** - Instrutores que estao na mesma cidade do aluno (destaque principal)
2. **"Outras regioes"** - Demais instrutores agrupados por cidade, com o nome da cidade exibido como separador

Se o aluno nao tiver cidade cadastrada no perfil, todos os instrutores aparecem normalmente sem separacao.

### Detalhes tecnicos

**1. Migracao SQL - Adicionar coluna `cidade` na cache publica**

A tabela `instrutores_publico_cache` nao tem a coluna `cidade`. Precisamos:

- Adicionar coluna `cidade` (text, nullable) na tabela `instrutores_publico_cache`
- Atualizar a funcao `sync_instrutor_cache()` para incluir a cidade do perfil do instrutor
- Atualizar a funcao `sync_profile_to_instrutor_cache()` para sincronizar cidade tambem
- Popular dados existentes (os 2 instrutores de Pereira Barreto)

```text
instrutores_publico_cache
+------------------+
| id               |
| nome             |
| foto             |
| cidade     (NEW) |  <-- vem de profiles.cidade do instrutor
| preco_hora       |
| nota_media       |
| ...              |
+------------------+
```

**2. Buscar cidade do aluno logado**

No componente `BuscarInstrutores.tsx`:
- Adicionar query para buscar `profiles.cidade` do usuario logado
- Incluir `cidade` no mapeamento de dados dos instrutores

**3. Separar instrutores em dois grupos**

Logica de filtragem:
- `instrutoresMesmaCidade` - onde `instrutor.cidade === aluno.cidade`
- `instrutoresOutrasCidades` - agrupados por cidade, com header de separacao

**4. Atualizar a interface**

- Secao "Na sua cidade" com icone de localizacao e contagem
- Secao "Outras regioes" com separadores visuais por cidade (ex: "-- Pereira Barreto --")
- InstructorCard recebe nova prop `cidade` para exibir no card (substituindo o campo `distance` que hoje mostra raio de atendimento)

**5. Atualizar InstructorCard**

- Adicionar prop opcional `cityLabel` para exibir a cidade no card
- Mostrar cidade ao lado do MapPin em vez do raio generico

### Arquivos modificados

| Arquivo | Alteracao |
|---------|-----------|
| Migracao SQL | Adicionar coluna cidade, atualizar triggers |
| `src/pages/aluno/BuscarInstrutores.tsx` | Buscar cidade do aluno, separar em secoes |
| `src/components/cards/InstructorCard.tsx` | Adicionar prop `cityLabel` |

### Resultado visual esperado

```text
+----------------------------------+
| Encontre seu instrutor           |
| [Buscar...]              [filtro]|
+----------------------------------+
|                                  |
| Na sua cidade (2)                |
| Pereira Barreto                  |
|                                  |
| [Card Instrutor A]               |
| [Card Instrutor B]               |
|                                  |
| ── Outras regioes ──             |
|                                  |
| Sao Paulo                        |
| [Card Instrutor C - Sao Paulo]   |
|                                  |
| Campinas                         |
| [Card Instrutor D - Campinas]    |
|                                  |
+----------------------------------+
```
