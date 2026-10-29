import { describe, expect, it } from 'vitest';
import { parseSessionCookies } from './session-cookies';

describe('parseSessionCookies', () => {
  it('lê nome, valor e expiração dos dois cookies de sessão', () => {
    const cookies = parseSessionCookies([
      'access_token=abc.def.ghi; Max-Age=900; Path=/; Expires=Thu, 29 Oct 2026 18:15:00 GMT; HttpOnly; Secure; SameSite=Lax',
      'refresh_token=xyz; Path=/auth; Expires=Sat, 28 Nov 2026 18:00:00 GMT; HttpOnly; Secure; SameSite=Lax',
    ]);

    expect(cookies).toEqual([
      {
        name: 'access_token',
        value: 'abc.def.ghi',
        expires: new Date('2026-10-29T18:15:00Z'),
      },
      {
        name: 'refresh_token',
        value: 'xyz',
        expires: new Date('2026-11-28T18:00:00Z'),
      },
    ]);
  });

  it('ignora cookies que não são de sessão', () => {
    expect(parseSessionCookies(['tracking=1; Path=/'])).toEqual([]);
  });

  it('mantém "=" que aparece dentro do valor', () => {
    const [cookie] = parseSessionCookies(['refresh_token=a=b; Path=/auth']);

    expect(cookie).toEqual({
      name: 'refresh_token',
      value: 'a=b',
      expires: undefined,
    });
  });
});
