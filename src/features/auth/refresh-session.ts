import 'server-only';
import { ApiError } from '@/lib/api/client';
import { authApi } from './api';
import type { SessionCookie } from './session-cookies';

export type RefreshResult =
  | { status: 'renewed'; cookies: SessionCookie[] }
  // A API recusou o refresh (expirado, revogado ou já usado): sessão acabou.
  | { status: 'invalid' }
  // A API não respondeu: não dá para dizer que a sessão acabou.
  | { status: 'unavailable' };

// Quanto tempo o resultado de um refresh fica guardado para pedidos que
// chegam com o token antigo (o navegador ainda não recebeu o cookie novo).
const REUSE_WINDOW_MS = 10_000;

// shortcut: memória do processo; vale para um servidor Next só. Com várias
// instâncias, o deduplicador precisa ir para um storage compartilhado (Redis).
const inFlight = new Map<
  string,
  { result: Promise<RefreshResult>; expiresAt: number }
>();

// O refresh token é rotativo: usar o mesmo duas vezes dá 401 na segunda.
// Pedidos simultâneos com o mesmo token (prefetch de vários links, abas)
// compartilham uma única chamada à API e recebem o mesmo par novo.
export function refreshSession(
  refreshToken: string,
  now: number = Date.now(),
): Promise<RefreshResult> {
  for (const [token, entry] of inFlight) {
    if (entry.expiresAt <= now) inFlight.delete(token);
  }

  const existing = inFlight.get(refreshToken);
  if (existing) return existing.result;

  const result = authApi.refresh(refreshToken).then(
    (cookies): RefreshResult => ({ status: 'renewed', cookies }),
    (error: unknown): RefreshResult =>
      error instanceof ApiError && error.status === 401
        ? { status: 'invalid' }
        : { status: 'unavailable' },
  );
  inFlight.set(refreshToken, { result, expiresAt: now + REUSE_WINDOW_MS });
  return result;
}
