'use client';

import { useActionState, useEffect, useRef } from 'react';
import { loginAction, type LoginState } from '../actions';

type LoginFormProps = {
  // Injetável para o teste de componente; o padrão é a Server Action real.
  action?: typeof loginAction;
};

const INPUT_CLASS =
  'w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-none aria-[invalid=true]:border-red-600';

export function LoginForm({ action = loginAction }: LoginFormProps) {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    action,
    { status: 'idle' },
  );
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const errors = state.status === 'error' ? state.errors : undefined;
  const values = state.status === 'error' ? state.values : undefined;

  // Depois de um erro, o foco vai para onde o usuário precisa agir: o campo
  // inválido ou, em credencial errada, a senha (o e-mail continua preenchido).
  useEffect(() => {
    if (state.status !== 'error') return;
    if (errors?.email) emailRef.current?.focus();
    else passwordRef.current?.focus();
  }, [state, errors?.email]);

  function renderFieldError(field: 'email' | 'password') {
    const message = errors?.[field];
    if (!message) return null;
    return (
      <p id={`login-${field}-error`} className="text-sm text-red-700">
        {message}
      </p>
    );
  }

  return (
    <form action={formAction} noValidate className="space-y-4">
      {/* Fica sempre no DOM: leitores de tela só anunciam mudanças em região já existente. */}
      <div role="alert" aria-live="assertive" className="empty:hidden">
        {state.status === 'error' && state.message ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
            {state.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-1">
        <label htmlFor="login-email" className="block text-sm font-medium">
          E-mail
        </label>
        <input
          ref={emailRef}
          id="login-email"
          name="email"
          type="email"
          autoComplete="username"
          inputMode="email"
          autoFocus
          required
          defaultValue={values?.email}
          aria-invalid={errors?.email ? true : undefined}
          aria-describedby={errors?.email ? 'login-email-error' : undefined}
          className={INPUT_CLASS}
        />
        {renderFieldError('email')}
      </div>

      <div className="space-y-1">
        <label htmlFor="login-password" className="block text-sm font-medium">
          Senha
        </label>
        <input
          ref={passwordRef}
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={errors?.password ? true : undefined}
          aria-describedby={
            errors?.password ? 'login-password-error' : undefined
          }
          className={INPUT_CLASS}
        />
        {renderFieldError('password')}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-emerald-700 px-4 py-2 font-semibold text-white focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-60"
      >
        {pending ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  );
}
