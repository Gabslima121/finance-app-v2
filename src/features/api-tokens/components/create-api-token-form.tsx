'use client';

import { useActionState, useState } from 'react';
import { createApiTokenAction, type CreateApiTokenState } from '../actions';

type CreateApiTokenFormProps = {
  // Injetável para o teste de componente; o padrão é a Server Action real.
  action?: typeof createApiTokenAction;
};

const INPUT_CLASS =
  'w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-none aria-[invalid=true]:border-red-600';
const BUTTON_CLASS =
  'rounded-lg bg-emerald-700 px-4 py-2 font-semibold text-white focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-60';

export function CreateApiTokenForm({
  action = createApiTokenAction,
}: CreateApiTokenFormProps) {
  const [state, formAction, pending] = useActionState<
    CreateApiTokenState,
    FormData
  >(action, { status: 'idle' });

  const error = state.status === 'error' ? state : undefined;

  return (
    <div className="space-y-4">
      <form action={formAction} noValidate className="space-y-3">
        <div role="alert" aria-live="assertive" className="empty:hidden">
          {error?.message ? (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
              {error.message}
            </p>
          ) : null}
        </div>
        <div className="space-y-1">
          <label htmlFor="token-name" className="block text-sm font-medium">
            Nome do token
          </label>
          <input
            // Recria o campo vazio depois de criar; em erro mantém o que foi digitado.
            key={state.status === 'created' ? state.token : 'form'}
            id="token-name"
            name="name"
            placeholder="Atalho Apple Pay"
            maxLength={60}
            required
            defaultValue={error?.name}
            aria-invalid={error?.nameError ? true : undefined}
            aria-describedby={error?.nameError ? 'token-name-error' : undefined}
            className={INPUT_CLASS}
          />
          {error?.nameError ? (
            <p id="token-name-error" className="text-sm text-red-700">
              {error.nameError}
            </p>
          ) : null}
        </div>
        <button type="submit" disabled={pending} className={BUTTON_CLASS}>
          {pending ? 'Criando...' : 'Criar token'}
        </button>
      </form>

      {state.status === 'created' ? (
        <CreatedToken name={state.name} token={state.token} />
      ) : null}
    </div>
  );
}

function CreatedToken({ name, token }: { name: string; token: string }) {
  const [copy, setCopy] = useState<'idle' | 'copied' | 'failed'>('idle');

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(token);
      setCopy('copied');
    } catch {
      // Sem permissão ou fora de HTTPS: o texto continua selecionável.
      setCopy('failed');
    }
  }

  return (
    <section
      aria-labelledby="created-token-title"
      className="space-y-2 rounded-lg border border-amber-300 bg-amber-50 p-4"
    >
      <h2 id="created-token-title" className="font-semibold">
        Token &quot;{name}&quot; criado
      </h2>
      <p className="text-sm text-amber-900">
        Copie agora. Este valor não será mostrado de novo.
      </p>
      <code className="block rounded bg-white px-3 py-2 text-sm break-all select-all">
        {token}
      </code>
      <button type="button" onClick={handleCopy} className={BUTTON_CLASS}>
        Copiar
      </button>
      <p role="status" className="text-sm text-zinc-700">
        {copy === 'copied' ? 'Copiado.' : null}
        {copy === 'failed'
          ? 'Não foi possível copiar. Selecione o texto e copie.'
          : null}
      </p>
    </section>
  );
}
