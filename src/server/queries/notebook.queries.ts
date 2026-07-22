import 'server-only';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/server/auth/session';
import { toNotebookDTO } from '@/server/mappers/notebook.mapper';
import type { NotebookDTO } from '@/types/dto';

const activeNoteCount = { _count: { select: { notes: { where: { active: true } } } } } as const;

export async function getNotebooks(): Promise<NotebookDTO[]> {
  const user = await requireUser();
  const notebooks = await prisma.notebook.findMany({
    where: { userId: user.id, active: true },
    orderBy: { position: 'asc' },
    include: activeNoteCount,
  });

  return notebooks.map(toNotebookDTO);
}

export async function getNotebookById(id: string): Promise<NotebookDTO | null> {
  if (!z.uuid().safeParse(id).success) return null;

  const user = await requireUser();
  const notebook = await prisma.notebook.findFirst({
    where: { id, userId: user.id, active: true },
    include: activeNoteCount,
  });

  return notebook ? toNotebookDTO(notebook) : null;
}