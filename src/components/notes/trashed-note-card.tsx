'use client';

import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { useState, useTransition } from 'react';
import { purgeNoteAction, restoreNoteAction } from '@/server/actions/note.actions';
import type { NoteSummaryDTO } from '@/types/dto';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useToast } from '@/components/ui/toast';
import { formatDateTime } from '@/components/format';

export function TrashedNoteCard({ note }: { note: NoteSummaryDTO }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [confirmPurge, setConfirmPurge] = useState(false);

  const handleRestore = () => {
    startTransition(async () => {
      const result = await restoreNoteAction({ id: note.id });
      if (!result.ok) {
        toast({ variant: 'error', title: result.message });
        return;
      }
      toast({ variant: 'success', title: 'Nota restaurada.', action: { label: 'Ver nota', onClick: () => router.push(`/notes/${note.id}`) } });
      router.refresh();
    });
  };

  const handlePurge = () => {
    startTransition(async () => {
      const result = await purgeNoteAction({ id: note.id });
      if (!result.ok) {
        toast({ variant: 'error', title: result.message });
        return;
      }
      toast({ variant: 'success', title: 'Nota eliminada definitivamente.' });
      setConfirmPurge(false);
      router.refresh();
    });
  };

  return (
    <div className="min-h-40 rounded-lg border border-line bg-surface-raised p-4">
      <div className="flex items-center gap-2">
        <Trash2 className="h-4 w-4 shrink-0 text-ink-subtle" aria-hidden="true" />
        <h3 className="line-clamp-2 text-base font-semibold text-ink-muted">{note.title}</h3>
      </div>
      {note.excerpt ? <p className="mt-2 line-clamp-2 text-sm text-ink-muted">{note.excerpt}</p> : null}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {note.notebook ? (
          <Badge
            icon={
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: note.notebook.color ?? 'var(--color-ink-subtle)' }}
                aria-hidden="true"
              />
            }
          >
            {note.notebook.name}
          </Badge>
        ) : null}
      </div>
      <p className="mt-3 text-[0.8125rem] text-ink-subtle">Eliminada el {formatDateTime(note.updatedAt)}</p>
      <div className="mt-3 flex gap-2">
        <Button variant="secondary" size="sm" onClick={handleRestore} loading={pending}>
          Restaurar
        </Button>
        <Button variant="danger-ghost" size="sm" onClick={() => setConfirmPurge(true)}>
          Eliminar definitivamente
        </Button>
      </div>
      <ConfirmDialog
        open={confirmPurge}
        onClose={() => setConfirmPurge(false)}
        onConfirm={handlePurge}
        title="Eliminar definitivamente"
        description={`«${note.title}» se eliminará para siempre. Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar definitivamente"
        confirmingLabel="Eliminando…"
        destructive
        pending={pending}
      />
    </div>
  );
}
