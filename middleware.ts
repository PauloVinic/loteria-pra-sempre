import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { createMiddlewareClient } from '@/lib/supabase/server'

const PROTECTED_PREFIXES = ['/dashboard']
const AUTH_REDIRECT_PATHS = ['/login', '/']
const STATIC_EXTENSIONS = /\.(?:svg|png|jpg|jpeg|gif|webp|ico)$/i

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  if (shouldBypass(pathname)) {
    return NextResponse.next()
  }

  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createMiddlewareClient(request, response)
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (!user && requiresAuth(pathname)) {
    return redirectWithCookies(request, response, '/login')
  }

  if (user && !authError && shouldRedirectAuthenticatedUser(pathname)) {
    return redirectWithCookies(request, response, '/dashboard')
  }

  return response
}

function shouldBypass(pathname: string) {
  if (pathname.startsWith('/_next') || pathname.startsWith('/api')) {
    return true
  }

  if (STATIC_EXTENSIONS.test(pathname) || pathname.includes('.')) {
    return true
  }

  return false
}

function requiresAuth(pathname: string) {
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

function shouldRedirectAuthenticatedUser(pathname: string) {
  return AUTH_REDIRECT_PATHS.includes(pathname)
}

function redirectWithCookies(request: NextRequest, response: NextResponse, targetPath: string) {
  const url = new URL(targetPath, request.url)
  const redirectResponse = NextResponse.redirect(url)

  response.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie.name, cookie.value)
  })

  return redirectResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
