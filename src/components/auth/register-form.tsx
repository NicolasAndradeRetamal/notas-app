'use client';

import { Check, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useActionState, useEffect, useRef, useState, type RefObject } from 'react';
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
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);

  const failed = state && !state.ok ? state : null;
  const fieldErrors = failed?.fieldErrors;
  const formError = failed && !fieldErrors ? failed.message : null;
  const emailTaken = failed?.code === 'CONFLICT';
  const longEnough = password.length >= PASSWORD_MIN;

  // The fields are controlled so a failed submit never wipes what was typed;
  // here the focus is sent to the first field that still needs attention.
  useEffect(() => {
    if (!failed) return;
    const fields: Array<[boolean, RefObject<HTMLInputElement | null>]> = [
      [Boolean(fieldErrors?.name?.[0]), nameRef],
      [emailTaken || Boolean(fieldErrors?.email?.[0]), emailRef],
      [Boolean(fieldErrors?.password?.[0]), passwordRef],
      [Boolean(fieldErrors?.confirmPassword?.[0]), confirmRef],
    ];
    fields.find(([invalid]) => invalid)?.[1].current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {formError && !emailTaken ? <Alert variant="error">{formError}</Alert> : null}

      <Input
        ref={nameRef}
        label="Nombre"
        name="name"
        type="text"
        autoComplete="name"
        required
        value={name}
        onChange={(event) => setName(event.target.value)}
        error={fieldErrors?.name?.[0]}
      />

      <div className="flex flex-col gap-1.5">
        <Input
          ref={emailRef}
          label="Correo electrónico"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
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
        ref={passwordRef}
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
        ref={confirmRef}
        label="Repetir contraseña"
        name="confirmPassword"
        type={showPassword ? 'text' : 'password'}
        autoComplete="new-password"
        required
        value={confirmPassword}
        onChange={(event) => setConfirmPassword(event.target.value)}
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
