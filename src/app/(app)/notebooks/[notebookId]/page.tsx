import { notFound } from 'next/navigation';
import { getNotebookById, getNotebooks } from '@/server/queries/notebook.queries';
import { getTags } from '@/server/queries/tag.queries';
import { noteListParamsSchema } from '@/schemas/search.schema';
import { NotesListing } from '@/components/notes/notes-listing';

type NotebookPageProps = {
  params: Promise<{ notebookId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NotebookPage({ params, searchParams }: NotebookPageProps) {
  const { notebookId } = await params;
  const rawParams = await searchParams;

  const [notebook, notebooks, tags] = await Promise.all([
    getNotebookById(notebookId),
    getNotebooks(),
    getTags(),
  ]);

  if (!notebook) notFound();

  const listParams = noteListParamsSchema.parse({ ...rawParams, notebookId });

  return (
    <NotesListing
      basePath={`/notebooks/${notebookId}`}
      params={listParams}
      notebooks={notebooks}
      tags={tags}
      heading={
        <h1 className="text-ink flex items-center gap-2 text-2xl font-bold tracking-tight md:text-3xl">
          <span
            className="border-line h-2.5 w-2.5 shrink-0 rounded-full border"
            style={{ backgroundColor: notebook.color ?? 'var(--color-ink-subtle)' }}
            aria-hidden="true"
          />
          Cuaderno: {notebook.name}
        </h1>
      }
      emptyState={{ kind: 'notebook-empty', notebookId: notebook.id, notebookName: notebook.name }}
      hideNotebookChip
    />
  );
}
