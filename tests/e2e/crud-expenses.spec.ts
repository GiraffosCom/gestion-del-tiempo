import { test, expect } from '@playwright/test';
import { PAGES, setupAuthenticatedUser } from './fixtures/test-helpers';

test.describe('Expenses CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedUser(page);
    await page.goto(PAGES.app);
    await page.waitForLoadState('networkidle');
    await page.locator('[data-tab="gastos"]').click();
    await page.waitForTimeout(500);
  });

  test('create new expense via manual form', async ({ page }) => {
    // Click manual add button
    await page.locator('button:has-text("Manual")').click();
    await expect(page.locator('#addExpenseModal')).toBeVisible();

    await page.locator('#manualExpenseStore').fill('Supermercado Test');
    await page.locator('#manualExpenseTotal').fill('15000');
    await page.locator('#manualExpenseDescription').fill('Compras semanales E2E');

    await page.locator('#addExpenseModal button:has-text("Guardar")').click();
    await page.waitForTimeout(500);

    // Verify the expense appears in the list
    await expect(page.getByText('Supermercado Test')).toBeVisible();
  });

  test('edit existing expense', async ({ page }) => {
    // First create an expense
    await page.locator('button:has-text("Manual")').click();
    await page.locator('#manualExpenseStore').fill('Tienda Edit');
    await page.locator('#manualExpenseTotal').fill('5000');
    await page.locator('#addExpenseModal button:has-text("Guardar")').click();
    await page.waitForTimeout(500);

    // Click edit button
    const editBtn = page.locator('button[title="Editar"]').first();
    await editBtn.click();
    await expect(page.locator('#editExpenseModal')).toBeVisible();

    // Modify the store name
    await page.locator('#editExpenseStore').fill('');
    await page.locator('#editExpenseStore').fill('Tienda Editada');

    await page.locator('#editExpenseModal button:has-text("Guardar")').click();
    await page.waitForTimeout(500);

    await expect(page.getByText('Tienda Editada')).toBeVisible();
  });

  test('delete expense with confirm dialog', async ({ page }) => {
    // First create an expense
    await page.locator('button:has-text("Manual")').click();
    await page.locator('#manualExpenseStore').fill('Gasto Para Borrar');
    await page.locator('#manualExpenseTotal').fill('3000');
    await page.locator('#addExpenseModal button:has-text("Guardar")').click();
    await page.waitForTimeout(500);

    await expect(page.getByText('Gasto Para Borrar')).toBeVisible();

    // Handle confirm dialog
    page.on('dialog', async dialog => {
      await dialog.accept();
    });

    // Click delete button
    const deleteBtn = page.locator('button[title="Eliminar"]').first();
    await deleteBtn.click();
    await page.waitForTimeout(500);

    // Verify the expense is removed
    await expect(page.getByText('Gasto Para Borrar')).toBeHidden();
  });
});
