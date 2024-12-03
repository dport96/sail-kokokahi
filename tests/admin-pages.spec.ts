import { test, expect } from '@playwright/test';

test.use({
  storageState: 'admin-auth.json',
});

test('Admin Pages', async ({ page }) => {
  const adminPages = [
    'http://localhost:3000/add-event',
    'http://localhost:3000/admin-dashboard',
    'http://localhost:3000/admin-landingpage',
    'http://localhost:3000/settings'
  ];

  for (const pageUrl of adminPages) {
    await page.goto(pageUrl);
    await expect(page).toHaveURL(pageUrl);
  }
});
