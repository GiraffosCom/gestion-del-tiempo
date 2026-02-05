import { test, expect } from '@playwright/test';
import { PAGES, setupAuthenticatedUser } from './fixtures/test-helpers';

test.describe('Weight CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedUser(page);
    await page.goto(PAGES.app);
    await page.waitForLoadState('networkidle');

    // Navigate to gym tab
    await page.locator('[data-tab="gym"]').click();
    await page.waitForTimeout(500);

    // Navigate to profile sub-tab (where weight registration is)
    const profileTab = page.locator('[data-tabs-container="gym"] button[data-tab="profile"]');
    if (await profileTab.isVisible()) {
      await profileTab.click();
      await page.waitForTimeout(500);
    }
  });

  test('register weight entry', async ({ page }) => {
    // Handle alert that might appear
    page.on('dialog', async dialog => {
      await dialog.accept();
    });

    // Click register weight button
    const weightBtn = page.locator('button:has-text("Registrar Peso")');
    await weightBtn.click();
    await expect(page.locator('#weightModal')).toBeVisible();

    // Fill weight form
    await page.locator('#weightValue').fill('65.5');
    await page.locator('#measureWaist').fill('75');
    await page.locator('#measureHip').fill('95');

    // Save
    await page.locator('#weightModal button:has-text("Guardar")').click();
    await page.waitForTimeout(500);

    await expect(page.locator('#weightModal')).toBeHidden();

    // Verify weight appears on the profile page
    await expect(page.getByText('65.5')).toBeVisible();
  });
});
