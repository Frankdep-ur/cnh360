

# Protecao contra Saques Duplicados

## Problema

Cleia conseguiu solicitar 2 saques de R$ 4,51 do mesmo saldo porque:

1. O botao de saque fica habilitado novamente ao reabrir o modal
2. A API da Pagar.me ainda reporta o saldo como "disponivel" enquanto a primeira transferencia esta `pending_transfer`
3. Nao existe nenhum registro local de saques para verificar duplicidade

## Solucao: Protecao em 3 camadas

### Camada 1 - Tabela de controle `saques` (banco de dados)

Criar uma tabela para registrar cada solicitacao de saque:

```text
saques
  - id (uuid, PK)
  - instrutor_id (uuid, FK -> instrutores.id)
  - valor (numeric) -- em centavos
  - transfer_id (text) -- ID da transferencia na Pagar.me
  - status (text) -- 'pendente', 'processado', 'rejeitado'
  - created_at (timestamptz)
```

Com RLS habilitado para que instrutores vejam apenas seus proprios saques.

### Camada 2 - Validacao no servidor (Edge Function)

Antes de criar a transferencia na Pagar.me, a Edge Function `request-manual-transfer-pagarme` fara:

1. Consultar a tabela `saques` para verificar se existe um saque com status `pendente` criado nos ultimos 10 minutos
2. Se existir, rejeitar com mensagem "Voce ja tem um saque em processamento"
3. Se nao existir, inserir um registro com status `pendente` ANTES de chamar a API
4. Apos sucesso na API, atualizar o registro com o `transfer_id` e status `processado`
5. Em caso de erro na API, atualizar para `rejeitado`

Fluxo no servidor:

```text
[Requisicao] --> [Verifica saque pendente?]
                       |
                  SIM: Rejeita ("Saque ja em processamento")
                       |
                  NAO: Insere registro 'pendente'
                       |
                  [Chama Pagar.me API]
                       |
                  SUCESSO: Atualiza para 'processado' + transfer_id
                       |
                  ERRO: Atualiza para 'rejeitado'
```

### Camada 3 - Protecao no frontend (WithdrawModal)

Apos um saque bem-sucedido:
- O modal fecha e o `onSuccess` recarrega o saldo (que agora sera zero)
- O botao "Sacar Saldo" ficara desabilitado porque `balance.available <= 0`

Adicionalmente, enquanto o modal estiver aberto:
- Desabilitar o fechamento do modal durante o processamento (impedir ESC e clique fora)
- O estado `loading` ja desabilita o botao, mas adicionar `onOpenChange` controlado

---

## Secao Tecnica

### Arquivos impactados

| Arquivo | Alteracao |
|---------|-----------|
| Nova migracao SQL | Criar tabela `saques` com RLS |
| `supabase/functions/request-manual-transfer-pagarme/index.ts` | Adicionar verificacao de saque pendente e registro na tabela |
| `src/components/instrutor/WithdrawModal.tsx` | Impedir fechamento durante processamento |

### Detalhes da migracao SQL

```text
CREATE TABLE public.saques (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  instrutor_id uuid NOT NULL REFERENCES public.instrutores(id),
  valor integer NOT NULL,
  transfer_id text,
  status text NOT NULL DEFAULT 'pendente',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.saques ENABLE ROW LEVEL SECURITY;

-- Instrutor pode ver seus proprios saques
CREATE POLICY "Instrutores podem ver seus saques"
  ON public.saques FOR SELECT
  USING (
    instrutor_id IN (
      SELECT id FROM public.instrutores WHERE user_id = auth.uid()
    )
  );

-- Apenas service_role pode inserir/atualizar (via Edge Function)
-- Nenhuma policy de INSERT/UPDATE para usuarios normais
```

### Detalhes da Edge Function

Na `request-manual-transfer-pagarme`, apos autenticacao e antes de consultar saldo:

```text
// 1. Verificar saque pendente nos ultimos 10 minutos
SELECT id FROM saques
WHERE instrutor_id = ? AND status = 'pendente'
AND created_at > now() - interval '10 minutes'

// 2. Se existir -> retornar erro 200 com mensagem
{ error: "Voce ja tem um saque em processamento. Aguarde alguns minutos." }

// 3. Se nao existir -> inserir registro pendente
INSERT INTO saques (instrutor_id, valor, status) VALUES (?, ?, 'pendente')

// 4. Apos sucesso -> atualizar
UPDATE saques SET status = 'processado', transfer_id = ? WHERE id = ?

// 5. Apos erro -> atualizar
UPDATE saques SET status = 'rejeitado' WHERE id = ?
```

### Detalhes do WithdrawModal

- Alterar `onOpenChange` do Dialog para ignorar fechamento quando `status === "loading"`
- Isso impede que o usuario feche o modal e abra novamente durante o processamento

### Resultado esperado

- Se Cleia clicar 2 vezes seguidas em "Confirmar Saque", o segundo clique sera bloqueado pelo estado `loading` do botao
- Se Cleia fechar e reabrir o modal rapidamente, o servidor rejeitara com "Saque ja em processamento"
- Apos o primeiro saque ser processado, o saldo sera zero e o botao ficara desabilitado

