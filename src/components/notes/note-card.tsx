import Link from 'next/link';
import type { NoteSummaryDTO, NotebookDTO, TagDTO } from '@/types/dto';
import { Badge } from '@/components/ui/badge';
import { TagBadge } from '@/components/tags/tag-badge';
import { formatDateTime } from '@/components/format';
import { NoteActionsMenu } from './note-actions-menu';

const MAX_VISIBLE_TAGS = 3;

export function NoteCard({
  note,
  notebooks,
  tags,
}: {
  note: NoteSummaryDTO;
  notebooks: NotebookDTO[];
  tags: TagDTO[];
}) {
  const visibleTags = note.tags.slice(0, MAX_VISIBLE_TAGS);
  const extraTagsCount = note.tags.length - visibleTags.length;
  const extraTagNames = note.tags.slice(MAX_VISIBLE_TAGS).map((t) => t.name).join(', ');
  const dateLabel = note.createdAt === note.updatedAt ? 'Creada el' : 'Editada el';

  return (
    <div className="group relative min-h-40 rounded-lg border border-line bg-surface-raised p-4 transition-[border-color,box-shadow,transform] duration-150 hover:-translate-y-px hover:border-line-strong hover:shadow-sm">
      <Link
        href={`/notes/${note.id}`}
        className="absolute inset-0 rounded-lg focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
      >
        <span className="sr-only">Abrir «{note.title}»</span>
      </Link>
      <div className="relative flex items-start justify-between gap-2">
        <h3 className="line-clamp-2 text-base font-semibold text-ink">{note.title}</h3>
        <div className="relative z-10">
          <NoteActionsMenu note={note} notebooks={notebooks} tags={tags} />
        </div>
      </div>
      {note.excerpt ? (
        <p className="mt-2 line-clamp-2 text-sm text-ink-muted">{note.excerpt}</p>
      ) : null}
      {note.notebook || visibleTags.length > 0 ? (
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
          {visibleTags.map((tag) => (
            <TagBadge key={tag.id} name={tag.name} />
          ))}
          {extraTagsCount > 0 ? <Badge title={extraTagNames}>+{extraTagsCount}</Badge> : null}
        </div>
      ) : null}
      <p className="mt-3 text-[0.8125rem] text-ink-subtle">
        {dateLabel} {formatDateTime(note.updatedAt)}
      </p>
    </div>
  );
}
