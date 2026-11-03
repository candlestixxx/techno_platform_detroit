import { chromium } from 'playwright';

async function testScrape() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  console.log("Navigating to https://movementparties.com/events/...");
  await page.goto('https://movementparties.com/events/', { waitUntil: 'networkidle' });

  // Wait a bit longer for JS to execute
  await page.waitForTimeout(5000);

  const content = await page.content();
  console.log("Spot Lite present:", content.includes("Spot Lite"));
  console.log("TV Lounge present:", content.includes("TV Lounge"));
  console.log("Marble Bar present:", content.includes("Marble Bar"));

  await browser.close();
}

testScrape().catch(console.error);
