import { z } from 'zod';

// Mesma regra da API (1 a 60 caracteres); a API valida de novo.
export const createApiTokenSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Informe um nome')
    .max(60, 'Use até 60 caracteres'),
});

export const apiTokenIdSchema = z.uuid();

// Item da lista: a API nunca devolve o valor completo nem o hash.
export type ApiToken = {
  id: string;
  name: string;
  prefix: string;
  scope: 'ingest';
  lastUsedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
};

export type CreatedApiToken = {
  id: string;
  name: string;
  prefix: string;
  token: string;
  createdAt: string;
};
