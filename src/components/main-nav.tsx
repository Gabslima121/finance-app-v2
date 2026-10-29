'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logoutAction } from '@/features/auth';

const ITEMS = [
  { href: '/', label: 'Início' },
  { href: '/status', label: 'Status' },
] as const;

// Celular: barra fixa embaixo. Telas médias em diante: menu lateral.
export function MainNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Principal"
      className="fixed inset-x-0 bottom-0 border-t border-zinc-200 bg-white md:static md:min-h-dvh md:w-56 md:border-t-0 md:border-r"
    >
      <p className="hidden px-4 py-5 text-lg font-bold md:block">Finanças</p>
      <ul className="flex md:flex-col">
        {ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`block px-4 py-3 text-center text-sm md:text-left ${
                  active ? 'font-semibold text-emerald-700' : 'text-zinc-600'
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
        <li className="flex-1">
          {/* Form + Server Action: funciona antes do JS carregar e o POST
              não pode ser disparado por um simples link de outro site. */}
          <form action={logoutAction}>
            <button
              type="submit"
              className="block w-full px-4 py-3 text-center text-sm text-zinc-600 md:text-left"
            >
              Sair
            </button>
          </form>
        </li>
      </ul>
    </nav>
  );
}
