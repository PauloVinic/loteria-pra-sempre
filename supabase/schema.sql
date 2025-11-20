-- ============================================================================
-- LOTERIA PRA SEMPRE - SCHEMA SQL COMPLETO
-- PostgreSQL / Supabase
-- ============================================================================

-- ============================================================================
-- EXTENSÕES
-- ============================================================================

-- Habilita UUID v4 para geração automática de IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABELAS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- profiles: Tabela pública espelhando auth.users
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice para melhor performance em consultas por email
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Comentários para documentação
COMMENT ON TABLE public.profiles IS 'Perfis de usuários espelhando auth.users';
COMMENT ON COLUMN public.profiles.id IS 'ID do usuário (FK para auth.users)';
COMMENT ON COLUMN public.profiles.email IS 'Email do usuário';
COMMENT ON COLUMN public.profiles.full_name IS 'Nome completo do usuário';
COMMENT ON COLUMN public.profiles.created_at IS 'Data de criação do perfil';
COMMENT ON COLUMN public.profiles.updated_at IS 'Data da última atualização';

-- ----------------------------------------------------------------------------
-- wallets: Saldo do usuário
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Constraint para garantir que balance >= 0
    CONSTRAINT check_balance_non_negative CHECK (balance >= 0)
);

-- Índice para melhor performance em consultas por user_id
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON public.wallets(user_id);

-- Comentários para documentação
COMMENT ON TABLE public.wallets IS 'Carteiras de saldo dos usuários';
COMMENT ON COLUMN public.wallets.id IS 'ID único da carteira';
COMMENT ON COLUMN public.wallets.user_id IS 'ID do usuário proprietário (FK para profiles)';
COMMENT ON COLUMN public.wallets.balance IS 'Saldo atual da carteira (deve ser >= 0)';
COMMENT ON CONSTRAINT check_balance_non_negative ON public.wallets IS 'Garante que o saldo nunca seja negativo';

-- ----------------------------------------------------------------------------
-- tickets: Bilhetes perpétuos
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'won')),
    purchase_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON public.tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_purchase_date ON public.tickets(purchase_date);

-- Comentários para documentação
COMMENT ON TABLE public.tickets IS 'Bilhetes perpétuos dos usuários';
COMMENT ON COLUMN public.tickets.id IS 'ID único do bilhete';
COMMENT ON COLUMN public.tickets.user_id IS 'ID do usuário proprietário (FK para profiles)';
COMMENT ON COLUMN public.tickets.status IS 'Status do bilhete: active ou won';
COMMENT ON COLUMN public.tickets.purchase_date IS 'Data de compra do bilhete';

-- ----------------------------------------------------------------------------
-- draws: Sorteios mensais
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.draws (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prize_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'completed')),
    winner_ticket_id UUID REFERENCES public.tickets(id) ON DELETE SET NULL,
    draw_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_draws_status ON public.draws(status);
CREATE INDEX IF NOT EXISTS idx_draws_draw_date ON public.draws(draw_date);
CREATE INDEX IF NOT EXISTS idx_draws_winner_ticket_id ON public.draws(winner_ticket_id);

-- Comentários para documentação
COMMENT ON TABLE public.draws IS 'Sorteios mensais da loteria';
COMMENT ON COLUMN public.draws.id IS 'ID único do sorteio';
COMMENT ON COLUMN public.draws.prize_amount IS 'Valor do prêmio do sorteio';
COMMENT ON COLUMN public.draws.status IS 'Status do sorteio: open ou completed';
COMMENT ON COLUMN public.draws.winner_ticket_id IS 'ID do bilhete vencedor (FK para tickets, nullable)';
COMMENT ON COLUMN public.draws.draw_date IS 'Data do sorteio';

-- ----------------------------------------------------------------------------
-- transactions: Histórico financeiro imutável
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('deposit', 'purchase', 'prize')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Campos opcionais para referência
    ticket_id UUID REFERENCES public.tickets(id) ON DELETE SET NULL,
    draw_id UUID REFERENCES public.draws(id) ON DELETE SET NULL
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_ticket_id ON public.transactions(ticket_id);
CREATE INDEX IF NOT EXISTS idx_transactions_draw_id ON public.transactions(draw_id);

-- Comentários para documentação
COMMENT ON TABLE public.transactions IS 'Histórico financeiro imutável de todas as transações';
COMMENT ON COLUMN public.transactions.id IS 'ID único da transação';
COMMENT ON COLUMN public.transactions.user_id IS 'ID do usuário (FK para profiles)';
COMMENT ON COLUMN public.transactions.amount IS 'Valor da transação (positivo para depósito/prêmio, negativo para compra)';
COMMENT ON COLUMN public.transactions.type IS 'Tipo da transação: deposit, purchase ou prize';
COMMENT ON COLUMN public.transactions.created_at IS 'Data de criação da transação (imutável)';

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Habilita RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLÍTICAS RLS - SELECT (Usuário vê apenas seus próprios dados)
-- ============================================================================

-- Política SELECT para profiles: usuário vê apenas seu próprio perfil
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

-- Política SELECT para wallets: usuário vê apenas sua própria carteira
DROP POLICY IF EXISTS "Users can view own wallet" ON public.wallets;
CREATE POLICY "Users can view own wallet"
    ON public.wallets
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Política SELECT para tickets: usuário vê apenas seus próprios bilhetes
DROP POLICY IF EXISTS "Users can view own tickets" ON public.tickets;
CREATE POLICY "Users can view own tickets"
    ON public.tickets
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Política SELECT para draws: todos podem ver sorteios (público)
DROP POLICY IF EXISTS "Anyone can view draws" ON public.draws;
CREATE POLICY "Anyone can view draws"
    ON public.draws
    FOR SELECT
    USING (true);

-- Política SELECT para transactions: usuário vê apenas suas próprias transações
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
CREATE POLICY "Users can view own transactions"
    ON public.transactions
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- ============================================================================
-- POLÍTICAS RLS - INSERT
-- ============================================================================

-- Política INSERT para profiles: apenas via função de servidor (trigger)
-- Não permitimos INSERT direto via API
DROP POLICY IF EXISTS "Profiles can only be created by server function" ON public.profiles;
CREATE POLICY "Profiles can only be created by server function"
    ON public.profiles
    FOR INSERT
    WITH CHECK (false);

-- Política INSERT para wallets: apenas via função de servidor (trigger)
-- Não permitimos INSERT direto via API
DROP POLICY IF EXISTS "Wallets can only be created by server function" ON public.wallets;
CREATE POLICY "Wallets can only be created by server function"
    ON public.wallets
    FOR INSERT
    WITH CHECK (false);

-- Política INSERT para tickets: usuário pode criar seus próprios bilhetes
-- (mas na prática será via função que valida saldo)
DROP POLICY IF EXISTS "Users can create own tickets" ON public.tickets;
CREATE POLICY "Users can create own tickets"
    ON public.tickets
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Política INSERT para draws: apenas administradores (via função de servidor)
DROP POLICY IF EXISTS "Draws can only be created by server function" ON public.draws;
CREATE POLICY "Draws can only be created by server function"
    ON public.draws
    FOR INSERT
    WITH CHECK (false);

-- Política INSERT para transactions: usuário cria apenas suas próprias transações
DROP POLICY IF EXISTS "Transactions can only be created by server function" ON public.transactions;
CREATE POLICY "Users can create own transactions"
    ON public.transactions
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- POLÍTICAS RLS - UPDATE
-- ============================================================================

-- Política UPDATE para profiles: usuário pode atualizar apenas seu próprio perfil
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Política UPDATE para wallets: usuário pode atualizar apenas sua própria carteira
DROP POLICY IF EXISTS "Wallets cannot be updated via API" ON public.wallets;
CREATE POLICY "Users can update own wallet"
    ON public.wallets
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Política UPDATE para tickets: usuário pode atualizar apenas seus próprios bilhetes
-- (mudanças de status via funções seguras)
DROP POLICY IF EXISTS "Users can update own tickets" ON public.tickets;
CREATE POLICY "Users can update own tickets"
    ON public.tickets
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Política UPDATE para draws: apenas via função de servidor
DROP POLICY IF EXISTS "Draws can only be updated by server function" ON public.draws;
CREATE POLICY "Draws can only be updated by server function"
    ON public.draws
    FOR UPDATE
    USING (false);

-- Política UPDATE para transactions: tabela imutável (sem UPDATE)
DROP POLICY IF EXISTS "Transactions are immutable" ON public.transactions;
CREATE POLICY "Transactions are immutable"
    ON public.transactions
    FOR UPDATE
    USING (false);

-- ============================================================================
-- POLÍTICAS RLS - DELETE
-- ============================================================================

-- DELETE geralmente não é permitido para manter integridade histórica

-- ============================================================================
-- FUNÇÕES DE SERVIDOR
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Função: handle_new_user()
-- Cria automaticamente profile e wallet quando um novo usuário se cadastra
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Insere o perfil do novo usuário
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    );

    -- Insere a carteira com saldo inicial 0
    INSERT INTO public.wallets (user_id, balance)
    VALUES (NEW.id, 0.00);

    RETURN NEW;
END;
$$;

-- Comentário da função
COMMENT ON FUNCTION public.handle_new_user() IS 'Cria automaticamente profile e wallet quando um novo usuário se cadastra no auth.users';

-- ----------------------------------------------------------------------------
-- Função: update_wallet_balance()
-- Atualiza o saldo da carteira de forma segura (apenas via função)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_wallet_balance(
    p_user_id UUID,
    p_amount NUMERIC
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_new_balance NUMERIC;
BEGIN
    -- Atualiza o saldo
    UPDATE public.wallets
    SET 
        balance = balance + p_amount,
        updated_at = NOW()
    WHERE user_id = p_user_id
    RETURNING balance INTO v_new_balance;

    -- Verifica se o saldo ficou negativo (a constraint também protege)
    IF v_new_balance < 0 THEN
        RAISE EXCEPTION 'Insufficient balance. Current balance: %', v_new_balance;
    END IF;

    RETURN TRUE;
END;
$$;

-- Comentário da função
COMMENT ON FUNCTION public.update_wallet_balance(UUID, NUMERIC) IS 'Atualiza o saldo da carteira de forma segura. Apenas funções de servidor devem usar esta função.';

-- ----------------------------------------------------------------------------
-- Função: create_transaction()
-- Cria uma transação no histórico (apenas via função de servidor)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_transaction(
    p_user_id UUID,
    p_amount NUMERIC,
    p_type TEXT,
    p_ticket_id UUID DEFAULT NULL,
    p_draw_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_transaction_id UUID;
BEGIN
    -- Valida o tipo de transação
    IF p_type NOT IN ('deposit', 'purchase', 'prize') THEN
        RAISE EXCEPTION 'Invalid transaction type: %', p_type;
    END IF;

    -- Insere a transação
    INSERT INTO public.transactions (user_id, amount, type, ticket_id, draw_id)
    VALUES (p_user_id, p_amount, p_type, p_ticket_id, p_draw_id)
    RETURNING id INTO v_transaction_id;

    RETURN v_transaction_id;
END;
$$;

-- Comentário da função
COMMENT ON FUNCTION public.create_transaction(UUID, NUMERIC, TEXT, UUID, UUID) IS 'Cria uma transação no histórico financeiro. Apenas funções de servidor devem usar esta função.';

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Trigger: on_auth_user_created
-- Dispara quando um novo usuário é criado em auth.users
-- ----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Comentário do trigger
COMMENT ON TRIGGER on_auth_user_created ON auth.users IS 'Cria automaticamente profile e wallet quando um novo usuário se cadastra';

-- ----------------------------------------------------------------------------
-- Trigger: update_profiles_updated_at
-- Atualiza o campo updated_at automaticamente
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_wallets_updated_at ON public.wallets;
CREATE TRIGGER update_wallets_updated_at
    BEFORE UPDATE ON public.wallets
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- GRANTS (Permissões)
-- ============================================================================

-- Permite que usuários autenticados leiam suas próprias tabelas (via RLS)
-- As políticas RLS já controlam o acesso, mas garantimos as permissões básicas

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, UPDATE ON public.wallets TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.tickets TO authenticated;
GRANT SELECT ON public.draws TO authenticated;
GRANT SELECT, INSERT ON public.transactions TO authenticated;

-- Permite que funções de servidor executem operações necessárias
GRANT ALL ON public.profiles TO service_role;
GRANT ALL ON public.wallets TO service_role;
GRANT ALL ON public.tickets TO service_role;
GRANT ALL ON public.draws TO service_role;
GRANT ALL ON public.transactions TO service_role;

-- ============================================================================
-- FIM DO SCHEMA
-- ============================================================================
