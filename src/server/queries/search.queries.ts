import 'server-only';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/server/auth/session';
import { sanitizeHighlight } from '@/lib/markdown';
import { toNoteSummaryDTO } from '@/server/mappers/note.mapper';
import { noteWithRelationsInclude } from '@/server/queries/note.queries';
import type { NoteListParams } from '@/schemas/search.schema';
import type { PaginatedDTO, SearchHitDTO } from '@/types/dto';

type SearchRow = {
  id: string;
  rank: number;
  highlight: string | null;
  total: bigint;
};

const EMPTY_RESULT = (page: number, pageSize: number): PaginatedDTO<SearchHitDTO> => ({
  items: [],
  total: 0,
  page,
  pageSize,
  hasMore: false,
});

export async function searchNotes(params: NoteListParams): Promise<PaginatedDTO<SearchHitDTO>> {
  const user = await requireUser();
  const { q, page, pageSize, notebookId, tagSlug } = params;
  const query = q?.trim();

  if (!query) return EMPTY_RESULT(page, pageSize);

  const offset = (page - 1) * pageSize;
  const notebookFilter = notebookId ?? null;
  const tagFilter = tagSlug ?? null;

  // Filters are expressed as EXISTS/NULL checks (not JOINs) so a note with
  // several tags never produces duplicate rows in the result set.
  const rows = await prisma.$queryRaw<SearchRow[]>`
    SELECT n.id,
           ts_rank_cd(n.search_vector, q) AS rank,
           ts_headline('spanish', n.content, q,
                       'MaxFragments=1,MaxWords=30,MinWords=10') AS highlight,
           count(*) OVER() AS total
    FROM note n, websearch_to_tsquery('spanish', ${query}) q
    WHERE n.user_id = ${user.id}::uuid
      AND n.active
      AND n.search_vector @@ q
      AND (${notebookFilter}::uuid IS NULL OR n.notebook_id = ${notebookFilter}::uuid)
      AND (
        ${tagFilter}::text IS NULL OR EXISTS (
          SELECT 1 FROM note_tag nt
          JOIN tag t ON t.id = nt.tag_id AND t.active
          WHERE nt.note_id = n.id AND nt.active AND t.slug = ${tagFilter}::text
        )
      )
    ORDER BY rank DESC, n.updated_at DESC
    LIMIT ${pageSize} OFFSET ${offset};
  `;

  if (rows.length === 0) return EMPTY_RESULT(page, pageSize);

  const total = Number(rows[0]!.total);
  const rankById = new Map(rows.map((row) => [row.id, row.rank]));
  const highlightById = new Map(rows.map((row) => [row.id, row.highlight]));

  const notes = await prisma.note.findMany({
    where: { id: { in: rows.map((row) => row.id) }, userId: user.id, active: true },
    include: noteWithRelationsInclude,
  });
  const notesById = new Map(notes.map((note) => [note.id, note]));

  const items = rows
    .map((row) => notesById.get(row.id))
    .filter((note): note is (typeof notes)[number] => Boolean(note))
    .map((note) => {
      const highlight = highlightById.get(note.id) ?? null;
      return {
        ...toNoteSummaryDTO(note),
        rank: rankById.get(note.id) ?? 0,
        highlight: highlight ? sanitizeHighlight(highlight) : null,
      };
    });

  return { items, total, page, pageSize, hasMore: page * pageSize < total };
}
