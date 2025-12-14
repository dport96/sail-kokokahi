const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('=== Testing QR URL Generation ===\n');

  try {
    // Login as admin
    console.log('Step 1: Logging in as admin...');
    await page.goto('http://localhost:3000/auth/signin');
    await page.fill('input[type="email"]', 'admin@foo.com');
    await page.fill('input[type="password"]', 'changeme');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(admin-dashboard|member-dashboard)/, { timeout: 10000 });
    console.log('✓ Logged in successfully');

    // Navigate to admin events page
    console.log('\nStep 2: Navigating to admin events page...');
    await page.goto('http://localhost:3000/admin-events', { waitUntil: 'networkidle' });
    console.log('✓ Admin events page loaded');

    // Check for any event check-in URLs in the page
    console.log('\nStep 3: Inspecting generated QR URLs...');
    const pageContent = await page.content();
    
    // Look for event-check-in URLs
    const urlMatches = pageContent.match(/event-check-in\/(\d+|EVENT-[^"'<>]+)/g);
    if (urlMatches && urlMatches.length > 0) {
      console.log(`Found ${urlMatches.length} check-in URL(s):`);
      urlMatches.slice(0, 5).forEach((match, i) => {
        console.log(`  ${i + 1}. ${match}`);
      });
      
      // Check if they're numeric IDs
      const numericIds = urlMatches.filter(url => /event-check-in\/\d+$/.test(url));
      const legacyIds = urlMatches.filter(url => /event-check-in\/EVENT-/.test(url));
      
      console.log(`\n✓ Numeric ID URLs: ${numericIds.length}`);
      console.log(`✗ Legacy format URLs: ${legacyIds.length}`);
      
      if (legacyIds.length > 0) {
        console.log('\n⚠ Warning: Found legacy format URLs still in use:');
        legacyIds.slice(0, 3).forEach((url, i) => {
          console.log(`  ${i + 1}. ${url}`);
        });
      }
    } else {
      console.log('No check-in URLs found in page content (events may be empty or URLs loaded dynamically)');
    }

    // Test print QR functionality by checking if button exists
    console.log('\nStep 4: Checking for Print QR Code buttons...');
    const printButtons = await page.$$('button:has-text("Print QR Code")');
    console.log(`Found ${printButtons.length} Print QR Code button(s)`);

    console.log('\n=== Test Complete ===');
  } catch (error) {
    console.error('Test error:', error.message);
  } finally {
    await browser.close();
  }
})();
