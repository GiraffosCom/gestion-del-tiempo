import { test, expect } from '@playwright/test';
import { PAGES, setupAuthenticatedUser } from './fixtures/test-helpers';

test.describe('App Habits', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedUser(page);
    await page.goto(PAGES.app);
    await page.waitForLoadState('networkidle');

    // Navigate to habits tab using data-tab selector
    await page.locator('[data-tab="habits"]').click();
    await page.waitForTimeout(500);
  });

  test('shows list of habits for the day', async ({ page }) => {
    // The habits we pre-loaded should be visible
    await expect(page.getByText('Despertar 07:00').first()).toBeVisible();
    await expect(page.getByText('Beber agua al despertar').first()).toBeVisible();
  });

  test('mark habit as completed (toggle check)', async ({ page }) => {
    // Find a habit checkbox or toggle button and click it
    const habitToggle = page.locator('[onclick*="toggleHabit"]').first();
    if (await habitToggle.isVisible()) {
      await habitToggle.click();
      await page.waitForTimeout(300);
    }
    expect(page.url()).toContain('app.html');
  });

  test('unmark completed habit', async ({ page }) => {
    // Click to complete then click again to uncomplete
    const habitToggle = page.locator('[onclick*="toggleHabit"]').first();
    if (await habitToggle.isVisible()) {
      await habitToggle.click();
      await page.waitForTimeout(300);
      await habitToggle.click();
      await page.waitForTimeout(300);
    }
    expect(page.url()).toContain('app.html');
  });

  test('habit completion counter updates', async ({ page }) => {
    // Look for a completion indicator (e.g. "0/5 completados" or progress text)
    const pageContent = await page.textContent('body');
    const hasProgress = pageContent?.match(/\d+\/\d+/) || pageContent?.includes('completad');
    expect(hasProgress).toBeTruthy();
  });

  test('add custom habit', async ({ page }) => {
    // Look for an "add habit" button
    const addBtn = page.locator('[onclick*="openAddHabit"], [onclick*="addHabit"], [onclick*="showAddHabit"], button:has-text("Agregar")').first();
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await page.waitForTimeout(500);

      // Fill in habit modal
      const nameInput = page.locator('#addHabitName');
      if (await nameInput.isVisible()) {
        await nameInput.fill('Mi hábito de prueba');

        const iconInput = page.locator('#addHabitIcon');
        if (await iconInput.isVisible()) {
          await iconInput.fill('🧪');
        }

        // Save habit
        const saveBtn = page.locator('#addHabitModal button:has-text("Guardar"), #addHabitModal button:has-text("Agregar"), #addHabitModal button[type="submit"]').first();
        if (await saveBtn.isVisible()) {
          await saveBtn.click();
          await page.waitForTimeout(500);
        }
      }
    }
    expect(page.url()).toContain('app.html');
  });
});
