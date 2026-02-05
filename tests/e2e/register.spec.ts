import { test, expect } from '@playwright/test';
import { PAGES, clearAllStorage } from './fixtures/test-helpers';

test.describe('Registration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGES.login);
    await clearAllStorage(page);
    await page.goto(PAGES.login);
    // Switch to register tab
    await page.locator('#tabRegister').click();
  });

  test('register form has name, email and password fields', async ({
    page,
  }) => {
    await expect(page.locator('#registerName')).toBeVisible();
    await expect(page.locator('#registerEmail')).toBeVisible();
    await expect(page.locator('#registerPassword')).toBeVisible();
  });

  test('successful registration redirects to onboarding.html', async ({
    page,
  }) => {
    // Use a unique email to avoid "already exists" errors
    const uniqueEmail = `testuser_${Date.now()}@test.com`;

    await page.locator('#registerName').fill('New User');
    await page.locator('#registerEmail').fill(uniqueEmail);
    await page.locator('#registerPassword').fill('password123');
    await page.locator('#registerForm button[type="submit"]').click();

    await page.waitForURL(/onboarding\.html/, { timeout: 15000 });
    expect(page.url()).toContain('onboarding.html');
  });

  test('registration with duplicate email shows error', async ({ page }) => {
    // Pre-register a user directly in localStorage
    const duplicateEmail = 'duplicate@test.com';
    await page.evaluate((email) => {
      const users: Record<string, unknown> = {};
      users[email] = {
        name: 'First User',
        password: 'a'.repeat(64), // Fake hash
        goal: 'personal',
        duration: 60,
        startDate: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem('gestion-users', JSON.stringify(users));
    }, duplicateEmail);

    // Now try to register with the same email
    await page.locator('#registerName').fill('Second User');
    await page.locator('#registerEmail').fill(duplicateEmail);
    await page.locator('#registerPassword').fill('password123');
    await page.locator('#registerForm button[type="submit"]').click();

    const errorDiv = page.locator('#registerError');
    await expect(errorDiv).toBeVisible({ timeout: 10000 });
    await expect(errorDiv).toContainText('existe');
  });

  test('password shorter than 6 chars prevents submit via validation', async ({
    page,
  }) => {
    const passwordInput = page.locator('#registerPassword');
    await expect(passwordInput).toHaveAttribute('minlength', '6');

    await page.locator('#registerName').fill('Test');
    await page.locator('#registerEmail').fill('short@test.com');
    await passwordInput.fill('12345');
    await page.locator('#registerForm button[type="submit"]').click();

    // Should stay on the same page (HTML5 validation prevents submit)
    expect(page.url()).toContain('login.html');
  });

  test('required fields show validation', async ({ page }) => {
    // Try submitting empty form
    await page.locator('#registerForm button[type="submit"]').click();

    // Should stay on same page due to HTML5 required validation
    expect(page.url()).toContain('login.html');
    await expect(page.locator('#registerName')).toHaveAttribute('required', '');
    await expect(page.locator('#registerEmail')).toHaveAttribute(
      'required',
      ''
    );
    await expect(page.locator('#registerPassword')).toHaveAttribute(
      'required',
      ''
    );
  });
});
