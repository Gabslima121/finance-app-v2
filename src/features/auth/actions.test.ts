import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { loginAction } from './actions';

const cookieSet = vi.fn();
vi.mock('next/headers', () => ({
  cookies: async () => ({ set: cookieSet }),
}));

// O redirect real lança um erro especial do Next; aqui ele só é registrado.
const redirectMock = vi.fn();
vi.mock('next/navigation', () => ({
  redirect: (path: string) => redirectMock(path),
}));

function form(email: string, password: string) {
  const data = new FormData();
  data.set('email', email);
  data.set('password', password);
  return data;
}

function mockApi(status: number, setCookies: string[] = []) {
  const headers = new Headers();
  for (const cookie of setCookies) headers.append('Set-Cookie', cookie);
  const fetchMock = vi
    .fn()
    .mockResolvedValue(new Response(null, { status, headers }));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

const idle = { status: 'idle' } as const;

describe('loginAction', () => {
  beforeEach(() => {
    cookieSet.mockClear();
    redirectMock.mockClear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('com credenciais corretas grava os cookies de sessão e vai para o início', async () => {
    mockApi(200, [
      'access_token=aaa; Path=/; Expires=Thu, 29 Oct 2026 18:15:00 GMT; HttpOnly',
      'refresh_token=rrr; Path=/auth; Expires=Sat, 28 Nov 2026 18:00:00 GMT; HttpOnly',
    ]);

    await loginAction(idle, form('gabriel@exemplo.com', 'senha-certa'));

    expect(cookieSet).toHaveBeenCalledWith(
      'access_token',
      'aaa',
      expect.objectContaining({
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
      }),
    );
    expect(cookieSet).toHaveBeenCalledWith(
      'refresh_token',
      'rrr',
      expect.objectContaining({ path: '/' }),
    );
    expect(redirectMock).toHaveBeenCalledWith('/');
  });

  it('envia e-mail e senha em JSON para POST /auth/login', async () => {
    const fetchMock = mockApi(200);

    await loginAction(idle, form(' gabriel@exemplo.com ', 'senha-certa'));

    const [url, init] = fetchMock.mock.calls[0];
    expect(url.toString()).toBe('http://api.test/auth/login');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toEqual({
      email: 'gabriel@exemplo.com',
      password: 'senha-certa',
    });
  });

  it('senha errada (401) devolve "E-mail ou senha inválidos" e mantém só o e-mail', async () => {
    mockApi(401);

    const state = await loginAction(
      idle,
      form('gabriel@exemplo.com', 'senha-errada'),
    );

    expect(state).toEqual({
      status: 'error',
      message: 'E-mail ou senha inválidos',
      values: { email: 'gabriel@exemplo.com' },
    });
    expect(cookieSet).not.toHaveBeenCalled();
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it('muitas tentativas (429) pede para aguardar', async () => {
    mockApi(429);

    const state = await loginAction(idle, form('gabriel@exemplo.com', 'x'));

    expect(state).toMatchObject({
      message: 'Muitas tentativas. Aguarde um minuto e tente de novo.',
    });
  });

  it('API fora do ar devolve mensagem genérica', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('fetch')));

    const state = await loginAction(idle, form('gabriel@exemplo.com', 'x'));

    expect(state).toMatchObject({
      message: 'Não foi possível entrar agora. Tente de novo.',
    });
  });

  it('campos inválidos não chamam a API', async () => {
    const fetchMock = mockApi(200);

    const state = await loginAction(idle, form('nao-e-email', ''));

    expect(state).toEqual({
      status: 'error',
      errors: {
        email: 'Informe um e-mail válido',
        password: 'Informe a senha',
      },
      values: { email: 'nao-e-email' },
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
