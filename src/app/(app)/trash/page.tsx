import { noteListParamsSchema } from '@/schemas/search.schema';
import { getTrashedNotes } from '@/server/queries/note.queries';
import { TrashedNoteCard } from '@/components/notes/trashed-note-card';
import { EmptyTrashButton } from '@/components/notes/empty-trash-button';
import { EmptyState } from '@/components/ui/empty-state';
import { Pagination } from '@/components/ui/pagination';
import { pluralize } from '@/components/format';
import { Trash2 } from 'lucide-react';

type TrashPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function TrashPage({ searchParams }: TrashPageProps) {
  const raw = await searchParams;
  const { page } = noteListParamsSchema.parse({ page: raw.page });
  const result = await getTrashedNotes(page);

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-ink md:text-3xl">Papelera</h1>
          <p className="text-meta text-ink-subtle">
            {pluralize(result.total, 'nota eliminada', 'notas eliminadas')} · se conservan hasta que las elimines
            definitivamente
          </p>
        </div>
        <EmptyTrashButton disabled={result.total === 0} />
      </div>

      {result.items.length === 0 ? (
        <EmptyState icon={Trash2} title="La papelera está vacía" description="Las notas que elimines aparecerán aquí hasta que las elimines definitivamente." />
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-6 xl:grid-cols-3">
          {result.items.map((note) => (
            <li key={note.id}>
              <TrashedNoteCard note={note} />
            </li>
          ))}
        </ul>
      )}

      <Pagination
        page={result.page}
        pageSize={result.pageSize}
        total={result.total}
        hasMore={result.hasMore}
        buildHref={(p) => ({ pathname: '/trash', query: { page: String(p) } })}
      />
    </div>
  );
}
