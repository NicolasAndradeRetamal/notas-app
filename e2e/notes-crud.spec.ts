import { expect, test } from '@playwright/test';
import { createNote, registerUser, uniqueEmail } from './helpers';

test.describe('note CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await registerUser(page, { name: 'Usuaria Notas', email: uniqueEmail('notes-crud') });
  });

  test('creates a note and shows it in the listing', async ({ page }) => {
    await createNote(page, {
      title: 'Nota de prueba end-to-end',
      content: 'Cuerpo de la nota de prueba.',
    });

    await page.goto('/notes');
    await expect(page.getByRole('heading', { name: 'Nota de prueba end-to-end' })).toBeVisible();
  });

  test('shows a live preview while writing markdown', async ({ page }) => {
    await page.goto('/notes/new');
    await page.getByPlaceholder('Título de la nota').fill('Nota con vista previa');
    await page
      .getByLabel('Contenido en markdown')
      .fill('## Encabezado en vivo\n\nUn **párrafo** en negrita.');

    await page.getByRole('tab', { name: 'Vista previa' }).click();
    await expect(page.getByRole('heading', { name: 'Encabezado en vivo' })).toBeVisible();
    await expect(page.locator('.prose-note strong', { hasText: 'párrafo' })).toBeVisible();
  });

  test('renders sanitized markdown on the read view, with headings shifted down', async ({
    page,
  }) => {
    const noteId = await createNote(page, {
      title: 'Nota con markdown',
      content:
        '# Encabezado principal\n\nTexto con <script>window.__pwned = true;</script> incrustado.',
    });

    await page.goto(`/notes/${noteId}`);
    const heading = page.getByRole('heading', { name: 'Encabezado principal' });
    await expect(heading).toBeVisible();
    await expect(heading).toHaveJSProperty('tagName', 'H2');
    await expect(page.locator('script', { hasText: '__pwned' })).toHaveCount(0);
    const pwned = await page.evaluate(() => (window as unknown as { __pwned?: boolean }).__pwned);
    expect(pwned).toBeUndefined();
  });

  test('edits a note and its content persists after reload', async ({ page }) => {
    const noteId = await createNote(page, {
      title: 'Nota editable',
      content: 'Contenido original',
    });

    await page.goto(`/notes/${noteId}/edit`);
    const content = page.getByLabel('Contenido en markdown');
    await content.fill('Contenido editado end-to-end');
    // Safe here (unlike creation): updateNoteAction never redirects, so the
    // component stays mounted and a later debounce firing just re-saves the
    // same content instead of creating a duplicate resource.
    await page.getByRole('button', { name: 'Guardar nota' }).click();
    await expect(page.getByText(/^Guardado/)).toBeVisible();

    await page.reload();
    await expect(page.getByLabel('Contenido en markdown')).toHaveValue(
      'Contenido editado end-to-end',
    );
  });

  test('handles an empty note body and a very long title', async ({ page }) => {
    const longTitle = 'T'.repeat(200);
    await page.goto('/notes/new');
    await page.getByPlaceholder('Título de la nota').fill(longTitle);
    // Relies on autosave rather than clicking "Guardar nota" — see the
    // duplicate-note race documented below.
    await page.waitForURL(/\/notes\/[0-9a-f-]{36}$/, { timeout: 10_000 });

    await expect(page.getByRole('heading', { name: longTitle })).toBeVisible();
  });

  test('sends a note to the trash, restores it, and purges it definitively', async ({ page }) => {
    await createNote(page, { title: 'Nota para la papelera' });

    await page.goto('/notes');
    const card = page.locator('li', {
      has: page.getByRole('heading', { name: 'Nota para la papelera' }),
    });
    await card.getByRole('button', { name: /Acciones de la nota/ }).click();
    await page.getByRole('menuitem', { name: 'Enviar a la papelera' }).click();

    await expect(page.getByText('Nota enviada a la papelera.')).toBeVisible();
    await page.goto('/notes');
    await expect(page.getByRole('heading', { name: 'Nota para la papelera' })).not.toBeVisible();

    await page.goto('/trash');
    await expect(page.getByRole('heading', { name: 'Nota para la papelera' })).toBeVisible();
    await page.getByRole('button', { name: 'Restaurar' }).click();
    await expect(page.getByText('Nota restaurada.')).toBeVisible();

    await page.goto('/notes');
    await expect(page.getByRole('heading', { name: 'Nota para la papelera' })).toBeVisible();

    // Trash it again and purge it for good this time.
    const cardAgain = page.locator('li', {
      has: page.getByRole('heading', { name: 'Nota para la papelera' }),
    });
    await cardAgain.getByRole('button', { name: /Acciones de la nota/ }).click();
    await page.getByRole('menuitem', { name: 'Enviar a la papelera' }).click();
    await expect(page.getByText('Nota enviada a la papelera.')).toBeVisible();

    await page.goto('/trash');
    await page.getByRole('button', { name: 'Eliminar definitivamente' }).click();
    await page.getByRole('button', { name: 'Eliminar definitivamente' }).last().click();
    await expect(page.getByText('Nota eliminada definitivamente.')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Nota para la papelera' })).not.toBeVisible();
  });

  test('empties the trash', async ({ page }) => {
    await createNote(page, { title: 'Nota a vaciar 1' });
    await createNote(page, { title: 'Nota a vaciar 2' });

    for (const title of ['Nota a vaciar 1', 'Nota a vaciar 2']) {
      await page.goto('/notes');
      const card = page.locator('li', { has: page.getByRole('heading', { name: title }) });
      await card.getByRole('button', { name: /Acciones de la nota/ }).click();
      await page.getByRole('menuitem', { name: 'Enviar a la papelera' }).click();
      await expect(page.getByText('Nota enviada a la papelera.')).toBeVisible();
    }

    await page.goto('/trash');
    await page.getByRole('button', { name: 'Vaciar la papelera' }).click();
    await page.getByRole('button', { name: 'Eliminar notas' }).click();
    await expect(page.getByText(/Papelera vaciada: se eliminaron \d+ notas\./)).toBeVisible();
    await expect(page.getByText('La papelera está vacía')).toBeVisible();
  });

  test('shows a not-found page when navigating to a note that does not exist', async ({ page }) => {
    await page.goto('/notes/00000000-0000-0000-0000-000000000000');
    await expect(page.getByText('Esta nota no existe o ya no tienes acceso a ella.')).toBeVisible();
  });

  test('saving right after typing creates exactly one note', async ({ page }) => {
    // Clicking "Guardar nota" leaves the autosave timer armed. Without the
    // in-flight guard in NoteEditor it fires a second create while the first
    // is still navigating, leaving two copies of the same note.
    const title = `Nota carrera doble ${Date.now()}`;
    await page.goto('/notes/new');
    await page.getByPlaceholder('Título de la nota').fill(title);
    await page.getByLabel('Contenido en markdown').fill('Contenido de la carrera.');
    await page.getByRole('button', { name: 'Guardar nota' }).click();
    await page.waitForURL(/\/notes\/[0-9a-f-]{36}$/, { timeout: 10_000 });

    // Give the still-pending autosave debounce (~1.2s from the last
    // keystroke) time to fire its own, duplicate create call.
    await page.waitForTimeout(2000);

    await page.goto('/notes');
    await expect(page.getByRole('heading', { name: title })).toHaveCount(1);
  });
});
