import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CreateApiTokenForm } from './create-api-token-form';

describe('CreateApiTokenForm', () => {
  it('mostra o valor criado com aviso e copia para a área de transferência', async () => {
    const user = userEvent.setup();
    const action = vi.fn().mockResolvedValue({
      status: 'created',
      name: 'Atalho Apple Pay',
      token: 'fin_Ab3dE6gHsegredo',
    });
    render(<CreateApiTokenForm action={action} />);

    await user.type(screen.getByLabelText('Nome do token'), 'Atalho Apple Pay');
    await user.click(screen.getByRole('button', { name: 'Criar token' }));

    expect(await screen.findByText('fin_Ab3dE6gHsegredo')).toBeInTheDocument();
    expect(
      screen.getByText('Copie agora. Este valor não será mostrado de novo.'),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Copiar' }));
    expect(await navigator.clipboard.readText()).toBe('fin_Ab3dE6gHsegredo');
    expect(screen.getByRole('status')).toHaveTextContent('Copiado.');
  });

  it('liga o erro de validação ao campo', async () => {
    const user = userEvent.setup();
    const action = vi.fn().mockResolvedValue({
      status: 'error',
      nameError: 'Informe um nome',
      name: '',
    });
    render(<CreateApiTokenForm action={action} />);

    await user.click(screen.getByRole('button', { name: 'Criar token' }));

    const input = await screen.findByLabelText('Nome do token');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Informe um nome');
  });
});
