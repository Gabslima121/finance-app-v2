import { ApiTokenList, CreateApiTokenForm } from '@/features/api-tokens';
import { apiTokensApi } from '@/features/api-tokens/server';

export default async function TokensPage() {
  const tokens = await apiTokensApi.list();

  return (
    <section className="max-w-xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Tokens de API</h1>
        <p className="text-zinc-600">
          Para os Atalhos do iPhone. Cada token só envia eventos (/ingest) e
          pode ser revogado sem trocar sua senha.
        </p>
      </div>
      <CreateApiTokenForm />
      <ApiTokenList tokens={tokens} />
    </section>
  );
}
