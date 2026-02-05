import { test, expect } from '@playwright/test';
import { PAGES, setupAuthenticatedUser } from './fixtures/test-helpers';

test.describe('Habits CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedUser(page);
    await page.goto(PAGES.app);
    await page.waitForLoadState('networkidle');
    await page.locator('[data-tab="habits"]').click();
    await page.waitForTimeout(500);
  });

  test('create new habit via add modal', async ({ page }) => {
    await page.locator('button[title="Agregar Hábito"]').click();
    await expect(page.locator('#addHabitModal')).toBeVisible();

    await page.locator('#addHabitIcon').fill('🧪');
    await page.locator('#addHabitName').fill('Hábito CRUD Test');

    await page.locator('#addHabitModal button:has-text("Agregar")').click();
    await page.waitForTimeout(500);

    await expect(page.getByText('Hábito CRUD Test')).toBeVisible();
  });

  test('edit existing habit', async ({ page }) => {
    // Click edit on the first habit (pre-populated by setupAuthenticatedUser)
    const editBtn = page.locator('button[title="Editar"]').first();
    await editBtn.click();
    await expect(page.locator('#editHabitModal')).toBeVisible();

    // Modify the habit name
    await page.locator('#editHabitName').fill('');
    await page.locator('#editHabitName').fill('Hábito Editado E2E');

    await page.locator('#editHabitModal button:has-text("Guardar")').click();
    await page.waitForTimeout(500);

    await expect(page.getByText('Hábito Editado E2E')).toBeVisible();
  });

  test('delete habit via delete modal', async ({ page }) => {
    // Count habits before deletion
    const habitCountBefore = await page.locator('button[title="Eliminar"]').count();

    // Click delete on the last habit
    await page.locator('button[title="Eliminar"]').last().click();
    await expect(page.locator('#deleteModal')).toBeVisible();

    // Confirm deletion
    await page.locator('#deleteModal button:has-text("Eliminar")').click();
    await page.waitForTimeout(500);

    await expect(page.locator('#deleteModal')).toBeHidden();

    // Verify one fewer habit
    const habitCountAfter = await page.locator('button[title="Eliminar"]').count();
    expect(habitCountAfter).toBeLessThan(habitCountBefore);
  });
});
