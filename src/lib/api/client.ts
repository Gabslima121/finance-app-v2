import 'server-only';
import { env } from '@/lib/env';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly body: unknown,
  ) {
    super(`A API respondeu com status ${status}`);
    this.name = 'ApiError';
  }
}

// Cliente HTTP da API, usado em Server Components e Server Actions.
// O tipo da resposta vem de quem chama: apiFetch<MinhaResposta>('/rota').
export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(new URL(path, env.API_URL), {
    ...init,
    headers: { Accept: 'application/json', ...init?.headers },
  });

  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(response.status, body);
  }

  return body as T;
}
