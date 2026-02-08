
CREATE TABLE public.saques (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  instrutor_id uuid NOT NULL REFERENCES public.instrutores(id),
  valor integer NOT NULL,
  transfer_id text,
  status text NOT NULL DEFAULT 'pendente',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.saques ENABLE ROW LEVEL SECURITY;

-- Instrutor pode ver seus próprios saques
CREATE POLICY "Instrutores podem ver seus saques"
  ON public.saques FOR SELECT
  USING (
    instrutor_id IN (
      SELECT id FROM public.instrutores WHERE user_id = auth.uid()
    )
  );

-- Apenas service_role pode inserir/atualizar (via Edge Function)
-- Nenhuma policy de INSERT/UPDATE para usuarios normais
