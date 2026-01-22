-- Permitir leitura pública de veículos de instrutores ativos (para busca)
CREATE POLICY "Public can view active instructor vehicles"
  ON public.veiculos FOR SELECT
  TO anon, authenticated
  USING (
    ativo = true 
    AND EXISTS (
      SELECT 1 FROM public.instrutores i 
      WHERE i.id = veiculos.instrutor_id 
      AND i.ativo = true
    )
  );