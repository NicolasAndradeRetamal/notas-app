import { expect, test } from '@playwright/test';
import { createNote, registerUser, uniqueEmail } from './helpers';

// The single most important guarantee of the app: one account can never see
// or reach another account's notes, notebooks or tags — not in listings and
// not through a direct URL.
test.describe('cross-user isolation', () => {
  test('user B cannot see or open user A notes, notebooks or tags', async ({ browser }) => {
    test.setTimeout(60_000);

    const contextA = await browser.newContext();
    const contextB = await browser.newContext();
    const pageA = await contextA.newPage();
    const pageB = await contextB.newPage();

    try {
      await registerUser(pageA, { name: 'Usuaria A', email: uniqueEmail('isolation-a') });

      const noteId = await createNote(pageA, {
        title: 'Nota privada de Usuaria A',
        content: 'Contenido confidencial que sólo A debe poder ver.',
      });

      await pageA.goto('/notes');
      await pageA.getByRole('button', { name: 'Crear cuaderno' }).click();
      const notebookDialog = pageA.getByRole('dialog');
      await notebookDialog.getByLabel(/^Nombre/).fill('Cuaderno privado de A');
      await notebookDialog.getByRole('button', { name: 'Crear cuaderno' }).click();
      await expect(pageA.getByText('Cuaderno «Cuaderno privado de A» creado.')).toBeVisible();
      const notebookHref = await pageA
        .getByRole('link', { name: /Cuaderno privado de A/ })
        .getAttribute('href');
      const notebookId = notebookHref?.split('/').pop();
      expect(notebookId).toBeTruthy();

      await pageA.getByRole('button', { name: 'Crear etiqueta' }).click();
      const tagDialog = pageA.getByRole('dialog');
      await tagDialog.getByLabel(/^Nombre/).fill('secreto-de-a');
      await tagDialog.getByRole('button', { name: 'Crear etiqueta' }).click();
      await expect(pageA.getByText('Etiqueta #secreto-de-a creada.')).toBeVisible();

      // User B registers independently and starts from an empty account.
      await registerUser(pageB, { name: 'Usuaria B', email: uniqueEmail('isolation-b') });

      await expect(
        pageB.getByRole('heading', { name: 'Nota privada de Usuaria A' }),
      ).not.toBeVisible();
      await expect(pageB.getByRole('link', { name: /Cuaderno privado de A/ })).not.toBeVisible();
      await expect(pageB.getByRole('link', { name: /secreto-de-a/ })).not.toBeVisible();
      await expect(pageB.getByText('Empieza tu primera nota')).toBeVisible();

      // Direct URL access to A's resources must be denied, not merely hidden from the UI.
      await pageB.goto(`/notes/${noteId}`);
      await expect(
        pageB.getByText('Esta nota no existe o ya no tienes acceso a ella.'),
      ).toBeVisible();

      await pageB.goto(`/notes/${noteId}/edit`);
      await expect(
        pageB.getByText('Esta nota no existe o ya no tienes acceso a ella.'),
      ).toBeVisible();

      await pageB.goto(`/notebooks/${notebookId}`);
      await expect(pageB.getByText('No encontramos esta página')).toBeVisible();

      await pageB.goto('/tags/secreto-de-a');
      await expect(pageB.getByText('No encontramos esta página')).toBeVisible();

      // And a search on B's account never surfaces A's content either.
      await pageB.goto('/notes');
      await pageB.getByRole('searchbox', { name: 'Buscar en tus notas' }).fill('confidencial');
      await pageB.waitForURL(/[?&]q=confidencial/);
      await expect(pageB.getByText('Sin resultados para «confidencial»')).toBeVisible();
    } finally {
      await contextA.close();
      await contextB.close();
    }
  });
});
