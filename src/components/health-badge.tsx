import type { ServiceStatus } from '@/lib/api/health';

const LABELS: Record<ServiceStatus, string> = {
  up: 'No ar',
  down: 'Fora do ar',
  unknown: 'Sem resposta',
};

const STYLES: Record<ServiceStatus, string> = {
  up: 'bg-emerald-100 text-emerald-800',
  down: 'bg-red-100 text-red-800',
  unknown: 'bg-zinc-200 text-zinc-700',
};

type HealthBadgeProps = {
  label: string;
  status: ServiceStatus;
};

export function HealthBadge({ label, status }: HealthBadgeProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-4 py-3">
      <span className="text-sm font-medium">{label}</span>
      <span
        className={`rounded-full px-3 py-1 text-xs font-semibold ${STYLES[status]}`}
      >
        {LABELS[status]}
      </span>
    </div>
  );
}
