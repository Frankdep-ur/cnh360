
-- ================================================
-- FASE 1: ENUMS E TIPOS
-- ================================================

CREATE TYPE public.app_role AS ENUM ('admin', 'aluno', 'instrutor', 'autoescola');
CREATE TYPE public.categoria_cnh AS ENUM ('ACC', 'A', 'B', 'AB', 'C', 'D', 'E');
CREATE TYPE public.objetivo_aluno AS ENUM ('primeira_habilitacao', 'adicao_categoria', 'renovacao', 'mudanca_categoria');
CREATE TYPE public.status_aula AS ENUM ('pendente', 'confirmada', 'em_andamento', 'concluida', 'cancelada');
CREATE TYPE public.tipo_transmissao AS ENUM ('manual', 'automatico', 'ambos');
CREATE TYPE public.status_pagamento AS ENUM ('pendente', 'processando', 'aprovado', 'recusado', 'estornado');
CREATE TYPE public.metodo_pagamento AS ENUM ('pix', 'cartao_credito', 'cartao_debito', 'boleto');

-- ================================================
-- FASE 2: TABELA PROFILES (BASE)
-- ================================================

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  cpf TEXT UNIQUE,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Trigger para criar profile automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ================================================
-- FASE 3: USER ROLES (SEGURANÇA)
-- ================================================

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Função de verificação de role (Security Definer)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- ================================================
-- FASE 4: TABELAS DE USUÁRIOS
-- ================================================

-- ALUNOS
CREATE TABLE public.alunos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  objetivo objetivo_aluno NOT NULL,
  categoria_pretendida categoria_cnh NOT NULL,
  possui_carro_proprio BOOLEAN DEFAULT false,
  renach TEXT,
  horas_praticas_completadas INTEGER DEFAULT 0,
  horas_praticas_total INTEGER DEFAULT 20,
  exame_teorico_aprovado BOOLEAN DEFAULT false,
  exame_pratico_aprovado BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.alunos ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_alunos_updated_at
  BEFORE UPDATE ON public.alunos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- AUTOESCOLAS
CREATE TABLE public.autoescolas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  razao_social TEXT NOT NULL,
  nome_fantasia TEXT,
  cnpj TEXT UNIQUE NOT NULL,
  credencial_detran TEXT NOT NULL,
  endereco TEXT,
  cidade TEXT,
  estado TEXT,
  cep TEXT,
  telefone TEXT,
  email TEXT,
  ativa BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.autoescolas ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_autoescolas_updated_at
  BEFORE UPDATE ON public.autoescolas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- INSTRUTORES
CREATE TABLE public.instrutores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  autoescola_id UUID REFERENCES public.autoescolas(id) ON DELETE SET NULL,
  credencial_detran TEXT NOT NULL,
  cnh_numero TEXT NOT NULL,
  cnh_categoria categoria_cnh NOT NULL,
  cnh_validade DATE NOT NULL,
  mei_cnpj TEXT,
  preco_hora DECIMAL(10,2) NOT NULL DEFAULT 80.00,
  raio_atendimento_km INTEGER DEFAULT 10,
  bio TEXT,
  nota_media DECIMAL(3,2) DEFAULT 5.00,
  total_avaliacoes INTEGER DEFAULT 0,
  total_aulas INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.instrutores ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_instrutores_updated_at
  BEFORE UPDATE ON public.instrutores
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- VEÍCULOS
CREATE TABLE public.veiculos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instrutor_id UUID REFERENCES public.instrutores(id) ON DELETE CASCADE NOT NULL,
  modelo TEXT NOT NULL,
  placa TEXT NOT NULL,
  ano INTEGER,
  transmissao tipo_transmissao NOT NULL DEFAULT 'manual',
  categoria categoria_cnh NOT NULL DEFAULT 'B',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.veiculos ENABLE ROW LEVEL SECURITY;

-- DISPONIBILIDADE
CREATE TABLE public.disponibilidade (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instrutor_id UUID REFERENCES public.instrutores(id) ON DELETE CASCADE NOT NULL,
  dia_semana INTEGER NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
  hora_inicio TIME NOT NULL,
  hora_fim TIME NOT NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.disponibilidade ENABLE ROW LEVEL SECURITY;

-- ================================================
-- FASE 5: CORE DO MARKETPLACE
-- ================================================

-- AULAS
CREATE TABLE public.aulas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID REFERENCES public.alunos(id) ON DELETE CASCADE NOT NULL,
  instrutor_id UUID REFERENCES public.instrutores(id) ON DELETE CASCADE NOT NULL,
  veiculo_id UUID REFERENCES public.veiculos(id) ON DELETE SET NULL,
  data_hora TIMESTAMPTZ NOT NULL,
  duracao_minutos INTEGER NOT NULL DEFAULT 50,
  status status_aula NOT NULL DEFAULT 'pendente',
  usa_carro_aluno BOOLEAN DEFAULT false,
  ponto_encontro TEXT,
  latitude_encontro DECIMAL(10,8),
  longitude_encontro DECIMAL(11,8),
  valor DECIMAL(10,2) NOT NULL,
  observacoes TEXT,
  codigo_validacao TEXT,
  validada_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.aulas ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_aulas_updated_at
  BEFORE UPDATE ON public.aulas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- VALIDAÇÕES GPS (Antifraude)
CREATE TABLE public.validacoes_gps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aula_id UUID REFERENCES public.aulas(id) ON DELETE CASCADE NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('inicio', 'fim', 'checkpoint')),
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  precisao_metros DECIMAL(6,2),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  device_info JSONB
);

ALTER TABLE public.validacoes_gps ENABLE ROW LEVEL SECURITY;

-- PAGAMENTOS
CREATE TABLE public.pagamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aula_id UUID REFERENCES public.aulas(id) ON DELETE SET NULL,
  aluno_id UUID REFERENCES public.alunos(id) ON DELETE SET NULL NOT NULL,
  instrutor_id UUID REFERENCES public.instrutores(id) ON DELETE SET NULL NOT NULL,
  valor_bruto DECIMAL(10,2) NOT NULL,
  taxa_plataforma DECIMAL(10,2) NOT NULL,
  valor_instrutor DECIMAL(10,2) NOT NULL,
  metodo metodo_pagamento NOT NULL,
  status status_pagamento NOT NULL DEFAULT 'pendente',
  external_id TEXT,
  pago_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pagamentos ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_pagamentos_updated_at
  BEFORE UPDATE ON public.pagamentos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- AVALIAÇÕES
CREATE TABLE public.avaliacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aula_id UUID REFERENCES public.aulas(id) ON DELETE CASCADE NOT NULL UNIQUE,
  aluno_id UUID REFERENCES public.alunos(id) ON DELETE CASCADE NOT NULL,
  instrutor_id UUID REFERENCES public.instrutores(id) ON DELETE CASCADE NOT NULL,
  nota INTEGER NOT NULL CHECK (nota BETWEEN 1 AND 5),
  comentario TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.avaliacoes ENABLE ROW LEVEL SECURITY;

-- ================================================
-- FASE 6: CONFORMIDADE CONTRAN
-- ================================================

-- PROGRESSO RENACH
CREATE TABLE public.progresso_renach (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID REFERENCES public.alunos(id) ON DELETE CASCADE NOT NULL UNIQUE,
  etapa_atual TEXT NOT NULL DEFAULT 'cadastro',
  curso_teorico_inicio TIMESTAMPTZ,
  curso_teorico_conclusao TIMESTAMPTZ,
  exame_teorico_data TIMESTAMPTZ,
  exame_teorico_resultado TEXT,
  aulas_praticas_inicio TIMESTAMPTZ,
  aulas_praticas_conclusao TIMESTAMPTZ,
  exame_pratico_data TIMESTAMPTZ,
  exame_pratico_resultado TEXT,
  cnh_emitida_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.progresso_renach ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_progresso_renach_updated_at
  BEFORE UPDATE ON public.progresso_renach
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- LOGS RENACH (para integração futura)
CREATE TABLE public.logs_renach (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID REFERENCES public.alunos(id) ON DELETE CASCADE NOT NULL,
  tipo_operacao TEXT NOT NULL,
  dados JSONB,
  status TEXT NOT NULL DEFAULT 'pendente',
  erro TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.logs_renach ENABLE ROW LEVEL SECURITY;

-- ================================================
-- FASE 7: POLÍTICAS RLS
-- ================================================

-- PROFILES
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- USER_ROLES
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- ALUNOS
CREATE POLICY "Alunos can view own data"
  ON public.alunos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Alunos can insert own data"
  ON public.alunos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Alunos can update own data"
  ON public.alunos FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Instrutores can view their students"
  ON public.alunos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.aulas a
      JOIN public.instrutores i ON a.instrutor_id = i.id
      WHERE a.aluno_id = alunos.id AND i.user_id = auth.uid()
    )
  );

-- INSTRUTORES
CREATE POLICY "Public can view active instructors"
  ON public.instrutores FOR SELECT
  USING (ativo = true);

CREATE POLICY "Instrutores can insert own data"
  ON public.instrutores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Instrutores can update own data"
  ON public.instrutores FOR UPDATE
  USING (auth.uid() = user_id);

-- AUTOESCOLAS
CREATE POLICY "Public can view active autoescolas"
  ON public.autoescolas FOR SELECT
  USING (ativa = true);

CREATE POLICY "Autoescolas can insert own data"
  ON public.autoescolas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Autoescolas can update own data"
  ON public.autoescolas FOR UPDATE
  USING (auth.uid() = user_id);

-- VEÍCULOS
CREATE POLICY "Public can view active vehicles"
  ON public.veiculos FOR SELECT
  USING (ativo = true);

CREATE POLICY "Instrutores can manage own vehicles"
  ON public.veiculos FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.instrutores
      WHERE id = veiculos.instrutor_id AND user_id = auth.uid()
    )
  );

-- DISPONIBILIDADE
CREATE POLICY "Public can view active availability"
  ON public.disponibilidade FOR SELECT
  USING (ativo = true);

CREATE POLICY "Instrutores can manage own availability"
  ON public.disponibilidade FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.instrutores
      WHERE id = disponibilidade.instrutor_id AND user_id = auth.uid()
    )
  );

-- AULAS
CREATE POLICY "Alunos can view own lessons"
  ON public.aulas FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.alunos
      WHERE id = aulas.aluno_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Instrutores can view own lessons"
  ON public.aulas FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.instrutores
      WHERE id = aulas.instrutor_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Alunos can create lessons"
  ON public.aulas FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.alunos
      WHERE id = aulas.aluno_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Participants can update lessons"
  ON public.aulas FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.alunos WHERE id = aulas.aluno_id AND user_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM public.instrutores WHERE id = aulas.instrutor_id AND user_id = auth.uid()
    )
  );

-- VALIDAÇÕES GPS
CREATE POLICY "Participants can view GPS validations"
  ON public.validacoes_gps FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.aulas a
      JOIN public.alunos al ON a.aluno_id = al.id
      WHERE a.id = validacoes_gps.aula_id AND al.user_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM public.aulas a
      JOIN public.instrutores i ON a.instrutor_id = i.id
      WHERE a.id = validacoes_gps.aula_id AND i.user_id = auth.uid()
    )
  );

CREATE POLICY "Participants can insert GPS validations"
  ON public.validacoes_gps FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.aulas a
      JOIN public.alunos al ON a.aluno_id = al.id
      WHERE a.id = validacoes_gps.aula_id AND al.user_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM public.aulas a
      JOIN public.instrutores i ON a.instrutor_id = i.id
      WHERE a.id = validacoes_gps.aula_id AND i.user_id = auth.uid()
    )
  );

-- PAGAMENTOS
CREATE POLICY "Alunos can view own payments"
  ON public.pagamentos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.alunos
      WHERE id = pagamentos.aluno_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Instrutores can view own payments"
  ON public.pagamentos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.instrutores
      WHERE id = pagamentos.instrutor_id AND user_id = auth.uid()
    )
  );

-- AVALIAÇÕES
CREATE POLICY "Public can view all ratings"
  ON public.avaliacoes FOR SELECT
  USING (true);

CREATE POLICY "Alunos can create ratings"
  ON public.avaliacoes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.alunos
      WHERE id = avaliacoes.aluno_id AND user_id = auth.uid()
    )
  );

-- PROGRESSO RENACH
CREATE POLICY "Alunos can view own progress"
  ON public.progresso_renach FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.alunos
      WHERE id = progresso_renach.aluno_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Alunos can update own progress"
  ON public.progresso_renach FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.alunos
      WHERE id = progresso_renach.aluno_id AND user_id = auth.uid()
    )
  );

-- LOGS RENACH
CREATE POLICY "Alunos can view own logs"
  ON public.logs_renach FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.alunos
      WHERE id = logs_renach.aluno_id AND user_id = auth.uid()
    )
  );

-- ================================================
-- ÍNDICES PARA PERFORMANCE
-- ================================================

CREATE INDEX idx_alunos_user_id ON public.alunos(user_id);
CREATE INDEX idx_instrutores_user_id ON public.instrutores(user_id);
CREATE INDEX idx_instrutores_autoescola_id ON public.instrutores(autoescola_id);
CREATE INDEX idx_aulas_aluno_id ON public.aulas(aluno_id);
CREATE INDEX idx_aulas_instrutor_id ON public.aulas(instrutor_id);
CREATE INDEX idx_aulas_data_hora ON public.aulas(data_hora);
CREATE INDEX idx_aulas_status ON public.aulas(status);
CREATE INDEX idx_pagamentos_aluno_id ON public.pagamentos(aluno_id);
CREATE INDEX idx_pagamentos_instrutor_id ON public.pagamentos(instrutor_id);
CREATE INDEX idx_disponibilidade_instrutor_id ON public.disponibilidade(instrutor_id);
CREATE INDEX idx_veiculos_instrutor_id ON public.veiculos(instrutor_id);
CREATE INDEX idx_avaliacoes_instrutor_id ON public.avaliacoes(instrutor_id);
