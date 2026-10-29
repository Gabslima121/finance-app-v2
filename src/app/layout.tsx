import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Finanças',
  description: 'Controle financeiro pessoal',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="pt-BR">
      <body className="bg-zinc-50 text-zinc-900 antialiased">{children}</body>
    </html>
  );
}
