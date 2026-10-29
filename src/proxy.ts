import { NextResponse, type NextRequest } from 'next/server';

// Checagem otimista: só olha se há cookie de sessão; quem valida o token é a
// API. Basta o refresh_token: com o access expirado, a página renova a sessão
// (T4) em vez de mandar para o login.
const SESSION_COOKIES = ['access_token', 'refresh_token'];
const PUBLIC_PATHS = ['/login'];

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (PUBLIC_PATHS.includes(pathname)) return NextResponse.next();

  const hasSession = SESSION_COOKIES.some((name) => request.cookies.has(name));
  if (hasSession) return NextResponse.next();

  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('next', pathname + search);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  // Fora: arquivos internos do Next e qualquer caminho com extensão (favicon, imagens).
  matcher: ['/((?!_next/static|_next/image|.*\\..*).*)'],
};
