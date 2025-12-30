-- Create table for storing simulado history
CREATE TABLE public.simulados_historico (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  aluno_id UUID NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
  nota NUMERIC NOT NULL,
  total_questoes INTEGER NOT NULL DEFAULT 30,
  acertos INTEGER NOT NULL,
  tempo_gasto_segundos INTEGER NOT NULL,
  aprovado BOOLEAN NOT NULL,
  detalhes_categorias JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.simulados_historico ENABLE ROW LEVEL SECURITY;

-- Students can view their own simulado history
CREATE POLICY "Students can view own simulado history"
ON public.simulados_historico
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.alunos
  WHERE alunos.id = simulados_historico.aluno_id
  AND alunos.user_id = auth.uid()
));

-- Students can insert their own simulado results
CREATE POLICY "Students can insert own simulado results"
ON public.simulados_historico
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.alunos
  WHERE alunos.id = simulados_historico.aluno_id
  AND alunos.user_id = auth.uid()
));

-- Create index for faster queries
CREATE INDEX idx_simulados_historico_aluno ON public.simulados_historico(aluno_id);
CREATE INDEX idx_simulados_historico_created ON public.simulados_historico(created_at DESC);