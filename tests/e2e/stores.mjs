import { chromium } from 'playwright';
import { readFile, mkdir } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import assert from 'node:assert/strict';
import pg from 'pg';
import { config } from 'dotenv';
config({ quiet: true });
const url = new URL(process.env.DATABASE_URL);
if (url.hostname !== '127.0.0.1' || url.port !== '55433' || url.pathname !== '/thinthai_dev')
  throw Error('Local development only');
const db = new pg.Pool({ connectionString: url.href });
const credentials = await readFile('.local/dev-accounts.md', 'utf8');
const line = credentials.split('\n').find((l) => l.startsWith('| SUPER_ADMIN |'));
const [, , email, password] = line.split('|').map((s) => s.trim());
const browser = await chromium.launch({
  headless: true,
  channel: process.env.PLAYWRIGHT_CHANNEL ?? 'chrome',
});
const prefix = 'UI-store-' + randomUUID();
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  // Never load public OSM tiles during automated pan/zoom tests. Real map geometry stays active.
  await page.route('https://tile.openstreetmap.org/**', (route) =>
    route.fulfill({
      contentType: 'image/png',
      body: Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=',
        'base64',
      ),
    }),
  );
  await mkdir('design/previews/stores', { recursive: true });
  for (const [name, width, height] of [
    ['desktop', 1440, 1000],
    ['tablet', 820, 1180],
    ['mobile', 390, 844],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto('http://127.0.0.1:3200/workspace');
    await page.getByLabel('อีเมล', { exact: true }).fill(email);
    await page.getByLabel('รหัสผ่าน', { exact: true }).fill(password);
    await page.getByRole('button', { name: 'เข้าสู่ระบบ', exact: true }).click();
    await page.getByRole('button', { name: 'เพิ่มร้านค้า', exact: true }).click();
    const form = page.getByRole('region', { name: 'จัดการร้านค้า', exact: true });
    await form.getByLabel('ชื่อร้าน', { exact: true }).fill(prefix + '-' + name);
    await form.getByLabel('จังหวัด', { exact: true }).selectOption('50');
    await form.getByLabel('อำเภอ / เขต', { exact: true }).selectOption('5001');
    await form.getByLabel('ตำบล / แขวง', { exact: true }).selectOption('500107');
    await form.getByLabel('รายละเอียดที่อยู่').fill('ที่อยู่ทดสอบ');
    await form.getByLabel('ละติจูด', { exact: true }).fill('18.788');
    await form.getByLabel('ลองจิจูด', { exact: true }).fill('98.965');
    await form.locator('.store-pin').waitFor();
    await form.locator('.location-map').click({ position: { x: 160, y: 160 } });
    const lat = await form.getByLabel('ละติจูด', { exact: true }).inputValue();
    assert.notEqual(lat, '18.788');
    const lng = await form.getByLabel('ลองจิจูด', { exact: true }).inputValue();
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      true,
      name + ' form overflow',
    );
    await page.screenshot({ path: `design/previews/stores/${name}-editor.png`, fullPage: true });
    await form.getByRole('button', { name: 'บันทึก', exact: true }).click();
    await form.waitFor({ state: 'detached' });
    let card = page
      .locator('.store')
      .filter({ has: page.getByRole('heading', { name: prefix + '-' + name, exact: true }) });
    await card.waitFor();
    await card.getByRole('button', { name: 'ตั้งค่าจัดส่ง', exact: true }).click();
    await form.getByLabel('การจัดส่ง', { exact: true }).selectOption('on');
    await form.getByLabel('รัศมี (กม.)').fill('3');
    await form.getByRole('button', { name: 'บันทึก', exact: true }).click();
    await form.waitFor({ state: 'detached' });
    await card.getByText('จัดส่งรัศมี 3 กม.', { exact: true }).waitFor();
    await page.reload();
    card = page
      .locator('.store')
      .filter({ has: page.getByRole('heading', { name: prefix + '-' + name, exact: true }) });
    await card.getByRole('button', { name: 'ตั้งค่าจัดส่ง', exact: true }).click();
    await form.getByLabel('ละติจูดปลายทาง').fill(lat);
    await form.getByLabel('ลองจิจูดปลายทาง').fill(lng);
    await form.getByRole('button', { name: 'ตรวจพื้นที่', exact: true }).click();
    await form.getByRole('status').filter({ hasText: 'อยู่ในรัศมีจัดส่ง' }).waitFor();
    await page.screenshot({ path: `design/previews/stores/${name}-delivery.png`, fullPage: true });
    await form.getByRole('button', { name: 'ปิดฟอร์ม' }).click();
    await card.getByRole('button', { name: 'ประวัติ', exact: true }).click();
    await form.getByText('ตั้งค่าจัดส่ง', { exact: true }).waitFor();
    await form.getByRole('button', { name: 'ปิดฟอร์ม' }).click();
    await page.getByRole('button', { name: 'ออกจากระบบ', exact: true }).click();
    console.log(name + ': create / pin / delivery / reload / check / history passed');
  }
  assert.deepEqual(errors, []);
} finally {
  await browser.close();
  const ids = (await db.query('SELECT id FROM stores WHERE name LIKE $1', [prefix + '%'])).rows.map(
    (s) => s.id,
  );
  if (ids.length) {
    await db.query('DELETE FROM store_memberships WHERE store_id=ANY($1::uuid[])', [ids]);
    await db.query('DELETE FROM stores WHERE id=ANY($1::uuid[])', [ids]);
  }
  await db.end();
}
