import { test } from '@playwright/test';

test.use({
  storageState: 'admin-auth.json', // Ensure this file is valid and correctly generated
});

test.describe('Admin Pages', () => {
  const adminPages = [
    '/',
    '/add-event',
    '/admin-dashboard',
    '/admin-events',
    '/settings',
    '/auth/signin',
  ];

  adminPages.forEach((path) => {
    test(`should navigate to ${path}`, async ({ page }) => {
      // Prefer BASE_URL, then NEXTAUTH_URL, then localhost
      const baseUrl = process.env.BASE_URL
        || process.env.NEXTAUTH_URL
        || 'http://localhost:3000';
      const pageUrl = `${baseUrl}${path}`;

      await page.goto(pageUrl);
    });
  });
});
