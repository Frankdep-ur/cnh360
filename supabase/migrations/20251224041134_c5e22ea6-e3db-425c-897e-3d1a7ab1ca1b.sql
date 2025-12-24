-- Add payment_intent_id column to aulas table for tracking Stripe payments
ALTER TABLE public.aulas 
ADD COLUMN IF NOT EXISTS payment_intent_id TEXT;

-- Add index for faster lookups by payment_intent_id
CREATE INDEX IF NOT EXISTS idx_aulas_payment_intent_id ON public.aulas(payment_intent_id);

-- Add comment for documentation
COMMENT ON COLUMN public.aulas.payment_intent_id IS 'Stripe PaymentIntent ID for tracking payment authorization/capture status';