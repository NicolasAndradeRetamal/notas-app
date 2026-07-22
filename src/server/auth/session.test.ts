import { describe, expect, it, vi } from 'vitest';

const authMock = vi.fn();
vi.mock('@/auth', () => ({ auth: authMock }));

const { getCurrentUser, requireUser, UnauthenticatedError } = await import('@/server/auth/session');

describe('getCurrentUser', () => {
  it('returns null when there is no session', async () => {
    authMock.mockResolvedValueOnce(null);
    await expect(getCurrentUser()).resolves.toBeNull();
  });

  it('returns null when the session has no user id', async () => {
    authMock.mockResolvedValueOnce({ user: {} });
    await expect(getCurrentUser()).resolves.toBeNull();
  });

  it('maps the session user to a UserDTO', async () => {
    authMock.mockResolvedValueOnce({ user: { id: 'user-1', name: 'Ada', email: 'ada@example.com' } });
    await expect(getCurrentUser()).resolves.toEqual({ id: 'user-1', name: 'Ada', email: 'ada@example.com' });
  });
});

describe('requireUser', () => {
  it('returns the user when authenticated', async () => {
    authMock.mockResolvedValueOnce({ user: { id: 'user-1', name: 'Ada', email: 'ada@example.com' } });
    await expect(requireUser()).resolves.toEqual({ id: 'user-1', name: 'Ada', email: 'ada@example.com' });
  });

  it('throws UnauthenticatedError when there is no session', async () => {
    authMock.mockResolvedValueOnce(null);
    await expect(requireUser()).rejects.toBeInstanceOf(UnauthenticatedError);
  });
});
