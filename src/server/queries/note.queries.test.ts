import { describe, expect, it, vi, beforeEach } from 'vitest';
import { UnauthenticatedError } from '@/server/auth/errors';

const requireUserMock = vi.fn();
vi.mock('@/server/auth/session', () => ({ requireUser: requireUserMock, UnauthenticatedError }));

const findManyMock = vi.fn();
const findFirstMock = vi.fn();
const countMock = vi.fn();
vi.mock('@/lib/prisma', () => ({
  prisma: {
    note: {
      findMany: findManyMock,
      findFirst: findFirstMock,
      count: countMock,
    },
  },
}));

vi.mock('@/server/queries/search.queries', () => ({ searchNotes: vi.fn() }));

const { getNoteById, getNotes, getTrashedNotes } = await import('@/server/queries/note.queries');
const { searchNotes } = await import('@/server/queries/search.queries');

const USER = { id: 'user-1', name: 'Ada', email: 'ada@example.com' };

const NOTE_ENTITY = {
  id: 'note-1',
  title: 'Título',
  content: 'Contenido',
  excerpt: 'Contenido',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-02T00:00:00.000Z'),
  notebook: null,
  noteTags: [],
};

beforeEach(() => {
  vi.clearAllMocks();
  requireUserMock.mockResolvedValue(USER);
});

describe('getNotes', () => {
  it('delegates to searchNotes when a query term is present', async () => {
    vi.mocked(searchNotes).mockResolvedValueOnce({ items: [], total: 0, page: 1, pageSize: 20, hasMore: false });

    await getNotes({ q: 'reunión', page: 1, pageSize: 20, sort: 'updated' });

    expect(searchNotes).toHaveBeenCalledOnce();
    expect(findManyMock).not.toHaveBeenCalled();
  });

  it('scopes the listing to the current user and active notes', async () => {
    findManyMock.mockResolvedValueOnce([NOTE_ENTITY]);
    countMock.mockResolvedValueOnce(1);

    const result = await getNotes({ page: 1, pageSize: 20, sort: 'updated' });

    expect(findManyMock).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ userId: USER.id, active: true }) }),
    );
    expect(result.items).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('filters by notebookId and tagSlug when provided', async () => {
    findManyMock.mockResolvedValueOnce([]);
    countMock.mockResolvedValueOnce(0);

    await getNotes({ page: 1, pageSize: 20, sort: 'updated', notebookId: 'nb-1', tagSlug: 'ideas' });

    const call = findManyMock.mock.calls[0]![0];
    expect(call.where.notebookId).toBe('nb-1');
    expect(call.where.noteTags.some.tag.slug).toBe('ideas');
  });
});

describe('getNoteById', () => {
  it('returns null for a malformed id without touching the database', async () => {
    await expect(getNoteById('not-a-uuid')).resolves.toBeNull();
    expect(findFirstMock).not.toHaveBeenCalled();
  });

  it('returns null when the note does not exist or belongs to another user', async () => {
    findFirstMock.mockResolvedValueOnce(null);
    await expect(getNoteById('11111111-1111-1111-1111-111111111111')).resolves.toBeNull();
    expect(findFirstMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: '11111111-1111-1111-1111-111111111111', userId: USER.id, active: true },
      }),
    );
  });

  it('returns a NoteDetailDTO including content when found', async () => {
    findFirstMock.mockResolvedValueOnce(NOTE_ENTITY);
    const result = await getNoteById('11111111-1111-1111-1111-111111111111');
    expect(result).toMatchObject({ id: 'note-1', content: 'Contenido' });
  });
});

describe('getTrashedNotes', () => {
  it('only returns inactive notes for the current user', async () => {
    findManyMock.mockResolvedValueOnce([]);
    countMock.mockResolvedValueOnce(0);

    await getTrashedNotes();

    expect(findManyMock).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: USER.id, active: false } }),
    );
  });
});
