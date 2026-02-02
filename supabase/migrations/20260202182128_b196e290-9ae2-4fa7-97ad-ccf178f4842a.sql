-- Add column to track if medical exam is completed
ALTER TABLE progresso_renach 
ADD COLUMN IF NOT EXISTS exame_medico_concluido BOOLEAN DEFAULT false;