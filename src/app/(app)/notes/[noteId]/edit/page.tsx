import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getNoteById } from '@/server/queries/note.queries';
import { getNotebooks } from '@/server/queries/notebook.queries';
import { getTags } from '@/server/queries/tag.queries';
import { NoteEditor } from '@/components/notes/note-editor';

type EditNotePageProps = {
  params: Promise<{ noteId: string }>;
};

export async function generateMetadata({ params }: EditNotePageProps): Promise<Metadata> {
  const { noteId } = await params;
  const note = await getNoteById(noteId);
  return { title: note ? `Editar: ${note.title}` : 'Editar nota' };
}

export default async function EditNotePage({ params }: EditNotePageProps) {
  const { noteId } = await params;
  const [note, notebooks, tags] = await Promise.all([
    getNoteById(noteId),
    getNotebooks(),
    getTags(),
  ]);

  if (!note) notFound();

  return (
    <div className="flex min-h-[calc(100dvh-8rem)] flex-col">
      <h1 className="sr-only">Editar «{note.title}»</h1>
      <NoteEditor mode="edit" note={note} notebooks={notebooks} tags={tags} />
    </div>
  );
}
