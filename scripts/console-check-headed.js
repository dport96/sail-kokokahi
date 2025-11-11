const { chromium } = require('playwright');
const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 50 });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });

  const pagesToCheck = ['/', '/member-dashboard', '/admin-dashboard'];
  const base = process.env.CHECK_BASE || 'http://localhost:3000';

  for (const path of pagesToCheck) {
    const page = await context.newPage();
    const messages = [];
    const errors = [];

    page.on('console', (msg) => {
      messages.push({ type: msg.type(), text: msg.text() });
      console.log(`[PAGE ${path}] [console:${msg.type()}] ${msg.text()}`);
    });
    page.on('pageerror', (err) => {
      errors.push(String(err));
      console.log(`[PAGE ${path}] [pageerror] ${err}`);
    });

    console.log(`\n=== Opening in headed browser: ${base}${path} ===`);
    try {
      const resp = await page.goto(`${base}${path}`, { waitUntil: 'networkidle', timeout: 30000 });
      console.log(`Status: ${resp && resp.status()} - URL: ${page.url()}`);
    } catch (err) {
      console.log('Navigation error:', String(err));
    }

    console.log('The browser window is visible. Inspect DevTools if needed. Press Enter in this terminal to continue to the next page.');
    await new Promise((resolve) => rl.question('', resolve));

    if (messages.length === 0 && errors.length === 0) {
      console.log('No console messages or page errors captured for this page.');
    }

    await page.close();
  }

  await browser.close();
  rl.close();
  process.exit(0);
})();
