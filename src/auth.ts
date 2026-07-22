import NextAuth, { type DefaultSession } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from '@/auth.config';
import { prisma } from '@/lib/prisma';
import { hashPassword, verifyPassword } from '@/server/auth/password';
import { loginSchema } from '@/schemas/auth.schema';

declare module 'next-auth' {
  interface Session {
    user: { id: string } & DefaultSession['user'];
  }
}

// Computed once and reused so a nonexistent email still pays the argon2 cost,
// preventing a timing side-channel that would reveal which emails are registered.
let dummyHash: Promise<string> | undefined;
function getDummyHash(): Promise<string> {
  dummyHash ??= hashPassword('dummy-password-used-only-for-timing-safety');
  return dummyHash;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({ where: { email } });

        const passwordHash = user?.active ? user.passwordHash : await getDummyHash();
        const isValid = await verifyPassword(passwordHash, password);

        if (!user?.active || !isValid) return null;

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
});
