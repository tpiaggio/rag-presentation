import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_PATHS = new Set(['/unlock', '/api/unlock'])

export function middleware(request: NextRequest) {
  const passcode = process.env.ACCESS_PASSCODE?.trim()
  if (!passcode) return NextResponse.next()

  const { pathname } = request.nextUrl
  if (PUBLIC_PATHS.has(pathname)) return NextResponse.next()

  const cookie = request.cookies.get('access')?.value
  if (cookie === passcode) return NextResponse.next()

  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const url = request.nextUrl.clone()
  url.pathname = '/unlock'
  return NextResponse.redirect(url)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon|tomas\\.jpg|.*\\.(?:png|jpg|jpeg|svg|css|js|woff|woff2|ico)).*)',
  ],
}
