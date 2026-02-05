

# Reverter Bloqueios de Verificação de Instrutor

## O que será revertido

As alterações feitas anteriormente bloqueavam alunos de agendar aulas com instrutores não verificados. Você prefere manter o fluxo aberto.

## Lógica de Negócio (sua preferência)

```text
Aluno agenda aula → Paga normalmente → Instrutor recebe notificação
                                              ↓
                          Se não verificou conta → 100% fica na plataforma
                          Se verificou conta → Split 50/50 é aplicado
                                              ↓
                          Instrutor é incentivado a verificar para receber $$$
```

## Alterações a Fazer

| Arquivo | Ação |
|---------|------|
| `src/components/cards/InstructorCard.tsx` | Remover badge "Verificação pendente" e props `kycStatus`/`hasRecipient` |
| `src/pages/aluno/InstrutorPerfil.tsx` | Remover bloqueio do botão de agendar e busca de dados KYC |
| `src/pages/aluno/BuscarInstrutores.tsx` | Remover busca de dados de verificação da tabela `instrutores` |

## Resultado Final

- Card de instrutor: Exibe normalmente sem badges de verificação
- Perfil do instrutor: Botão "Agendar" sempre habilitado
- Busca: Não precisa mais buscar dados de KYC

## Seção Técnica

### InstructorCard.tsx
Remover:
- Props `kycStatus` e `hasRecipient`
- Lógica `isVerifiedForPayments`
- Badge "Verificação pendente"
- Ícone de alerta laranja

### InstrutorPerfil.tsx
Remover:
- Busca de `kyc_status` e `pagarme_recipient_id` da tabela `instrutores`
- Estado `isVerifiedForPayments`
- Condicionais que desabilitam o botão de agendar
- Badge de verificação no header

### BuscarInstrutores.tsx
Remover:
- Query separada para tabela `instrutores` buscando dados de verificação
- Mapeamento de `kycStatus` e `hasRecipient` para os cards

