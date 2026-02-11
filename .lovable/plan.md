

## Remover todas as menções a "Araçatuba" do CNH360

### Arquivos a modificar (10 arquivos, ~15 alterações)

**1. `src/pages/aluno/BuscarInstrutores.tsx`** (tela de busca - prioridade)
- Remover linha "Araçatuba, SP" com o ícone MapPin (linhas 201-204)

**2. `src/pages/Index.tsx`** (landing page)
- Remover o badge "Disponível em Araçatuba/SP" (linhas 148-153)

**3. `src/components/instrutor/RideRequestNotification.tsx`**
- Substituir fallback "Araçatuba, SP" por "Localização não informada" (linha 80)

**4. `src/components/instrutor/NovaAulaPopupEnhanced.tsx`**
- Substituir 3 referências a "Araçatuba, SP" por "Localização não informada" ou remover (linhas 53, 101, 129)

**5. `src/pages/aluno/ValidacaoAula.tsx`**
- Substituir endereço mock "Centro, Araçatuba" por texto genérico (linha 55)

**6. `src/pages/aluno/ExamePratico.tsx`**
- Substituir "CIRETRAN Araçatuba" por "CIRETRAN Regional" (linha 21)

**7. `src/pages/autoescola/AutoescolaProvas.tsx`**
- Substituir 4x "DETRAN Araçatuba" por "DETRAN Regional" (linhas 30-34)

**8. `src/pages/autoescola/AutoescolaLeads.tsx`**
- Substituir 3x "Araçatuba" nas cidades dos leads mock por cidades genéricas (linhas 34-38)

**9. `src/pages/onboarding/AutoescolaOnboarding.tsx`**
- Remover valor padrão "Araçatuba" do campo cidade, deixar vazio (linha 46)

**10. `src/pages/TermosUso.tsx`**
- Manter referência ao foro jurídico (Comarca de Araçatuba) - este é um texto legal que define jurisdição e **não deve ser removido** por questões jurídicas

### Resumo
- 9 arquivos editados com remoções/substituições
- 1 arquivo mantido (TermosUso.tsx - texto legal)
- A tela de busca de instrutores ficará sem referência a cidade fixa
- Landing page ficará sem o badge de cidade piloto

