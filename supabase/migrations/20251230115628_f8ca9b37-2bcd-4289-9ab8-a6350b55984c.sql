-- Tabela de módulos do curso teórico
CREATE TABLE public.curso_modulos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ordem INTEGER NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  icone TEXT NOT NULL DEFAULT 'BookOpen',
  duracao_estimada_minutos INTEGER NOT NULL DEFAULT 60,
  cor TEXT NOT NULL DEFAULT '#00c853',
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de aulas dentro de cada módulo
CREATE TABLE public.curso_aulas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  modulo_id UUID NOT NULL REFERENCES public.curso_modulos(id) ON DELETE CASCADE,
  ordem INTEGER NOT NULL,
  titulo TEXT NOT NULL,
  conteudo_texto TEXT NOT NULL,
  video_url TEXT,
  video_fonte TEXT,
  duracao_minutos INTEGER NOT NULL DEFAULT 10,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de perguntas do quiz de cada aula
CREATE TABLE public.curso_quiz_perguntas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  aula_id UUID NOT NULL REFERENCES public.curso_aulas(id) ON DELETE CASCADE,
  ordem INTEGER NOT NULL,
  pergunta TEXT NOT NULL,
  opcoes JSONB NOT NULL, -- Array de {letra: "A", texto: "..."}
  resposta_correta TEXT NOT NULL, -- Letra da resposta correta
  explicacao TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de progresso do aluno em cada aula
CREATE TABLE public.progresso_aulas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  aluno_id UUID NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
  aula_id UUID NOT NULL REFERENCES public.curso_aulas(id) ON DELETE CASCADE,
  iniciada_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  concluida_em TIMESTAMP WITH TIME ZONE,
  tempo_visualizado_segundos INTEGER NOT NULL DEFAULT 0,
  quiz_nota NUMERIC,
  quiz_aprovado BOOLEAN DEFAULT false,
  tentativas_quiz INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(aluno_id, aula_id)
);

-- Índices para performance
CREATE INDEX idx_curso_aulas_modulo ON public.curso_aulas(modulo_id);
CREATE INDEX idx_curso_quiz_aula ON public.curso_quiz_perguntas(aula_id);
CREATE INDEX idx_progresso_aulas_aluno ON public.progresso_aulas(aluno_id);
CREATE INDEX idx_progresso_aulas_aula ON public.progresso_aulas(aula_id);

-- Enable RLS
ALTER TABLE public.curso_modulos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curso_aulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curso_quiz_perguntas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progresso_aulas ENABLE ROW LEVEL SECURITY;

-- Políticas para curso_modulos (público pode ler módulos ativos)
CREATE POLICY "Anyone can view active modules"
  ON public.curso_modulos FOR SELECT
  USING (ativo = true);

-- Políticas para curso_aulas (público pode ler aulas ativas)
CREATE POLICY "Anyone can view active lessons"
  ON public.curso_aulas FOR SELECT
  USING (ativo = true);

-- Políticas para curso_quiz_perguntas (público pode ler perguntas)
CREATE POLICY "Anyone can view quiz questions"
  ON public.curso_quiz_perguntas FOR SELECT
  USING (true);

-- Políticas para progresso_aulas (alunos gerenciam próprio progresso)
CREATE POLICY "Students can view own progress"
  ON public.progresso_aulas FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.alunos
    WHERE alunos.id = progresso_aulas.aluno_id
    AND alunos.user_id = auth.uid()
  ));

CREATE POLICY "Students can insert own progress"
  ON public.progresso_aulas FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.alunos
    WHERE alunos.id = aluno_id
    AND alunos.user_id = auth.uid()
  ));

CREATE POLICY "Students can update own progress"
  ON public.progresso_aulas FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.alunos
    WHERE alunos.id = progresso_aulas.aluno_id
    AND alunos.user_id = auth.uid()
  ));

-- Trigger para updated_at
CREATE TRIGGER update_progresso_aulas_updated_at
  BEFORE UPDATE ON public.progresso_aulas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir os 5 módulos oficiais CONTRAN 1.020/2025
INSERT INTO public.curso_modulos (ordem, titulo, descricao, icone, duracao_estimada_minutos, cor) VALUES
(1, 'Legislação de Trânsito', 'Código de Trânsito Brasileiro, Sistema Nacional de Trânsito, sinalização, infrações e penalidades', 'Scale', 150, '#00c853'),
(2, 'Direção Defensiva', 'Técnicas de condução segura, condições adversas, prevenção de acidentes', 'Shield', 120, '#2196f3'),
(3, 'Primeiros Socorros', 'Procedimentos de emergência, sinalização de acidentes, socorro às vítimas', 'Heart', 90, '#f44336'),
(4, 'Meio Ambiente e Cidadania', 'Poluição veicular, cidadania no trânsito, relações interpessoais', 'Leaf', 60, '#4caf50'),
(5, 'Mecânica Básica', 'Funcionamento do veículo, manutenção preventiva, sistemas básicos', 'Wrench', 45, '#ff9800');