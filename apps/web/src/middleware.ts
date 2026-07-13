/**
 * Middleware Next.js — protege rotas autenticadas.
 * Redireciona para /login se não houver token no cookie.
 */
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/login', '/register', '/favicon.ico', '/admin']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Redireciona /funcionarios para /admin
  if (pathname === '/funcionarios') {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  // Permite rotas públicas e assets
  if (
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api')
  ) {
    return NextResponse.next()
  }

  // Verifica cookie de token (setado após login)
  const token = request.cookies.get('access_token')?.value
  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
