-- Create messages table for trip chat
CREATE TABLE public.mensagens_aula (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  aula_id UUID NOT NULL REFERENCES public.aulas(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mensagens_aula ENABLE ROW LEVEL SECURITY;

-- Policy: users can view messages for aulas they participate in
CREATE POLICY "Participantes podem ver mensagens"
ON public.mensagens_aula
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM aulas a
    JOIN alunos al ON a.aluno_id = al.id
    JOIN instrutores i ON a.instrutor_id = i.id
    WHERE a.id = mensagens_aula.aula_id
    AND (al.user_id = auth.uid() OR i.user_id = auth.uid())
  )
);

-- Policy: users can send messages to aulas they participate in
CREATE POLICY "Participantes podem enviar mensagens"
ON public.mensagens_aula
FOR INSERT
WITH CHECK (
  auth.uid() = sender_id
  AND EXISTS (
    SELECT 1 FROM aulas a
    JOIN alunos al ON a.aluno_id = al.id
    JOIN instrutores i ON a.instrutor_id = i.id
    WHERE a.id = mensagens_aula.aula_id
    AND (al.user_id = auth.uid() OR i.user_id = auth.uid())
  )
);

-- Enable realtime for chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.mensagens_aula;

-- Add student location columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'aulas' AND column_name = 'latitude_aluno') THEN
    ALTER TABLE public.aulas ADD COLUMN latitude_aluno NUMERIC;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'aulas' AND column_name = 'longitude_aluno') THEN
    ALTER TABLE public.aulas ADD COLUMN longitude_aluno NUMERIC;
  END IF;
END $$;