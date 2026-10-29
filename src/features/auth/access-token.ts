// Renova com folga: um token que expira em segundos pode vencer no caminho
// até a API (e relógios de servidores diferentes nunca batem exato).
const REFRESH_MARGIN_SECONDS = 30;

// Lê o "exp" do JWT sem validar a assinatura. Serve só para decidir se vale
// renovar antes de usar; quem confia ou não no token é a API.
export function isAccessTokenExpiring(
  token: string,
  now: Date = new Date(),
): boolean {
  try {
    const payload: unknown = JSON.parse(
      Buffer.from(token.split('.')[1] ?? '', 'base64url').toString(),
    );
    const exp =
      typeof payload === 'object' && payload !== null && 'exp' in payload
        ? payload.exp
        : undefined;
    if (typeof exp !== 'number') return true;
    return exp - now.getTime() / 1000 < REFRESH_MARGIN_SECONDS;
  } catch {
    return true;
  }
}
