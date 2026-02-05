import { test, expect } from '@playwright/test';
import { PAGES, setupAuthenticatedUser } from './fixtures/test-helpers';

test.describe('Goals CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedUser(page);
    await page.goto(PAGES.app);
    await page.waitForLoadState('networkidle');
    await page.locator('[data-tab="goals"]').click();
    await page.waitForTimeout(500);
  });

  test('create new goal via add modal', async ({ page }) => {
    await page.locator('button[title="Agregar Meta"]').click();
    await expect(page.locator('#addGoalModal')).toBeVisible();

    await page.locator('#addGoalWeek').fill('10');
    await page.locator('#addGoalDates').fill('5-11 Mar');
    await page.locator('#addGoalFisica').fill('Correr 5km');
    await page.locator('#addGoalPersonal').fill('Leer un libro');
    await page.locator('#addGoalDigital').fill('Terminar proyecto');
    await page.locator('#addGoalEspiritual').fill('Meditar 10min diarios');

    await page.locator('#addGoalModal button:has-text("Crear Meta")').click();
    await page.waitForTimeout(500);

    await expect(page.getByText('Semana 10')).toBeVisible();
    await expect(page.getByText('Correr 5km')).toBeVisible();
  });

  test('edit existing goal', async ({ page }) => {
    // Click edit on the first goal (pre-populated by setupAuthenticatedUser)
    const editBtn = page.locator('button[title="Editar"]').first();
    await editBtn.click();
    await expect(page.locator('#editGoalModal')).toBeVisible();

    // Modify the physical goal
    await page.locator('#editGoalFisica').fill('');
    await page.locator('#editGoalFisica').fill('Meta Física Editada E2E');

    await page.locator('#editGoalModal button:has-text("Guardar")').click();
    await page.waitForTimeout(500);

    await expect(page.getByText('Meta Física Editada E2E')).toBeVisible();
  });
});
