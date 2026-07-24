'use client';

import { Check, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { registerAction } from '@/server/actions/auth.actions';

const PASSWORD_MIN = 10;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      size="lg"
      loading={pending}
      loadingText="Creando cuenta…"
      className="w-full"
    >
      Crear cuenta
    </Button>
  );
}

export function RegisterForm() {
  const [state, formAction] = useActionState(registerAction, null);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');

  const failed = state && !state.ok ? state : null;
  const fieldErrors = failed?.fieldErrors;
  const formError = failed && !fieldErrors ? failed.message : null;
  const emailTaken = failed?.code === 'CONFLICT';
  const longEnough = password.length >= PASSWORD_MIN;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {formError && !emailTaken ? <Alert variant="error">{formError}</Alert> : null}

      <Input
        label="Nombre"
        name="name"
        type="text"
        autoComplete="name"
        required
        error={fieldErrors?.name?.[0]}
      />

      <div className="flex flex-col gap-1.5">
        <Input
          label="Correo electrónico"
          name="email"
          type="email"
          autoComplete="email"
          required
          error={emailTaken ? undefined : fieldErrors?.email?.[0]}
        />
        {emailTaken ? (
          <p className="text-danger flex flex-wrap gap-1 text-[13px]">
            <span>Ya existe una cuenta con este correo.</span>
            <Link href="/login" className="underline underline-offset-2">
              Iniciar sesión
            </Link>
          </p>
        ) : null}
      </div>

      <Input
        label="Contraseña"
        name="password"
        type={showPassword ? 'text' : 'password'}
        autoComplete="new-password"
        required
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={fieldErrors?.password?.[0]}
        hint={password.length === 0 ? `Mínimo ${PASSWORD_MIN} caracteres` : undefined}
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

      {password.length > 0 ? (
        <p
          className={`-mt-2 flex items-center gap-1.5 text-[13px] ${longEnough ? 'text-success' : 'text-ink-muted'}`}
        >
          {longEnough ? <Check size={14} aria-hidden /> : null}
          Mínimo {PASSWORD_MIN} caracteres
        </p>
      ) : null}

      <Input
        label="Repetir contraseña"
        name="confirmPassword"
        type={showPassword ? 'text' : 'password'}
        autoComplete="new-password"
        required
        error={fieldErrors?.confirmPassword?.[0]}
      />

      <SubmitButton />

      <p className="text-ink-muted text-center text-[15px]">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="text-primary underline-offset-2 hover:underline">
          Iniciar sesión
        </Link>
      </p>
    </form>
  );
}
