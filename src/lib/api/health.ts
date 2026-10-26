import 'server-only';
import { ApiError, apiFetch } from './client';

export type ServiceStatus = 'up' | 'down' | 'unknown';

type HealthResponse = {
  status: 'ok' | 'error';
  details: Record<string, { status: 'up' | 'down' }>;
};

export type ApiStatus = {
  api: ServiceStatus;
  database: ServiceStatus;
};

export async function getApiStatus(): Promise<ApiStatus> {
  try {
    const health = await apiFetch<HealthResponse>('/health');
    return {
      api: 'up',
      database: health.details.database?.status ?? 'unknown',
    };
  } catch (error) {
    // 503 = a API respondeu, mas algum indicador (o banco) está fora.
    if (error instanceof ApiError && error.status === 503) {
      return { api: 'up', database: 'down' };
    }
    return { api: 'down', database: 'unknown' };
  }
}
