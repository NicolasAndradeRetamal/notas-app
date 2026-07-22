import { expect, test } from '@playwright/test';
import { PASSWORD, loginUser, registerUser, uniqueEmail } from './helpers';

test.describe('authentication', () => {
  test('redirects an anonymous visitor from /notes to /login', async ({ page }) => {
    await page.goto('/notes');
    await page.waitForURL(/\/login/);
    await expect(page.getByRole('heading', { name: 'Inicia sesión' })).toBeVisible();
  });

  test('registers a new account and lands on /notes signed in', async ({ page }) => {
    const email = uniqueEmail('register');
    await registerUser(page, { name: 'Usuaria E2E', email });

    await expect(page).toHaveURL(/\/notes$/);
    await expect(page.getByRole('button', { name: /Cuenta de Usuaria E2E/ })).toBeVisible();
  });

  test('rejects registration with a password shorter than 10 characters', async ({ page }) => {
    const email = uniqueEmail('short-pw');
    await page.goto('/register');
    await page.getByLabel(/^Nombre/).fill('Usuaria Corta');
    await page.getByLabel(/^Correo electrónico/).fill(email);
    await page.getByLabel(/^Contraseña/).fill('corta123');
    await page.getByLabel(/^Repetir contraseña/).fill('corta123');
    await page.getByRole('button', { name: 'Crear cuenta' }).click();

    await expect(page.getByText('La contraseña debe tener al menos 10 caracteres')).toBeVisible();
    await expect(page).toHaveURL(/\/register$/);
  });

  test('rejects registration when the email is already taken', async ({ page }) => {
    const email = uniqueEmail('duplicate');
    await registerUser(page, { name: 'Primera Usuaria', email });

    await page.getByRole('button', { name: /Cuenta de Primera Usuaria/ }).click();
    await page.getByRole('menuitem', { name: 'Cerrar sesión' }).click();
    await page.waitForURL(/\/login/);

    await page.goto('/register');
    await page.getByLabel(/^Nombre/).fill('Segunda Usuaria');
    await page.getByLabel(/^Correo electrónico/).fill(email);
    await page.getByLabel(/^Contraseña/).fill(PASSWORD);
    await page.getByLabel(/^Repetir contraseña/).fill(PASSWORD);
    await page.getByRole('button', { name: 'Crear cuenta' }).click();

    await expect(page.getByText('Ya existe una cuenta con este correo.')).toBeVisible();
  });

  test('logs in with valid credentials', async ({ page }) => {
    const email = uniqueEmail('login-ok');
    await registerUser(page, { name: 'Usuaria Login', email });

    await page.getByRole('button', { name: /Cuenta de Usuaria Login/ }).click();
    await page.getByRole('menuitem', { name: 'Cerrar sesión' }).click();
    await page.waitForURL(/\/login/);

    await loginUser(page, { email });
    await expect(page.getByRole('button', { name: /Cuenta de Usuaria Login/ })).toBeVisible();
  });

  test('rejects login with an incorrect password', async ({ page }) => {
    const email = uniqueEmail('login-bad');
    await registerUser(page, { name: 'Usuaria Rechazada', email });
    await page.getByRole('button', { name: /Cuenta de Usuaria Rechazada/ }).click();
    await page.getByRole('menuitem', { name: 'Cerrar sesión' }).click();
    await page.waitForURL(/\/login/);

    await page.goto('/login');
    await page.getByLabel(/^Correo electrónico/).fill(email);
    await page.getByLabel(/^Contraseña/).fill('esta-no-es-la-clave');
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page.getByText('Correo o contraseña incorrectos.')).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('logs out and blocks further access to /notes', async ({ page }) => {
    const email = uniqueEmail('logout');
    await registerUser(page, { name: 'Usuaria Logout', email });

    await page.getByRole('button', { name: /Cuenta de Usuaria Logout/ }).click();
    await page.getByRole('menuitem', { name: 'Cerrar sesión' }).click();

    await page.waitForURL(/\/login/);
    await page.goto('/notes');
    await page.waitForURL(/\/login/);
  });
});
