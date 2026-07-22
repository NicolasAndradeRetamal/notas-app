'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@/generated/prisma/client';
import { deriveExcerpt } from '@/lib/excerpt';
import { requireUser, UnauthenticatedError } from '@/server/auth/session';
import { toNoteDetailDTO, toNoteSummaryDTO } from '@/server/mappers/note.mapper';
import { noteWithRelationsInclude } from '@/server/queries/note.queries';
import { fail, ok, type ActionFailure, type ActionResult } from '@/lib/action-result';
import {
  createNoteSchema,
  moveNoteSchema,
  noteIdSchema,
  setNoteTagsSchema,
  updateNoteSchema,
  type CreateNoteInput,
  type MoveNoteInput,
  type SetNoteTagsInput,
  type UpdateNoteInput,
} from '@/schemas/note.schema';
import type { NoteDetailDTO, NoteSummaryDTO } from '@/types/dto';

async function verifyNotebookAndTagsOwnership(
  userId: string,
  notebookId: string | null,
  tagIds: string[],
): Promise<ActionFailure | null> {
  if (notebookId) {
    const notebook = await prisma.notebook.findFirst({ where: { id: notebookId, userId, active: true } });
    if (!notebook) return fail('FORBIDDEN', 'El cuaderno seleccionado no existe o no te pertenece.');
  }

  if (tagIds.length > 0) {
    const owned = await prisma.tag.count({ where: { id: { in: tagIds }, userId, active: true } });
    if (owned !== tagIds.length) return fail('FORBIDDEN', 'Alguna etiqueta seleccionada no existe o no te pertenece.');
  }

  return null;
}

async function syncNoteTags(tx: Prisma.TransactionClient, noteId: string, tagIds: string[]): Promise<void> {
  await tx.noteTag.updateMany({ where: { noteId, active: true }, data: { active: false } });

  for (const tagId of tagIds) {
    await tx.noteTag.upsert({
      where: { noteId_tagId: { noteId, tagId } },
      update: { active: true },
      create: { noteId, tagId },
    });
  }
}

export async function createNoteAction(
  input: CreateNoteInput,
): Promise<ActionResult<NoteDetailDTO, CreateNoteInput>> {
  const parsed = createNoteSchema.safeParse(input);
  if (!parsed.success) {
    return fail('VALIDATION_ERROR', 'Revisa los datos de la nota.', z.flattenError(parsed.error).fieldErrors);
  }

  const { title, content, notebookId, tagIds } = parsed.data;
  const uniqueTagIds = [...new Set(tagIds)];

  let noteId: string;
  try {
    const user = await requireUser();

    const ownershipError = await verifyNotebookAndTagsOwnership(user.id, notebookId, uniqueTagIds);
    if (ownershipError) return ownershipError;

    const note = await prisma.note.create({
      data: {
        userId: user.id,
        title,
        content,
        excerpt: deriveExcerpt(content),
        notebookId,
        noteTags: { create: uniqueTagIds.map((tagId) => ({ tagId })) },
      },
    });

    noteId = note.id;
  } catch (error) {
    if (error instanceof UnauthenticatedError) {
      return fail('UNAUTHENTICATED', 'Debes iniciar sesión para continuar.');
    }
    console.error('createNoteAction failed', error);
    return fail('INTERNAL_ERROR', 'No se pudo crear la nota. Inténtalo de nuevo.');
  }

  revalidatePath('/notes');
  revalidatePath('/(app)', 'layout');
  redirect(`/notes/${noteId}`);
}

export async function updateNoteAction(
  input: UpdateNoteInput,
): Promise<ActionResult<NoteDetailDTO, UpdateNoteInput>> {
  const parsed = updateNoteSchema.safeParse(input);
  if (!parsed.success) {
    return fail('VALIDATION_ERROR', 'Revisa los datos de la nota.', z.flattenError(parsed.error).fieldErrors);
  }

  const { id, title, content, notebookId, tagIds } = parsed.data;
  const uniqueTagIds = [...new Set(tagIds)];

  try {
    const user = await requireUser();

    const ownershipError = await verifyNotebookAndTagsOwnership(user.id, notebookId, uniqueTagIds);
    if (ownershipError) return ownershipError;

    const existing = await prisma.note.findFirst({ where: { id, userId: user.id, active: true } });
    if (!existing) return fail('NOT_FOUND', 'La nota no existe.');

    const note = await prisma.$transaction(async (tx) => {
      await syncNoteTags(tx, id, uniqueTagIds);
      return tx.note.update({
        where: { id },
        data: { title, content, excerpt: deriveExcerpt(content), notebookId },
        include: noteWithRelationsInclude,
      });
    });

    revalidatePath(`/notes/${id}`);
    revalidatePath('/notes');

    return ok(toNoteDetailDTO(note));
  } catch (error) {
    if (error instanceof UnauthenticatedError) {
      return fail('UNAUTHENTICATED', 'Debes iniciar sesión para continuar.');
    }
    console.error('updateNoteAction failed', error);
    return fail('INTERNAL_ERROR', 'No se pudo actualizar la nota. Inténtalo de nuevo.');
  }
}

export async function deleteNoteAction(input: { id: string }): Promise<ActionResult<{ id: string }>> {
  const parsed = noteIdSchema.safeParse(input);
  if (!parsed.success) return fail('VALIDATION_ERROR', 'Identificador de nota no válido.');

  try {
    const user = await requireUser();
    const result = await prisma.note.updateMany({
      where: { id: parsed.data.id, userId: user.id, active: true },
      data: { active: false },
    });
    if (result.count === 0) return fail('NOT_FOUND', 'La nota no existe.');

    revalidatePath('/notes');
    revalidatePath('/trash');

    return ok({ id: parsed.data.id });
  } catch (error) {
    if (error instanceof UnauthenticatedError) {
      return fail('UNAUTHENTICATED', 'Debes iniciar sesión para continuar.');
    }
    console.error('deleteNoteAction failed', error);
    return fail('INTERNAL_ERROR', 'No se pudo eliminar la nota. Inténtalo de nuevo.');
  }
}

export async function restoreNoteAction(input: { id: string }): Promise<ActionResult<NoteSummaryDTO>> {
  const parsed = noteIdSchema.safeParse(input);
  if (!parsed.success) return fail('VALIDATION_ERROR', 'Identificador de nota no válido.');

  try {
    const user = await requireUser();
    const existing = await prisma.note.findFirst({
      where: { id: parsed.data.id, userId: user.id, active: false },
    });
    if (!existing) return fail('NOT_FOUND', 'La nota no existe en la papelera.');

    const note = await prisma.note.update({
      where: { id: parsed.data.id },
      data: { active: true },
      include: noteWithRelationsInclude,
    });

    revalidatePath('/notes');
    revalidatePath('/trash');

    return ok(toNoteSummaryDTO(note));
  } catch (error) {
    if (error instanceof UnauthenticatedError) {
      return fail('UNAUTHENTICATED', 'Debes iniciar sesión para continuar.');
    }
    console.error('restoreNoteAction failed', error);
    return fail('INTERNAL_ERROR', 'No se pudo restaurar la nota. Inténtalo de nuevo.');
  }
}

export async function purgeNoteAction(input: { id: string }): Promise<ActionResult<{ id: string }>> {
  const parsed = noteIdSchema.safeParse(input);
  if (!parsed.success) return fail('VALIDATION_ERROR', 'Identificador de nota no válido.');

  try {
    const user = await requireUser();
    const result = await prisma.note.deleteMany({
      where: { id: parsed.data.id, userId: user.id, active: false },
    });
    if (result.count === 0) return fail('NOT_FOUND', 'La nota no existe en la papelera.');

    revalidatePath('/trash');

    return ok({ id: parsed.data.id });
  } catch (error) {
    if (error instanceof UnauthenticatedError) {
      return fail('UNAUTHENTICATED', 'Debes iniciar sesión para continuar.');
    }
    console.error('purgeNoteAction failed', error);
    return fail('INTERNAL_ERROR', 'No se pudo eliminar la nota definitivamente. Inténtalo de nuevo.');
  }
}

export async function emptyTrashAction(): Promise<ActionResult<{ deleted: number }>> {
  try {
    const user = await requireUser();
    const { count } = await prisma.note.deleteMany({ where: { userId: user.id, active: false } });

    revalidatePath('/trash');

    return ok({ deleted: count });
  } catch (error) {
    if (error instanceof UnauthenticatedError) {
      return fail('UNAUTHENTICATED', 'Debes iniciar sesión para continuar.');
    }
    console.error('emptyTrashAction failed', error);
    return fail('INTERNAL_ERROR', 'No se pudo vaciar la papelera. Inténtalo de nuevo.');
  }
}

export async function moveNoteAction(
  input: MoveNoteInput,
): Promise<ActionResult<NoteSummaryDTO, MoveNoteInput>> {
  const parsed = moveNoteSchema.safeParse(input);
  if (!parsed.success) {
    return fail('VALIDATION_ERROR', 'Datos no válidos.', z.flattenError(parsed.error).fieldErrors);
  }

  const { id, notebookId } = parsed.data;

  try {
    const user = await requireUser();

    if (notebookId) {
      const notebook = await prisma.notebook.findFirst({ where: { id: notebookId, userId: user.id, active: true } });
      if (!notebook) return fail('FORBIDDEN', 'El cuaderno seleccionado no existe o no te pertenece.');
    }

    const existing = await prisma.note.findFirst({ where: { id, userId: user.id, active: true } });
    if (!existing) return fail('NOT_FOUND', 'La nota no existe.');

    const note = await prisma.note.update({
      where: { id },
      data: { notebookId },
      include: noteWithRelationsInclude,
    });

    revalidatePath('/notes');
    revalidatePath('/(app)', 'layout');

    return ok(toNoteSummaryDTO(note));
  } catch (error) {
    if (error instanceof UnauthenticatedError) {
      return fail('UNAUTHENTICATED', 'Debes iniciar sesión para continuar.');
    }
    console.error('moveNoteAction failed', error);
    return fail('INTERNAL_ERROR', 'No se pudo mover la nota. Inténtalo de nuevo.');
  }
}

export async function setNoteTagsAction(
  input: SetNoteTagsInput,
): Promise<ActionResult<NoteSummaryDTO, SetNoteTagsInput>> {
  const parsed = setNoteTagsSchema.safeParse(input);
  if (!parsed.success) {
    return fail('VALIDATION_ERROR', 'Datos no válidos.', z.flattenError(parsed.error).fieldErrors);
  }

  const { noteId, tagIds } = parsed.data;
  const uniqueTagIds = [...new Set(tagIds)];

  try {
    const user = await requireUser();

    const existing = await prisma.note.findFirst({ where: { id: noteId, userId: user.id, active: true } });
    if (!existing) return fail('NOT_FOUND', 'La nota no existe.');

    if (uniqueTagIds.length > 0) {
      const owned = await prisma.tag.count({ where: { id: { in: uniqueTagIds }, userId: user.id, active: true } });
      if (owned !== uniqueTagIds.length) {
        return fail('FORBIDDEN', 'Alguna etiqueta seleccionada no existe o no te pertenece.');
      }
    }

    const note = await prisma.$transaction(async (tx) => {
      await syncNoteTags(tx, noteId, uniqueTagIds);
      return tx.note.findFirstOrThrow({ where: { id: noteId }, include: noteWithRelationsInclude });
    });

    revalidatePath('/notes');
    revalidatePath('/(app)', 'layout');

    return ok(toNoteSummaryDTO(note));
  } catch (error) {
    if (error instanceof UnauthenticatedError) {
      return fail('UNAUTHENTICATED', 'Debes iniciar sesión para continuar.');
    }
    console.error('setNoteTagsAction failed', error);
    return fail('INTERNAL_ERROR', 'No se pudieron actualizar las etiquetas. Inténtalo de nuevo.');
  }
}
