'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { LinkButton } from '@/components/ui/link-button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 text-center">
      <div>
        <h1 className="text-2xl font-bold text-ink">Algo ha salido mal</h1>
        <p className="mt-2 max-w-[46ch] text-[15px] text-ink-muted">
          No hemos podido cargar esta página. Puedes intentarlo de nuevo o volver a tus notas.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button onClick={reset}>Intentar de nuevo</Button>
        <LinkButton href="/notes" variant="secondary">
          Volver a mis notas
        </LinkButton>
      </div>
    </main>
  );
}
