import { afterEach, describe, expect, it, vi } from 'vitest';
import { refreshSession } from './refresh-session';

function mockApi(status: number, setCookies: string[] = []) {
  const headers = new Headers();
  for (const cookie of setCookies) headers.append('Set-Cookie', cookie);
  const fetchMock = vi
    .fn()
    .mockImplementation(
      async () => new Response(null, { status, headers: new Headers(headers) }),
    );
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

// Cada teste usa um token próprio: o deduplicador guarda resultados por token.
let tokenCount = 0;
const newToken = () => `refresh-${++tokenCount}`;

describe('refreshSession', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('troca o refresh token por cookies novos', async () => {
    const fetchMock = mockApi(200, ['access_token=novo; Path=/']);
    const token = newToken();

    const result = await refreshSession(token);

    expect(result).toEqual({
      status: 'renewed',
      cookies: [{ name: 'access_token', value: 'novo', expires: undefined }],
    });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url.toString()).toBe('http://api.test/auth/refresh');
    expect(init.headers.Cookie).toBe(`refresh_token=${token}`);
  });

  it('pedidos simultâneos com o mesmo token fazem um refresh só', async () => {
    const fetchMock = mockApi(200, ['access_token=novo; Path=/']);
    const token = newToken();

    const results = await Promise.all([
      refreshSession(token),
      refreshSession(token),
      refreshSession(token),
    ]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(results[1]).toBe(results[0]);
    expect(results[2]).toBe(results[0]);
  });

  it('pedido que chega logo depois com o token antigo reaproveita o resultado', async () => {
    const fetchMock = mockApi(200, ['access_token=novo; Path=/']);
    const token = newToken();
    const now = Date.now();

    await refreshSession(token, now);
    await refreshSession(token, now + 5_000);

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('depois da janela de reuso chama a API de novo', async () => {
    const fetchMock = mockApi(401);
    const token = newToken();
    const now = Date.now();

    await refreshSession(token, now);
    await refreshSession(token, now + 11_000);

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('refresh recusado pela API (401) encerra a sessão', async () => {
    mockApi(401);

    expect(await refreshSession(newToken())).toEqual({ status: 'invalid' });
  });

  it('API fora do ar não encerra a sessão', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('fetch')));

    expect(await refreshSession(newToken())).toEqual({
      status: 'unavailable',
    });
  });
});
