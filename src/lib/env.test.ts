import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('env', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('parses valid environment variables and freezes the result', async () => {
    vi.stubEnv('DATABASE_URL', 'postgresql://user:pass@localhost:5432/db');
    vi.stubEnv('AUTH_SECRET', 'a'.repeat(32));
    vi.stubEnv('AUTH_TRUST_HOST', 'true');

    const { env } = await import('@/lib/env');

    expect(env.DATABASE_URL).toBe('postgresql://user:pass@localhost:5432/db');
    expect(env.AUTH_TRUST_HOST).toBe(true);
    expect(Object.isFrozen(env)).toBe(true);
  });

  it('throws when DATABASE_URL is missing', async () => {
    vi.stubEnv('DATABASE_URL', undefined);
    vi.stubEnv('AUTH_SECRET', 'a'.repeat(32));

    await expect(import('@/lib/env')).rejects.toThrow('Invalid environment variables');
  });

  it('throws when AUTH_SECRET is too short', async () => {
    vi.stubEnv('DATABASE_URL', 'postgresql://user:pass@localhost:5432/db');
    vi.stubEnv('AUTH_SECRET', 'too-short');

    await expect(import('@/lib/env')).rejects.toThrow('Invalid environment variables');
  });
});
