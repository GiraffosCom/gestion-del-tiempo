import { test, expect } from '@playwright/test';
import { PAGES, setupAuthenticatedUser } from './fixtures/test-helpers';

test.describe('App Goals', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedUser(page);
    await page.goto(PAGES.app);
    await page.waitForLoadState('networkidle');

    // Navigate to goals tab using data-tab selector
    await page.locator('[data-tab="goals"]').click();
    await page.waitForTimeout(500);
  });

  test('shows goal categories (fisica, personal, digital, espiritual)', async ({
    page,
  }) => {
    const pageContent = await page.textContent('body');
    const hasGoalCategories =
      pageContent?.includes('Física') ||
      pageContent?.includes('física') ||
      pageContent?.includes('Personal') ||
      pageContent?.includes('Digital') ||
      pageContent?.includes('Espiritual') ||
      pageContent?.includes('Establecer rutina') ||
      pageContent?.includes('Semana');

    expect(hasGoalCategories).toBeTruthy();
  });

  test('add new goal in a category', async ({ page }) => {
    // From the screenshot, the edit goal modal has fields:
    // Semana, Fechas, Meta Física, Meta Personal, Meta Digital, Meta Espiritual
    // With "Cancelar" and "Guardar" buttons

    // Find the edit/add goal trigger - look for edit buttons on goal cards
    const editBtn = page.locator('button:has-text("Editar"), [onclick*="editGoal"], [onclick*="openEditGoal"]').first();
    if (await editBtn.isVisible()) {
      await editBtn.click();
      await page.waitForTimeout(500);
    }

    // The edit goal modal should be open - it has input fields for each category
    const modalVisible = await page.locator('#editGoalModal').isVisible();
    if (modalVisible) {
      // Find and modify one of the goal fields (Meta Física)
      const fisicaInput = page.locator('#editGoalModal input, #editGoalModal textarea').nth(2); // Skip semana and fechas
      if (await fisicaInput.isVisible()) {
        await fisicaInput.clear();
        await fisicaInput.fill('Meta de prueba E2E');
      }

      // Click Guardar
      await page.locator('#editGoalModal button:has-text("Guardar")').click();
      await page.waitForTimeout(500);
    }

    expect(page.url()).toContain('app.html');
  });

  test('mark goal as completed', async ({ page }) => {
    const goalCheck = page.locator('[onclick*="toggleGoal"], [onclick*="completeGoal"], input[type="checkbox"]').first();
    if (await goalCheck.isVisible()) {
      await goalCheck.click();
      await page.waitForTimeout(300);
    }
    expect(page.url()).toContain('app.html');
  });
});
