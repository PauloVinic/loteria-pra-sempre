import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  // Cria a resposta inicial
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables')
    return response
  }

  // Cria o cliente Supabase seguindo o padrão oficial do @supabase/ssr
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        // Atualiza os cookies na requisição
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value)
        })
        // Atualiza os cookies na resposta
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  // OBRIGATÓRIO: Chama getUser() para atualizar a sessão e verificar autenticação
  // Isso é mais seguro que getSession() pois valida o token
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Ignora arquivos estáticos e rotas do Next.js
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon')
  ) {
    return response
  }

  const isAuthPage = pathname === '/login' || pathname === '/'
  const isProtectedPage = pathname.startsWith('/dashboard')

  // Regra 1: Se o usuário NÃO tem user (error ou !user) E está tentando acessar rota protegida
  // -> Redireciona para /login
  if (isProtectedPage && (!user || authError)) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    const redirectResponse = NextResponse.redirect(url)
    
    // CRUCIAL: Copia todos os cookies atualizados da resposta para o redirect
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, {
        ...cookie,
        httpOnly: cookie.httpOnly,
        secure: cookie.secure,
        sameSite: cookie.sameSite,
        path: cookie.path,
      })
    })
    
    return redirectResponse
  }

  // Regra 2: Se o usuário TEM user E está tentando acessar /login ou / (root)
  // -> Redireciona para /dashboard
  if (isAuthPage && user && !authError) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    const redirectResponse = NextResponse.redirect(url)
    
    // CRUCIAL: Copia todos os cookies atualizados da resposta para o redirect
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, {
        ...cookie,
        httpOnly: cookie.httpOnly,
        secure: cookie.secure,
        sameSite: cookie.sameSite,
        path: cookie.path,
      })
    })
    
    return redirectResponse
  }

  // Retorna a resposta com os cookies atualizados
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api routes
     * - static files (images, etc)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
