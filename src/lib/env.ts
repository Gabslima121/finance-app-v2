import 'server-only';
import { z } from 'zod';

// Variáveis lidas só no servidor. Nada aqui vai para o bundle do navegador.
const envSchema = z.object({
  API_URL: z.url(),
});

export const env = envSchema.parse({
  API_URL: process.env.API_URL,
});
