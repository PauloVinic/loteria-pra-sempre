import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const email = body?.email as string
    const password = body?.password as string

    if (!email || !password) {
      return NextResponse.json({ error: 'Email e senha são obrigatórios' }, { status: 400 })
    }

    const responseCookies: Array<{ name: string; value: string; options?: any }> = []

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookies().getAll().map((c) => ({ name: c.name, value: c.value }))
          },
          setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
            cookiesToSet.forEach(({ name, value, options }) => {
              responseCookies.push({ name, value, options })
            })
          },
        } as any,
      }
    )

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const response = NextResponse.json({ user: data.user ?? null })

    // Escreve os cookies coletados pelo client do supabase na resposta
    responseCookies.forEach(({ name, value, options }) => {
      try {
        response.cookies.set({ name, value, ...options })
      } catch (err) {
        // ignorar problemas de set de cookie
      }
    })

    return response
  } catch (err: any) {
    console.error('API /api/auth/signin error:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
