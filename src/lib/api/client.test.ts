import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, apiFetch } from './client';

let cookieValues: Record<string, string> = {};
vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) =>
      name in cookieValues ? { name, value: cookieValues[name] } : undefined,
  }),
}));

// O redirect real lança um erro especial do Next; aqui lança um comum.
const redirectMock = vi.fn((path: string) => {
  throw new Error(`redirect:${path}`);
});
vi.mock('next/navigation', () => ({
  redirect: (path: string) => redirectMock(path),
}));

function mockFetch(status: number, body: unknown) {
  const fetchMock = vi.fn().mockResolvedValue(
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  );
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('apiFetch', () => {
  beforeEach(() => {
    cookieValues = {};
    redirectMock.mockClear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('chama a API na URL configurada e devolve o JSON', async () => {
    const fetchMock = mockFetch(200, { status: 'ok' });

    const result = await apiFetch<{ status: string }>('/health');

    expect(result).toEqual({ status: 'ok' });
    expect(fetchMock.mock.calls[0][0].toString()).toBe(
      'http://api.test/health',
    );
  });

  it('lança ApiError com status e corpo quando a resposta não é 2xx', async () => {
    mockFetch(503, { status: 'error' });

    const error = await apiFetch('/health').catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 503, body: { status: 'error' } });
  });

  it('repassa o access token do cookie do site para a API', async () => {
    cookieValues = { access_token: 'aaa', refresh_token: 'rrr' };
    const fetchMock = mockFetch(200, {});

    await apiFetch('/transacoes');

    // Só o access: o refresh nunca sai do site em chamadas comuns.
    expect(fetchMock.mock.calls[0][1].headers.Cookie).toBe('access_token=aaa');
  });

  it('sem cookie não envia o cabeçalho Cookie', async () => {
    const fetchMock = mockFetch(200, {});

    await apiFetch('/health');

    expect(fetchMock.mock.calls[0][1].headers.Cookie).toBeUndefined();
  });

  it('401 da API manda para o login', async () => {
    mockFetch(401, { code: 'UNAUTHORIZED' });

    await expect(apiFetch('/transacoes')).rejects.toThrow('redirect:/login');
  });
});
