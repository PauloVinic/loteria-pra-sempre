-- RPC transacional para compra de bilhetes
CREATE OR REPLACE FUNCTION public.perform_ticket_purchase(
    p_user_id UUID,
    p_quantity INT,
    p_ticket_price NUMERIC
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    total_cost NUMERIC := p_quantity * p_ticket_price;
    i INT;
BEGIN
    IF p_quantity IS NULL OR p_quantity <= 0 THEN
        RAISE EXCEPTION 'Quantidade inválida';
    END IF;

    -- Debita a wallet garantindo saldo suficiente
    UPDATE public.wallets
    SET balance = balance - total_cost,
        updated_at = NOW()
    WHERE user_id = p_user_id
      AND balance >= total_cost;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Saldo insuficiente';
    END IF;

    -- Registra transação de compra (valor negativo)
    INSERT INTO public.transactions (user_id, amount, type, ticket_id, draw_id, created_at)
    VALUES (p_user_id, -total_cost, 'purchase', NULL, NULL, NOW());

    -- Cria os bilhetes
    FOR i IN 1..p_quantity LOOP
        INSERT INTO public.tickets (user_id, status, purchase_date, created_at)
        VALUES (p_user_id, 'active', NOW(), NOW());
    END LOOP;

    RETURN;
END;
$$;

GRANT EXECUTE ON FUNCTION public.perform_ticket_purchase(UUID, INT, NUMERIC) TO authenticated;
