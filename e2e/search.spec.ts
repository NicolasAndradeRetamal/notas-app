import { expect, test } from '@playwright/test';
import { createNote, registerUser, uniqueEmail } from './helpers';

test.describe('search', () => {
  test.beforeEach(async ({ page }) => {
    await registerUser(page, { name: 'Usuaria Búsqueda', email: uniqueEmail('search') });
  });

  test('finds a note by a word in its title', async ({ page }) => {
    await createNote(page, {
      title: 'Presupuesto anual del departamento',
      content: 'Cifras y proyecciones para el año que viene.',
    });

    await page.goto('/notes');
    await page.getByRole('searchbox', { name: 'Buscar en tus notas' }).fill('presupuesto');
    await page.waitForURL(/[?&]q=presupuesto/);

    await expect(page.getByText('1 resultado para «presupuesto»')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Presupuesto anual del departamento' })).toBeVisible();
  });

  test('finds a note by a word in its body', async ({ page }) => {
    await createNote(page, {
      title: 'Notas sueltas',
      content: 'Recordatorio: revisar el contrato con el proveedor de hosting.',
    });

    await page.goto('/notes');
    await page.getByRole('searchbox', { name: 'Buscar en tus notas' }).fill('proveedor');
    await page.waitForURL(/[?&]q=proveedor/);

    await expect(page.getByRole('heading', { name: 'Notas sueltas' })).toBeVisible();
  });

  test('matches accented search terms against unaccented content and vice versa', async ({ page }) => {
    await createNote(page, {
      title: 'Reunión de planificación',
      content: 'Se define el plan de acción para el próximo trimestre.',
    });

    await page.goto('/notes');
    // Spanish full-text search normalizes accents, so "reunion" (no tilde)
    // must still find a title written with one ("Reunión").
    await page.getByRole('searchbox', { name: 'Buscar en tus notas' }).fill('reunion');
    await page.waitForURL(/[?&]q=reunion/);

    await expect(page.getByRole('heading', { name: 'Reunión de planificación' })).toBeVisible();
  });

  test('shows the empty-results state for a query that matches nothing', async ({ page }) => {
    await createNote(page, { title: 'Nota cualquiera', content: 'Contenido irrelevante.' });

    await page.goto('/notes');
    await page.getByRole('searchbox', { name: 'Buscar en tus notas' }).fill('xyzzyquenoexiste');
    await page.waitForURL(/[?&]q=xyzzyquenoexiste/);

    await expect(page.getByText('Sin resultados para «xyzzyquenoexiste»')).toBeVisible();
    // The empty-state action is a LinkButton (renders as a link, not a button).
    await expect(page.getByRole('link', { name: 'Quitar filtros' })).toBeVisible();
  });

  test('highlights the matching term in the search result excerpt', async ({ page }) => {
    await createNote(page, {
      title: 'Acta de reunión de seguimiento',
      content:
        'Durante la reunión se discutieron los avances del sprint y se acordaron los próximos pasos del equipo.',
    });

    await page.goto('/notes');
    await page.getByRole('searchbox', { name: 'Buscar en tus notas' }).fill('sprint');
    await page.waitForURL(/[?&]q=sprint/);

    await expect(page.locator('b', { hasText: 'sprint' })).toBeVisible();
  });
});
