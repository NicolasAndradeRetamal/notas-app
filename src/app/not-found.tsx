import { Compass } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import { LinkButton } from '@/components/ui/link-button';

export default function NotFound() {
  return (
    <main id="main" className="flex min-h-dvh items-center justify-center p-6">
      <EmptyState
        icon={Compass}
        title="No encontramos esta página"
        description="Puede que el enlace esté mal o que el contenido ya no exista."
        action={
          <LinkButton href="/notes" size="lg">
            Ir a mis notas
          </LinkButton>
        }
      />
    </main>
  );
}
