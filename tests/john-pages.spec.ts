import { test, expect } from '@playwright/test';

test.use({
  storageState: 'john-auth.json',
});

test('User Pages', async ({ page }) => {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  const pages = [
    `${baseUrl}/`,
    `${baseUrl}/member-dashboard`,
    `${baseUrl}/eventsignup`,
    `${baseUrl}/settings`,
  ];
  for (const url of pages) {
    await page.goto(url);
    await expect(page).toHaveURL(url);
  }
});
