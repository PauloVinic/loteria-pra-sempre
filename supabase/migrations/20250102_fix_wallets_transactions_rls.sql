-- Ajusta RLS para wallets e transactions para permitir operações do próprio usuário autenticado.

-- Wallets: permitir SELECT e UPDATE apenas da própria wallet
DROP POLICY IF EXISTS "Users can view own wallet" ON public.wallets;
CREATE POLICY "Users can view own wallet"
  ON public.wallets
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Wallets cannot be updated via API" ON public.wallets;
CREATE POLICY "Users can update own wallet"
  ON public.wallets
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Transactions: permitir INSERT e SELECT apenas das próprias transações
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
CREATE POLICY "Users can view own transactions"
  ON public.transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Transactions can only be created by server function" ON public.transactions;
CREATE POLICY "Users can create own transactions"
  ON public.transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
