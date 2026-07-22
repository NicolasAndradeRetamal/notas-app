'use server';

import 'server-only';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/slug';
import { requireUser, UnauthenticatedError } from '@/server/auth/session';
import { toNotebookDTO } from '@/server/mappers/notebook.mapper';
import { fail, ok, type ActionResult } from '@/lib/action-result';
import {
  createNotebookSchema,
  notebookIdSchema,
  reorderNotebooksSchema,
  updateNotebookSchema,
  type CreateNotebookInput,
  type UpdateNotebookInput,
} from '@/schemas/notebook.schema';
import type { NotebookDTO } from '@/types/dto';

const NOTEBOOK_SLUG_MAX_LENGTH = 96;
const activeNoteCount = { _count: { select: { notes: { where: { active: true } } } } } as const;

function isUniqueConstraintError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
}

export async function createNotebookAction(
  input: CreateNotebookInput,
): Promise<ActionResult<NotebookDTO, CreateNotebookInput>> {
  const parsed = createNotebookSchema.safeParse(input);
  if (!parsed.success) {
    return fail(
      'VALIDATION_ERROR',
      'Revisa los datos del cuaderno.',
      z.flattenError(parsed.error).fieldErrors,
    );
  }

  const { name, color } = parsed.data;

  try {
    const user = await requireUser();
    const slug = slugify(name, NOTEBOOK_SLUG_MAX_LENGTH);

    const existing = await prisma.notebook.findUnique({
      where: { userId_slug: { userId: user.id, slug } },
    });

    if (existing?.active) {
      return fail('CONFLICT', 'Ya existe un cuaderno con ese nombre.');
    }

    // An inactive notebook with the same slug is reactivated instead of creating a duplicate.
    const notebook = existing
      ? await prisma.notebook.update({
          where: { id: existing.id },
          data: { name, color, active: true },
          include: activeNoteCount,
        })
      : await prisma.notebook.create({
          data: { userId: user.id, name, slug, color },
          include: activeNoteCount,
        });

    revalidatePath('/(app)', 'layout');
    return ok(toNotebookDTO(notebook));
  } catch (error) {
    if (error instanceof UnauthenticatedError) {
      return fail('UNAUTHENTICATED', 'Debes iniciar sesión para continuar.');
    }
    if (isUniqueConstraintError(error)) {
      return fail('CONFLICT', 'Ya existe un cuaderno con ese nombre.');
    }
    console.error('createNotebookAction failed', error);
    return fail('INTERNAL_ERROR', 'No se pudo crear el cuaderno. Inténtalo de nuevo.');
  }
}

export async function updateNotebookAction(
  input: UpdateNotebookInput,
): Promise<ActionResult<NotebookDTO, UpdateNotebookInput>> {
  const parsed = updateNotebookSchema.safeParse(input);
  if (!parsed.success) {
    return fail(
      'VALIDATION_ERROR',
      'Revisa los datos del cuaderno.',
      z.flattenError(parsed.error).fieldErrors,
    );
  }

  const { id, name, color } = parsed.data;

  try {
    const user = await requireUser();
    const existing = await prisma.notebook.findFirst({
      where: { id, userId: user.id, active: true },
    });
    if (!existing) return fail('NOT_FOUND', 'El cuaderno no existe.');

    const slug = slugify(name, NOTEBOOK_SLUG_MAX_LENGTH);
    const notebook = await prisma.notebook.update({
      where: { id },
      data: { name, slug, color },
      include: activeNoteCount,
    });

    revalidatePath('/(app)', 'layout');
    return ok(toNotebookDTO(notebook));
  } catch (error) {
    if (error instanceof UnauthenticatedError) {
      return fail('UNAUTHENTICATED', 'Debes iniciar sesión para continuar.');
    }
    if (isUniqueConstraintError(error)) {
      return fail('CONFLICT', 'Ya existe un cuaderno con ese nombre.');
    }
    console.error('updateNotebookAction failed', error);
    return fail('INTERNAL_ERROR', 'No se pudo actualizar el cuaderno. Inténtalo de nuevo.');
  }
}

export async function deleteNotebookAction(input: {
  id: string;
}): Promise<ActionResult<{ id: string; detachedNotes: number }>> {
  const parsed = notebookIdSchema.safeParse(input);
  if (!parsed.success) return fail('VALIDATION_ERROR', 'Identificador de cuaderno no válido.');

  const { id } = parsed.data;

  try {
    const user = await requireUser();
    const existing = await prisma.notebook.findFirst({
      where: { id, userId: user.id, active: true },
    });
    if (!existing) return fail('NOT_FOUND', 'El cuaderno no existe.');

    const detachedNotes = await prisma.$transaction(async (tx) => {
      const { count } = await tx.note.updateMany({
        where: { notebookId: id, userId: user.id, active: true },
        data: { notebookId: null },
      });
      await tx.notebook.update({ where: { id }, data: { active: false } });
      return count;
    });

    revalidatePath('/(app)', 'layout');
    return ok({ id, detachedNotes });
  } catch (error) {
    if (error instanceof UnauthenticatedError) {
      return fail('UNAUTHENTICATED', 'Debes iniciar sesión para continuar.');
    }
    console.error('deleteNotebookAction failed', error);
    return fail('INTERNAL_ERROR', 'No se pudo eliminar el cuaderno. Inténtalo de nuevo.');
  }
}

export async function reorderNotebooksAction(input: {
  orderedIds: string[];
}): Promise<ActionResult<NotebookDTO[]>> {
  const parsed = reorderNotebooksSchema.safeParse(input);
  if (!parsed.success) return fail('VALIDATION_ERROR', 'Lista de cuadernos no válida.');

  const { orderedIds } = parsed.data;

  try {
    const user = await requireUser();

    const owned = await prisma.notebook.count({
      where: { id: { in: orderedIds }, userId: user.id, active: true },
    });
    if (owned !== orderedIds.length)
      return fail('FORBIDDEN', 'Alguno de los cuadernos no te pertenece.');

    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.notebook.update({ where: { id }, data: { position: index } }),
      ),
    );

    const notebooks = await prisma.notebook.findMany({
      where: { userId: user.id, active: true },
      orderBy: { position: 'asc' },
      include: activeNoteCount,
    });

    revalidatePath('/(app)', 'layout');
    return ok(notebooks.map(toNotebookDTO));
  } catch (error) {
    if (error instanceof UnauthenticatedError) {
      return fail('UNAUTHENTICATED', 'Debes iniciar sesión para continuar.');
    }
    console.error('reorderNotebooksAction failed', error);
    return fail('INTERNAL_ERROR', 'No se pudo reordenar los cuadernos. Inténtalo de nuevo.');
  }
}
