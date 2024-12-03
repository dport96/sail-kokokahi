import { test, expect } from '@playwright/test';

test.use({
  storageState: 'john-auth.json',
});

test('User Pages', async ({ page }) => {
  const pages = [
    'http://localhost:3000/member-dashboard',
    'http://localhost:3000/eventsignup',
    'http://localhost:3000/member-landingpage',
    'http://localhost:3000/settings',
  ];

  for (const url of pages) {
    await page.goto(url);
    await expect(page).toHaveURL(url);
  }
});
