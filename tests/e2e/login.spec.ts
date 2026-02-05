import { test, expect } from '@playwright/test';
import {
  PAGES,
  TEST_USER,
  setupRegisteredUser,
  setupAuthenticatedUser,
  clearAllStorage,
} from './fixtures/test-helpers';

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGES.login);
    await clearAllStorage(page);
    await page.goto(PAGES.login);
  });

  test('shows login form by default', async ({ page }) => {
    const loginForm = page.locator('#loginForm');
    const registerForm = page.locator('#registerForm');

    await expect(loginForm).toBeVisible();
    await expect(registerForm).toBeHidden();
    await expect(page.locator('#loginEmail')).toBeVisible();
    await expect(page.locator('#loginPassword')).toBeVisible();
  });

  test('switches between login and register tabs', async ({ page }) => {
    // Click register tab
    await page.locator('#tabRegister').click();
    await expect(page.locator('#registerForm')).toBeVisible();
    await expect(page.locator('#loginForm')).toBeHidden();

    // Click login tab
    await page.locator('#tabLogin').click();
    await expect(page.locator('#loginForm')).toBeVisible();
    await expect(page.locator('#registerForm')).toBeHidden();
  });

  test('successful login redirects to app.html', async ({ page }) => {
    await setupRegisteredUser(page);
    await page.goto(PAGES.login);

    await page.locator('#loginEmail').fill(TEST_USER.email);
    await page.locator('#loginPassword').fill(TEST_USER.password);
    await page.locator('#loginForm button[type="submit"]').click();

    await page.waitForURL(/app\.html/);
    expect(page.url()).toContain('app.html');
  });

  test('login with wrong credentials shows error', async ({ page }) => {
    await setupRegisteredUser(page);
    await page.goto(PAGES.login);

    await page.locator('#loginEmail').fill(TEST_USER.email);
    await page.locator('#loginPassword').fill('wrongpassword');
    await page.locator('#loginForm button[type="submit"]').click();

    const errorDiv = page.locator('#loginError');
    await expect(errorDiv).toBeVisible();
    await expect(errorDiv).toContainText('incorrecta');
  });

  test('password visibility toggle works', async ({ page }) => {
    const passwordInput = page.locator('#loginPassword');
    const toggleBtn = page
      .locator('#loginForm')
      .locator('button[onclick*="togglePassword"]');

    await expect(passwordInput).toHaveAttribute('type', 'password');
    await toggleBtn.click();
    await expect(passwordInput).toHaveAttribute('type', 'text');
    await toggleBtn.click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('demo button redirects to app.html', async ({ page }) => {
    await page.locator('button', { hasText: 'demo' }).click();
    await page.waitForURL(/app\.html/);
    expect(page.url()).toContain('app.html');
  });

  test('already authenticated user is redirected automatically', async ({
    page,
  }) => {
    await setupAuthenticatedUser(page);
    // The redirect happens so fast it can interrupt goto, so catch that
    try {
      await page.goto(PAGES.login, { waitUntil: 'commit' });
    } catch {
      // Navigation interrupted by redirect is expected
    }
    await page.waitForURL(/app\.html/, { timeout: 10000 });
    expect(page.url()).toContain('app.html');
  });
});
