import Link from 'next/link';
import type { SearchHitDTO, NotebookDTO, TagDTO } from '@/types/dto';
import { Badge } from '@/components/ui/badge';
import { TagBadge } from '@/components/tags/tag-badge';
import { formatDateTime } from '@/components/format';
import { NoteActionsMenu } from './note-actions-menu';

export function SearchHitCard({
  hit,
  notebooks,
  tags,
}: {
  hit: SearchHitDTO;
  notebooks: NotebookDTO[];
  tags: TagDTO[];
}) {
  return (
    <div className="group border-line bg-surface-raised hover:border-line-strong relative rounded-lg border p-4 transition-[border-color,box-shadow,transform] duration-150 hover:-translate-y-px hover:shadow-sm">
      <Link
        href={`/notes/${hit.id}`}
        className="focus-visible:outline-primary absolute inset-0 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <span className="sr-only">Abrir «{hit.title}»</span>
      </Link>
      <div className="relative flex items-start justify-between gap-2">
        <h3 className="text-ink line-clamp-2 text-base font-semibold">{hit.title}</h3>
        <div className="relative z-10">
          <NoteActionsMenu note={hit} notebooks={notebooks} tags={tags} />
        </div>
      </div>
      {hit.highlight ? (
        // The DTO contract guarantees `highlight` arrives already sanitized by the server.
        <p
          className="text-ink-muted [&_b]:bg-highlight [&_b]:text-ink mt-2 line-clamp-2 text-sm [&_b]:rounded-xs [&_b]:px-0.5 [&_b]:font-semibold [&_b]:not-italic"
          dangerouslySetInnerHTML={{ __html: hit.highlight }}
        />
      ) : hit.excerpt ? (
        <p className="text-ink-muted mt-2 line-clamp-2 text-sm">{hit.excerpt}</p>
      ) : null}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {hit.notebook ? (
          <Badge
            icon={
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: hit.notebook.color ?? 'var(--color-ink-subtle)' }}
                aria-hidden="true"
              />
            }
          >
            {hit.notebook.name}
          </Badge>
        ) : null}
        {hit.tags.slice(0, 3).map((tag) => (
          <TagBadge key={tag.id} name={tag.name} />
        ))}
      </div>
      <p className="text-ink-subtle mt-3 text-[0.8125rem]">
        Editada el {formatDateTime(hit.updatedAt)}
      </p>
    </div>
  );
}
