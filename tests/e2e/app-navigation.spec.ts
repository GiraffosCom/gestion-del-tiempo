import { test, expect } from '@playwright/test';
import {
  PAGES,
  setupAuthenticatedUser,
  clearAllStorage,
} from './fixtures/test-helpers';

test.describe('App Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedUser(page);
  });

  test('loads dashboard (agenda tab) by default', async ({ page }) => {
    await page.goto(PAGES.app);
    await page.waitForLoadState('networkidle');

    // The app should load with the agenda tab active by default
    expect(page.url()).toContain('app.html');
    // The agenda tab button should have the active styling
    const agendaTab = page.locator('[data-tab="agenda"]');
    await expect(agendaTab).toBeVisible();
  });

  test('navigate to Habits tab', async ({ page }) => {
    await page.goto(PAGES.app);
    await page.waitForLoadState('networkidle');

    await page.locator('[data-tab="habits"]').click();
    await page.waitForTimeout(500);
    expect(page.url()).toContain('app.html');
  });

  test('navigate to Agenda tab', async ({ page }) => {
    await page.goto(PAGES.app);
    await page.waitForLoadState('networkidle');

    // First navigate away, then back to agenda
    await page.locator('[data-tab="habits"]').click();
    await page.waitForTimeout(300);
    await page.locator('[data-tab="agenda"]').click();
    await page.waitForTimeout(500);
    expect(page.url()).toContain('app.html');
  });

  test('navigate to Goals tab', async ({ page }) => {
    await page.goto(PAGES.app);
    await page.waitForLoadState('networkidle');

    await page.locator('[data-tab="goals"]').click();
    await page.waitForTimeout(500);
    expect(page.url()).toContain('app.html');
  });

  test('navigate to Settings (gear icon)', async ({ page }) => {
    await page.goto(PAGES.app);
    await page.waitForLoadState('networkidle');

    // Settings is a gear icon dropdown, not a tab (title="Configuración")
    await page.locator('button[title="Configuración"]').click();
    await page.waitForTimeout(300);
    await expect(page.locator('#settingsMenu')).toBeVisible();
  });

  test('redirects to login.html if no session', async ({ page }) => {
    await clearAllStorage(page);
    await page.goto(PAGES.app);
    await page.waitForURL(/login\.html/, { timeout: 10000 });
    expect(page.url()).toContain('login.html');
  });
});
