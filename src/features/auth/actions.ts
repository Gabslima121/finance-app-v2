'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { ApiError } from '@/lib/api/client';
import { authApi } from './api';
import { safeNextPath } from './safe-next-path';
import { SESSION_COOKIE_OPTIONS } from './session-cookies';
import { loginInputSchema, type LoginInput } from './schemas';

export type LoginState =
  | { status: 'idle' }
  | {
      status: 'error';
      message?: string;
      errors?: Partial<Record<keyof LoginInput, string>>;
      // A senha nunca volta para a tela: só o e-mail é restaurado.
      values?: { email: string };
    };

const MESSAGES: Record<number, string> = {
  401: 'E-mail ou senha inválidos',
  429: 'Muitas tentativas. Aguarde um minuto e tente de novo.',
};

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const values = {
    email: String(formData.get('email') ?? '').trim(),
    password: String(formData.get('password') ?? ''),
  };
  const result = loginInputSchema.safeParse(values);
  if (!result.success) {
    const { fieldErrors } = z.flattenError(result.error);
    return {
      status: 'error',
      errors: {
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      },
      values: { email: values.email },
    };
  }

  let sessionCookies;
  try {
    sessionCookies = await authApi.login(result.data);
  } catch (error) {
    const message =
      (error instanceof ApiError && MESSAGES[error.status]) ||
      'Não foi possível entrar agora. Tente de novo.';
    return { status: 'error', message, values: { email: values.email } };
  }

  // Os cookies da API são do domínio dela; o site grava os seus.
  const cookieStore = await cookies();
  for (const { name, value, expires } of sessionCookies) {
    cookieStore.set(name, value, { ...SESSION_COOKIE_OPTIONS, expires });
  }

  // O campo vem do navegador: só caminho interno passa (anti open redirect).
  redirect(safeNextPath(formData.get('next')));
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refresh_token')?.value;

  if (refreshToken) {
    try {
      await authApi.logout(refreshToken);
    } catch {
      // API fora: o site sai do mesmo jeito. O refresh continua válido na API
      // até expirar, mas ninguém mais tem o cookie dele.
    }
  }

  // Apagar cookie numa Server Action também limpa o cache do roteador no
  // navegador: o "voltar" não reaproveita páginas já carregadas.
  cookieStore.delete('access_token');
  cookieStore.delete('refresh_token');
  redirect('/login');
}
