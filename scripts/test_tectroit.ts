import { chromium } from 'playwright';

async function testScrapeTectroit() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  console.log("Navigating to https://www.tectroit.com/events...");
  await page.goto('https://www.tectroit.com/events', { waitUntil: 'networkidle' });

  // Wix sites take time to hydrate
  await page.waitForTimeout(5000);

  const content = await page.content();
  console.log("Page title:", await page.title());

  // Check for common Wix event patterns
  const eventTexts = await page.evaluate(() => {
    // Look for anything that looks like an event container
    const items = Array.from(document.querySelectorAll('[data-testid="linkElement"], [data-mesh-id*="comp-"]'));
    return items.map(i => i.textContent?.trim()).filter(t => t && t.length > 10).slice(0, 10);
  });

  console.log("Found text snippets:", eventTexts);

  await browser.close();
}

testScrapeTectroit().catch(console.error);
