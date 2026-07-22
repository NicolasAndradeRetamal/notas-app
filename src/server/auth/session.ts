import 'server-only';
import { auth } from '@/auth';
import type { UserDTO } from '@/types/dto';

export { UnauthenticatedError } from '@/server/auth/errors';
import { UnauthenticatedError } from '@/server/auth/errors';

export async function getCurrentUser(): Promise<UserDTO | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  return {
    id: session.user.id,
    name: session.user.name ?? '',
    email: session.user.email ?? '',
  };
}

/** Every query and action resolves the caller from the session, never from a parameter. */
export async function requireUser(): Promise<UserDTO> {
  const user = await getCurrentUser();
  if (!user) throw new UnauthenticatedError();
  return user;
}