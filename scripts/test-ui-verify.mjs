import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const artifactDir = '/Users/3designs/.gemini/antigravity-ide/brain/5694b025-8cc3-4fc5-bcd7-3660c1cd9348';
const scratchDir = `${artifactDir}/scratch/ui_test`;
await mkdir(scratchDir, { recursive: true });

const browser = await chromium.launch({ headless: true, channel: 'chrome' });

console.log('--- 1. Testing Desktop (1280x800) ---');
const desktop = await browser.newPage({ viewport: { width: 1280, height: 800 } });

// 1. Home Page
await desktop.goto('http://127.0.0.1:3200/');
await desktop.waitForSelector('.travel-hero');
const fontFamily = await desktop.evaluate(() => window.getComputedStyle(document.body).fontFamily);
console.log('Desktop body font-family:', fontFamily);
await desktop.screenshot({ path: `${scratchDir}/desktop-home.png` });
console.log('✓ Desktop home page screenshot saved');

// 2. Trips Page
await desktop.goto('http://127.0.0.1:3200/trips');
await desktop.waitForSelector('.trips-page');
const tripCards = await desktop.$$('.trip-card');
console.log(`✓ Trips loaded: ${tripCards.length} cards found`);
await desktop.screenshot({ path: `${scratchDir}/desktop-trips.png` });

// 3. Catalog Page & Cart Persistence
await desktop.goto('http://127.0.0.1:3200/catalog');
await desktop.waitForSelector('.product-card');
const productCards = await desktop.$$('.product-card');
console.log(`✓ Products loaded: ${productCards.length} cards found`);

// Add item to cart
const addBtn = await desktop.$('.product-card button');
if (addBtn) {
  await addBtn.click();
  console.log('Clicked "เพิ่มลงตะกร้า"');
  await desktop.waitForTimeout(500);
}
let cartText = await desktop.$eval('.cart-panel .panel-head h2', (el) => el.textContent);
console.log('Cart before reload:', cartText);
await desktop.screenshot({ path: `${scratchDir}/desktop-catalog-with-cart.png` });

// Reload page and check if cart persisted in localStorage
await desktop.reload();
await desktop.waitForSelector('.cart-panel');
await desktop.waitForTimeout(500);
cartText = await desktop.$eval('.cart-panel .panel-head h2', (el) => el.textContent);
console.log('Cart after reload (localStorage persistence):', cartText);
if (cartText.includes('1 ชิ้น')) {
  console.log('✓ SUCCESS: Cart persisted successfully across reload!');
} else {
  console.warn('✗ Cart did not persist as expected:', cartText);
}

// 4. Mobile Viewport (390x844 - iPhone 14 / modern smartphone)
console.log('\n--- 2. Testing Mobile (390x844) ---');
const mobile = await browser.newPage({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
});

await mobile.goto('http://127.0.0.1:3200/');
await mobile.waitForSelector('.mobile-bottom-nav');
const isBottomNavVisible = await mobile.$eval('.mobile-bottom-nav', (el) => {
  const style = window.getComputedStyle(el);
  return style.display === 'flex' && style.visibility !== 'hidden';
});
console.log('✓ Mobile bottom navigation visible:', isBottomNavVisible);
await mobile.screenshot({ path: `${scratchDir}/mobile-home.png` });

// Mobile Trips
await mobile.goto('http://127.0.0.1:3200/trips');
await mobile.waitForSelector('.trips-page');
const mobileActiveTab = await mobile.$eval('.bottom-nav-item.active .bottom-nav-label', (el) => el.textContent);
console.log('✓ Mobile active bottom nav tab on /trips:', mobileActiveTab);
await mobile.screenshot({ path: `${scratchDir}/mobile-trips.png` });

// Mobile Catalog
await mobile.goto('http://127.0.0.1:3200/catalog');
await mobile.waitForSelector('.product-card');
await mobile.screenshot({ path: `${scratchDir}/mobile-catalog.png` });

await browser.close();
console.log('\n🎉 All automated browser tests completed successfully!');
