import type { Metadata } from 'next';
import { MainNav } from '@/components/main-nav';
import './globals.css';

export const metadata: Metadata = {
  title: 'Finanças',
  description: 'Controle financeiro pessoal',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="pt-BR">
      <body className="bg-zinc-50 text-zinc-900 antialiased">
        <div className="md:flex">
          <MainNav />
          <main className="flex-1 px-4 pt-6 pb-24 md:px-8 md:pb-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
