-- Problema 1: Remover INSERT irrestrito em notifications
-- Edge Functions usam service role key que bypassa RLS automaticamente
DROP POLICY IF EXISTS "Service role can insert notifications" ON notifications;

-- Problema 2: Remover policy duplicada em veiculos (mesma condição da "Authenticated")
DROP POLICY IF EXISTS "Public can view active instructor vehicles" ON veiculos;

-- Problema 2: Remover policy morta (PERMISSIVE com false não bloqueia nada)
DROP POLICY IF EXISTS "Block anonymous access to veiculos" ON veiculos;