import { describe, expect, it } from 'vitest';
import { isAccessTokenExpiring } from './access-token';

const now = new Date('2026-10-29T18:00:00Z');
const nowSeconds = now.getTime() / 1000;

function jwtWith(payload: object) {
  const encode = (value: object) =>
    Buffer.from(JSON.stringify(value)).toString('base64url');
  return `${encode({ alg: 'HS256' })}.${encode(payload)}.assinatura`;
}

describe('isAccessTokenExpiring', () => {
  it('token com mais de 30 segundos de vida não precisa renovar', () => {
    expect(isAccessTokenExpiring(jwtWith({ exp: nowSeconds + 600 }), now)).toBe(
      false,
    );
  });

  it('token que vence em menos de 30 segundos precisa renovar', () => {
    expect(isAccessTokenExpiring(jwtWith({ exp: nowSeconds + 10 }), now)).toBe(
      true,
    );
  });

  it('token já vencido precisa renovar', () => {
    expect(isAccessTokenExpiring(jwtWith({ exp: nowSeconds - 1 }), now)).toBe(
      true,
    );
  });

  it.each(['nao-e-jwt', 'a.b.c', jwtWith({ sub: 'sem-exp' })])(
    'token ilegível (%s) conta como vencido',
    (token) => {
      expect(isAccessTokenExpiring(token, now)).toBe(true);
    },
  );
});
