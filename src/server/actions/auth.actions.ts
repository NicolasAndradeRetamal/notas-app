'use server';

import 'server-only';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { AuthError } from 'next-auth';
import { signIn, signOut } from '@/auth';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/server/auth/password';
import { fail, type ActionResult } from '@/lib/action-result';
import {
  loginSchema,
  registerSchema,
  type LoginInput,
  type RegisterInput,
} from '@/schemas/auth.schema';
import type { UserDTO } from '@/types/dto';

export async function registerAction(
  _prevState: ActionResult<UserDTO, RegisterInput> | null,
  formData: FormData,
): Promise<ActionResult<UserDTO, RegisterInput>> {
  const parsed = registerSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  });

  if (!parsed.success) {
    return fail(
      'VALIDATION_ERROR',
      'Revisa los datos del formulario.',
      z.flattenError(parsed.error).fieldErrors,
    );
  }

  const { name, email, password } = parsed.data;

  try {
    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing?.active) {
      return fail('CONFLICT', 'Ya existe una cuenta con ese correo.');
    }

    const passwordHash = await hashPassword(password);

    // A deactivated account keeps its email: registering again reactivates it
    // instead of leaving the identifier permanently unusable.
    if (existing) {
      await prisma.user.update({
        where: { id: existing.id },
        data: { name, passwordHash, active: true },
      });
    } else {
      await prisma.user.create({ data: { name, email, passwordHash } });
    }

    try {
      await signIn('credentials', { email, password, redirect: false });
    } catch (error) {
      console.error('registerAction: sign-in after register failed', error);
      return fail(
        'INTERNAL_ERROR',
        'Tu cuenta se creó, pero no se pudo iniciar sesión. Inicia sesión manualmente.',
      );
    }
  } catch (error) {
    console.error('registerAction failed', error);
    return fail('INTERNAL_ERROR', 'No se pudo completar el registro. Inténtalo de nuevo.');
  }

  redirect('/notes');
}

export async function loginAction(
  _prevState: ActionResult<never, LoginInput> | null,
  formData: FormData,
): Promise<ActionResult<never, LoginInput>> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return fail(
      'VALIDATION_ERROR',
      'Revisa los datos del formulario.',
      z.flattenError(parsed.error).fieldErrors,
    );
  }

  const { email, password } = parsed.data;

  try {
    await signIn('credentials', { email, password, redirect: false });
  } catch (error) {
    // Same message whether the email doesn't exist or the password is wrong,
    // so the response never reveals which registered emails exist.
    if (error instanceof AuthError) {
      return fail('UNAUTHENTICATED', 'Correo o contraseña incorrectos.');
    }
    console.error('loginAction failed', error);
    return fail('INTERNAL_ERROR', 'No se pudo iniciar sesión. Inténtalo de nuevo.');
  }

  redirect('/notes');
}

export async function logoutAction(): Promise<void> {
  await signOut({ redirect: false });
  redirect('/login');
}
