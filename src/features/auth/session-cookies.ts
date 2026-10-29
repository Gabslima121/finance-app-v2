// Cookies de sessão que a API grava no login. Só estes são repassados ao
// navegador; qualquer outro Set-Cookie da API é ignorado.
export const SESSION_COOKIES = ['access_token', 'refresh_token'] as const;

// Flags com que o site grava os cookies de sessão. Path "/" para o servidor
// do Next ler em qualquer rota (o proxy precisa do refresh para renovar).
export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
  path: '/',
} as const;

export type SessionCookie = {
  name: (typeof SESSION_COOKIES)[number];
  value: string;
  expires?: Date;
};

// Lê "nome=valor; Expires=...; ..." de cada Set-Cookie da API. As flags
// (HttpOnly, Secure, SameSite, Path) não são copiadas: quem grava no domínio
// do site define as próprias.
export function parseSessionCookies(setCookies: string[]): SessionCookie[] {
  return setCookies.flatMap((header) => {
    const [pair, ...attributes] = header.split(';');
    const separator = pair.indexOf('=');
    const name = pair.slice(0, separator).trim();

    if (!SESSION_COOKIES.some((allowed) => allowed === name)) return [];

    const expires = attributes
      .map((attribute) => attribute.trim())
      .find((attribute) => attribute.toLowerCase().startsWith('expires='))
      ?.slice('expires='.length);

    return [
      {
        name: name as SessionCookie['name'],
        value: pair.slice(separator + 1).trim(),
        expires: expires ? new Date(expires) : undefined,
      },
    ];
  });
}
