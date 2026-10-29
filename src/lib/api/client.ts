import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
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

// Requisição crua à API: devolve a Response (para quem precisa de cabeçalhos,
// como os Set-Cookie do login) e lança ApiError quando não é 2xx.
export async function apiRequest(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const response = await fetch(new URL(path, env.API_URL), {
    ...init,
    headers: { Accept: 'application/json', ...init?.headers },
  });

  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    throw new ApiError(response.status, body);
  }

  return response;
}

// Cliente HTTP da API, usado em Server Components e Server Actions.
// O tipo da resposta vem de quem chama: apiFetch<MinhaResposta>('/rota').
// Repassa o access token do cookie do site; o proxy já o renovou se precisava.
export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const accessToken = (await cookies()).get('access_token')?.value;

  try {
    const response = await apiRequest(path, {
      ...init,
      headers: {
        ...init?.headers,
        ...(accessToken ? { Cookie: `access_token=${accessToken}` } : {}),
      },
    });
    return (await response.json().catch(() => null)) as T;
  } catch (error) {
    // 401 mesmo depois do proxy: sessão revogada no servidor. Volta ao login.
    if (error instanceof ApiError && error.status === 401) redirect('/login');
    throw error;
  }
}
