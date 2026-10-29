import { z } from 'zod';

// Só presença e formato: a regra da senha (tamanho etc.) é da API. Aqui não
// se diz nada que ajude a adivinhar a senha.
export const loginInputSchema = z.object({
  email: z.email('Informe um e-mail válido'),
  password: z.string().min(1, 'Informe a senha'),
});

export type LoginInput = z.infer<typeof loginInputSchema>;
