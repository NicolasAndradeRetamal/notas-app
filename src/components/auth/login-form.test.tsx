import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { LoginForm } from './login-form';
import { loginAction } from '@/server/actions/auth.actions';

vi.mock('@/server/actions/auth.actions', () => ({
  loginAction: vi.fn(),
}));

const mockedLoginAction = vi.mocked(loginAction);

// The Input component appends a visually-hidden "*" to required labels, so
// label text is matched with a leading-anchor regex instead of an exact string.
const emailLabel = () => screen.getByLabelText(/^Correo electrónico/);
const passwordLabel = () => screen.getByLabelText(/^Contraseña/);

describe('LoginForm', () => {
  it('renders the email and password fields with associated labels', () => {
    render(<LoginForm />);

    expect(emailLabel()).toBeInTheDocument();
    expect(passwordLabel()).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument();
  });

  it('toggles password visibility', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const password = passwordLabel();
    expect(password).toHaveAttribute('type', 'password');

    await user.click(screen.getByRole('button', { name: 'Mostrar contraseña' }));
    expect(password).toHaveAttribute('type', 'text');

    await user.click(screen.getByRole('button', { name: 'Ocultar contraseña' }));
    expect(password).toHaveAttribute('type', 'password');
  });

  it('shows a field error under the email input on validation failure', async () => {
    mockedLoginAction.mockResolvedValue({
      ok: false,
      code: 'VALIDATION_ERROR',
      message: 'Revisa los datos del formulario.',
      fieldErrors: { email: ['Introduce un correo válido'] },
    });
    const user = userEvent.setup();
    render(<LoginForm />);

    // A syntactically valid address is used here on purpose: the browser's
    // native type="email" validation would otherwise block submission before
    // the (mocked) server ever runs, which is what this test exercises.
    await user.type(emailLabel(), 'rejected@example.com');
    await user.type(passwordLabel(), 'whatever');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByText('Introduce un correo válido')).toBeInTheDocument();
  });

  it('shows a form-level alert when credentials are rejected', async () => {
    mockedLoginAction.mockResolvedValue({
      ok: false,
      code: 'UNAUTHENTICATED',
      message: 'Correo o contraseña incorrectos.',
    });
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(emailLabel(), 'demo@notas.app');
    await user.type(passwordLabel(), 'wrong-password');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByText('Correo o contraseña incorrectos.')).toBeInTheDocument();
  });

  it('shows the loading state while the action is pending', async () => {
    let resolveAction: (value: Awaited<ReturnType<typeof loginAction>>) => void = () => {};
    mockedLoginAction.mockReturnValue(
      new Promise((resolve) => {
        resolveAction = resolve;
      }),
    );
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(emailLabel(), 'demo@notas.app');
    await user.type(passwordLabel(), 'contrasena-demo-123');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() => expect(screen.getByRole('button', { name: /Entrando…/ })).toBeDisabled());

    resolveAction({ ok: false, code: 'UNAUTHENTICATED', message: 'Correo o contraseña incorrectos.' });
  });
});
