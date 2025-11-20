-- Permite deletar transações do próprio usuário (usado para rollback lógico em falha de compra)
DROP POLICY IF EXISTS "Users can delete own transactions" ON public.transactions;
CREATE POLICY "Users can delete own transactions"
  ON public.transactions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
