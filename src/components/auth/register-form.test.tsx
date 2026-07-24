import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { RegisterForm } from './register-form';
import { registerAction } from '@/server/actions/auth.actions';

vi.mock('@/server/actions/auth.actions', () => ({
  registerAction: vi.fn(),
}));

const mockedRegisterAction = vi.mocked(registerAction);

// The Input component appends a visually-hidden "*" to required labels, so
// label text is matched with a leading-anchor regex instead of an exact string.
const nameLabel = () => screen.getByLabelText(/^Nombre/);
const emailLabel = () => screen.getByLabelText(/^Correo electrónico/);
const passwordLabel = () => screen.getByLabelText(/^Contraseña/);
const confirmPasswordLabel = () => screen.getByLabelText(/^Repetir contraseña/);

describe('RegisterForm', () => {
  it('renders every field with an associated label', () => {
    render(<RegisterForm />);

    expect(nameLabel()).toBeInTheDocument();
    expect(emailLabel()).toBeInTheDocument();
    expect(passwordLabel()).toBeInTheDocument();
    expect(confirmPasswordLabel()).toBeInTheDocument();
  });

  it('does not show the password length hint until the user starts typing', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    expect(screen.getByText('Mínimo 10 caracteres')).toBeInTheDocument();

    await user.type(passwordLabel(), 'a');
    // Once typing starts, the hint below the input disappears and only the
    // live length-progress indicator (also "Mínimo 10 caracteres") remains.
    expect(screen.getAllByText('Mínimo 10 caracteres')).toHaveLength(1);
  });

  it('marks the password as long enough once it reaches the minimum length', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    await user.type(passwordLabel(), 'short');
    expect(screen.getByText('Mínimo 10 caracteres')).not.toHaveClass('text-success');

    await user.type(passwordLabel(), 'enough123');
    expect(screen.getByText('Mínimo 10 caracteres')).toHaveClass('text-success');
  });

  it('shows a field error under the affected input on validation failure', async () => {
    mockedRegisterAction.mockResolvedValue({
      ok: false,
      code: 'VALIDATION_ERROR',
      message: 'Revisa los datos del formulario.',
      fieldErrors: { confirmPassword: ['Las contraseñas no coinciden'] },
    });
    const user = userEvent.setup();
    render(<RegisterForm />);

    await user.type(nameLabel(), 'Nicolás Andrade');
    await user.type(emailLabel(), 'nicolas@example.com');
    await user.type(passwordLabel(), 'contrasena-uno');
    await user.type(confirmPasswordLabel(), 'contrasena-dos');
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    expect(await screen.findByText('Las contraseñas no coinciden')).toBeInTheDocument();
  });

  it('keeps everything typed after a validation error', async () => {
    mockedRegisterAction.mockResolvedValue({
      ok: false,
      code: 'VALIDATION_ERROR',
      message: 'Revisa los datos del formulario.',
      fieldErrors: { confirmPassword: ['Las contraseñas no coinciden'] },
    });
    const user = userEvent.setup();
    render(<RegisterForm />);

    await user.type(nameLabel(), 'Nicolás Andrade');
    await user.type(emailLabel(), 'nicolas@example.com');
    await user.type(passwordLabel(), 'contrasena-uno');
    await user.type(confirmPasswordLabel(), 'contrasena-dos');
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    expect(await screen.findByText('Las contraseñas no coinciden')).toBeInTheDocument();
    expect(nameLabel()).toHaveValue('Nicolás Andrade');
    expect(emailLabel()).toHaveValue('nicolas@example.com');
    expect(passwordLabel()).toHaveValue('contrasena-uno');
    expect(confirmPasswordLabel()).toHaveValue('contrasena-dos');
  });

  it('shows the email-taken message with a link to log in on conflict', async () => {
    mockedRegisterAction.mockResolvedValue({
      ok: false,
      code: 'CONFLICT',
      message: 'Ya existe una cuenta con ese correo.',
    });
    const user = userEvent.setup();
    render(<RegisterForm />);

    await user.type(nameLabel(), 'Nicolás Andrade');
    await user.type(emailLabel(), 'demo@notas.app');
    await user.type(passwordLabel(), 'contrasena-demo-123');
    await user.type(confirmPasswordLabel(), 'contrasena-demo-123');
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    expect(await screen.findByText('Ya existe una cuenta con este correo.')).toBeInTheDocument();
    // Two links point to /login here: the inline conflict message and the
    // form footer, so every match is asserted instead of a single one.
    const loginLinks = screen.getAllByRole('link', { name: 'Iniciar sesión' });
    expect(loginLinks.length).toBeGreaterThan(0);
    for (const link of loginLinks) {
      expect(link).toHaveAttribute('href', '/login');
    }
  });

  it('shows the loading state while the action is pending', async () => {
    let resolveAction: (value: Awaited<ReturnType<typeof registerAction>>) => void = () => {};
    mockedRegisterAction.mockReturnValue(
      new Promise((resolve) => {
        resolveAction = resolve;
      }),
    );
    const user = userEvent.setup();
    render(<RegisterForm />);

    await user.type(nameLabel(), 'Nicolás Andrade');
    await user.type(emailLabel(), 'nicolas@example.com');
    await user.type(passwordLabel(), 'contrasena-demo-123');
    await user.type(confirmPasswordLabel(), 'contrasena-demo-123');
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Creando cuenta…/ })).toBeDisabled(),
    );

    resolveAction({ ok: false, code: 'CONFLICT', message: 'Ya existe una cuenta con ese correo.' });
  });
});
