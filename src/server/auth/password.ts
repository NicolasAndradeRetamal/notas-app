import { hash, verify } from '@node-rs/argon2';

// OWASP-recommended argon2id parameters; the encoded hash carries them, so
// raising these later never breaks verification of existing hashes.
const ARGON2_OPTIONS = {
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
} as const;

export function hashPassword(password: string): Promise<string> {
  return hash(password, ARGON2_OPTIONS);
}

export function verifyPassword(passwordHash: string, password: string): Promise<boolean> {
  return verify(passwordHash, password);
}
