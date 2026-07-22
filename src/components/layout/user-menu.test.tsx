import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { UserMenu } from './user-menu';
import { ThemeProvider } from './theme-provider';
import { ToastProvider } from '@/components/ui/toast';
import { logoutAction } from '@/server/actions/auth.actions';
import type { UserDTO } from '@/types/dto';

vi.mock('@/server/actions/auth.actions', () => ({
  logoutAction: vi.fn().mockResolvedValue(undefined),
}));

const mockedLogoutAction = vi.mocked(logoutAction);

const USER: UserDTO = { id: 'user-1', name: 'Nicolás Andrade', email: 'nicolas@example.com' };

function renderUserMenu() {
  return render(
    <ThemeProvider>
      <ToastProvider>
        <UserMenu user={USER} />
      </ToastProvider>
    </ThemeProvider>,
  );
}

describe('UserMenu — theme switcher', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('opens the menu and shows the three theme options plus sign out', async () => {
    const user = userEvent.setup();
    renderUserMenu();

    await user.click(screen.getByRole('button', { name: 'Cuenta de Nicolás Andrade' }));

    expect(
      screen.getByRole('menuitemradio', { name: /Automático \(sistema\)/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole('menuitemradio', { name: /Claro/ })).toBeInTheDocument();
    expect(screen.getByRole('menuitemradio', { name: /Oscuro/ })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /Cerrar sesión/ })).toBeInTheDocument();
  });

  it('marks "Automático (sistema)" as checked by default', async () => {
    const user = userEvent.setup();
    renderUserMenu();

    await user.click(screen.getByRole('button', { name: 'Cuenta de Nicolás Andrade' }));

    expect(screen.getByRole('menuitemradio', { name: /Automático \(sistema\)/ })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(screen.getByRole('menuitemradio', { name: /Claro/ })).toHaveAttribute(
      'aria-checked',
      'false',
    );
  });

  it('switches to dark theme, persists it and reflects the checked state on reopen', async () => {
    const user = userEvent.setup();
    renderUserMenu();

    await user.click(screen.getByRole('button', { name: 'Cuenta de Nicolás Andrade' }));
    await user.click(screen.getByRole('menuitemradio', { name: /Oscuro/ }));

    expect(localStorage.getItem('theme')).toBe('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');

    await user.click(screen.getByRole('button', { name: 'Cuenta de Nicolás Andrade' }));
    expect(screen.getByRole('menuitemradio', { name: /Oscuro/ })).toHaveAttribute(
      'aria-checked',
      'true',
    );
  });

  it('shows a confirmation toast naming the selected theme', async () => {
    const user = userEvent.setup();
    renderUserMenu();

    await user.click(screen.getByRole('button', { name: 'Cuenta de Nicolás Andrade' }));
    await user.click(screen.getByRole('menuitemradio', { name: /Claro/ }));

    expect(await screen.findByText('Tema claro activado.')).toBeInTheDocument();
  });

  it('switches back to the light theme correctly', async () => {
    const user = userEvent.setup();
    renderUserMenu();

    await user.click(screen.getByRole('button', { name: 'Cuenta de Nicolás Andrade' }));
    await user.click(screen.getByRole('menuitemradio', { name: /Oscuro/ }));

    await user.click(screen.getByRole('button', { name: 'Cuenta de Nicolás Andrade' }));
    await user.click(screen.getByRole('menuitemradio', { name: /Claro/ }));

    expect(localStorage.getItem('theme')).toBe('light');
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('calls logoutAction when "Cerrar sesión" is clicked', async () => {
    const user = userEvent.setup();
    renderUserMenu();

    await user.click(screen.getByRole('button', { name: 'Cuenta de Nicolás Andrade' }));
    await user.click(screen.getByRole('menuitem', { name: /Cerrar sesión/ }));

    expect(mockedLogoutAction).toHaveBeenCalledTimes(1);
  });
});
