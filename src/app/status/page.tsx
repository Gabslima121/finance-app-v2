import { HealthBadge } from '@/components/health-badge';
import { getApiStatus } from '@/lib/api/health';

// Busca a cada requisição; o loading.tsx desta pasta mostra o estado de carregamento.
export default async function StatusPage() {
  const status = await getApiStatus();

  return (
    <section className="max-w-md space-y-4">
      <h1 className="text-2xl font-bold">Status</h1>
      <div className="space-y-2">
        <HealthBadge label="API" status={status.api} />
        <HealthBadge label="Banco de dados" status={status.database} />
      </div>
    </section>
  );
}
