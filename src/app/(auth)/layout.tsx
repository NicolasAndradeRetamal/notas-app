import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { auth } from '@/auth';

export default async function AuthLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (session?.user) redirect('/notes');

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 py-12">
      <Link
        href="/"
        className="mb-8 flex items-center gap-2 text-lg font-bold text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
      >
        <span aria-hidden className="text-primary">
          ●
        </span>
        notas
      </Link>
      <div className="w-full max-w-[25rem] rounded-xl border border-line bg-surface-raised p-6 shadow-sm">
        {children}
      </div>
    </main>
  );
}
