-- RPC transacional para execução de sorteio genérico
CREATE OR REPLACE FUNCTION public.perform_draw(
    p_prize_amount NUMERIC,
    p_draw_type TEXT DEFAULT 'manual'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_ticket RECORD;
    v_ticket_count INT;
    v_result JSON;
BEGIN
    -- TODO: permitir filtros por período/campanha na seleção de tickets elegíveis
    SELECT count(*) INTO v_ticket_count
    FROM public.tickets;

    IF v_ticket_count = 0 THEN
        RAISE EXCEPTION 'Nenhum ticket elegivel para sorteio';
    END IF;

    SELECT *
    INTO v_ticket
    FROM public.tickets
    ORDER BY random()
    LIMIT 1;

    INSERT INTO public.draws (
        prize_amount,
        status,
        winner_ticket_id,
        draw_date,
        created_at,
        completed_at
    )
    VALUES (
        p_prize_amount,
        'completed',
        v_ticket.id,
        NOW(),
        NOW(),
        NOW()
    );

    INSERT INTO public.transactions (user_id, amount, type, ticket_id, draw_id, created_at)
    VALUES (v_ticket.user_id, p_prize_amount, 'prize', v_ticket.id, NULL, NOW());

    UPDATE public.wallets
    SET balance = balance + p_prize_amount,
        updated_at = NOW()
    WHERE user_id = v_ticket.user_id;

    v_result := json_build_object(
        'winner_user_id', v_ticket.user_id,
        'winner_ticket_id', v_ticket.id,
        'amount', p_prize_amount,
        'draw_type', coalesce(p_draw_type, 'manual'),
        'total_tickets', v_ticket_count
    );

    RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.perform_draw(NUMERIC, TEXT) TO authenticated;
