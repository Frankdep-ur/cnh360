

# Melhorias no Perfil do Instrutor + Preco de Teste da Cleia Santos

## 1. Mostrar status de aprovacao real do KYC no perfil

### Problema atual
O badge "Verificado" no perfil do instrutor usa uma logica simplificada que verifica apenas se o instrutor tem nome real, foto e credencial DETRAN. Nao consulta o `kyc_status` real do banco de dados, entao um instrutor com KYC aprovado pela Pagar.me pode ainda aparecer como "Pendente".

### Solucao
Buscar o campo `kyc_status` da tabela `instrutores` e usar esse dado para determinar o badge correto no perfil. Quando `kyc_status === "approved"`, exibir um badge verde bonito com "Conta Verificada". Quando pendente ou em analise, mostrar o status correspondente.

### Mudancas no arquivo `src/pages/instrutor/InstrutorPerfil.tsx`:

1. **Adicionar `kyc_status` ao `InstrutorData` interface** - Incluir o campo `kyc_status` para ser carregado junto com os dados do instrutor

2. **Atualizar `fetchProfile`** - O campo `kyc_status` ja vem no `select("*")`, so precisa mapear no estado

3. **Atualizar logica do `isVerified`** - Usar `kyc_status === "approved"` como criterio principal de verificacao, mantendo os outros criterios como secundarios

4. **Melhorar o badge visual** - Quando KYC aprovado, mostrar um badge verde elegante "Conta Verificada" com icone de check. Quando em analise ("affiliation"/"registration"), mostrar "Em analise" em amarelo. Quando recusado, mostrar em vermelho.

### Mudancas no arquivo `src/components/profile/VerifiedBadge.tsx`:

1. **Adicionar suporte para multiplos estados** - Aceitar uma prop `status` opcional ("approved", "affiliation", "refused", "not_started") alem do booleano `isVerified`

2. **Renderizar badges diferentes por status**:
   - `approved`: Verde com "Conta Verificada"
   - `affiliation`/`registration`: Amarelo com "Em analise"
   - `refused`: Vermelho com "Recusado"
   - `not_started`/default: Cinza com "Pendente"

## 2. Alterar preco da aula da Cleia Santos para R$10

### Dados atuais da Cleia:
- **ID instrutor:** `1c8b7ace-c167-481f-ae06-986f00cb8d6f`
- **Preco atual:** R$ 80,00
- **KYC Status:** approved

### Acao:
- Atualizar o campo `preco_hora` na tabela `instrutores` de 80 para 10
- Atualizar tambem na tabela `instrutores_publico_cache` para que o preco correto apareca na busca dos alunos

---

## Secao Tecnica

### Arquivos a modificar

| Arquivo | Mudanca |
|---------|---------|
| `src/pages/instrutor/InstrutorPerfil.tsx` | Adicionar `kyc_status` ao estado e usar para badge |
| `src/components/profile/VerifiedBadge.tsx` | Suportar multiplos estados de KYC com cores diferentes |

### Operacoes no banco de dados

```text
UPDATE instrutores SET preco_hora = 10 WHERE id = '1c8b7ace-c167-481f-ae06-986f00cb8d6f'
UPDATE instrutores_publico_cache SET preco_hora = 10 WHERE id = '1c8b7ace-c167-481f-ae06-986f00cb8d6f'
```

### Interface atualizada do InstrutorData

```text
interface InstrutorData {
  id: string;
  credencial_detran: string;
  cnh_numero: string;
  cnh_categoria: string;
  preco_hora: number;
  nota_media: number;
  total_aulas: number;
  pagarme_recipient_id: string | null;
  kyc_status: string | null;          // NOVO
}
```

### Logica do badge atualizada

```text
// Antes (simplificado, nao real):
isVerified = !isTestAccount && hasPhoto && hasCredential

// Depois (baseado no KYC real):
kycStatus = instrutorData?.kyc_status
-> "approved" = Badge verde "Conta Verificada"
-> "affiliation"/"registration" = Badge amarelo "Em analise"
-> "refused" = Badge vermelho "Recusado"
-> default = Badge cinza "Pendente"
```

### Resultado visual esperado

Para a Cleia Santos (KYC approved):
- Badge verde com icone de check: "Conta Verificada"
- Preco exibido: R$ 10,00/hora
- Seção de saldo mostrando "Identidade verificada" (ja funciona)
