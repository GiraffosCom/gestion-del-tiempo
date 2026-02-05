import { test, expect } from '@playwright/test';
import { PAGES, setupAuthenticatedUser } from './fixtures/test-helpers';

test.describe('Meals CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedUser(page);
    await page.goto(PAGES.app);
    await page.waitForLoadState('networkidle');

    // Navigate to meals tab
    await page.locator('[data-tab="meals"]').click();
    await page.waitForTimeout(500);

    // Navigate to plan sub-tab
    const planTab = page.locator('[data-tabs-container="nutrition"] button[data-tab="plan"]');
    if (await planTab.isVisible()) {
      await planTab.click();
      await page.waitForTimeout(500);
    }
  });

  test('create new meal via add modal', async ({ page }) => {
    await page.locator('button[title="Agregar Comida"]').click();
    await expect(page.locator('#addMealModal')).toBeVisible();

    await page.locator('#addMealTime').fill('13:00');
    await page.locator('#addMealName').fill('Almuerzo Test');
    await page.locator('#addMealEmoji').fill('🥗');
    await page.locator('#addMealOptions').fill('Ensalada\nPollo');
    await page.locator('#addMealMacros').fill('P:30g | C:20g | G:10g');

    await page.locator('#addMealModal button:has-text("Agregar")').click();
    await page.waitForTimeout(500);

    await expect(page.getByText('Almuerzo Test')).toBeVisible();
  });

  test('edit existing meal', async ({ page }) => {
    // First create a meal to edit
    await page.locator('button[title="Agregar Comida"]').click();
    await page.locator('#addMealTime').fill('20:00');
    await page.locator('#addMealName').fill('Cena To Edit');
    await page.locator('#addMealEmoji').fill('🍕');
    await page.locator('#addMealModal button:has-text("Agregar")').click();
    await page.waitForTimeout(500);

    // Click edit on the last meal (ours should be last due to time sort)
    await page.locator('button[title="Editar"]').last().click();
    await expect(page.locator('#editMealModal')).toBeVisible();

    // Modify the meal name
    await page.locator('#editMealName').fill('');
    await page.locator('#editMealName').fill('Cena Editada');

    await page.locator('#editMealModal button:has-text("Guardar")').click();
    await page.waitForTimeout(500);

    await expect(page.getByText('Cena Editada')).toBeVisible();
  });

  test('delete meal via delete modal', async ({ page }) => {
    // First create a meal to delete
    await page.locator('button[title="Agregar Comida"]').click();
    await page.locator('#addMealTime').fill('22:00');
    await page.locator('#addMealName').fill('Meal To Delete');
    await page.locator('#addMealEmoji').fill('🗑️');
    await page.locator('#addMealModal button:has-text("Agregar")').click();
    await page.waitForTimeout(500);

    await expect(page.getByText('Meal To Delete')).toBeVisible();

    // Click delete on the last meal
    await page.locator('button[title="Eliminar"]').last().click();
    await expect(page.locator('#deleteModal')).toBeVisible();

    // Confirm deletion
    await page.locator('#deleteModal button:has-text("Eliminar")').click();
    await page.waitForTimeout(500);

    await expect(page.locator('#deleteModal')).toBeHidden();
  });
});
