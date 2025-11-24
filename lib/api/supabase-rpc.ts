import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export async function requireUser() {
  const supabase = await createServerClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    throw new ApiError(401, 'Não autenticado')
  }

  return { supabase, user }
}

export function handleError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json({ error: error.message }, { status: error.status })
  }

  return NextResponse.json(
    { error: 'Erro inesperado ao processar a requisição.' },
    { status: 500 }
  )
}
