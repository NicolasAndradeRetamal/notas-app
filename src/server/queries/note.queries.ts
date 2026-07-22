import 'server-only';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/server/auth/session';
import { toNoteDetailDTO, toNoteSummaryDTO } from '@/server/mappers/note.mapper';
import { searchNotes } from '@/server/queries/search.queries';
import type { NoteListParams } from '@/schemas/search.schema';
import type { NoteDetailDTO, NoteSummaryDTO, PaginatedDTO } from '@/types/dto';

const TRASH_PAGE_SIZE = 20;

export const noteWithRelationsInclude = {
  notebook: true,
  noteTags: {
    where: { active: true, tag: { active: true } },
    include: { tag: true },
  },
} as const;

export async function getNotes(params: NoteListParams): Promise<PaginatedDTO<NoteSummaryDTO>> {
  if (params.q) {
    return searchNotes(params);
  }

  const user = await requireUser();
  const { page, pageSize, notebookId, tagSlug, sort } = params;

  const where = {
    userId: user.id,
    active: true,
    ...(notebookId ? { notebookId } : {}),
    ...(tagSlug
      ? { noteTags: { some: { active: true, tag: { slug: tagSlug, userId: user.id, active: true } } } }
      : {}),
  };

  const orderBy =
    sort === 'title'
      ? { title: 'asc' as const }
      : sort === 'created'
        ? { createdAt: 'desc' as const }
        : { updatedAt: 'desc' as const };

  const [items, total] = await Promise.all([
    prisma.note.findMany({
      where,
      include: noteWithRelationsInclude,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.note.count({ where }),
  ]);

  return {
    items: items.map(toNoteSummaryDTO),
    total,
    page,
    pageSize,
    hasMore: page * pageSize < total,
  };
}

export async function getNoteById(id: string): Promise<NoteDetailDTO | null> {
  if (!z.uuid().safeParse(id).success) return null;

  const user = await requireUser();
  const note = await prisma.note.findFirst({
    where: { id, userId: user.id, active: true },
    include: noteWithRelationsInclude,
  });

  return note ? toNoteDetailDTO(note) : null;
}

export async function getTrashedNotes(page = 1): Promise<PaginatedDTO<NoteSummaryDTO>> {
  const user = await requireUser();
  const where = { userId: user.id, active: false };

  const [items, total] = await Promise.all([
    prisma.note.findMany({
      where,
      include: noteWithRelationsInclude,
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * TRASH_PAGE_SIZE,
      take: TRASH_PAGE_SIZE,
    }),
    prisma.note.count({ where }),
  ]);

  return {
    items: items.map(toNoteSummaryDTO),
    total,
    page,
    pageSize: TRASH_PAGE_SIZE,
    hasMore: page * TRASH_PAGE_SIZE < total,
  };
}