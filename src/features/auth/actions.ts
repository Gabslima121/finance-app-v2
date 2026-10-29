'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { ApiError } from '@/lib/api/client';
import { authApi } from './api';
import { safeNextPath } from './safe-next-path';
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

  // Os cookies da API são do domínio dela; o site grava os seus, com as
  // mesmas garantias. Path "/" para o servidor do Next ler em qualquer rota.
  const cookieStore = await cookies();
  for (const { name, value, expires } of sessionCookies) {
    cookieStore.set(name, value, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      expires,
    });
  }

  // O campo vem do navegador: só caminho interno passa (anti open redirect).
  redirect(safeNextPath(formData.get('next')));
}
