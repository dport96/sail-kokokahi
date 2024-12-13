import { test, expect } from '@playwright/test';

test.use({
  storageState: 'admin-auth.json',
});

test('Admin Pages', async ({ page }) => {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  const adminPages = [
    `${baseUrl}/`,
    `${baseUrl}/add-event`,
    `${baseUrl}/admin-dashboard`,
    `${baseUrl}/admin-events`,
    `${baseUrl}/settings`,
  ];

  for (const pageUrl of adminPages) {
    await page.goto(pageUrl);
    await expect(page).toHaveURL(pageUrl);
  }
});
