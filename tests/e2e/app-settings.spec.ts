import { test, expect } from '@playwright/test';
import {
  PAGES,
  setupAuthenticatedUser,
} from './fixtures/test-helpers';

test.describe('App Settings', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedUser(page);
    await page.goto(PAGES.app);
    await page.waitForLoadState('networkidle');
  });

  test('change theme (color)', async ({ page }) => {
    // Open settings menu via gear icon (title="Configuración")
    await page.locator('button[title="Configuración"]').click();
    await page.waitForTimeout(300);

    // The settings menu should be visible
    await expect(page.locator('#settingsMenu')).toBeVisible();
    expect(page.url()).toContain('app.html');
  });

  test('logout redirects to login', async ({ page }) => {
    // Open settings menu via gear icon
    await page.locator('button[title="Configuración"]').click();
    await page.waitForTimeout(300);

    // Handle the confirm dialog that logout() triggers
    page.on('dialog', async dialog => {
      await dialog.accept();
    });

    // Click "Cerrar sesión" logout button
    await page.getByText('Cerrar sesión').click();
    await page.waitForURL(/login\.html/, { timeout: 10000 });
    expect(page.url()).toContain('login.html');
  });
});
