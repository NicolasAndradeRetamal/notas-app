import type { Page } from '@playwright/test';

export const PASSWORD = 'contrasena-e2e-123';

// Every test that needs an account registers its own, so specs stay
// independent of each other and of any seeded demo data.
export function uniqueEmail(prefix: string): string {
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return `${prefix}-${unique}@e2e.test`;
}

// The Input component appends a visually-hidden "*" to required field
// labels, and getByLabel matches raw label text (not the browser's
// aria-hidden-aware accessible name), so labels are matched with a
// leading-anchor regex instead of an exact string.
const nameLabel = () => /^Nombre/;
const emailLabel = () => /^Correo electrónico/;
const passwordLabel = () => /^Contraseña/;
const confirmPasswordLabel = () => /^Repetir contraseña/;

export async function registerUser(
  page: Page,
  opts: { name: string; email: string; password?: string },
): Promise<void> {
  const password = opts.password ?? PASSWORD;
  await page.goto('/register');
  await page.getByLabel(nameLabel()).fill(opts.name);
  await page.getByLabel(emailLabel()).fill(opts.email);
  await page.getByLabel(passwordLabel()).fill(password);
  await page.getByLabel(confirmPasswordLabel()).fill(password);
  await page.getByRole('button', { name: 'Crear cuenta' }).click();
  await page.waitForURL(/\/notes$/);
}

export async function loginUser(page: Page, opts: { email: string; password?: string }): Promise<void> {
  const password = opts.password ?? PASSWORD;
  await page.goto('/login');
  await page.getByLabel(emailLabel()).fill(opts.email);
  await page.getByLabel(passwordLabel()).fill(password);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await page.waitForURL(/\/notes$/);
}

// Fills the editor and waits for the autosave debounce to persist the note,
// then reads the note id back out of the resulting URL.
//
// Deliberately does NOT click "Guardar nota" here: doing so right after
// filling the fields races the ~1.2s autosave debounce timer (see the
// documented bug in notes-crud.spec.ts — "Guardar nota" clicked while a
// save is already scheduled can create a duplicate note). Waiting for
// autosave alone keeps this helper — and everything built on top of it —
// deterministic.
export async function createNote(page: Page, opts: { title: string; content?: string }): Promise<string> {
  await page.goto('/notes/new');
  await page.getByPlaceholder('Título de la nota').fill(opts.title);
  if (opts.content) {
    await page.getByLabel('Contenido en markdown').fill(opts.content);
  }
  await page.waitForURL(/\/notes\/[0-9a-f-]{36}$/, { timeout: 10_000 });
  const url = page.url();
  const match = url.match(/\/notes\/([0-9a-f-]{36})$/);
  if (!match) throw new Error(`Could not extract note id from URL: ${url}`);
  return match[1]!;
}
