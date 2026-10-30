import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createApiTokenAction, revokeApiTokenAction } from './actions';

vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) =>
      name === 'access_token' ? { name, value: 'jwt' } : undefined,
  }),
}));
const redirectMock = vi.fn();
vi.mock('next/navigation', () => ({
  redirect: (path: string) => redirectMock(path),
}));
const revalidatePath = vi.fn();
vi.mock('next/cache', () => ({
  revalidatePath: (path: string) => revalidatePath(path),
}));

function mockApi(status: number, body?: unknown) {
  const fetchMock = vi.fn().mockResolvedValue(
    new Response(body === undefined ? null : JSON.stringify(body), {
      status,
    }),
  );
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

function form(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

const idle = { status: 'idle' } as const;
const ID = '01890a5d-ac96-774b-bcce-b302099a8057';

beforeEach(() => {
  revalidatePath.mockClear();
});
afterEach(() => {
  vi.unstubAllGlobals();
});

describe('createApiTokenAction', () => {
  it('cria o token, devolve o valor completo uma vez e recarrega a lista', async () => {
    const fetchMock = mockApi(201, {
      id: ID,
      name: 'Atalho Apple Pay',
      prefix: 'fin_Ab3dE6gH',
      token: 'fin_Ab3dE6gHsegredo',
      createdAt: '2026-10-30T10:00:00.000Z',
    });

    const state = await createApiTokenAction(
      idle,
      form({ name: '  Atalho Apple Pay ' }),
    );

    expect(state).toEqual({
      status: 'created',
      name: 'Atalho Apple Pay',
      token: 'fin_Ab3dE6gHsegredo',
    });
    const [url, init] = fetchMock.mock.calls[0] as [URL, RequestInit];
    expect(url.toString()).toBe('http://api.test/api-tokens');
    expect(init.method).toBe('POST');
    expect(init.body).toBe(JSON.stringify({ name: 'Atalho Apple Pay' }));
    expect(revalidatePath).toHaveBeenCalledWith('/tokens');
  });

  it('recusa nome vazio sem chamar a API', async () => {
    const fetchMock = mockApi(201);

    const state = await createApiTokenAction(idle, form({ name: '   ' }));

    expect(state).toMatchObject({
      status: 'error',
      nameError: 'Informe um nome',
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('mostra mensagem quando a API falha', async () => {
    mockApi(500);

    const state = await createApiTokenAction(idle, form({ name: 'Atalho' }));

    expect(state).toEqual({
      status: 'error',
      message: 'Não foi possível criar o token. Tente de novo.',
      name: 'Atalho',
    });
  });
});

describe('revokeApiTokenAction', () => {
  it('revoga pelo id e recarrega a lista', async () => {
    const fetchMock = mockApi(204);

    await revokeApiTokenAction(form({ id: ID }));

    const [url, init] = fetchMock.mock.calls[0] as [URL, RequestInit];
    expect(url.toString()).toBe(`http://api.test/api-tokens/${ID}`);
    expect(init.method).toBe('DELETE');
    expect(revalidatePath).toHaveBeenCalledWith('/tokens');
  });

  it('ignora id que não é UUID (não monta caminho com entrada do navegador)', async () => {
    const fetchMock = mockApi(204);

    await revokeApiTokenAction(form({ id: '../auth/logout' }));

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('trata 404 como já revogado', async () => {
    mockApi(404);

    await expect(
      revokeApiTokenAction(form({ id: ID })),
    ).resolves.toBeUndefined();
    expect(revalidatePath).toHaveBeenCalledWith('/tokens');
  });
});
