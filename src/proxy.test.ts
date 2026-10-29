// @vitest-environment node
import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';
import { proxy } from './proxy';

function requestTo(path: string, cookie?: string) {
  return new NextRequest(new URL(path, 'http://localhost:3001'), {
    headers: cookie ? { cookie } : {},
  });
}

describe('proxy', () => {
  it('sem sessão manda para /login com o caminho original em next', () => {
    const response = proxy(requestTo('/transacoes'));

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe(
      'http://localhost:3001/login?next=%2Ftransacoes',
    );
  });

  it('preserva a query string da rota original', () => {
    const response = proxy(requestTo('/transacoes?mes=2026-10'));

    const location = new URL(response.headers.get('location')!);
    expect(location.searchParams.get('next')).toBe('/transacoes?mes=2026-10');
  });

  it('deixa a /login passar sem sessão', () => {
    const response = proxy(requestTo('/login'));

    expect(response.headers.get('location')).toBeNull();
  });

  it('com access token deixa passar', () => {
    const response = proxy(requestTo('/transacoes', 'access_token=aaa'));

    expect(response.headers.get('location')).toBeNull();
  });

  it('só com refresh token também deixa passar (a página renova a sessão)', () => {
    const response = proxy(requestTo('/transacoes', 'refresh_token=rrr'));

    expect(response.headers.get('location')).toBeNull();
  });
});
