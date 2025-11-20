import { createServerClient } from '@/lib/supabase/server'

type DashboardProfile = {
  id: string
  email: string
  full_name: string | null
}

type DashboardWallet = {
  id: string
  balance: number
}

export type DashboardInitialData = {
  profile: DashboardProfile | null
  wallet: DashboardWallet | null
  ticketsCount: number
}

const INITIAL_FALLBACK: DashboardInitialData = {
  profile: null,
  wallet: null,
  ticketsCount: 0,
}

export type UserTicket = {
  id: string
  status: string | null
  purchaseDate: string | null
  createdAt: string | null
}

export type UserTransaction = {
  id: string
  amount: number
  type: string
  createdAt: string | null
}

export type DrawHistoryItem = {
  id: string
  prizeAmount: number
  status: string | null
  drawDate: string | null
  completedAt: string | null
  winnerTicketId: string | null
}

export async function getDashboardInitialData(): Promise<DashboardInitialData> {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
      console.error('[Dashboard] Erro ao obter usuario logado.', userError)
    }

    if (!user) {
      return INITIAL_FALLBACK
    }

    const [profileResult, walletResult, ticketsResult] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, email, full_name')
        .eq('id', user.id)
        .maybeSingle(),
      supabase
        .from('wallets')
        .select('id, balance')
        .eq('user_id', user.id)
        .maybeSingle(),
      supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'active'),
    ])

    if (profileResult.error) {
      console.error('[Dashboard] Erro ao carregar perfil.', profileResult.error)
    }

    if (walletResult.error) {
      console.error('[Dashboard] Erro ao carregar carteira.', walletResult.error)
    }

    if (ticketsResult.error) {
      console.error('[Dashboard] Erro ao contar bilhetes.', ticketsResult.error)
    }

    return {
      profile: profileResult.data ?? null,
      wallet: walletResult.data
        ? { ...walletResult.data, balance: Number(walletResult.data.balance ?? 0) }
        : null,
      ticketsCount: ticketsResult.count ?? 0,
    }
  } catch (error) {
    console.error('[Dashboard] Falha inesperada ao carregar dados iniciais.', error)
    return INITIAL_FALLBACK
  }
}

export async function getUserTickets(userId: string): Promise<UserTicket[]> {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('tickets')
      .select('id, status, purchase_date, created_at')
      .eq('user_id', userId)
      .order('purchase_date', { ascending: false })
      .limit(20)

    if (error) {
      console.error('[Dashboard] Erro ao buscar tickets do usuario.', error)
      return []
    }

    return (
      data?.map((ticket) => ({
        id: ticket.id,
        status: ticket.status ?? null,
        purchaseDate: ticket.purchase_date ?? null,
        createdAt: ticket.created_at ?? null,
      })) ?? []
    )
  } catch (error) {
    console.error('[Dashboard] Falha inesperada ao carregar tickets do usuario.', error)
    return []
  }
}

export async function getUserTransactions(userId: string): Promise<UserTransaction[]> {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('transactions')
      .select('id, amount, type, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20) // TODO: adicionar paginacao se necessario

    if (error) {
      console.error('[Dashboard] Erro ao buscar transacoes do usuario.', error)
      return []
    }

    return (
      data?.map((tx) => ({
        id: tx.id,
        amount: Number(tx.amount ?? 0),
        type: tx.type ?? '',
        createdAt: tx.created_at ?? null,
      })) ?? []
    )
  } catch (error) {
    console.error('[Dashboard] Falha inesperada ao carregar transacoes do usuario.', error)
    return []
  }
}

export async function getRecentDraws(): Promise<DrawHistoryItem[]> {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('draws')
      .select('id, prize_amount, status, draw_date, completed_at, winner_ticket_id')
      .order('draw_date', { ascending: false })
      .limit(10)

    if (error) {
      console.error('[Dashboard] Erro ao buscar sorteios.', error)
      return []
    }

    return (
      data?.map((draw) => ({
        id: draw.id,
        prizeAmount: Number(draw.prize_amount ?? 0),
        status: draw.status ?? null,
        drawDate: draw.draw_date ?? null,
        completedAt: draw.completed_at ?? null,
        winnerTicketId: draw.winner_ticket_id ?? null,
      })) ?? []
    )
  } catch (error) {
    console.error('[Dashboard] Falha inesperada ao carregar sorteios.', error)
    return []
  }
}
