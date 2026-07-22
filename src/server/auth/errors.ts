// Kept import-free so tests can reference this class without pulling in the
// full auth stack (Prisma, env validation) through session.ts / auth.ts.
export class UnauthenticatedError extends Error {
  constructor() {
    super('UNAUTHENTICATED');
    this.name = 'UnauthenticatedError';
  }
}
