import 'server-only';
import { apiRequest } from '@/lib/api/client';
import type { LoginInput } from './schemas';
import { parseSessionCookies, type SessionCookie } from './session-cookies';

class AuthApi {
  // A API responde 200 sem corpo e grava a sessão nos Set-Cookie.
  // Credenciais erradas: ApiError 401. Muitas tentativas: ApiError 429.
  async login(input: LoginInput): Promise<SessionCookie[]> {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    return parseSessionCookies(response.headers.getSetCookie());
  }

  // Troca o refresh token por um par novo (a API revoga o antigo).
  // Refresh inválido, expirado ou já usado: ApiError 401.
  async refresh(refreshToken: string): Promise<SessionCookie[]> {
    const response = await apiRequest('/auth/refresh', {
      method: 'POST',
      headers: { Cookie: `refresh_token=${refreshToken}` },
    });
    return parseSessionCookies(response.headers.getSetCookie());
  }

  // Revoga o refresh token na API. Idempotente: token já inválido também dá 204.
  async logout(refreshToken: string): Promise<void> {
    await apiRequest('/auth/logout', {
      method: 'POST',
      headers: { Cookie: `refresh_token=${refreshToken}` },
    });
  }
}

export const authApi = new AuthApi();
