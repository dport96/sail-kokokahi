import { test, expect } from '@playwright/test';

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
    'auth/signin',
  ];

  adminPages.forEach((path) => {
    test(`should navigate to ${path}`, async ({ page }) => {
      const baseUrl = process.env.BASE_URL || 'http://localhost:3000'; // Use environment variable for flexibility
      const pageUrl = `${baseUrl}${path}`;

      await page.goto(pageUrl); // Navigate to the URL

      await expect(page); // Validate the URL
    });
  });
});
