const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Array to collect console messages
  const consoleMessages = [];
  const consoleErrors = [];

  // Capture console messages
  page.on('console', (msg) => {
    const text = msg.text();
    consoleMessages.push({ type: msg.type(), text });
    if (msg.type() === 'error' || msg.type() === 'warning') {
      consoleErrors.push({ type: msg.type(), text });
    }
  });

  // Capture page errors
  page.on('pageerror', (error) => {
    consoleErrors.push({ type: 'pageerror', text: error.message });
  });

  console.log('=== Testing Check-in Flow ===\n');

  try {
    // Test 1: Numeric event ID (new format)
    console.log('Test 1: Checking numeric event ID URL');
    const response1 = await page.goto('http://localhost:3000/event-check-in/1', {
      waitUntil: 'networkidle',
      timeout: 10000
    });
    console.log(`Status: ${response1.status()}`);
    console.log(`Final URL: ${page.url()}`);
    
    if (page.url().includes('/auth/signin')) {
      console.log('✓ Correctly redirects to signin for unauthenticated user');
      console.log(`  Callback URL preserved: ${page.url().includes('callbackUrl')}`);
    }
    
    console.log(`Page title: ${await page.title()}`);
    
    // Test 2: Legacy EVENT-date-title format
    console.log('\nTest 2: Checking legacy EVENT-date-title URL format');
    consoleMessages.length = 0; // Clear messages
    consoleErrors.length = 0;
    
    const response2 = await page.goto('http://localhost:3000/event-check-in/EVENT-12252024-Test-Event', {
      waitUntil: 'networkidle',
      timeout: 10000
    });
    console.log(`Status: ${response2.status()}`);
    console.log(`Final URL: ${page.url()}`);
    
    if (page.url().includes('/auth/signin')) {
      console.log('✓ Legacy format also redirects to signin');
    }
    
    // Test 3: Invalid event ID
    console.log('\nTest 3: Checking invalid event ID (99999)');
    consoleMessages.length = 0;
    consoleErrors.length = 0;
    
    const response3 = await page.goto('http://localhost:3000/event-check-in/99999', {
      waitUntil: 'networkidle',
      timeout: 10000
    });
    console.log(`Status: ${response3.status()}`);
    console.log(`Final URL: ${page.url()}`);
    
    // Test 4: Check admin events page to see QR code generation
    console.log('\nTest 4: Verifying admin events page loads');
    const response4 = await page.goto('http://localhost:3000/admin-events', {
      waitUntil: 'networkidle',
      timeout: 10000
    });
    console.log(`Status: ${response4.status()}`);
    console.log(`Final URL: ${page.url()}`);

    // Summary
    console.log('\n=== Console Messages Summary ===');
    if (consoleErrors.length > 0) {
      console.log('Errors/Warnings found:');
      consoleErrors.forEach((msg, i) => {
        console.log(`  ${i + 1}. [${msg.type}] ${msg.text}`);
      });
    } else {
      console.log('✓ No console errors or warnings detected');
    }

    console.log('\n=== Test Complete ===');
  } catch (error) {
    console.error('Test error:', error.message);
  } finally {
    await browser.close();
  }
})();
