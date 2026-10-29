import { NextResponse, type NextRequest } from 'next/server';
import {
  isAccessTokenExpiring,
  refreshSession,
  SESSION_COOKIE_OPTIONS,
} from '@/features/auth';

// Checagem otimista: só olha os cookies de sessão; quem valida o token é a
// API. Com o access expirado (ou quase), renova pelo refresh antes da página
// rodar, para o usuário não perceber.
const PUBLIC_PATHS = ['/login'];

export async function proxy(request: NextRequest) {
  if (PUBLIC_PATHS.includes(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get('access_token')?.value;
  const refreshToken = request.cookies.get('refresh_token')?.value;

  if (accessToken && !isAccessTokenExpiring(accessToken)) {
    return NextResponse.next();
  }
  if (!refreshToken) {
    return accessToken ? NextResponse.next() : redirectToLogin(request);
  }

  const result = await refreshSession(refreshToken);

  if (result.status === 'invalid') {
    const response = redirectToLogin(request);
    response.cookies.delete('access_token');
    response.cookies.delete('refresh_token');
    return response;
  }
  // API fora: segue com o que tem; a página mostra o erro dela.
  if (result.status === 'unavailable') return NextResponse.next();

  // Os cookies novos valem já nesta requisição (a página lê o access novo) e
  // voltam para o navegador no Set-Cookie da resposta.
  for (const { name, value } of result.cookies) {
    request.cookies.set(name, value);
  }
  const response = NextResponse.next({
    request: { headers: request.headers },
  });
  for (const { name, value, expires } of result.cookies) {
    response.cookies.set(name, value, { ...SESSION_COOKIE_OPTIONS, expires });
  }
  return response;
}

function redirectToLogin(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('next', pathname + search);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  // Fora: arquivos internos do Next e qualquer caminho com extensão (favicon, imagens).
  matcher: ['/((?!_next/static|_next/image|.*\\..*).*)'],
};
