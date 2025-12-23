-- Create table for real-time location tracking
CREATE TABLE public.localizacao_tempo_real (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  aula_id UUID REFERENCES public.aulas(id) ON DELETE CASCADE,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  heading NUMERIC,
  speed NUMERIC,
  accuracy NUMERIC,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.localizacao_tempo_real ENABLE ROW LEVEL SECURITY;

-- Instructors can manage their own location
CREATE POLICY "Instructors can manage own location"
ON public.localizacao_tempo_real
FOR ALL
USING (auth.uid() = user_id);

-- Students can view instructor location for their lessons
CREATE POLICY "Students can view instructor location for their lessons"
ON public.localizacao_tempo_real
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM aulas a
    JOIN alunos al ON a.aluno_id = al.id
    WHERE a.id = localizacao_tempo_real.aula_id
    AND al.user_id = auth.uid()
  )
);

-- Add columns to aulas table for student location
ALTER TABLE public.aulas 
ADD COLUMN IF NOT EXISTS latitude_aluno NUMERIC,
ADD COLUMN IF NOT EXISTS longitude_aluno NUMERIC,
ADD COLUMN IF NOT EXISTS instrutor_a_caminho BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS instrutor_chegou BOOLEAN DEFAULT false;

-- Enable realtime for location tracking
ALTER PUBLICATION supabase_realtime ADD TABLE public.localizacao_tempo_real;

-- Create index for faster queries
CREATE INDEX idx_localizacao_aula_id ON public.localizacao_tempo_real(aula_id);
CREATE INDEX idx_localizacao_user_id ON public.localizacao_tempo_real(user_id);