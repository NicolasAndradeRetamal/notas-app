'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/slug';
import { requireUser, UnauthenticatedError } from '@/server/auth/session';
import { toTagDTO } from '@/server/mappers/tag.mapper';
import { fail, ok, type ActionResult } from '@/lib/action-result';
import {
  createTagSchema,
  tagIdSchema,
  updateTagSchema,
  type CreateTagInput,
  type UpdateTagInput,
} from '@/schemas/tag.schema';
import type { TagDTO } from '@/types/dto';

const TAG_SLUG_MAX_LENGTH = 48;

export async function createTagAction(input: CreateTagInput): Promise<ActionResult<TagDTO, CreateTagInput>> {
  const parsed = createTagSchema.safeParse(input);
  if (!parsed.success) {
    return fail('VALIDATION_ERROR', 'Revisa los datos de la etiqueta.', z.flattenError(parsed.error).fieldErrors);
  }

  const { name } = parsed.data;
  const slug = slugify(name, TAG_SLUG_MAX_LENGTH);

  try {
    const user = await requireUser();
    const existing = await prisma.tag.findUnique({ where: { userId_slug: { userId: user.id, slug } } });

    if (existing?.active) {
      return fail('CONFLICT', 'Ya existe una etiqueta con ese nombre.');
    }

    // An inactive tag with the same slug is reactivated instead of creating a duplicate.
    const tag = existing
      ? await prisma.tag.update({ where: { id: existing.id }, data: { name, active: true } })
      : await prisma.tag.create({ data: { userId: user.id, name, slug } });

    revalidatePath('/(app)', 'layout');
    return ok(toTagDTO(tag));
  } catch (error) {
    if (error instanceof UnauthenticatedError) {
      return fail('UNAUTHENTICATED', 'Debes iniciar sesión para continuar.');
    }
    console.error('createTagAction failed', error);
    return fail('INTERNAL_ERROR', 'No se pudo crear la etiqueta. Inténtalo de nuevo.');
  }
}

export async function updateTagAction(input: UpdateTagInput): Promise<ActionResult<TagDTO, UpdateTagInput>> {
  const parsed = updateTagSchema.safeParse(input);
  if (!parsed.success) {
    return fail('VALIDATION_ERROR', 'Revisa los datos de la etiqueta.', z.flattenError(parsed.error).fieldErrors);
  }

  const { id, name } = parsed.data;
  const slug = slugify(name, TAG_SLUG_MAX_LENGTH);

  try {
    const user = await requireUser();
    const existing = await prisma.tag.findFirst({ where: { id, userId: user.id, active: true } });
    if (!existing) return fail('NOT_FOUND', 'La etiqueta no existe.');

    const conflicting = await prisma.tag.findUnique({ where: { userId_slug: { userId: user.id, slug } } });
    if (conflicting && conflicting.id !== id) {
      return fail('CONFLICT', 'Ya existe una etiqueta con ese nombre.');
    }

    const tag = await prisma.tag.update({ where: { id }, data: { name, slug } });

    revalidatePath('/(app)', 'layout');
    return ok(toTagDTO(tag));
  } catch (error) {
    if (error instanceof UnauthenticatedError) {
      return fail('UNAUTHENTICATED', 'Debes iniciar sesión para continuar.');
    }
    console.error('updateTagAction failed', error);
    return fail('INTERNAL_ERROR', 'No se pudo actualizar la etiqueta. Inténtalo de nuevo.');
  }
}

export async function deleteTagAction(input: { id: string }): Promise<ActionResult<{ id: string }>> {
  const parsed = tagIdSchema.safeParse(input);
  if (!parsed.success) return fail('VALIDATION_ERROR', 'Identificador de etiqueta no válido.');

  try {
    const user = await requireUser();
    const result = await prisma.tag.updateMany({
      where: { id: parsed.data.id, userId: user.id, active: true },
      data: { active: false },
    });
    if (result.count === 0) return fail('NOT_FOUND', 'La etiqueta no existe.');

    revalidatePath('/(app)', 'layout');
    return ok({ id: parsed.data.id });
  } catch (error) {
    if (error instanceof UnauthenticatedError) {
      return fail('UNAUTHENTICATED', 'Debes iniciar sesión para continuar.');
    }
    console.error('deleteTagAction failed', error);
    return fail('INTERNAL_ERROR', 'No se pudo eliminar la etiqueta. Inténtalo de nuevo.');
  }
}
