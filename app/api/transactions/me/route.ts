import { NextResponse } from 'next/server'
import { handleError, requireUser } from '@/lib/api/supabase-rpc'

export async function GET() {
  try {
    const { supabase, user } = await requireUser()

    const { data, error } = await supabase
      .from('transactions')
      .select('id, type, amount, created_at, ticket_id, draw_id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ items: data ?? [] })
  } catch (error) {
    return handleError(error)
  }
}
