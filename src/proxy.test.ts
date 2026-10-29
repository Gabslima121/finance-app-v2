// @vitest-environment node
import { NextRequest } from 'next/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { proxy } from './proxy';

function requestTo(path: string, cookie?: string) {
  return new NextRequest(new URL(path, 'http://localhost:3001'), {
    headers: cookie ? { cookie } : {},
  });
}

function jwtExpiringIn(seconds: number) {
  const payload = { exp: Math.floor(Date.now() / 1000) + seconds };
  return `h.${Buffer.from(JSON.stringify(payload)).toString('base64url')}.s`;
}

function mockRefresh(status: number, setCookies: string[] = []) {
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

// O deduplicador de refresh guarda resultado por token: um token por teste.
let tokenCount = 0;
const newRefreshToken = () => `refresh-proxy-${++tokenCount}`;

describe('proxy', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sem sessão manda para /login com o caminho original em next', async () => {
    const response = await proxy(requestTo('/transacoes'));

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe(
      'http://localhost:3001/login?next=%2Ftransacoes',
    );
  });

  it('preserva a query string da rota original', async () => {
    const response = await proxy(requestTo('/transacoes?mes=2026-10'));

    const location = new URL(response.headers.get('location')!);
    expect(location.searchParams.get('next')).toBe('/transacoes?mes=2026-10');
  });

  it('deixa a /login passar sem sessão', async () => {
    const response = await proxy(requestTo('/login'));

    expect(response.headers.get('location')).toBeNull();
  });

  it('com access token válido deixa passar sem chamar a API', async () => {
    const fetchMock = mockRefresh(200);

    const response = await proxy(
      requestTo(
        '/transacoes',
        `access_token=${jwtExpiringIn(600)}; refresh_token=${newRefreshToken()}`,
      ),
    );

    expect(response.headers.get('location')).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('só com refresh token renova a sessão e segue para a página', async () => {
    mockRefresh(200, [
      'access_token=access-novo; Path=/; Expires=Thu, 29 Oct 2026 18:15:00 GMT',
      'refresh_token=refresh-novo; Path=/auth; Expires=Sat, 28 Nov 2026 18:00:00 GMT',
    ]);

    const response = await proxy(
      requestTo('/transacoes', `refresh_token=${newRefreshToken()}`),
    );

    expect(response.headers.get('location')).toBeNull();
    // Volta para o navegador no Set-Cookie, com as flags do site.
    const setCookie = response.headers.getSetCookie().join('\n');
    expect(setCookie).toMatch(/access_token=access-novo; Path=\/;.*HttpOnly/);
    expect(setCookie).toMatch(/refresh_token=refresh-novo; Path=\/;/);
    // E a página desta mesma requisição já recebe o access novo.
    expect(response.headers.get('x-middleware-request-cookie')).toContain(
      'access_token=access-novo',
    );
  });

  it('access quase vencido também renova', async () => {
    const fetchMock = mockRefresh(200, ['access_token=access-novo; Path=/']);

    await proxy(
      requestTo(
        '/transacoes',
        `access_token=${jwtExpiringIn(10)}; refresh_token=${newRefreshToken()}`,
      ),
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('refresh recusado manda para o login e apaga os cookies', async () => {
    mockRefresh(401);

    const response = await proxy(
      requestTo('/transacoes', `refresh_token=${newRefreshToken()}`),
    );

    expect(response.headers.get('location')).toBe(
      'http://localhost:3001/login?next=%2Ftransacoes',
    );
    const setCookie = response.headers.getSetCookie().join('\n');
    expect(setCookie).toMatch(/access_token=;/);
    expect(setCookie).toMatch(/refresh_token=;/);
  });

  it('API fora do ar no refresh não desloga', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('fetch')));

    const response = await proxy(
      requestTo('/transacoes', `refresh_token=${newRefreshToken()}`),
    );

    expect(response.headers.get('location')).toBeNull();
  });
});
