-- Add new columns to aulas table for anti-fraud workflow
ALTER TABLE public.aulas
ADD COLUMN IF NOT EXISTS aluno_confirmou_chegada boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS aula_inicio timestamptz,
ADD COLUMN IF NOT EXISTS aula_fim timestamptz,
ADD COLUMN IF NOT EXISTS qr_code_data text,
ADD COLUMN IF NOT EXISTS qr_code_expires_at timestamptz,
ADD COLUMN IF NOT EXISTS qr_validado boolean DEFAULT false;

-- Add is_system column to mensagens_aula for automated system messages
ALTER TABLE public.mensagens_aula
ADD COLUMN IF NOT EXISTS is_system boolean DEFAULT false;

-- Expand status_aula enum with new values for the workflow
ALTER TYPE status_aula ADD VALUE IF NOT EXISTS 'em_rota';
ALTER TYPE status_aula ADD VALUE IF NOT EXISTS 'aguardando_confirmacao';
ALTER TYPE status_aula ADD VALUE IF NOT EXISTS 'aguardando_qr';

-- Add index for faster queries on lesson status
CREATE INDEX IF NOT EXISTS idx_aulas_status ON public.aulas(status);
CREATE INDEX IF NOT EXISTS idx_aulas_instrutor_status ON public.aulas(instrutor_id, status);