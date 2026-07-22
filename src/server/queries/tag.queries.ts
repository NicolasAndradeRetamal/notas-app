import 'server-only';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/server/auth/session';
import { toTagDTO } from '@/server/mappers/tag.mapper';
import type { TagDTO } from '@/types/dto';

export async function getTags(): Promise<TagDTO[]> {
  const user = await requireUser();

  const [tags, counts] = await Promise.all([
    prisma.tag.findMany({ where: { userId: user.id, active: true }, orderBy: { name: 'asc' } }),
    // Counted separately: note_tag has its own active flag, and the note it
    // points at can also be inactive, neither of which Prisma's relation
    // _count can filter on for a table two hops away.
    prisma.noteTag.groupBy({
      by: ['tagId'],
      where: { active: true, note: { active: true }, tag: { userId: user.id, active: true } },
      _count: { _all: true },
    }),
  ]);

  const countByTagId = new Map(counts.map((count) => [count.tagId, count._count._all]));

  return tags.map((tag) => toTagDTO(tag, countByTagId.get(tag.id) ?? 0));
}

export async function getTagBySlug(slug: string): Promise<TagDTO | null> {
  const user = await requireUser();
  const tag = await prisma.tag.findFirst({ where: { slug, userId: user.id, active: true } });

  return tag ? toTagDTO(tag) : null;
}