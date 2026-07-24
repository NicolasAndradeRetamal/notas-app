import type { Metadata } from 'next';
import { ChevronLeft, Pencil } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getNoteById } from '@/server/queries/note.queries';
import { getNotebooks } from '@/server/queries/notebook.queries';
import { getTags } from '@/server/queries/tag.queries';
import { Badge } from '@/components/ui/badge';
import { LinkButton } from '@/components/ui/link-button';
import { TagBadge } from '@/components/tags/tag-badge';
import { NoteActionsMenu } from '@/components/notes/note-actions-menu';
import { NoteContent } from '@/components/notes/note-content';
import { formatDate, formatDateTime } from '@/components/format';

type NotePageProps = {
  params: Promise<{ noteId: string }>;
};

export async function generateMetadata({ params }: NotePageProps): Promise<Metadata> {
  const { noteId } = await params;
  const note = await getNoteById(noteId);
  return { title: note ? note.title : 'Nota' };
}

export default async function NotePage({ params }: NotePageProps) {
  const { noteId } = await params;
  const [note, notebooks, tags] = await Promise.all([
    getNoteById(noteId),
    getNotebooks(),
    getTags(),
  ]);

  if (!note) notFound();

  return (
    <div className="mx-auto max-w-[44rem]">
      {note.notebook ? (
        <Link
          href={`/notebooks/${note.notebook.id}`}
          className="text-ink-muted hover:text-ink mb-4 inline-flex items-center gap-1 text-sm"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Volver a {note.notebook.name}
        </Link>
      ) : (
        <Link
          href="/notes"
          className="text-ink-muted hover:text-ink mb-4 inline-flex items-center gap-1 text-sm"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Volver a mis notas
        </Link>
      )}

      <div className="border-line flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <h1 className="text-ink text-2xl font-bold tracking-tight text-balance md:text-3xl">
            {note.title}
          </h1>
          {note.notebook || note.tags.length > 0 ? (
            <div className="flex flex-wrap items-center gap-1.5">
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
              {note.tags.map((tag) => (
                <TagBadge key={tag.id} name={tag.name} />
              ))}
            </div>
          ) : null}
          <p className="text-meta text-ink-subtle">
            Creada el {formatDate(note.createdAt)} · Editada el {formatDateTime(note.updatedAt)}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <LinkButton
            href={`/notes/${note.id}/edit`}
            icon={<Pencil aria-hidden="true" />}
            className="flex-1 sm:flex-none"
          >
            Editar
          </LinkButton>
          <NoteActionsMenu
            note={note}
            notebooks={notebooks}
            tags={tags}
            showOpen={false}
            showCopyMarkdown
          />
        </div>
      </div>

      <div className="py-6">
        <NoteContent content={note.content} />
      </div>
    </div>
  );
}
