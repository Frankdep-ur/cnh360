-- Adiciona campo para modo de transição SP no perfil
ALTER TABLE public.profiles 
ADD COLUMN modo_transicao text DEFAULT NULL CHECK (modo_transicao IN ('atual', 'nova_lei', NULL));

-- Adiciona campo para estado do usuário (para detectar SP)
ALTER TABLE public.profiles 
ADD COLUMN estado text DEFAULT NULL;

-- Adiciona campo para indicar se instrutor é MEI autônomo
ALTER TABLE public.instrutores 
ADD COLUMN is_mei_autonomo boolean DEFAULT false;

-- Atualiza a tabela alunos para ter referência ao modo escolhido
ALTER TABLE public.alunos 
ADD COLUMN modo_transicao text DEFAULT NULL CHECK (modo_transicao IN ('atual', 'nova_lei', NULL));