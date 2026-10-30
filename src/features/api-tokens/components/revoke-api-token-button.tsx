'use client';

import { useRef } from 'react';
import { revokeApiTokenAction } from '../actions';

type RevokeApiTokenButtonProps = {
  id: string;
  name: string;
  action?: typeof revokeApiTokenAction;
};

// Confirmação com <dialog> nativo: foco preso, Esc fecha, sem biblioteca.
export function RevokeApiTokenButton({
  id,
  name,
  action = revokeApiTokenAction,
}: RevokeApiTokenButtonProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = `revoke-${id}-title`;

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-700 focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:outline-none"
      >
        Revogar
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        className="m-auto max-w-sm rounded-lg p-5 backdrop:bg-black/40"
      >
        <h2 id={titleId} className="font-semibold">
          Revogar &quot;{name}&quot;?
        </h2>
        <p className="mt-2 text-sm text-zinc-700">
          O Atalho que usa este token para de funcionar na hora. Não dá para
          desfazer.
        </p>
        <form action={action} className="mt-4 flex justify-end gap-2">
          <input type="hidden" name="id" value={id} />
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="rounded-lg px-3 py-1.5 text-sm text-zinc-700"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="rounded-lg bg-red-700 px-3 py-1.5 text-sm font-semibold text-white"
          >
            Revogar
          </button>
        </form>
      </dialog>
    </>
  );
}
