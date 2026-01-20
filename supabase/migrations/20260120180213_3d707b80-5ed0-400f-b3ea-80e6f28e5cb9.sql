-- Adicionar coluna para armazenar o ID do recebedor Pagar.me nos instrutores
ALTER TABLE public.instrutores 
ADD COLUMN IF NOT EXISTS pagarme_recipient_id TEXT;

-- Adicionar comentário explicativo
COMMENT ON COLUMN public.instrutores.pagarme_recipient_id IS 
  'ID do recebedor na Pagar.me para receber split de pagamentos';

-- Renomear coluna payment_intent_id para transaction_id (agnóstico ao gateway)
ALTER TABLE public.aulas 
RENAME COLUMN payment_intent_id TO transaction_id;

-- Atualizar comentário da coluna
COMMENT ON COLUMN public.aulas.transaction_id IS 
  'ID da transação no gateway de pagamento (Pagar.me)';