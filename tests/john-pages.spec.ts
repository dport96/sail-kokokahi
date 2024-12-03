import { test, expect } from '@playwright/test';

test.use({
  storageState: 'john-auth.json',
});

test('User Pages', async ({ page }) => {
  await page.goto('http://localhost:3000/');
});
