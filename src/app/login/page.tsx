import type { Metadata } from 'next';
import { Suspense } from 'react';
import { LoginForm } from '@/features/auth';

export const metadata: Metadata = { title: 'Entrar · Finanças' };

export default function LoginPage({ searchParams }: PageProps<'/login'>) {
  return (
    <main className="mx-auto max-w-sm space-y-6 px-4 pt-16">
      <h1 className="text-2xl font-bold">Entrar</h1>
      {/* Sem fallback: um formulário provisório seria trocado pelo definitivo
          ao chegar o ?next=, e o foco inicial no e-mail se perderia. */}
      <Suspense>
        <LoginFormWithNext searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function LoginFormWithNext({
  searchParams,
}: Pick<PageProps<'/login'>, 'searchParams'>) {
  const { next } = await searchParams;
  return <LoginForm next={typeof next === 'string' ? next : undefined} />;
}
