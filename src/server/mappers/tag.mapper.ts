import type { TagDTO } from '@/types/dto';

export type TagEntity = { id: string; name: string; slug: string };

export function toTagDTO(tag: TagEntity, noteCount?: number): TagDTO {
  return {
    id: tag.id,
    name: tag.name,
    slug: tag.slug,
    ...(noteCount === undefined ? {} : { noteCount }),
  };
}
