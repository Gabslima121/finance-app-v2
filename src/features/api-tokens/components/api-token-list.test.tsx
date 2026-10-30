import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { ApiToken } from '../schemas';
import { ApiTokenList } from './api-token-list';
import { RevokeApiTokenButton } from './revoke-api-token-button';

vi.mock('../actions', () => ({ revokeApiTokenAction: vi.fn() }));

const base: ApiToken = {
  id: '01890a5d-ac96-774b-bcce-b302099a8057',
  name: 'Atalho Apple Pay',
  prefix: 'fin_Ab3dE6gH',
  scope: 'ingest',
  lastUsedAt: null,
  revokedAt: null,
  createdAt: '2026-10-30T10:00:00.000Z',
};

describe('ApiTokenList', () => {
  it('mostra nome, só o prefixo, último uso e status', () => {
    render(
      <ApiTokenList
        tokens={[
          base,
          {
            ...base,
            id: '01890a5d-ac96-774b-bcce-b302099a8058',
            name: 'Atalho antigo',
            lastUsedAt: '2026-10-30T13:05:00.000Z',
            revokedAt: '2026-10-30T14:00:00.000Z',
          },
        ]}
      />,
    );

    const [active, revoked] = screen.getAllByRole('listitem');
    expect(within(active).getByText('fin_Ab3dE6gH…')).toBeInTheDocument();
    expect(within(active).getByText('Último uso: nunca')).toBeInTheDocument();
    expect(within(active).getByText('Ativo')).toBeInTheDocument();
    // 13:05 UTC = 10:05 em São Paulo.
    expect(within(revoked).getByText('30/10/2026, 10:05')).toBeInTheDocument();
    expect(within(revoked).getByText(/Revogado em/)).toBeInTheDocument();
    expect(
      within(revoked).queryByRole('button', { name: 'Revogar' }),
    ).not.toBeInTheDocument();
  });

  it('avisa quando não há tokens', () => {
    render(<ApiTokenList tokens={[]} />);

    expect(screen.getByText('Nenhum token criado ainda.')).toBeInTheDocument();
  });
});

describe('RevokeApiTokenButton', () => {
  // O jsdom não implementa showModal/close; aqui só abrem e fecham o atributo.
  HTMLDialogElement.prototype.showModal = function () {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function () {
    this.open = false;
  };

  it('só revoga depois de confirmar no diálogo', async () => {
    const user = userEvent.setup();
    const action = vi.fn();
    render(
      <RevokeApiTokenButton id={base.id} name={base.name} action={action} />,
    );

    await user.click(screen.getByRole('button', { name: 'Revogar' }));
    const dialog = screen.getByRole('dialog', {
      name: 'Revogar "Atalho Apple Pay"?',
    });
    expect(action).not.toHaveBeenCalled();

    await user.click(within(dialog).getByRole('button', { name: 'Revogar' }));

    expect(action).toHaveBeenCalledTimes(1);
    const data = action.mock.calls[0][0] as FormData;
    expect(data.get('id')).toBe(base.id);
  });
});
