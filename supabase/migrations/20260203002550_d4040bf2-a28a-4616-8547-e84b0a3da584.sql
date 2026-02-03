-- Adicionar colunas para cache de KYC link
ALTER TABLE instrutores 
ADD COLUMN IF NOT EXISTS kyc_url TEXT,
ADD COLUMN IF NOT EXISTS kyc_base64 TEXT,
ADD COLUMN IF NOT EXISTS kyc_link_expires_at TIMESTAMP WITH TIME ZONE;