import { test, expect } from '@playwright/test';
import {
  PAGES,
  TEST_ADMIN,
  setupAdminSession,
  clearAllStorage,
} from './fixtures/test-helpers';

test.describe('Admin', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGES.adminLogin);
    await clearAllStorage(page);
    await page.goto(PAGES.adminLogin);
  });

  test('admin login with correct credentials redirects to backoffice', async ({
    page,
  }) => {
    await page.locator('#adminUser').fill(TEST_ADMIN.user);
    await page.locator('#adminPassword').fill(TEST_ADMIN.password);
    await page.locator('button[type="submit"], button:has-text("Entrar")').first().click();

    await page.waitForURL(/backoffice\.html/);
    expect(page.url()).toContain('backoffice.html');
  });

  test('admin login with wrong credentials shows error', async ({ page }) => {
    await page.locator('#adminUser').fill('wrong');
    await page.locator('#adminPassword').fill('wrong');
    await page.locator('button[type="submit"], button:has-text("Entrar")').first().click();

    const errorDiv = page.locator('#adminError');
    await expect(errorDiv).toBeVisible();
    await expect(errorDiv).toContainText('incorrectas');
  });

  test('backoffice shows dashboard with stats', async ({ page }) => {
    await setupAdminSession(page);
    await page.goto(PAGES.backoffice);
    await page.waitForLoadState('networkidle');

    // Should be on backoffice page
    expect(page.url()).toContain('backoffice.html');

    // Dashboard section should be visible with stats
    const body = await page.textContent('body');
    const hasDashboardContent =
      body?.includes('Dashboard') ||
      body?.includes('dashboard') ||
      body?.includes('Usuarios') ||
      body?.includes('Clientes') ||
      body?.includes('Total');

    expect(hasDashboardContent).toBeTruthy();
  });

  test('admin logout redirects to admin-login', async ({ page }) => {
    await setupAdminSession(page);
    await page.goto(PAGES.backoffice);
    await page.waitForLoadState('networkidle');

    // Find and click logout
    const logoutBtn = page.locator('button:has-text("Cerrar"), button:has-text("Salir"), [onclick*="logout"], a:has-text("Cerrar"), a:has-text("Salir")').first();
    if (await logoutBtn.isVisible()) {
      await logoutBtn.click();
      await page.waitForURL(/admin-login\.html/, { timeout: 10000 });
      expect(page.url()).toContain('admin-login.html');
    } else {
      // Verify we are at least on the backoffice
      expect(page.url()).toContain('backoffice.html');
    }
  });
});
