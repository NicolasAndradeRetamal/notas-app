import { getNotebooks } from '@/server/queries/notebook.queries';
import { getTags } from '@/server/queries/tag.queries';
import { NoteEditor } from '@/components/notes/note-editor';

type NewNotePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NewNotePage({ searchParams }: NewNotePageProps) {
  const [notebooks, tags, params] = await Promise.all([getNotebooks(), getTags(), searchParams]);
  const notebookId = typeof params.notebookId === 'string' ? params.notebookId : undefined;
  const preset = notebookId && notebooks.some((n) => n.id === notebookId) ? notebookId : undefined;

  return (
    <div className="flex min-h-[calc(100dvh-8rem)] flex-col">
      <h1 className="sr-only">Nueva nota</h1>
      <NoteEditor mode="create" notebooks={notebooks} tags={tags} initialNotebookId={preset} />
    </div>
  );
}
