import type { ReactNode } from 'react';
import { getNotes } from '@/server/queries/note.queries';
import { searchNotes } from '@/server/queries/search.queries';
import type { NoteListParams } from '@/schemas/search.schema';
import type { NotebookDTO, TagDTO } from '@/types/dto';
import { NoteList, SearchHitList } from './note-list';
import { NotesFilterBar } from './notes-filter-bar';
import { NotesEmptyState } from './notes-empty-state';
import { SortSelect } from './sort-select';
import { Pagination } from '@/components/ui/pagination';
import { pluralize } from '@/components/format';

function sortLabel(sort: NoteListParams['sort']) {
  if (sort === 'created') return 'fecha de creación';
  if (sort === 'title') return 'título (A–Z)';
  return 'última edición';
}

type NotesListingProps = {
  basePath: string;
  params: NoteListParams;
  notebooks: NotebookDTO[];
  tags: TagDTO[];
  heading: ReactNode;
  emptyState:
    | 'all-notes'
    | { kind: 'notebook-empty'; notebookId: string; notebookName: string }
    | { kind: 'tag-empty'; tagName: string };
  notebookName?: string;
  tagName?: string;
  hideNotebookChip?: boolean;
  hideTagChip?: boolean;
  fixedQuery?: Record<string, string>;
};

export async function NotesListing({
  basePath,
  params,
  notebooks,
  tags,
  heading,
  emptyState,
  notebookName,
  tagName,
  hideNotebookChip,
  hideTagChip,
  fixedQuery = {},
}: NotesListingProps) {
  const buildHref = (page: number) => ({
    pathname: basePath,
    query: {
      ...fixedQuery,
      ...(params.q ? { q: params.q } : {}),
      ...(!hideNotebookChip && params.notebookId ? { notebookId: params.notebookId } : {}),
      ...(!hideTagChip && params.tagSlug ? { tagSlug: params.tagSlug } : {}),
      ...(params.sort !== 'updated' ? { sort: params.sort } : {}),
      page: String(page),
    },
  });
  const clearHref = { pathname: basePath, query: fixedQuery };

  if (params.q) {
    const result = await searchNotes(params);
    return (
      <div className="space-y-6 md:space-y-8">
        <div className="space-y-1">
          {heading}
          <p aria-live="polite" className="text-meta text-ink-subtle tabular-nums">
            {pluralize(result.total, 'resultado', 'resultados')} para «{params.q}»
          </p>
        </div>
        <NotesFilterBar
          basePath={basePath}
          params={params}
          notebookName={notebookName}
          tagName={tagName}
          hideNotebookChip={hideNotebookChip}
          hideTagChip={hideTagChip}
        />
        {result.items.length === 0 ? (
          <NotesEmptyState kind="search-empty" query={params.q} clearHref={clearHref} />
        ) : (
          <SearchHitList hits={result.items} notebooks={notebooks} tags={tags} />
        )}
        <Pagination
          page={result.page}
          pageSize={result.pageSize}
          total={result.total}
          hasMore={result.hasMore}
          buildHref={buildHref}
        />
      </div>
    );
  }

  const result = await getNotes(params);
  const hasExtraFilters = Boolean(
    (params.notebookId && !hideNotebookChip) ||
    (params.tagSlug && !hideTagChip) ||
    params.sort !== 'updated',
  );

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="space-y-1">
        {heading}
        <p aria-live="polite" className="text-meta text-ink-subtle tabular-nums">
          {pluralize(result.total, 'nota', 'notas')} · orden: {sortLabel(params.sort)}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <NotesFilterBar
          basePath={basePath}
          params={params}
          notebookName={notebookName}
          tagName={tagName}
          hideNotebookChip={hideNotebookChip}
          hideTagChip={hideTagChip}
        />
        <SortSelect />
      </div>

      {result.items.length === 0 ? (
        hasExtraFilters ? (
          <NotesEmptyState kind="filters-empty" total={result.total} clearHref={clearHref} />
        ) : emptyState === 'all-notes' ? (
          <NotesEmptyState kind="all-notes" />
        ) : emptyState.kind === 'notebook-empty' ? (
          <NotesEmptyState
            kind="notebook-empty"
            notebookId={emptyState.notebookId}
            notebookName={emptyState.notebookName}
          />
        ) : (
          <NotesEmptyState kind="tag-empty" tagName={emptyState.tagName} />
        )
      ) : (
        <NoteList notes={result.items} notebooks={notebooks} tags={tags} />
      )}

      <Pagination
        page={result.page}
        pageSize={result.pageSize}
        total={result.total}
        hasMore={result.hasMore}
        buildHref={buildHref}
      />
    </div>
  );
}
