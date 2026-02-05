import { test, expect } from '@playwright/test';
import { PAGES, setupAuthenticatedUser } from './fixtures/test-helpers';

test.describe('Schedule CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedUser(page);
    await page.goto(PAGES.app);
    await page.waitForLoadState('networkidle');
    await page.locator('[data-tab="agenda"]').waitFor({ state: 'visible' });
    await page.locator('[data-tab="agenda"]').click();
    await page.waitForTimeout(500);
  });

  test('create new activity via add modal', async ({ page }) => {
    await page.locator('button[title="Agregar Actividad"]').click();
    await expect(page.locator('#addModal')).toBeVisible();

    await page.locator('#addTime').fill('14:30');
    await page.locator('#addActivity').fill('Actividad CRUD Test');
    await page.locator('#addDuration').fill('45min');

    await page.locator('#addModal button:has-text("Agregar")').click();
    await page.waitForTimeout(500);

    await expect(page.getByText('Actividad CRUD Test')).toBeVisible();
  });

  test('edit existing activity', async ({ page }) => {
    // First create an activity at a late time so it's last in list
    await page.locator('button[title="Agregar Actividad"]').click();
    await page.locator('#addTime').fill('23:50');
    await page.locator('#addActivity').fill('Activity To Edit');
    await page.locator('#addDuration').fill('30min');
    await page.locator('#addModal button:has-text("Agregar")').click();
    await page.waitForTimeout(500);

    await expect(page.getByText('Activity To Edit')).toBeVisible();

    // Click edit on the last activity (ours should be last due to time sort)
    await page.locator('button[title="Editar"]').last().click();
    await expect(page.locator('#editModal')).toBeVisible();

    // Modify the activity name
    await page.locator('#editActivity').fill('');
    await page.locator('#editActivity').fill('Edited Activity');

    await page.locator('#editModal button:has-text("Guardar")').click();
    await page.waitForTimeout(500);

    // Handle "apply to all days?" confirmation if it appears
    const applyModal = page.getByText('Solo este día');
    if (await applyModal.isVisible({ timeout: 2000 }).catch(() => false)) {
      await applyModal.click();
      await page.waitForTimeout(500);
    }

    await expect(page.getByText('Edited Activity')).toBeVisible();
  });

  test('delete activity via delete modal', async ({ page }) => {
    // First create an activity
    await page.locator('button[title="Agregar Actividad"]').click();
    await page.locator('#addTime').fill('23:55');
    await page.locator('#addActivity').fill('Activity To Delete');
    await page.locator('#addDuration').fill('1h');
    await page.locator('#addModal button:has-text("Agregar")').click();
    await page.waitForTimeout(500);

    await expect(page.getByText('Activity To Delete')).toBeVisible();

    // Click delete on the last activity
    await page.locator('button[title="Eliminar"]').last().click();
    await expect(page.locator('#deleteModal')).toBeVisible();

    // Confirm deletion
    await page.locator('#deleteModal button:has-text("Eliminar")').click();
    await page.waitForTimeout(500);

    await expect(page.locator('#deleteModal')).toBeHidden();
  });
});
