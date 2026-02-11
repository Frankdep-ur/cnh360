

## Destacar cidades na seção "Outras regiões"

### O que muda

Melhorar visualmente os headers de cidade na seção "Outras regioes" para transmitir credibilidade -- mostrar que o app ja tem instrutores em varias cidades do Brasil.

### Alteracoes

**Arquivo: `src/pages/aluno/BuscarInstrutores.tsx`** (linhas 356-361)

O header de cada cidade na secao "Outras regioes" vai ficar mais visivel e bonito:

- Trocar o estilo discreto atual (texto cinza pequeno) por um badge/chip com fundo colorido
- Adicionar icone `MapPin` com cor primaria (nao cinza)
- Mostrar a quantidade de instrutores naquela cidade (ex: "Araçatuba (3)")
- Manter simples e limpo, sem exagerar

**De:**
```
MapPin cinza + texto cinza pequeno com nome da cidade
```

**Para:**
```
Badge com fundo primary/10 + MapPin colorido + "Cidade (N instrutores)"
```

### Resultado visual esperado

```text
─────── Outras regiões ───────

  📍 Araçatuba (2 instrutores)
  [Card instrutor 1]
  [Card instrutor 2]

  📍 São Paulo (1 instrutor)
  [Card instrutor 3]
```

Isso passa mais credibilidade mostrando que o app tem presenca em varias cidades, com contagem de instrutores por regiao.
