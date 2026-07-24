import { existsSync } from 'node:fs';
import { defineConfig } from 'prisma/config';

// Prisma 7 no longer loads .env on its own; CI supplies the variables directly.
if (existsSync('.env')) {
  process.loadEnvFile('.env');
}

// Only migration and introspection commands need the datasource. Declaring it
// unconditionally would make `prisma generate` — and therefore `pnpm install` —
// fail on a fresh clone before the developer has written a .env file.
const url = process.env.DATABASE_URL;

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'node --experimental-strip-types prisma/seed.ts',
  },
  ...(url ? { datasource: { url } } : {}),
});
