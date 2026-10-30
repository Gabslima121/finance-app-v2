import { formatDateTime } from '@/lib/format';
import type { ApiToken } from '../schemas';
import { RevokeApiTokenButton } from './revoke-api-token-button';

export function ApiTokenList({ tokens }: { tokens: ApiToken[] }) {
  if (tokens.length === 0) {
    return <p className="text-zinc-600">Nenhum token criado ainda.</p>;
  }

  return (
    <ul className="space-y-3">
      {tokens.map((token) => (
        <li
          key={token.id}
          className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-zinc-200 bg-white p-4"
        >
          <div className="space-y-1">
            <p className="font-semibold">{token.name}</p>
            <p className="font-mono text-sm text-zinc-600">{token.prefix}…</p>
            <p className="text-sm text-zinc-600">
              Último uso: {renderDate(token.lastUsedAt, 'nunca')}
            </p>
            {renderStatus(token)}
          </div>
          {token.revokedAt ? null : (
            <RevokeApiTokenButton id={token.id} name={token.name} />
          )}
        </li>
      ))}
    </ul>
  );
}

function renderDate(value: string | null, empty: string) {
  if (!value) return empty;
  return <time dateTime={value}>{formatDateTime(value)}</time>;
}

function renderStatus(token: ApiToken) {
  if (token.revokedAt) {
    return (
      <p className="text-sm text-red-700">
        Revogado em {renderDate(token.revokedAt, '')}
      </p>
    );
  }
  return <p className="text-sm text-emerald-700">Ativo</p>;
}
