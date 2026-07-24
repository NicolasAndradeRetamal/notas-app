import Link from 'next/link';
import type { NoteListParams } from '@/schemas/search.schema';
import { FilterChipLink } from './filter-chip-link';

type NotesFilterBarProps = {
  basePath: string;
  params: NoteListParams;
  notebookName?: string;
  tagName?: string;
  hideNotebookChip?: boolean;
  hideTagChip?: boolean;
};

function withoutParam(params: NoteListParams, key: keyof NoteListParams) {
  const next: Record<string, string> = {};
  if (params.q && key !== 'q') next.q = params.q;
  if (params.notebookId && key !== 'notebookId') next.notebookId = params.notebookId;
  if (params.tagSlug && key !== 'tagSlug') next.tagSlug = params.tagSlug;
  if (params.sort !== 'updated') next.sort = params.sort;
  return next;
}

export function NotesFilterBar({
  basePath,
  params,
  notebookName,
  tagName,
  hideNotebookChip,
  hideTagChip,
}: NotesFilterBarProps) {
  const chips: {
    key: string;
    label: string;
    removeLabel: string;
    query: Record<string, string>;
  }[] = [];

  if (params.q) {
    chips.push({
      key: 'q',
      label: `Búsqueda: «${params.q}»`,
      removeLabel: 'Quitar el filtro de búsqueda',
      query: withoutParam(params, 'q'),
    });
  }
  if (params.notebookId && !hideNotebookChip) {
    chips.push({
      key: 'notebookId',
      label: `Cuaderno: ${notebookName ?? ''}`,
      removeLabel: 'Quitar el filtro de cuaderno',
      query: withoutParam(params, 'notebookId'),
    });
  }
  if (params.tagSlug && !hideTagChip) {
    chips.push({
      key: 'tagSlug',
      label: `Etiqueta: #${tagName ?? params.tagSlug}`,
      removeLabel: `Quitar el filtro de etiqueta #${tagName ?? params.tagSlug}`,
      query: withoutParam(params, 'tagSlug'),
    });
  }
  if (params.sort !== 'updated') {
    const sortLabel = params.sort === 'created' ? 'fecha de creación' : 'título (A–Z)';
    chips.push({
      key: 'sort',
      label: `Orden: ${sortLabel}`,
      removeLabel: 'Quitar el orden personalizado',
      query: withoutParam(params, 'sort'),
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <FilterChipLink
          key={chip.key}
          label={chip.label}
          removeLabel={chip.removeLabel}
          href={{ pathname: basePath, query: chip.query }}
        />
      ))}
      {chips.length > 1 ? (
        <Link
          href={basePath}
          className="text-ui text-ink-muted hover:bg-surface-sunken hover:text-ink inline-flex h-9 items-center rounded-md px-3 text-sm"
        >
          Limpiar filtros
        </Link>
      ) : null}
    </div>
  );
}
