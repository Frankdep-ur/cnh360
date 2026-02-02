-- Add KYC status column to instrutores table
ALTER TABLE public.instrutores 
ADD COLUMN IF NOT EXISTS kyc_status text DEFAULT 'not_started' 
CHECK (kyc_status IN ('not_started', 'initiated', 'in_review', 'approved', 'refused'));

-- Add KYC metadata column for storing additional info
ALTER TABLE public.instrutores 
ADD COLUMN IF NOT EXISTS kyc_updated_at timestamp with time zone;

-- Create index for faster KYC status queries
CREATE INDEX IF NOT EXISTS idx_instrutores_kyc_status ON public.instrutores(kyc_status);

-- Comment for documentation
COMMENT ON COLUMN public.instrutores.kyc_status IS 'KYC verification status: not_started, initiated, in_review, approved, refused';