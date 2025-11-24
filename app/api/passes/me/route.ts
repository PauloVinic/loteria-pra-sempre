import { NextResponse } from 'next/server'
import { handleError, requireUser } from '@/lib/api/supabase-rpc'

export async function GET() {
  try {
    const { supabase, user } = await requireUser()

    const { data, error } = await supabase
      .from('tickets')
      .select('id, ticket_type, face_value, status, purchase_date')
      .eq('user_id', user.id)
      .order('purchase_date', { ascending: false })

    if (error) throw error

    return NextResponse.json({ items: data ?? [] })
  } catch (error) {
    return handleError(error)
  }
}
