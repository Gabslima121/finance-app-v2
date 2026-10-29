import { MainNav } from '@/components/main-nav';

// Páginas do sistema (exigem sessão): com o menu. A /login fica fora deste grupo.
export default function AppLayout({ children }: LayoutProps<'/'>) {
  return (
    <div className="md:flex">
      <MainNav />
      <main className="flex-1 px-4 pt-6 pb-24 md:px-8 md:pb-6">{children}</main>
    </div>
  );
}
