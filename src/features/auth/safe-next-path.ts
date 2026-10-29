// Destino depois do login: só caminho interno do próprio site. Qualquer outra
// coisa ("https://site-malicioso.com", "//site-malicioso.com", "/\\site...")
// vira a página inicial, para o ?next= não servir de redirecionamento aberto.
export function safeNextPath(next: unknown): string {
  if (typeof next !== 'string' || !next.startsWith('/')) return '/';

  // O navegador trata "//x" e "/\x" como outro host; resolver contra uma
  // origem fixa e conferir a origem pega todas essas variações.
  const base = 'http://site.invalid';
  const url = new URL(next, base);
  if (url.origin !== base) return '/';

  return url.pathname + url.search + url.hash;
}
