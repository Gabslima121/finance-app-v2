import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, apiFetch } from './client';

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
});
