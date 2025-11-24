import { NextResponse } from 'next/server'
import { handleError, requireUser } from '@/lib/api/supabase-rpc'

export async function POST(request: Request) {
  try {
    const { amount } = (await request.json()) ?? {}
    const parsedAmount = Number(amount)

    if (!parsedAmount || parsedAmount <= 0) {
      return NextResponse.json(
        { error: 'amount deve ser numérico e maior que zero.' },
        { status: 400 }
      )
    }

    const { supabase, user } = await requireUser()

    const { data: withdrawalId, error: rpcError } = await supabase.rpc(
      'request_withdrawal',
      { p_user_id: user.id, p_amount: parsedAmount }
    )

    if (rpcError) throw rpcError

    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', user.id)
      .single()

    if (walletError) throw walletError

    return NextResponse.json({
      withdrawal_id: withdrawalId,
      status: 'pending',
      balance: Number(wallet?.balance ?? 0).toFixed(2),
    })
  } catch (error) {
    return handleError(error)
  }
}
