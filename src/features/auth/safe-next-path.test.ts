import { describe, expect, it } from 'vitest';
import { safeNextPath } from './safe-next-path';

describe('safeNextPath', () => {
  it.each([
    ['/transacoes', '/transacoes'],
    ['/transacoes?mes=2026-10', '/transacoes?mes=2026-10'],
    ['/', '/'],
  ])('aceita caminho interno %s', (next, expected) => {
    expect(safeNextPath(next)).toBe(expected);
  });

  it.each([
    'https://site-malicioso.com',
    '//site-malicioso.com',
    '/\\site-malicioso.com',
    '/\t/site-malicioso.com',
    'javascript:alert(1)',
    'transacoes',
    '',
    undefined,
    null,
  ])('troca %s pela página inicial', (next) => {
    expect(safeNextPath(next)).toBe('/');
  });
});
