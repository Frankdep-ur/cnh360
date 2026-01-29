-- Adicionar campos para QR Code de início da aula (anti-fraude)
ALTER TABLE aulas 
ADD COLUMN IF NOT EXISTS qr_code_inicio_data TEXT,
ADD COLUMN IF NOT EXISTS qr_code_inicio_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS qr_inicio_validado BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS aluno_pronto_para_aula BOOLEAN DEFAULT FALSE;