// API pública da feature só para o servidor (proxy). Fica separada do
// index.ts porque um Client Component que importa o index não pode puxar
// módulos 'server-only'.
import 'server-only';

export { isAccessTokenExpiring } from './access-token';
export { refreshSession } from './refresh-session';
export { SESSION_COOKIE_OPTIONS } from './session-cookies';
