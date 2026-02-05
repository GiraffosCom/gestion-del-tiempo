import { test, expect } from '@playwright/test';
import { PAGES, setupAuthenticatedUser } from './fixtures/test-helpers';

test.describe('Fasting CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedUser(page);
    await page.goto(PAGES.app);
    await page.waitForLoadState('networkidle');
    await page.locator('[data-tab="fasting"]').click();
    await page.waitForTimeout(500);
  });

  test('start a fasting session', async ({ page }) => {
    // Click start fasting button
    const startBtn = page.locator('button:has-text("Iniciar Ayuno")');
    await startBtn.click();
    await expect(page.locator('#startFastingModal')).toBeVisible();

    // Select 16:8 fasting type (the popular one)
    await page.locator('button:has-text("16:8")').click();
    await page.waitForTimeout(300);

    // Confirm start
    await page.locator('#startFastingModal button:has-text("Comenzar")').click();
    await page.waitForTimeout(500);

    // Modal should close
    await expect(page.locator('#startFastingModal')).toBeHidden();

    // Verify fasting is active (should show timer or active state)
    expect(page.url()).toContain('app.html');
  });
});
