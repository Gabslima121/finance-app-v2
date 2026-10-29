import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { LoginState } from '../actions';
import { LoginForm } from './login-form';

// A action real usa cookies/redirect do servidor; aqui ela entra por prop.
vi.mock('../actions', () => ({ loginAction: vi.fn() }));

function renderForm(result: LoginState) {
  const action = vi.fn().mockResolvedValue(result);
  render(<LoginForm action={action} />);
  return action;
}

async function submit(email: string, password: string) {
  const user = userEvent.setup();
  if (email) await user.type(screen.getByLabelText('E-mail'), email);
  if (password) await user.type(screen.getByLabelText('Senha'), password);
  await user.click(screen.getByRole('button', { name: 'Entrar' }));
}

describe('LoginForm', () => {
  it('começa com o foco no e-mail', () => {
    renderForm({ status: 'idle' });

    expect(screen.getByLabelText('E-mail')).toHaveFocus();
  });

  it('senha errada mostra o erro num alerta, mantém o e-mail e foca a senha', async () => {
    renderForm({
      status: 'error',
      message: 'E-mail ou senha inválidos',
      values: { email: 'gabriel@exemplo.com' },
    });

    await submit('gabriel@exemplo.com', 'senha-errada');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'E-mail ou senha inválidos',
    );
    expect(screen.getByLabelText('E-mail')).toHaveValue('gabriel@exemplo.com');
    expect(screen.getByLabelText('Senha')).toHaveValue('');
    expect(screen.getByLabelText('Senha')).toHaveFocus();
  });

  it('erro de campo marca o campo inválido, liga a mensagem e foca nele', async () => {
    renderForm({
      status: 'error',
      errors: { email: 'Informe um e-mail válido' },
      values: { email: 'x' },
    });

    await submit('x', 'qualquer');

    const email = await screen.findByLabelText('E-mail');
    expect(email).toHaveAttribute('aria-invalid', 'true');
    expect(email).toHaveAccessibleDescription('Informe um e-mail válido');
    expect(email).toHaveFocus();
  });

  it('envia o next recebido junto com o formulário', async () => {
    const action = vi.fn().mockResolvedValue({ status: 'idle' });
    render(<LoginForm next="/transacoes" action={action} />);

    await submit('gabriel@exemplo.com', 'senha');

    const formData: FormData = action.mock.calls[0][1];
    expect(formData.get('next')).toBe('/transacoes');
  });

  it('desabilita o botão e mostra "Entrando..." enquanto envia', async () => {
    const action = vi.fn(() => new Promise<LoginState>(() => {}));
    render(<LoginForm action={action} />);

    await submit('gabriel@exemplo.com', 'senha');

    expect(
      await screen.findByRole('button', { name: 'Entrando...' }),
    ).toBeDisabled();
  });
});
