import { createServerClient } from '@/lib/supabase/server'

export type AdminUser = {
  id: string
  email: string
  createdAt: string | null
}

export type AdminWallet = {
  userId: string
  balance: number
  updatedAt: string | null
}

export type AdminTicket = {
  id: string
  userId: string
  createdAt: string | null
}

export type AdminTransaction = {
  id: string
  userId: string
  amount: number
  type: string
  createdAt: string | null
}

export type AdminDraw = {
  id: string
  winnerTicketId: string | null
  prizeAmount: number
  status: string | null
  drawDate: string | null
  completedAt: string | null
}

export async function getAllUsers(): Promise<AdminUser[]> {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[Admin] Erro ao carregar usuarios.', error)
      return []
    }

    return (
      data?.map((user) => ({
        id: user.id,
        email: user.email,
        createdAt: user.created_at ?? null,
      })) ?? []
    )
  } catch (error) {
    console.error('[Admin] Falha inesperada ao carregar usuarios.', error)
    return []
  }
}

export async function getAllWallets(): Promise<AdminWallet[]> {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('wallets')
      .select('user_id, balance, updated_at')
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('[Admin] Erro ao carregar wallets.', error)
      return []
    }

    return (
      data?.map((wallet) => ({
        userId: wallet.user_id,
        balance: Number(wallet.balance ?? 0),
        updatedAt: wallet.updated_at ?? null,
      })) ?? []
    )
  } catch (error) {
    console.error('[Admin] Falha inesperada ao carregar wallets.', error)
    return []
  }
}

export async function getAllTickets(): Promise<AdminTicket[]> {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('tickets')
      .select('id, user_id, created_at')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('[Admin] Erro ao carregar tickets.', error)
      return []
    }

    return (
      data?.map((ticket) => ({
        id: ticket.id,
        userId: ticket.user_id,
        createdAt: ticket.created_at ?? null,
      })) ?? []
    )
  } catch (error) {
    console.error('[Admin] Falha inesperada ao carregar tickets.', error)
    return []
  }
}

export async function getAllTransactions(): Promise<AdminTransaction[]> {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('transactions')
      .select('id, user_id, amount, type, created_at')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('[Admin] Erro ao carregar transacoes.', error)
      return []
    }

    return (
      data?.map((tx) => ({
        id: tx.id,
        userId: tx.user_id,
        amount: Number(tx.amount ?? 0),
        type: tx.type ?? '',
        createdAt: tx.created_at ?? null,
      })) ?? []
    )
  } catch (error) {
    console.error('[Admin] Falha inesperada ao carregar transacoes.', error)
    return []
  }
}

export async function getAllDraws(): Promise<AdminDraw[]> {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('draws')
      .select('id, winner_ticket_id, prize_amount, status, draw_date, completed_at')
      .order('draw_date', { ascending: false })
      .limit(20)

    if (error) {
      console.error('[Admin] Erro ao carregar sorteios.', error)
      return []
    }

    return (
      data?.map((draw) => ({
        id: draw.id,
        winnerTicketId: draw.winner_ticket_id ?? null,
        prizeAmount: Number(draw.prize_amount ?? 0),
        status: draw.status ?? null,
        drawDate: draw.draw_date ?? null,
        completedAt: draw.completed_at ?? null,
      })) ?? []
    )
  } catch (error) {
    console.error('[Admin] Falha inesperada ao carregar sorteios.', error)
    // TODO: implementar historico de sorteios quando a tabela draws estiver disponivel, se falhar
    return []
  }
}
