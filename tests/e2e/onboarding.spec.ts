import { test, expect } from '@playwright/test';
import { PAGES, clearAllStorage } from './fixtures/test-helpers';

test.describe('Onboarding', () => {
  test.beforeEach(async ({ page }) => {
    // Set up a logged-in user who needs onboarding
    await page.goto(PAGES.login);
    await clearAllStorage(page);
    await page.evaluate(() => {
      localStorage.setItem(
        'gestion-currentUser',
        JSON.stringify({
          email: 'onboard@test.com',
          name: 'Onboard User',
          goal: 'personal',
          duration: 60,
          needsOnboarding: true,
        })
      );
    });
  });

  test('shows step 1 with goal selection', async ({ page }) => {
    await page.goto(PAGES.onboarding);

    await expect(page.locator('#step1')).toBeVisible();
    await expect(page.locator('#step2')).toBeHidden();
    await expect(page.locator('#step3')).toBeHidden();
    await expect(page.locator('#stepIndicator')).toContainText('Paso 1 de 3');
  });

  test('selecting goal and color advances to step 2', async ({ page }) => {
    await page.goto(PAGES.onboarding);

    // Select fitness goal
    await page
      .locator('.option-card', { hasText: 'Fitness' })
      .first()
      .click();
    // Select a color
    await page.locator('.option-card', { hasText: 'Azul' }).click();
    // Click next
    await page.locator('#nextBtn').click();

    await expect(page.locator('#step2')).toBeVisible();
    await expect(page.locator('#step1')).toBeHidden();
    await expect(page.locator('#stepIndicator')).toContainText('Paso 2 de 3');
  });

  test('step 2 shows time and exercise options', async ({ page }) => {
    await page.goto(PAGES.onboarding);

    // Go to step 2
    await page
      .locator('.option-card', { hasText: 'Fitness' })
      .first()
      .click();
    await page.locator('.option-card', { hasText: 'Azul' }).click();
    await page.locator('#nextBtn').click();

    await expect(page.locator('#step2')).toBeVisible();
    // Check time buttons exist
    await expect(
      page.locator('.time-btn', { hasText: '5:00' })
    ).toBeVisible();
    await expect(
      page.locator('.time-btn', { hasText: '6:00' })
    ).toBeVisible();
    // Check exercise options exist
    await expect(
      page.locator('#step2 .option-card', { hasText: 'Gimnasio' })
    ).toBeVisible();
    await expect(
      page.locator('#step2 .option-card', { hasText: 'Cardio' })
    ).toBeVisible();
  });

  test('selecting time and advancing to step 3', async ({ page }) => {
    await page.goto(PAGES.onboarding);

    // Step 1
    await page
      .locator('.option-card', { hasText: 'Fitness' })
      .first()
      .click();
    await page.locator('.option-card', { hasText: 'Rosa' }).click();
    await page.locator('#nextBtn').click();

    // Step 2 - select time and exercise
    await page
      .locator('#step2 .option-card', { hasText: 'Gimnasio' })
      .click();
    await page.locator('#nextBtn').click();

    await expect(page.locator('#step3')).toBeVisible();
    await expect(page.locator('#stepIndicator')).toContainText('Paso 3 de 3');
  });

  test('step 3 shows duration options', async ({ page }) => {
    await page.goto(PAGES.onboarding);

    // Navigate to step 3
    await page
      .locator('.option-card', { hasText: 'Fitness' })
      .first()
      .click();
    await page.locator('.option-card', { hasText: 'Azul' }).click();
    await page.locator('#nextBtn').click();
    await page.locator('#nextBtn').click();

    await expect(page.locator('#step3')).toBeVisible();
    await expect(
      page.locator('#step3 .option-card', { hasText: '30' })
    ).toBeVisible();
    await expect(
      page.locator('#step3 .option-card', { hasText: '60' })
    ).toBeVisible();
    await expect(
      page.locator('#step3 .option-card', { hasText: '90' })
    ).toBeVisible();
    await expect(
      page.locator('#step3 .option-card', { hasText: '180' })
    ).toBeVisible();
  });

  test('completing onboarding redirects to app.html', async ({ page }) => {
    await page.goto(PAGES.onboarding);

    // Step 1
    await page
      .locator('.option-card', { hasText: 'Fitness' })
      .first()
      .click();
    await page.locator('.option-card', { hasText: 'Azul' }).click();
    await page.locator('#nextBtn').click();

    // Step 2
    await page.locator('#nextBtn').click();

    // Step 3 - select duration and finish
    await page
      .locator('#step3 .option-card', { hasText: '60' })
      .first()
      .click();

    // Handle the potential alert for missing goal validation
    page.on('dialog', async dialog => {
      await dialog.accept();
    });

    await page.locator('#finishBtn').click();
    await page.waitForURL(/app\.html/);
    expect(page.url()).toContain('app.html');
  });

  test('redirects to login if no session', async ({ page }) => {
    await clearAllStorage(page);
    await page.goto(PAGES.onboarding);
    await page.waitForURL(/login\.html/);
    expect(page.url()).toContain('login.html');
  });
});
