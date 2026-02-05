import { Page } from '@playwright/test';

// Test credentials
export const TEST_USER = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'test123456',
};

export const TEST_ADMIN = {
  user: 'admin',
  password: 'admin123',
};

// URLs
export const PAGES = {
  login: '/login.html',
  onboarding: '/onboarding.html',
  app: '/app.html',
  adminLogin: '/admin-login.html',
  backoffice: '/backoffice.html',
};

/**
 * Hash a password using SHA-256 (mirrors auth.js hashPassword)
 */
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Pre-populate localStorage with an authenticated user session.
 * Must be called BEFORE navigating to a page (use page.goto after).
 */
export async function setupAuthenticatedUser(page: Page) {
  const hashedPw = await hashPassword(TEST_USER.password);
  const userKey = TEST_USER.email.replace(/[^a-z0-9]/gi, '_');
  const today = new Date().toISOString().split('T')[0];

  await page.goto('/login.html', { waitUntil: 'commit' });

  await page.evaluate(
    ({ email, name, hashedPw, userKey, today }) => {
      // Register user in users store
      const users: Record<string, unknown> = {};
      users[email] = {
        name,
        password: hashedPw,
        goal: 'fitness',
        duration: 60,
        startDate: today,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem('gestion-users', JSON.stringify(users));

      // Set current user session
      localStorage.setItem(
        'gestion-currentUser',
        JSON.stringify({
          email,
          name,
          goal: 'fitness',
          duration: 60,
          startDate: today,
          onboardingCompleted: true,
        })
      );

      // Set user profile
      localStorage.setItem(
        `${userKey}-user-profile`,
        JSON.stringify({
          wakeUp: '07:00',
          sleep: '22:00',
          goal: 'fitness',
          themeColor: 'azul',
          iconStyle: 'emoji',
        })
      );

      // Set some default habits
      localStorage.setItem(
        `${userKey}-custom-habits`,
        JSON.stringify([
          { id: 1, icon: '☀️', name: 'Despertar 07:00' },
          { id: 2, icon: '💧', name: 'Beber agua al despertar' },
          { id: 3, icon: '💪', name: 'Ejercicio completado' },
          { id: 4, icon: '📖', name: 'Leer 15-20 min' },
          { id: 5, icon: '🙏', name: 'Momento de gratitud' },
        ])
      );

      // Set some schedule items
      localStorage.setItem(
        `${userKey}-custom-schedules`,
        JSON.stringify([
          {
            id: 1,
            time: '07:00',
            activity: 'Rutina matutina',
            duration: '30min',
            category: 'routine',
          },
          {
            id: 2,
            time: '09:00',
            activity: 'Trabajo',
            duration: '4h',
            category: 'work',
          },
        ])
      );

      // Set weekly goals
      localStorage.setItem(
        `${userKey}-custom-goals`,
        JSON.stringify([
          {
            week: 1,
            dates: 'Semana 1',
            fisica: 'Establecer rutina',
            personal: 'Aprender nutrición',
            digital: 'Seguir cuentas fitness',
            espiritual: 'Practicar gratitud',
          },
        ])
      );

      // Icon style
      localStorage.setItem(`${userKey}-icon-style`, 'emoji');
    },
    {
      email: TEST_USER.email,
      name: TEST_USER.name,
      hashedPw,
      userKey,
      today,
    }
  );
}

/**
 * Pre-populate localStorage with admin session.
 */
export async function setupAdminSession(page: Page) {
  await page.goto('/admin-login.html', { waitUntil: 'commit' });

  await page.evaluate(() => {
    localStorage.setItem(
      'gestion-admin',
      JSON.stringify({ user: 'admin', password: 'admin123' })
    );
    localStorage.setItem('gestion-admin-session', 'true');
  });
}

/**
 * Pre-populate localStorage with a registered user (but NOT logged in).
 * Useful for login tests.
 */
export async function setupRegisteredUser(page: Page) {
  const hashedPw = await hashPassword(TEST_USER.password);

  await page.goto('/login.html', { waitUntil: 'commit' });

  await page.evaluate(
    ({ email, name, hashedPw }) => {
      const users: Record<string, unknown> = {};
      users[email] = {
        name,
        password: hashedPw,
        goal: 'fitness',
        duration: 60,
        startDate: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem('gestion-users', JSON.stringify(users));
    },
    { email: TEST_USER.email, name: TEST_USER.name, hashedPw }
  );
}

/**
 * Clear all localStorage data.
 */
export async function clearAllStorage(page: Page) {
  await page.evaluate(() => localStorage.clear());
}
