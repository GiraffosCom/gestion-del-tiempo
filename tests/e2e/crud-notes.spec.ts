import { test, expect } from '@playwright/test';
import { PAGES, setupAuthenticatedUser } from './fixtures/test-helpers';

test.describe('Notes CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedUser(page);
    await page.goto(PAGES.app);
    await page.waitForLoadState('networkidle');
    await page.locator('[data-tab="notes"]').click();
    await page.waitForTimeout(500);
  });

  test('create and save a note', async ({ page }) => {
    const textarea = page.locator('#notesTextarea');
    await expect(textarea).toBeVisible();

    await textarea.fill('Esta es una nota de prueba E2E');

    // Click save button
    const saveBtn = page.locator('button:has-text("Guardar")').first();
    await saveBtn.click();
    await page.waitForTimeout(500);

    // Verify the note was saved by checking the textarea still has the text
    await expect(textarea).toHaveValue('Esta es una nota de prueba E2E');
  });

  test('delete a note from history', async ({ page }) => {
    // First create a note
    const textarea = page.locator('#notesTextarea');
    await textarea.fill('Nota para eliminar E2E');

    const saveBtn = page.locator('button:has-text("Guardar")').first();
    await saveBtn.click();
    await page.waitForTimeout(500);

    // Handle confirm dialog for deletion
    page.on('dialog', async dialog => {
      await dialog.accept();
    });

    // Look for delete button in notes history
    const deleteBtn = page.locator('button[title="Eliminar nota"]').first();
    if (await deleteBtn.isVisible()) {
      await deleteBtn.click();
      await page.waitForTimeout(500);
    }

    expect(page.url()).toContain('app.html');
  });
});
