

## Remover "Cidade não informada" e mostrar cidade no card

### Alterações

**1. Filtrar instrutores sem cidade na seção "Outras regiões"** (`BuscarInstrutores.tsx`, linha 227)
- Instrutores sem cidade cadastrada não entram na seção "Outras regiões"
- Eles vão para a seção "Na sua cidade" junto com os locais (já que não temos como saber onde estão)

**2. Trocar tag "Experiente" pela cidade do instrutor** (`BuscarInstrutores.tsx`, linha 117)
- No campo `tags`, em vez de colocar "Experiente" como fallback, colocar a cidade do instrutor quando disponível
- Exemplo: em vez de "Experiente", aparece "Pereira Barreto"

### Arquivos modificados

| Arquivo | Alteração |
|---------|-----------|
| `src/pages/aluno/BuscarInstrutores.tsx` | Linha 117: usar cidade como tag principal em vez de "Experiente" |
| `src/pages/aluno/BuscarInstrutores.tsx` | Linha 222-231: instrutores sem cidade vão junto com os da mesma cidade, não criam grupo "Cidade não informada" |

### Resultado
- Desaparece o grupo "Cidade não informada"
- Cada card de instrutor mostra a cidade dele como tag (ex: "Pereira Barreto") no lugar de "Experiente"
