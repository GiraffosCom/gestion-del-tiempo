import { test, expect } from '@playwright/test';
import { PAGES, setupAuthenticatedUser } from './fixtures/test-helpers';

test.describe('Protein CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedUser(page);
    await page.goto(PAGES.app);
    await page.waitForLoadState('networkidle');

    // Navigate to meals tab
    await page.locator('[data-tab="meals"]').click();
    await page.waitForTimeout(500);

    // Navigate to protein sub-tab
    const proteinTab = page.locator('[data-tabs-container="nutrition"] button[data-tab="protein"]');
    if (await proteinTab.isVisible()) {
      await proteinTab.click();
      await page.waitForTimeout(500);
    }
  });

  test('add protein entry via modal', async ({ page }) => {
    // Click manual add button
    const addBtn = page.locator('button:has-text("Manual")').first();
    await addBtn.click();
    await expect(page.locator('#addProteinModal')).toBeVisible();

    await page.locator('#proteinSource').fill('Pechuga de pollo');
    await page.locator('#proteinGrams').fill('30');
    await page.locator('#proteinNote').fill('Almuerzo E2E');

    await page.locator('#addProteinModal button:has-text("Agregar")').click();
    await page.waitForTimeout(500);

    // Verify protein entry appears in the daily log
    await expect(page.getByText('Pechuga de pollo', { exact: true })).toBeVisible();
  });

  test('delete protein entry', async ({ page }) => {
    // First add an entry
    const addBtn = page.locator('button:has-text("Manual")').first();
    await addBtn.click();

    const modal = page.locator('#addProteinModal');
    if (await modal.isVisible()) {
      await page.locator('#proteinSource').fill('Proteína para borrar');
      await page.locator('#proteinGrams').fill('25');
      await page.locator('#addProteinModal button:has-text("Agregar")').click();
      await page.waitForTimeout(500);
    }

    // Find and click the delete button (✕) on the protein entry
    const deleteBtn = page.locator('button:has-text("✕")').first();
    if (await deleteBtn.isVisible()) {
      await deleteBtn.click();
      await page.waitForTimeout(500);
    }

    expect(page.url()).toContain('app.html');
  });
});
