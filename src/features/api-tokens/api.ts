import 'server-only';
import { apiFetch } from '@/lib/api/client';
import type { ApiToken, CreatedApiToken } from './schemas';

class ApiTokensApi {
  list(): Promise<ApiToken[]> {
    return apiFetch<ApiToken[]>('/api-tokens');
  }

  // Única chamada que traz o valor completo do token.
  create(name: string): Promise<CreatedApiToken> {
    return apiFetch<CreatedApiToken>('/api-tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
  }

  // Token inexistente ou de outro usuário: ApiError 404.
  async revoke(id: string): Promise<void> {
    await apiFetch<null>(`/api-tokens/${id}`, { method: 'DELETE' });
  }
}

export const apiTokensApi = new ApiTokensApi();
