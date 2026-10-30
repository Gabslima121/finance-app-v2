'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { ApiError } from '@/lib/api/client';
import { apiTokensApi } from './api';
import { apiTokenIdSchema, createApiTokenSchema } from './schemas';

export type CreateApiTokenState =
  | { status: 'idle' }
  | { status: 'error'; message?: string; nameError?: string; name: string }
  // O valor completo só existe neste estado: some ao recarregar a página.
  | { status: 'created'; name: string; token: string };

export async function createApiTokenAction(
  _prev: CreateApiTokenState,
  formData: FormData,
): Promise<CreateApiTokenState> {
  const name = String(formData.get('name') ?? '');
  const result = createApiTokenSchema.safeParse({ name });
  if (!result.success) {
    const { fieldErrors } = z.flattenError(result.error);
    return { status: 'error', nameError: fieldErrors.name?.[0], name };
  }

  try {
    const created = await apiTokensApi.create(result.data.name);
    revalidatePath('/tokens');
    return { status: 'created', name: created.name, token: created.token };
  } catch (error) {
    // 401 já virou redirect para o login dentro do apiFetch.
    if (!(error instanceof ApiError)) throw error;
    return {
      status: 'error',
      message: 'Não foi possível criar o token. Tente de novo.',
      name,
    };
  }
}

export async function revokeApiTokenAction(formData: FormData): Promise<void> {
  const id = apiTokenIdSchema.safeParse(formData.get('id'));
  if (!id.success) return;

  try {
    await apiTokensApi.revoke(id.data);
  } catch (error) {
    // 404: já não existe (ou não é seu). A lista recarregada mostra o estado real.
    if (!(error instanceof ApiError && error.status === 404)) throw error;
  }
  revalidatePath('/tokens');
}
