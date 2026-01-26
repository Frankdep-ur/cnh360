-- Permitir participantes atualizar mensagens (para marcar como lida)
CREATE POLICY "Participantes podem atualizar read_at" 
ON public.mensagens_aula 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM aulas a
  JOIN alunos al ON a.aluno_id = al.id
  JOIN instrutores i ON a.instrutor_id = i.id
  WHERE a.id = mensagens_aula.aula_id 
  AND (al.user_id = auth.uid() OR i.user_id = auth.uid())
))
WITH CHECK (EXISTS (
  SELECT 1 FROM aulas a
  JOIN alunos al ON a.aluno_id = al.id
  JOIN instrutores i ON a.instrutor_id = i.id
  WHERE a.id = mensagens_aula.aula_id 
  AND (al.user_id = auth.uid() OR i.user_id = auth.uid())
));