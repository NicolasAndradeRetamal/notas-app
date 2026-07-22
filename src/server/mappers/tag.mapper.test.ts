import { describe, expect, it } from 'vitest';
import { toTagDTO } from '@/server/mappers/tag.mapper';

describe('toTagDTO', () => {
  it('maps scalar fields without noteCount by default', () => {
    const dto = toTagDTO({ id: 'tag-1', name: 'ideas', slug: 'ideas' });
    expect(dto).toEqual({ id: 'tag-1', name: 'ideas', slug: 'ideas' });
    expect('noteCount' in dto).toBe(false);
  });

  it('includes noteCount when provided, even when zero', () => {
    const dto = toTagDTO({ id: 'tag-1', name: 'ideas', slug: 'ideas' }, 0);
    expect(dto.noteCount).toBe(0);
  });
});
