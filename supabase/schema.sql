-- ============================================================================
-- LOTERIA PRA SEMPRE - SCHEMA SQL COMPLETO (REFATORADO PARA PASSES E WALLET DE PREMIO)
-- PostgreSQL / Supabase
-- ============================================================================

-- ============================================================================
-- EXTENSOES
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- RESET DE ESTRUTURAS DEPENDENTES (GARANTE COMPATIBILIDADE COM NOVO MODELO)
-- ============================================================================
-- Para aplicar o novo modelo de passes e transacoes, removemos tabelas dependentes
-- legadas antes de recriar com a estrutura atualizada.
DROP TABLE IF EXISTS public.withdrawals CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.draws CASCADE;
DROP TABLE IF EXISTS public.tickets CASCADE;
DROP TABLE IF EXISTS public.ticket_types CASCADE;

-- ============================================================================
-- TABELAS
-- ============================================================================

-- profiles: Tabela publica espelhando auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

COMMENT ON TABLE public.profiles IS 'Perfis de usuarios espelhando auth.users';
COMMENT ON COLUMN public.profiles.id IS 'ID do usuario (FK para auth.users)';
COMMENT ON COLUMN public.profiles.email IS 'Email do usuario';
COMMENT ON COLUMN public.profiles.full_name IS 'Nome completo do usuario';
COMMENT ON COLUMN public.profiles.created_at IS 'Data de criacao do perfil';
COMMENT ON COLUMN public.profiles.updated_at IS 'Data da ultima atualizacao';

-- wallets: saldo exclusivamente de premios
CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT check_balance_non_negative CHECK (balance >= 0)
);

CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON public.wallets(user_id);

COMMENT ON TABLE public.wallets IS 'Carteira que guarda exclusivamente saldo de premios (nao recebe depositos externos)';
COMMENT ON COLUMN public.wallets.id IS 'ID unico da carteira';
COMMENT ON COLUMN public.wallets.user_id IS 'ID do usuario proprietario (FK para profiles)';
COMMENT ON COLUMN public.wallets.balance IS 'Saldo atual de premios disponivel para compra de passes ou saque (nunca negativo)';
COMMENT ON CONSTRAINT check_balance_non_negative ON public.wallets IS 'Garante que o saldo nunca seja negativo';

-- ticket_types: tipos oficiais e imutaveis de Passe
CREATE TABLE IF NOT EXISTS public.ticket_types (
    id TEXT PRIMARY KEY,
    value NUMERIC(12, 2) NOT NULL,
    description TEXT
);

COMMENT ON TABLE public.ticket_types IS 'Tipos oficiais de Passe (imutaveis): P10, P50, P100';
COMMENT ON COLUMN public.ticket_types.id IS 'Identificador do tipo de Passe (ex: P10, P50, P100)';
COMMENT ON COLUMN public.ticket_types.value IS 'Valor fixo do Passe em unidades monetarias';
COMMENT ON COLUMN public.ticket_types.description IS 'Descricao curta do tipo de Passe';

INSERT INTO public.ticket_types (id, value, description) VALUES
    ('P10', 10.00, 'Passe de R$10'),
    ('P50', 50.00, 'Passe de R$50'),
    ('P100', 100.00, 'Passe de R$100')
ON CONFLICT (id) DO NOTHING;

-- tickets: Passes perpetuos
CREATE TABLE IF NOT EXISTS public.tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    ticket_type TEXT NOT NULL REFERENCES public.ticket_types(id),
    face_value NUMERIC(12, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'won')),
    purchase_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON public.tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_purchase_date ON public.tickets(purchase_date);
CREATE INDEX IF NOT EXISTS idx_tickets_ticket_type ON public.tickets(ticket_type);

COMMENT ON TABLE public.tickets IS 'Passes perpetuos comprados pelo usuario (tipos fixos P10, P50, P100)';
COMMENT ON COLUMN public.tickets.id IS 'ID unico do Passe';
COMMENT ON COLUMN public.tickets.user_id IS 'ID do usuario proprietario (FK para profiles)';
COMMENT ON COLUMN public.tickets.ticket_type IS 'Tipo oficial do Passe (FK para ticket_types)';
COMMENT ON COLUMN public.tickets.face_value IS 'Valor do Passe no momento da compra (copia do ticket_type para historico)';
COMMENT ON COLUMN public.tickets.status IS 'Status do Passe: active ou won';
COMMENT ON COLUMN public.tickets.purchase_date IS 'Data de compra do Passe';

-- draws: Sorteios mensais
CREATE TABLE IF NOT EXISTS public.draws (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prize_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'completed')),
    winner_ticket_id UUID REFERENCES public.tickets(id) ON DELETE SET NULL,
    draw_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_draws_status ON public.draws(status);
CREATE INDEX IF NOT EXISTS idx_draws_draw_date ON public.draws(draw_date);
CREATE INDEX IF NOT EXISTS idx_draws_winner_ticket_id ON public.draws(winner_ticket_id);

COMMENT ON TABLE public.draws IS 'Sorteios mensais da loteria';
COMMENT ON COLUMN public.draws.id IS 'ID unico do sorteio';
COMMENT ON COLUMN public.draws.prize_amount IS 'Valor do premio do sorteio';
COMMENT ON COLUMN public.draws.status IS 'Status do sorteio: open ou completed';
COMMENT ON COLUMN public.draws.winner_ticket_id IS 'ID do Passe vencedor (FK para tickets, nullable)';
COMMENT ON COLUMN public.draws.draw_date IS 'Data do sorteio';

-- transactions: Historico financeiro imutavel
CREATE TABLE IF NOT EXISTS public.transactions (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN (
        'PASS_PURCHASE_EXTERNAL',
        'PASS_PURCHASE_FROM_WALLET',
        'PRIZE_CREDIT',
        'WITHDRAWAL'
    )),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ticket_id UUID REFERENCES public.tickets(id) ON DELETE SET NULL,
    draw_id UUID REFERENCES public.draws(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_ticket_id ON public.transactions(ticket_id);
CREATE INDEX IF NOT EXISTS idx_transactions_draw_id ON public.transactions(draw_id);

COMMENT ON TABLE public.transactions IS 'Historico financeiro imutavel: compra de passes (externa ou via wallet), creditos de premio e saques';
COMMENT ON COLUMN public.transactions.id IS 'ID unico da transacao (sequencial)';
COMMENT ON COLUMN public.transactions.user_id IS 'ID do usuario (FK para profiles)';
COMMENT ON COLUMN public.transactions.amount IS 'Valor da transacao (positivo para creditos, negativo para debitos da wallet)';
COMMENT ON COLUMN public.transactions.type IS 'Tipo: PASS_PURCHASE_EXTERNAL (nao altera wallet), PASS_PURCHASE_FROM_WALLET (debito wallet), PRIZE_CREDIT (credito wallet), WITHDRAWAL (debito wallet)';
COMMENT ON COLUMN public.transactions.created_at IS 'Data de criacao da transacao (imutavel)';

-- withdrawals: solicitacoes de saque do saldo de premios
CREATE TABLE IF NOT EXISTS public.withdrawals (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    transaction_id BIGINT NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'paid', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id ON public.withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON public.withdrawals(status);

COMMENT ON TABLE public.withdrawals IS 'Solicitacoes de saque do saldo de premios (ligadas a transacoes WITHDRAWAL)';
COMMENT ON COLUMN public.withdrawals.id IS 'ID unico da solicitacao de saque';
COMMENT ON COLUMN public.withdrawals.user_id IS 'ID do usuario solicitante (FK para profiles)';
COMMENT ON COLUMN public.withdrawals.transaction_id IS 'Transacao WITHDRAWAL associada';
COMMENT ON COLUMN public.withdrawals.amount IS 'Valor solicitado para saque';
COMMENT ON COLUMN public.withdrawals.status IS 'Status do saque: pending, processing, paid ou rejected';
COMMENT ON COLUMN public.withdrawals.created_at IS 'Data de criacao da solicitacao de saque';
COMMENT ON COLUMN public.withdrawals.updated_at IS 'Data da ultima atualizacao da solicitacao';

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

-- SELECT policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view own wallet" ON public.wallets;
CREATE POLICY "Users can view own wallet"
    ON public.wallets
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own tickets" ON public.tickets;
CREATE POLICY "Users can view own tickets"
    ON public.tickets
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can view draws" ON public.draws;
CREATE POLICY "Anyone can view draws"
    ON public.draws
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
CREATE POLICY "Users can view own transactions"
    ON public.transactions
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own withdrawals" ON public.withdrawals;
CREATE POLICY "Users can view own withdrawals"
    ON public.withdrawals
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can view ticket_types" ON public.ticket_types;
CREATE POLICY "Anyone can view ticket_types"
    ON public.ticket_types
    FOR SELECT
    USING (true);

-- INSERT policies (bloqueio via API para tabelas sensiveis)
DROP POLICY IF EXISTS "Profiles can only be created by server function" ON public.profiles;
CREATE POLICY "Profiles can only be created by server function"
    ON public.profiles
    FOR INSERT
    WITH CHECK (false);

DROP POLICY IF EXISTS "Wallets can only be created by server function" ON public.wallets;
CREATE POLICY "Wallets can only be created by server function"
    ON public.wallets
    FOR INSERT
    WITH CHECK (false);

DROP POLICY IF EXISTS "Tickets can only be created by server function" ON public.tickets;
CREATE POLICY "Tickets can only be created by server function"
    ON public.tickets
    FOR INSERT
    WITH CHECK (false);

DROP POLICY IF EXISTS "Draws can only be created by server function" ON public.draws;
CREATE POLICY "Draws can only be created by server function"
    ON public.draws
    FOR INSERT
    WITH CHECK (false);

DROP POLICY IF EXISTS "Transactions can only be created by server function" ON public.transactions;
CREATE POLICY "Transactions can only be created by server function"
    ON public.transactions
    FOR INSERT
    WITH CHECK (false);

DROP POLICY IF EXISTS "Withdrawals can only be created by server function" ON public.withdrawals;
CREATE POLICY "Withdrawals can only be created by server function"
    ON public.withdrawals
    FOR INSERT
    WITH CHECK (false);

DROP POLICY IF EXISTS "ticket_types cannot be inserted via API" ON public.ticket_types;
CREATE POLICY "ticket_types cannot be inserted via API"
    ON public.ticket_types
    FOR INSERT
    WITH CHECK (false);

-- UPDATE policies
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Wallets cannot be updated via API" ON public.wallets;
CREATE POLICY "Wallets cannot be updated via API"
    ON public.wallets
    FOR UPDATE
    USING (false);

DROP POLICY IF EXISTS "Tickets cannot be updated via API" ON public.tickets;
CREATE POLICY "Tickets cannot be updated via API"
    ON public.tickets
    FOR UPDATE
    USING (false);

DROP POLICY IF EXISTS "Draws can only be updated by server function" ON public.draws;
CREATE POLICY "Draws can only be updated by server function"
    ON public.draws
    FOR UPDATE
    USING (false);

DROP POLICY IF EXISTS "Transactions are immutable" ON public.transactions;
CREATE POLICY "Transactions are immutable"
    ON public.transactions
    FOR UPDATE
    USING (false);

DROP POLICY IF EXISTS "Withdrawals can only be updated by server function" ON public.withdrawals;
CREATE POLICY "Withdrawals can only be updated by server function"
    ON public.withdrawals
    FOR UPDATE
    USING (false);

DROP POLICY IF EXISTS "ticket_types cannot be updated via API" ON public.ticket_types;
CREATE POLICY "ticket_types cannot be updated via API"
    ON public.ticket_types
    FOR UPDATE
    USING (false);

-- DELETE is not allowed (historico)

-- ============================================================================
-- FUNCOES DE SERVIDOR
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    );

    INSERT INTO public.wallets (user_id, balance)
    VALUES (NEW.id, 0.00);

    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_new_user() IS 'Cria automaticamente profile e wallet (saldo de premios) quando um novo usuario se cadastra no auth.users';

CREATE OR REPLACE FUNCTION public.update_wallet_balance(
    p_user_id UUID,
    p_amount NUMERIC,
    p_reason TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_new_balance NUMERIC;
BEGIN
    IF p_reason NOT IN ('PRIZE_CREDIT', 'PASS_PURCHASE_FROM_WALLET', 'WITHDRAWAL') THEN
        RAISE EXCEPTION 'Invalid wallet operation reason: %', p_reason;
    END IF;

    IF p_reason = 'PRIZE_CREDIT' AND p_amount <= 0 THEN
        RAISE EXCEPTION 'PRIZE_CREDIT must be positive. Provided: %', p_amount;
    END IF;

    IF p_reason IN ('PASS_PURCHASE_FROM_WALLET', 'WITHDRAWAL') AND p_amount >= 0 THEN
        RAISE EXCEPTION 'Debits must be negative for %', p_reason;
    END IF;

    UPDATE public.wallets
    SET 
        balance = balance + p_amount,
        updated_at = NOW()
    WHERE user_id = p_user_id
    RETURNING balance INTO v_new_balance;

    IF v_new_balance < 0 THEN
        RAISE EXCEPTION 'Insufficient balance. Current balance: %', v_new_balance;
    END IF;

    RETURN TRUE;
END;
$$;

COMMENT ON FUNCTION public.update_wallet_balance(UUID, NUMERIC, TEXT) IS 'Atualiza saldo de premios da wallet. Somente premios podem creditar; compras via wallet e saques debitam. Depositos externos sao proibidos.';

CREATE OR REPLACE FUNCTION public.create_transaction(
    p_user_id UUID,
    p_amount NUMERIC,
    p_type TEXT,
    p_ticket_id UUID DEFAULT NULL,
    p_draw_id UUID DEFAULT NULL
)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_transaction_id BIGINT;
BEGIN
    IF p_type NOT IN (
        'PASS_PURCHASE_EXTERNAL',
        'PASS_PURCHASE_FROM_WALLET',
        'PRIZE_CREDIT',
        'WITHDRAWAL'
    ) THEN
        RAISE EXCEPTION 'Invalid transaction type: %', p_type;
    END IF;

    INSERT INTO public.transactions (user_id, amount, type, ticket_id, draw_id)
    VALUES (p_user_id, p_amount, p_type, p_ticket_id, p_draw_id)
    RETURNING id INTO v_transaction_id;

    RETURN v_transaction_id;
END;
$$;

COMMENT ON FUNCTION public.create_transaction(UUID, NUMERIC, TEXT, UUID, UUID) IS 'Cria transacao imutavel com tipos restritos: compras de Passes (externa/wallet), credito de premio ou saque. Depositos externos nao sao permitidos.';

CREATE OR REPLACE FUNCTION public.create_pass_purchase(
    p_user_id UUID,
    p_items JSONB,
    p_source TEXT
)
RETURNS UUID[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_total NUMERIC(12, 2) := 0.00;
    v_ticket_type TEXT;
    v_quantity INT;
    v_unit NUMERIC(12, 2);
    v_ticket_id UUID;
    v_created UUID[];
    item RECORD;
BEGIN
    IF p_source NOT IN ('PASS_PURCHASE_EXTERNAL', 'PASS_PURCHASE_FROM_WALLET') THEN
        RAISE EXCEPTION 'Invalid purchase source: %', p_source;
    END IF;

    IF jsonb_typeof(p_items) <> 'array' THEN
        RAISE EXCEPTION 'p_items must be a JSON array of objects {ticket_type, quantity}';
    END IF;

    FOR item IN SELECT jsonb_array_elements(p_items) AS elem
    LOOP
        v_ticket_type := item.elem->>'ticket_type';
        v_quantity := COALESCE((item.elem->>'quantity')::INT, 0);

        IF v_ticket_type IS NULL THEN
            RAISE EXCEPTION 'ticket_type is required in each item';
        END IF;

        SELECT value INTO v_unit FROM public.ticket_types WHERE id = v_ticket_type;
        IF NOT FOUND THEN
            RAISE EXCEPTION 'Unknown ticket_type: %', v_ticket_type;
        END IF;

        IF v_quantity IS NULL OR v_quantity <= 0 THEN
            RAISE EXCEPTION 'quantity must be a positive integer for ticket_type %', v_ticket_type;
        END IF;

        v_total := v_total + (v_unit * v_quantity);

        FOR i IN 1..v_quantity LOOP
            INSERT INTO public.tickets (user_id, ticket_type, face_value)
            VALUES (p_user_id, v_ticket_type, v_unit)
            RETURNING id INTO v_ticket_id;

            v_created := array_append(v_created, v_ticket_id);
        END LOOP;
    END LOOP;

    IF v_total <= 0 THEN
        RAISE EXCEPTION 'Purchase total must be greater than zero';
    END IF;

    IF p_source = 'PASS_PURCHASE_FROM_WALLET' THEN
        PERFORM public.update_wallet_balance(p_user_id, -v_total, 'PASS_PURCHASE_FROM_WALLET');
        PERFORM public.create_transaction(p_user_id, -v_total, 'PASS_PURCHASE_FROM_WALLET', NULL, NULL);
    ELSE
        PERFORM public.create_transaction(p_user_id, v_total, 'PASS_PURCHASE_EXTERNAL', NULL, NULL);
    END IF;

    RETURN v_created;
END;
$$;

COMMENT ON FUNCTION public.create_pass_purchase(UUID, JSONB, TEXT) IS 'Cria Passes (P10, P50, P100) a partir de itens e registra transacao. Compra externa nao altera wallet; compra via wallet debita saldo de premios.';

CREATE OR REPLACE FUNCTION public.credit_prize(
    p_user_id UUID,
    p_ticket_id UUID,
    p_draw_id UUID,
    p_amount NUMERIC
)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_tx_id BIGINT;
BEGIN
    IF p_amount <= 0 THEN
        RAISE EXCEPTION 'Prize amount must be positive';
    END IF;

    PERFORM public.update_wallet_balance(p_user_id, p_amount, 'PRIZE_CREDIT');

    v_tx_id := public.create_transaction(p_user_id, p_amount, 'PRIZE_CREDIT', p_ticket_id, p_draw_id);

    RETURN v_tx_id;
END;
$$;

COMMENT ON FUNCTION public.credit_prize(UUID, UUID, UUID, NUMERIC) IS 'Credita premio na wallet (saldo de premios) e registra transacao PRIZE_CREDIT vinculada ao Passe e sorteio.';

CREATE OR REPLACE FUNCTION public.request_withdrawal(
    p_user_id UUID,
    p_amount NUMERIC
)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_tx_id BIGINT;
    v_withdrawal_id BIGINT;
BEGIN
    IF p_amount IS NULL OR p_amount <= 0 THEN
        RAISE EXCEPTION 'Withdrawal amount must be positive';
    END IF;

    PERFORM public.update_wallet_balance(p_user_id, -p_amount, 'WITHDRAWAL');

    v_tx_id := public.create_transaction(p_user_id, -p_amount, 'WITHDRAWAL', NULL, NULL);

    INSERT INTO public.withdrawals (user_id, transaction_id, amount, status)
    VALUES (p_user_id, v_tx_id, p_amount, 'pending')
    RETURNING id INTO v_withdrawal_id;

    RETURN v_withdrawal_id;
END;
$$;

COMMENT ON FUNCTION public.request_withdrawal(UUID, NUMERIC) IS 'Valida saldo, debita wallet de premios, cria transacao WITHDRAWAL e abre solicitacao de saque.';

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Cria o trigger de usuário novo apenas se houver permissão no auth.users.
DO $$
BEGIN
    BEGIN
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    EXCEPTION WHEN insufficient_privilege THEN
        RAISE NOTICE 'Sem permissao para remover trigger on auth.users; mantendo configuracao existente.';
    END;

    BEGIN
        CREATE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW
            EXECUTE FUNCTION public.handle_new_user();
    EXCEPTION
        WHEN duplicate_object THEN
            RAISE NOTICE 'Trigger on_auth_user_created ja existe em auth.users; mantendo.';
        WHEN insufficient_privilege THEN
            RAISE NOTICE 'Sem permissao para criar trigger on auth.users; ajuste manual necessario.';
    END;
END;
$$;

COMMENT ON TRIGGER on_auth_user_created ON auth.users IS 'Cria automaticamente profile e wallet (saldo de premios) quando um novo usuario se cadastra';

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

DROP TRIGGER IF EXISTS update_withdrawals_updated_at ON public.withdrawals;
CREATE TRIGGER update_withdrawals_updated_at
    BEFORE UPDATE ON public.withdrawals
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- GRANTS (Permissoes)
-- ============================================================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.wallets TO authenticated;
GRANT SELECT ON public.ticket_types TO authenticated;
GRANT SELECT ON public.tickets TO authenticated;
GRANT SELECT ON public.draws TO authenticated;
GRANT SELECT ON public.transactions TO authenticated;
GRANT SELECT ON public.withdrawals TO authenticated;

GRANT ALL ON public.profiles TO service_role;
GRANT ALL ON public.wallets TO service_role;
GRANT ALL ON public.ticket_types TO service_role;
GRANT ALL ON public.tickets TO service_role;
GRANT ALL ON public.draws TO service_role;
GRANT ALL ON public.transactions TO service_role;
GRANT ALL ON public.withdrawals TO service_role;

-- ============================================================================
-- FIM DO SCHEMA
-- ============================================================================
