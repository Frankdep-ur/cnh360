

## Corrigir separação de instrutores por cidade

### Problema atual
A lógica na linha 224 coloca instrutores **sem cidade cadastrada** junto com os da cidade do aluno. Isso faz com que todos os 6 instrutores caiam em "Na sua cidade" e a seção "Outras regiões" nunca apareça.

### Correção

**Arquivo: `src/pages/aluno/BuscarInstrutores.tsx`**

**1. Corrigir lógica de agrupamento (linha 222-231)**
- Instrutor com cidade igual a do aluno -> "Na sua cidade"
- Instrutor com cidade diferente -> "Outras regiões", agrupado pelo nome da cidade
- Instrutor sem cidade cadastrada -> "Outras regiões" em um grupo separado ("Sem cidade informada" nao aparece -- esses instrutores simplesmente ficam no final da lista geral, sem header de cidade)

Nova lógica:
```
instCity === normalizedStudentCity  ->  sameCity
instCity && instCity !== normalizedStudentCity  ->  othersMap (agrupado por cidade)
!instCity  ->  sameCity (fallback, ja que nao sabemos onde esta)
```

Espera -- o usuario quer que so aparecam na cidade os que realmente sao da cidade. Entao instrutores sem cidade vao para "Outras regiões" como grupo genérico ou simplesmente nao aparecem na secao "Na sua cidade".

Vou ajustar assim:
- `instCity === normalizedStudentCity` -> sameCity
- `instCity && instCity !== normalizedStudentCity` -> othersMap por cidade
- `!instCity` -> othersMap em grupo "Outras" (ou ficam soltos no final)

**2. Melhorar visual da seção "Na sua cidade" (linhas 324-344)**
- Adicionar um subtítulo informativo tipo "Instrutores disponíveis perto de você"
- Manter o badge com nome da cidade do aluno

**3. Melhorar visual da seção "Outras regiões" (linhas 347-379)**
- Adicionar subtítulo "Também temos instrutores nestas cidades"
- Manter os badges coloridos por cidade com contagem

### Resultado esperado

```text
📍 Na sua cidade - Pereira Barreto
   Instrutores disponíveis perto de você
   [Card instrutor 1 - Pereira Barreto]
   [Card instrutor 2 - Pereira Barreto]

─────── Outras regiões ───────
   Também temos instrutores nestas cidades

   📍 Fernandópolis (2 instrutores)
   [Card instrutor 3]
   [Card instrutor 4]

   📍 Araçatuba (1 instrutor)
   [Card instrutor 5]
```

### Detalhes técnicos

| Local | Alteração |
|-------|-----------|
| Linha 224 | Mudar `!instCity \|\| instCity === normalized` para `instCity === normalized` (somente match exato) |
| Linha 224-231 | Instrutores sem cidade vao para grupo genérico no final (sem header de cidade) |
| Linhas 326-331 | Header "Na sua cidade" com subtítulo informativo |
| Linhas 349-354 | Subtítulo "Também temos instrutores nestas cidades" |

