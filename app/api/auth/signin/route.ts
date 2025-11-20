import { NextResponse } from 'next/server'

// Mantido apenas como fallback temporario para clientes antigos.
export async function POST() {
  return NextResponse.json(
    { error: 'Este endpoint foi substituido por Server Actions em /login.' },
    { status: 410 }
  )
}
