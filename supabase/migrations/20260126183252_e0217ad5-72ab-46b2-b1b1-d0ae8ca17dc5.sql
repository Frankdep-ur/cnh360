-- Create audit history table for lessons
CREATE TABLE public.aulas_auditoria (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  aula_id UUID NOT NULL REFERENCES public.aulas(id) ON DELETE CASCADE,
  evento TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  latitude NUMERIC,
  longitude NUMERIC,
  precisao_metros NUMERIC,
  device_info JSONB,
  user_id UUID NOT NULL,
  dados_adicionais JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_auditoria_aula_id ON public.aulas_auditoria(aula_id);
CREATE INDEX idx_auditoria_timestamp ON public.aulas_auditoria(timestamp);
CREATE INDEX idx_auditoria_evento ON public.aulas_auditoria(evento);

-- Enable RLS
ALTER TABLE public.aulas_auditoria ENABLE ROW LEVEL SECURITY;

-- RLS policy: Participants can view their own lesson audits
CREATE POLICY "Participants can view lesson audit"
  ON public.aulas_auditoria
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.aulas a
      JOIN public.alunos al ON a.aluno_id = al.id
      JOIN public.instrutores i ON a.instrutor_id = i.id
      WHERE a.id = aulas_auditoria.aula_id
        AND (al.user_id = auth.uid() OR i.user_id = auth.uid())
    )
  );

-- RLS policy: Only service role can insert (via Edge Function)
CREATE POLICY "Service role can insert audit"
  ON public.aulas_auditoria
  FOR INSERT
  WITH CHECK (true);

-- Enable realtime for audit table
ALTER PUBLICATION supabase_realtime ADD TABLE public.aulas_auditoria;

-- Add comment for documentation
COMMENT ON TABLE public.aulas_auditoria IS 'Audit trail for lesson events with GPS validation';