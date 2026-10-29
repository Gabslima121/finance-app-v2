import type { Metadata } from 'next';
import { LoginForm } from '@/features/auth';

export const metadata: Metadata = { title: 'Entrar · Finanças' };

export default function LoginPage() {
  return (
    <section className="mx-auto max-w-sm space-y-6 pt-8">
      <h1 className="text-2xl font-bold">Entrar</h1>
      <LoginForm />
    </section>
  );
}
