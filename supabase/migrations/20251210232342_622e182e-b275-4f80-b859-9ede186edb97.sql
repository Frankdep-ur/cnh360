-- 1. Remover views SECURITY DEFINER problemáticas e criar versões seguras

-- Drop existing public views
DROP VIEW IF EXISTS public.instrutores_public;
DROP VIEW IF EXISTS public.autoescolas_public;

-- Criar tabela de cache para dados públicos de instrutores (mais seguro que views)
CREATE TABLE IF NOT EXISTS public.instrutores_publico_cache (
  id uuid PRIMARY KEY,
  preco_hora numeric,
  raio_atendimento_km integer,
  nota_media numeric,
  total_avaliacoes integer,
  total_aulas integer,
  cnh_categoria categoria_cnh,
  bio text,
  ativo boolean DEFAULT true,
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS na tabela de cache
ALTER TABLE public.instrutores_publico_cache ENABLE ROW LEVEL SECURITY;

-- Política: qualquer pessoa pode ler instrutores ativos
CREATE POLICY "Anyone can view active instructors cache"
ON public.instrutores_publico_cache
FOR SELECT USING (ativo = true);

-- Política: instrutores podem atualizar seu próprio cache
CREATE POLICY "Instructors can update own cache"
ON public.instrutores_publico_cache
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.instrutores i
    WHERE i.id = instrutores_publico_cache.id
    AND i.user_id = auth.uid()
  )
);

-- 2. Restringir acesso à tabela veiculos
DROP POLICY IF EXISTS "Public can view active vehicles" ON public.veiculos;

-- Criar view segura para veículos (sem placa completa)
CREATE OR REPLACE FUNCTION public.get_vehicle_display_info(p_instrutor_id uuid)
RETURNS TABLE (
  id uuid,
  modelo text,
  transmissao tipo_transmissao,
  categoria categoria_cnh,
  ano integer
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT v.id, v.modelo, v.transmissao, v.categoria, v.ano
  FROM public.veiculos v
  WHERE v.instrutor_id = p_instrutor_id AND v.ativo = true
$$;

-- 3. Criar função para buscar instrutores públicos de forma segura
CREATE OR REPLACE FUNCTION public.get_public_instructors()
RETURNS TABLE (
  id uuid,
  preco_hora numeric,
  nota_media numeric,
  total_avaliacoes integer,
  cnh_categoria categoria_cnh,
  bio text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT i.id, i.preco_hora, i.nota_media, i.total_avaliacoes, i.cnh_categoria, i.bio
  FROM public.instrutores i
  WHERE i.ativo = true
$$;

-- 4. Criar função para buscar autoescolas públicas (só nome e cidade)
CREATE OR REPLACE FUNCTION public.get_public_autoescolas()
RETURNS TABLE (
  id uuid,
  nome_fantasia text,
  cidade text,
  estado text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT a.id, a.nome_fantasia, a.cidade, a.estado
  FROM public.autoescolas a
  WHERE a.ativa = true
$$;