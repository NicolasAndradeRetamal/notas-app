'use client';

import { LogOut, Monitor, Moon, Sun } from 'lucide-react';
import { useTransition } from 'react';
import { logoutAction } from '@/server/actions/auth.actions';
import type { UserDTO } from '@/types/dto';
import { DropdownMenu } from '@/components/ui/dropdown-menu';
import type { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/toast';
import type { ThemePreference } from './theme-provider';
import { useTheme } from './theme-provider';

const THEME_TOAST: Record<ThemePreference, string> = {
  system: 'El tema sigue al sistema.',
  light: 'Tema claro activado.',
  dark: 'Tema oscuro activado.',
};

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function UserMenu({ user }: { user: UserDTO }) {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  const handleThemeChange = (next: ThemePreference) => {
    setTheme(next);
    toast({ variant: 'info', title: THEME_TOAST[next] });
  };

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
    });
  };

  const items: DropdownMenuItem[] = [
    {
      type: 'heading',
      key: 'account',
      content: (
        <div>
          <p className="text-ink text-sm font-medium">{user.name}</p>
          <p className="text-meta text-ink-subtle break-all">{user.email}</p>
        </div>
      ),
    },
    { type: 'separator', key: 'sep-1' },
    {
      type: 'radio',
      key: 'theme-system',
      label: 'Automático (sistema)',
      icon: <Monitor aria-hidden="true" />,
      checked: theme === 'system',
      onClick: () => handleThemeChange('system'),
    },
    {
      type: 'radio',
      key: 'theme-light',
      label: 'Claro',
      icon: <Sun aria-hidden="true" />,
      checked: theme === 'light',
      onClick: () => handleThemeChange('light'),
    },
    {
      type: 'radio',
      key: 'theme-dark',
      label: 'Oscuro',
      icon: <Moon aria-hidden="true" />,
      checked: theme === 'dark',
      onClick: () => handleThemeChange('dark'),
    },
    { type: 'separator', key: 'sep-2' },
    {
      type: 'button',
      key: 'logout',
      label: pending ? 'Cerrando sesión…' : 'Cerrar sesión',
      icon: <LogOut aria-hidden="true" />,
      onClick: handleLogout,
      destructive: true,
      disabled: pending,
    },
  ];

  return (
    <DropdownMenu
      align="end"
      label={`Cuenta de ${user.name}`}
      trigger={
        <button
          type="button"
          aria-label={`Cuenta de ${user.name}`}
          className="hit-44 focus-visible:outline-primary flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <span className="bg-primary-soft text-primary flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium">
            {initials(user.name)}
          </span>
        </button>
      }
      items={items}
    />
  );
}
