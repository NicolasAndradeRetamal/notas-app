import { describe, expect, it } from 'vitest';
import {
  toNoteDetailDTO,
  toNoteSummaryDTO,
  type NoteWithRelations,
} from '@/server/mappers/note.mapper';

function buildNote(overrides: Partial<NoteWithRelations> = {}): NoteWithRelations {
  return {
    id: 'note-1',
    title: 'Título',
    content: '# Contenido',
    excerpt: 'Contenido',
    createdAt: new Date('2026-01-01T10:00:00.000Z'),
    updatedAt: new Date('2026-01-02T10:00:00.000Z'),
    notebook: null,
    noteTags: [],
    ...overrides,
  };
}

describe('toNoteSummaryDTO', () => {
  it('maps scalar fields and serializes dates to ISO strings', () => {
    const dto = toNoteSummaryDTO(buildNote());

    expect(dto).toMatchObject({
      id: 'note-1',
      title: 'Título',
      excerpt: 'Contenido',
      notebook: null,
      tags: [],
    });
    expect(dto.createdAt).toBe('2026-01-01T10:00:00.000Z');
    expect(dto.updatedAt).toBe('2026-01-02T10:00:00.000Z');
  });

  it('maps the notebook relation when present', () => {
    const dto = toNoteSummaryDTO(
      buildNote({ notebook: { id: 'nb-1', name: 'Trabajo', color: '#3b82f6' } }),
    );

    expect(dto.notebook).toEqual({ id: 'nb-1', name: 'Trabajo', color: '#3b82f6' });
  });

  it('maps active note tags to their DTO shape', () => {
    const dto = toNoteSummaryDTO(
      buildNote({
        noteTags: [
          { tag: { id: 'tag-1', name: 'ideas', slug: 'ideas' } },
          { tag: { id: 'tag-2', name: 'urgente', slug: 'urgente' } },
        ],
      }),
    );

    expect(dto.tags).toEqual([
      { id: 'tag-1', name: 'ideas', slug: 'ideas' },
      { id: 'tag-2', name: 'urgente', slug: 'urgente' },
    ]);
  });
});

describe('toNoteDetailDTO', () => {
  it('includes the raw markdown content on top of the summary fields', () => {
    const dto = toNoteDetailDTO(buildNote({ content: '# Hola' }));
    expect(dto.content).toBe('# Hola');
    expect(dto.id).toBe('note-1');
  });
});
