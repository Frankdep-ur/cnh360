-- Make instrutor_id nullable in pagamentos table
ALTER TABLE public.pagamentos 
ALTER COLUMN instrutor_id DROP NOT NULL;

-- Add unique constraint on external_id to prevent duplicate payments
CREATE UNIQUE INDEX IF NOT EXISTS idx_pagamentos_external_id_unique 
ON public.pagamentos(external_id) 
WHERE external_id IS NOT NULL;