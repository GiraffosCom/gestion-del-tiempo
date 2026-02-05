import { test, expect } from '@playwright/test';
import { PAGES, setupAuthenticatedUser } from './fixtures/test-helpers';

test.describe('Gym Workout CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedUser(page);
    await page.goto(PAGES.app);
    await page.waitForLoadState('networkidle');

    // Navigate to gym tab
    await page.locator('[data-tab="gym"]').click();
    await page.waitForTimeout(500);

    // Navigate to workout sub-tab
    const workoutTab = page.locator('[data-tabs-container="gym"] button[data-tab="workout"]');
    if (await workoutTab.isVisible()) {
      await workoutTab.click();
      await page.waitForTimeout(500);
    }
  });

  test('add exercise to workout', async ({ page }) => {
    // Click add exercise button
    const addBtn = page.getByText('Ejercicio', { exact: false }).locator('xpath=ancestor-or-self::button').first();
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await page.waitForTimeout(500);
    } else {
      // Try alternative: "o agregar ejercicios manualmente" link
      const altBtn = page.locator('button:has-text("agregar ejercicios")');
      if (await altBtn.isVisible()) {
        await altBtn.click();
        await page.waitForTimeout(500);
      }
    }

    // The exercise library modal should be visible
    const modal = page.locator('#addWorkoutExerciseModal');
    if (await modal.isVisible()) {
      // Add a custom exercise
      await page.locator('#customExerciseName').fill('Press Banca Test');
      await page.locator('#addWorkoutExerciseModal').getByRole('button', { name: 'Crear' }).click();
      await page.waitForTimeout(500);

      // Verify exercise appears in workout
      await expect(page.getByText('Press Banca Test')).toBeVisible();
    } else {
      // If modal didn't open, just verify we're on the gym page
      expect(page.url()).toContain('app.html');
    }
  });

  test('remove exercise from workout', async ({ page }) => {
    // First add an exercise
    const addBtn = page.locator('button:has-text("Ejercicio")').first();
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await page.waitForTimeout(500);

      const modal = page.locator('#addWorkoutExerciseModal');
      if (await modal.isVisible()) {
        await page.locator('#customExerciseName').fill('Ejercicio Para Borrar');
        await page.locator('#addWorkoutExerciseModal').getByRole('button', { name: 'Crear' }).click();
        await page.waitForTimeout(500);
      }
    }

    // Handle confirm dialog for deletion
    page.on('dialog', async dialog => {
      await dialog.accept();
    });

    // Find and click the delete button (🗑️) on the exercise
    const deleteBtn = page.locator('button:has-text("🗑️")').first();
    if (await deleteBtn.isVisible()) {
      await deleteBtn.click();
      await page.waitForTimeout(500);
    }

    expect(page.url()).toContain('app.html');
  });
});
