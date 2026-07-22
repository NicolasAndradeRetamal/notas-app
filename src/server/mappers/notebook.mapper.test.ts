import { describe, expect, it } from 'vitest';
import { toNotebookDTO } from '@/server/mappers/notebook.mapper';

describe('toNotebookDTO', () => {
  it('maps scalar fields', () => {
    const dto = toNotebookDTO({
      id: 'nb-1',
      name: 'Personal',
      slug: 'personal',
      color: '#22c55e',
      position: 0,
    });

    expect(dto).toEqual({
      id: 'nb-1',
      name: 'Personal',
      slug: 'personal',
      color: '#22c55e',
      position: 0,
    });
  });

  it('includes noteCount when the _count relation is present', () => {
    const dto = toNotebookDTO({
      id: 'nb-1',
      name: 'Personal',
      slug: 'personal',
      color: null,
      position: 0,
      _count: { notes: 3 },
    });

    expect(dto.noteCount).toBe(3);
  });

  it('omits noteCount when the _count relation is absent', () => {
    const dto = toNotebookDTO({
      id: 'nb-1',
      name: 'Personal',
      slug: 'personal',
      color: null,
      position: 0,
    });

    expect(dto.noteCount).toBeUndefined();
    expect('noteCount' in dto).toBe(false);
  });
});
