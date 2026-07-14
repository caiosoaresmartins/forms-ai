/**
 * Middleware Next.js — protege rotas autenticadas.
 * Redireciona para /login se não houver token no cookie.
 */
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/login', '/register', '/favicon.ico', '/portal']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Redireciona /funcionarios para /admin
  if (pathname === '/funcionarios') {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  // A landing page (/) é pública — permitir acesso direto
  if (pathname === '/') {
    return NextResponse.next()
  }

  // Permite rotas públicas e assets
  if (
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/forms') // Permite upload e análise de PDFs
  ) {
    return NextResponse.next()
  }

  // Verifica cookie de token (setado após login)
  const token = request.cookies.get('access_token')?.value
  
  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ detail: 'Não autorizado. Token ausente.' }, { status: 401 })
    }
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  try {
    // Valida criptograficamente o JWT gerado no login
    const { jwtVerify } = await import('jose')
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_for_local_dev')
    await jwtVerify(token, secret)
  } catch (err) {
    // Token inválido ou expirado
    request.cookies.delete('access_token')
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ detail: 'Não autorizado. Token inválido.' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
