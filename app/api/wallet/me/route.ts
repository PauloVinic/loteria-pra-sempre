import { NextResponse } from 'next/server'
import { handleError, requireUser } from '@/lib/api/supabase-rpc'

export async function GET() {
  try {
    const { supabase, user } = await requireUser()

    const { data, error } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', user.id)
      .single()

    if (error) throw error

    return NextResponse.json({ balance: Number(data?.balance ?? 0).toFixed(2) })
  } catch (error) {
    return handleError(error)
  }
}
