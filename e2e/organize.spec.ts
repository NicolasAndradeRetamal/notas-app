import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { createNote, registerUser, uniqueEmail } from './helpers';

// Dialog content stays mounted in the DOM even while closed (native <dialog>
// hides itself visually, but getByLabel/getByText still match it), and the
// mobile sidebar drawer duplicates every sidebar dialog off-screen. Scoping
// through getByRole('dialog') sidesteps both: closed dialogs and the
// aria-hidden mobile drawer are correctly excluded from accessibility
// queries, so this always resolves to the one dialog actually open.
function openDialog(page: Page) {
  return page.getByRole('dialog');
}

test.describe('notebooks and tags', () => {
  test.beforeEach(async ({ page }) => {
    await registerUser(page, { name: 'Usuaria Organiza', email: uniqueEmail('organize') });
  });

  test('creates a notebook from the sidebar', async ({ page }) => {
    await page.goto('/notes');
    await page.getByRole('button', { name: 'Crear cuaderno' }).click();
    const dialog = openDialog(page);
    await dialog.getByLabel(/^Nombre/).fill('Proyectos');
    await dialog.getByRole('button', { name: 'Crear cuaderno' }).click();

    await expect(page.getByText('Cuaderno «Proyectos» creado.')).toBeVisible();
    await expect(page.getByRole('link', { name: /Proyectos/ })).toBeVisible();
  });

  test('creates a tag from the sidebar', async ({ page }) => {
    await page.goto('/notes');
    await page.getByRole('button', { name: 'Crear etiqueta' }).click();
    const dialog = openDialog(page);
    await dialog.getByLabel(/^Nombre/).fill('importante');
    await dialog.getByRole('button', { name: 'Crear etiqueta' }).click();

    await expect(page.getByText('Etiqueta #importante creada.')).toBeVisible();
    await expect(page.getByRole('link', { name: /importante/ })).toBeVisible();
  });

  test('moves a note into a notebook and filters the listing by it', async ({ page }) => {
    await page.goto('/notes');
    await page.getByRole('button', { name: 'Crear cuaderno' }).click();
    const notebookDialog = openDialog(page);
    await notebookDialog.getByLabel(/^Nombre/).fill('Trabajo E2E');
    await notebookDialog.getByRole('button', { name: 'Crear cuaderno' }).click();
    await expect(page.getByText('Cuaderno «Trabajo E2E» creado.')).toBeVisible();

    await createNote(page, { title: 'Nota a mover de cuaderno' });
    await page.goto('/notes');
    const card = page.locator('li', {
      has: page.getByRole('heading', { name: 'Nota a mover de cuaderno' }),
    });
    await card.getByRole('button', { name: /Acciones de la nota/ }).click();
    await page.getByRole('menuitem', { name: 'Mover a un cuaderno…' }).click();
    const moveDialog = openDialog(page);
    await moveDialog.getByLabel('Cuaderno', { exact: true }).selectOption({ label: 'Trabajo E2E' });
    await moveDialog.getByRole('button', { name: 'Mover nota' }).click();
    await expect(page.getByText('Nota movida a «Trabajo E2E».')).toBeVisible();

    await page.getByRole('link', { name: /Trabajo E2E/ }).click();
    await expect(page.getByRole('heading', { name: 'Cuaderno: Trabajo E2E' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Nota a mover de cuaderno' })).toBeVisible();
  });

  test('tags a note and filters the listing by that tag', async ({ page }) => {
    await page.goto('/notes');
    await page.getByRole('button', { name: 'Crear etiqueta' }).click();
    const tagDialog = openDialog(page);
    await tagDialog.getByLabel(/^Nombre/).fill('urgentísimo');
    await tagDialog.getByRole('button', { name: 'Crear etiqueta' }).click();
    await expect(page.getByText('Etiqueta #urgentísimo creada.')).toBeVisible();

    await createNote(page, { title: 'Nota que se etiquetará' });
    await page.goto('/notes');
    const card = page.locator('li', {
      has: page.getByRole('heading', { name: 'Nota que se etiquetará' }),
    });
    await card.getByRole('button', { name: /Acciones de la nota/ }).click();
    await page.getByRole('menuitem', { name: 'Editar etiquetas…' }).click();
    const tagsDialog = openDialog(page);
    const tagPickerInput = tagsDialog.getByLabel('Etiquetas');
    await tagPickerInput.click();
    await tagsDialog.getByRole('option', { name: /urgentísimo/ }).click();
    // Selecting an option keeps focus on the combobox, so its suggestion
    // panel stays open and covers the footer buttons. Escape would close the
    // whole dialog (it also cancels the native <dialog>), so focus is moved
    // to the heading instead to blur the combobox and let the panel close.
    await tagsDialog.getByRole('heading', { name: 'Editar etiquetas' }).click();
    await tagsDialog.getByRole('button', { name: 'Guardar cambios' }).click();
    await expect(page.getByText('Etiquetas actualizadas.')).toBeVisible();

    await page.getByRole('link', { name: /urgentísimo/ }).click();
    await expect(page.getByRole('heading', { name: 'Etiqueta: #urgentísimo' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Nota que se etiquetará' })).toBeVisible();
  });

  test('shows the notebook-empty state for a notebook with no notes', async ({ page }) => {
    await page.goto('/notes');
    await page.getByRole('button', { name: 'Crear cuaderno' }).click();
    const dialog = openDialog(page);
    await dialog.getByLabel(/^Nombre/).fill('Cuaderno vacío');
    await dialog.getByRole('button', { name: 'Crear cuaderno' }).click();
    await expect(page.getByText('Cuaderno «Cuaderno vacío» creado.')).toBeVisible();

    await page.getByRole('link', { name: /Cuaderno vacío/ }).click();
    await expect(page.getByText('Este cuaderno está vacío')).toBeVisible();
  });
});
