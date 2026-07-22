'use client';

import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { loginAction } from '@/server/actions/auth.actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" loading={pending} loadingText="Entrando…" className="w-full">
      Entrar
    </Button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, null);
  const [showPassword, setShowPassword] = useState(false);

  const failed = state && !state.ok ? state : null;
  const fieldErrors = failed?.fieldErrors;
  const formError = failed && !fieldErrors ? failed.message : null;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {formError ? <Alert variant="error">{formError}</Alert> : null}

      <Input
        label="Correo electrónico"
        name="email"
        type="email"
        autoComplete="email"
        required
        error={fieldErrors?.email?.[0]}
      />

      <Input
        label="Contraseña"
        name="password"
        type={showPassword ? 'text' : 'password'}
        autoComplete="current-password"
        required
        error={fieldErrors?.password?.[0]}
        trailingSlot={
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-pressed={showPassword}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            className="flex h-11 w-11 items-center justify-center rounded-md text-ink-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        }
      />

      <SubmitButton />

      <p className="text-center text-[15px] text-ink-muted">
        ¿No tienes cuenta?{' '}
        <Link href="/register" className="text-primary underline-offset-2 hover:underline">
          Crear una cuenta
        </Link>
      </p>
    </form>
  );
}
