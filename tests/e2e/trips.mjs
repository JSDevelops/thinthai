import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile, mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';
import { config } from 'dotenv';
import pg from 'pg';
config({ quiet: true });
const url = new URL(process.env.DATABASE_URL);
if (url.hostname !== '127.0.0.1' || url.port !== '55433' || url.pathname !== '/thinthai_dev')
  throw Error('Local only');
const db = new pg.Pool({ connectionString: url.href });
const credentials = await readFile('.local/dev-accounts.md', 'utf8');
const account = (role) =>
  credentials
    .split('\n')
    .find((s) => s.startsWith('| ' + role + ' |'))
    .split('|')
    .map((s) => s.trim())
    .slice(2, 4);
const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const base = 'http://127.0.0.1:3200';
let storeId;
const title = 'ทริปทดสอบ ' + randomUUID().slice(0, 8);
const errors = [];
async function login(page, role) {
  const [email, password] = account(role);
  await page.goto(base + '/workspace');
  await page.getByLabel('อีเมล', { exact: true }).fill(email);
  await page.getByLabel('รหัสผ่าน', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'เข้าสู่ระบบ', exact: true }).click();
  await page.getByRole('button', { name: 'คำสั่งซื้อ', exact: true }).waitFor();
}
try {
  await mkdir('design/previews/trips', { recursive: true });
  const buyer = await browser.newPage(),
    merchant = await browser.newPage();
  for (const page of [buyer, merchant]) page.on('pageerror', (e) => errors.push(e.message));
  await login(buyer, 'USER');
  await login(merchant, 'MERCHANT');
  const res = await merchant.request.post(base + '/api/v1/stores', {
    headers: { Origin: base, 'X-ThinThai-Action': '1' },
    data: {
      name: 'ชุมชน ' + title,
      address: 'ที่อยู่ทดสอบ',
      category: 'craft',
      subdistrictId: '500107',
      lat: null,
      lng: null,
      active: true,
    },
  });
  assert.equal(res.status(), 201);
  storeId = (await res.json()).id;
  await merchant.reload();
  await merchant.getByRole('button', { name: 'ทริปและการจอง', exact: true }).click();
  await merchant.getByRole('button', { name: 'เพิ่มทริป', exact: true }).click();
  await merchant.getByLabel('ผู้ให้บริการ', { exact: true }).selectOption(storeId);
  await merchant.getByLabel('ชื่อทริป', { exact: true }).fill(title);
  await merchant
    .getByLabel('รายละเอียดและสิ่งที่รวม')
    .fill('เดินเรียนรู้ชุมชนตัวอย่าง พร้อมอุปกรณ์สำหรับกิจกรรมทดสอบ');
  await merchant
    .getByLabel('จุดนัดพบและช่องทางติดต่อ')
    .fill('ศาลาชุมชนจำลอง ติดต่อผู้ดูแลระบบทดสอบ');
  await merchant.getByLabel('ราคาต่อคน (บาท)').fill('650');
  await merchant.getByLabel('การแสดงผล', { exact: true }).selectOption('on');
  await merchant.getByRole('button', { name: 'บันทึกทริป', exact: true }).click();
  const managed = merchant
    .locator('.managed-trip')
    .filter({ has: merchant.getByRole('heading', { name: title, exact: true }) });
  await managed.waitFor();
  await managed.getByRole('button', { name: 'เพิ่มรอบ', exact: true }).click();
  const future = new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10) + 'T09:00';
  await merchant.getByLabel('วันและเวลาเดินทาง (ไทย)').fill(future);
  await merchant.getByLabel('จำนวนที่นั่ง', { exact: true }).fill('6');
  await merchant.getByRole('button', { name: 'บันทึกรอบ', exact: true }).click();
  await managed.getByText('เหลือ 6/6 ที่', { exact: false }).waitFor();
  for (const [device, width, height] of [
    ['desktop', 1440, 1000],
    ['tablet', 820, 1180],
    ['mobile', 390, 844],
  ]) {
    await buyer.setViewportSize({ width, height });
    await buyer.goto(base);
    await buyer.getByRole('link', { name: 'ค้นหาทริป →', exact: true }).waitFor();
    assert.equal(
      await buyer.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      true,
    );
    await buyer.screenshot({ path: `design/previews/trips/${device}-home.png`, fullPage: true });
    await buyer.getByRole('link', { name: 'ค้นหาทริป →', exact: true }).click();
    await buyer.getByRole('heading', { name: title, exact: true }).waitFor();
    assert.equal(
      await buyer.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      true,
    );
    await buyer.screenshot({ path: `design/previews/trips/${device}-trips.png`, fullPage: true });
    await buyer.getByLabel('ค้นหาทริป', { exact: true }).fill(title);
    const card = buyer
      .locator('.trip-card')
      .filter({ has: buyer.getByRole('heading', { name: title, exact: true }) });
    await card.getByRole('button', { name: 'เลือกรอบ', exact: true }).click();
    await buyer.getByLabel('จำนวนผู้เดินทาง', { exact: true }).fill('2');
    await buyer.getByLabel('ชื่อผู้ติดต่อ', { exact: true }).fill('ผู้เดินทาง ' + device);
    await buyer.getByLabel('เบอร์โทรติดต่อ', { exact: true }).fill('0812345678');
    await buyer.screenshot({
      path: `design/previews/trips/${device}-booking-form.png`,
      fullPage: true,
    });
    await buyer.getByRole('button', { name: 'ส่งคำขอจองทดลอง', exact: true }).click();
    await buyer.getByRole('status').filter({ hasText: 'บันทึกคำขอจองแล้ว' }).waitFor();
    await buyer.getByRole('link', { name: 'ดูทริปของฉัน', exact: true }).click();
    const booking = buyer.locator('.booking-card').filter({ hasText: 'ผู้เดินทาง ' + device });
    await booking.getByText('รอยืนยัน', { exact: true }).first().waitFor();
    if (device === 'desktop') {
      await booking.getByRole('button', { name: 'ยกเลิกการจอง', exact: true }).click();
      await buyer.getByLabel('เหตุผลการจอง', { exact: true }).fill('ยกเลิกเพื่อทดสอบคืนที่นั่ง');
      await buyer.getByRole('button', { name: 'บันทึกสถานะการจอง' }).click();
      await booking.getByText('ผู้เดินทางยกเลิก', { exact: true }).first().waitFor();
    } else {
      await merchant.setViewportSize({ width, height });
      await merchant.getByRole('button', { name: 'โหลดการจองใหม่', exact: true }).click();
      const book = merchant.locator('.booking-card').filter({ hasText: 'ผู้เดินทาง ' + device });
      await book
        .getByRole('button', {
          name: device === 'tablet' ? 'ปฏิเสธ / ยกเลิกทริป' : 'ยืนยันการจอง',
          exact: true,
        })
        .click();
      await merchant.getByLabel('เหตุผลการจอง', { exact: true }).fill('ผู้ประกอบการดำเนินการทดสอบ');
      await merchant.getByRole('button', { name: 'บันทึกสถานะการจอง' }).click();
      await book
        .getByText(device === 'tablet' ? 'ผู้ให้บริการยกเลิก' : 'ยืนยันแล้ว', { exact: true })
        .first()
        .waitFor();
      assert.equal(
        await merchant.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        true,
      );
      await merchant.screenshot({
        path: `design/previews/trips/${device}-manage.png`,
        fullPage: true,
      });
      await buyer.reload();
      await booking
        .getByText(device === 'tablet' ? 'ผู้ให้บริการยกเลิก' : 'ยืนยันแล้ว', { exact: true })
        .first()
        .waitFor();
    }
    await buyer.screenshot({
      path: `design/previews/trips/${device}-bookings.png`,
      fullPage: true,
    });
    console.log(device + ' home / trips / booking / status passed');
  }
  assert.deepEqual(errors, []);
  assert.equal(
    (
      await db.query(
        'SELECT d.used FROM departures d JOIN trips t ON t.id=d.trip_id WHERE t.store_id=$1',
        [storeId],
      )
    ).rows[0].used,
    2,
  );
  console.log('Seats restored on cancel/reject; confirmed booking retains exactly 2 seats.');
} finally {
  await browser.close();
  if (storeId) {
    await db.query(
      'DELETE FROM bookings WHERE departure_id IN(SELECT d.id FROM departures d JOIN trips t ON t.id=d.trip_id WHERE t.store_id=$1)',
      [storeId],
    );
    await db.query('DELETE FROM trips WHERE store_id=$1', [storeId]);
    await db.query('DELETE FROM store_memberships WHERE store_id=$1', [storeId]);
    await db.query('DELETE FROM stores WHERE id=$1', [storeId]);
  }
  await db.end();
}
