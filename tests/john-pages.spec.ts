import { test, expect } from '@playwright/test';

test.use({
  storageState: 'john-auth.json', // Ensure this file is valid and correctly generated
});

test.describe('User Pages', () => {
  const userPages = [
    '/',
    '/member-dashboard',
    '/eventsignup',
    '/settings',
  ];

  userPages.forEach((path) => {
    test(`should navigate to ${path}`, async ({ page }) => {
      const baseUrl = process.env.BASE_URL || 'http://localhost:3000'; // Use environment variable for flexibility
      const pageUrl = `${baseUrl}${path}`;

      await page.goto(pageUrl); // Navigate to the URL
      await expect(page).toHaveURL(pageUrl); // Validate the URL
    });
  });
});
