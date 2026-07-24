'use client';

import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useActionState, useEffect, useRef, useState } from 'react';
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const emailRef = useRef<HTMLInputElement>(null);

  const failed = state && !state.ok ? state : null;
  const fieldErrors = failed?.fieldErrors;
  const formError = failed && !fieldErrors ? failed.message : null;

  // Controlled fields keep the email and password after a rejected attempt, so
  // only the wrong field has to be fixed; the focus returns to the email.
  useEffect(() => {
    if (!failed) return;
    emailRef.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={formAction} noValidate className="flex flex-col gap-4">
      {formError ? <Alert variant="error">{formError}</Alert> : null}

      <Input
        ref={emailRef}
        label="Correo electrónico"
        name="email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        error={fieldErrors?.email?.[0]}
      />

      <Input
        label="Contraseña"
        name="password"
        type={showPassword ? 'text' : 'password'}
        autoComplete="current-password"
        required
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={fieldErrors?.password?.[0]}
        trailingSlot={
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-pressed={showPassword}
            aria-label={showPassword ? 'Ocultar la contraseña' : 'Mostrar la contraseña'}
            className="text-ink-muted hover:text-ink focus-visible:outline-primary flex h-11 w-11 items-center justify-center rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        }
      />

      <SubmitButton />

      <p className="text-ink-muted text-center text-[15px]">
        ¿No tienes cuenta?{' '}
        <Link href="/register" className="text-primary underline-offset-2 hover:underline">
          Crear una cuenta
        </Link>
      </p>
    </form>
  );
}
