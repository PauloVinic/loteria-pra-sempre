-- Corrige policies da tabela tickets para permitir apenas inserção/visualização do próprio usuário autenticado.

-- Seleção: usuário autenticado vê apenas seus próprios bilhetes
DROP POLICY IF EXISTS "Users can view own tickets" ON public.tickets;
CREATE POLICY "Users can view own tickets"
  ON public.tickets
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Inserção: usuário autenticado cria bilhetes apenas para si
DROP POLICY IF EXISTS "Users can create own tickets" ON public.tickets;
CREATE POLICY "Users can create own tickets"
  ON public.tickets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
