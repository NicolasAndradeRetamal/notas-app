import { Compass } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import { LinkButton } from '@/components/ui/link-button';

export default function NoteNotFound() {
  return (
    <EmptyState
      icon={Compass}
      title="No encontramos esta página"
      description="Esta nota no existe o ya no tienes acceso a ella."
      action={
        <LinkButton href="/notes" size="lg">
          Ir a mis notas
        </LinkButton>
      }
    />
  );
}
