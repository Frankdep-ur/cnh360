-- Add payment_confirmed column to track paid lessons
ALTER TABLE aulas 
ADD COLUMN payment_confirmed boolean DEFAULT false;

-- Update existing confirmed lessons with transaction_id as already paid
UPDATE aulas 
SET payment_confirmed = true 
WHERE status = 'confirmada' 
AND transaction_id IS NOT NULL;