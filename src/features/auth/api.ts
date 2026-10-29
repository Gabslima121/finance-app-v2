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
}

export const authApi = new AuthApi();
