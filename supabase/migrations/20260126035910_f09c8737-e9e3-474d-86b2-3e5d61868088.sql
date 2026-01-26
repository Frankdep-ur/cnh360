-- Adicionar coluna para marcar quando a mensagem foi lida
ALTER TABLE public.mensagens_aula 
ADD COLUMN read_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Adicionar índice para consultas de mensagens não lidas
CREATE INDEX idx_mensagens_aula_read_at ON public.mensagens_aula(aula_id, read_at);