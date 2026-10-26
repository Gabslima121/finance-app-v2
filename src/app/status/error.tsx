'use client';

import { useEffect } from 'react';

export default function StatusError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="space-y-3">
      <p className="text-red-700">Não foi possível carregar o status.</p>
      <button
        type="button"
        onClick={() => retry()}
        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white"
      >
        Tentar de novo
      </button>
    </div>
  );
}
