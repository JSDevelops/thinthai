import { config } from 'dotenv';
import pg from 'pg';
import { randomUUID } from 'node:crypto';

config({ quiet: true });
const url = new URL(process.env.DATABASE_URL);
if (
  url.hostname !== '127.0.0.1' ||
  url.port !== '55433' ||
  url.pathname !== '/thinthai_dev' ||
  process.env.NODE_ENV === 'production'
) {
  throw Error('Local demo only');
}

const db = new pg.Client({ connectionString: url.href });
await db.connect();

try {
  await db.query('BEGIN');
  await db.query("SELECT pg_advisory_xact_lock(hashtextextended('thinthai-demo-products', 0))");

  const merchant = (await db.query("SELECT id FROM app_users WHERE auth_subject='seed:merchant'"))
    .rows[0];
  if (!merchant) throw Error('Run db:seed first');

  // Find or setup food and craft stores
  const foodStore = (await db.query("SELECT id FROM stores WHERE name='ครัวถิ่นเหนือ' LIMIT 1"))
    .rows[0];
  const craftStore = (await db.query("SELECT id FROM stores WHERE name='งานผ้าชุมชน' LIMIT 1"))
    .rows[0];

  if (!foodStore || !craftStore) throw Error('Run db:seed first');

  // Enable delivery for food store so instant food delivery works
  await db.query(
    "UPDATE stores SET active=true, delivery_enabled=true, delivery_radius_km=25, address='ต.สุเทพ อ.เมือง จ.เชียงใหม่' WHERE id=$1",
    [foodStore.id],
  );
  await db.query(
    "UPDATE stores SET active=true, address='ต.ริมใต้ อ.แม่ริม จ.เชียงใหม่' WHERE id=$1",
    [craftStore.id],
  );

  const sampleProducts = [
    {
      storeId: foodStore.id,
      name: 'ข้าวซอยไก่สูตรโบราณ',
      description: 'ข้าวซอยเข้มข้น เส้นสด น่องไก่ตุ๋นเปื่อย เสิร์ฟพร้อมผักกาดดองและมะนาวสด',
      category: 'food',
      fulfillment: 'instant_food_delivery',
      priceSatang: 8900,
      stock: 25,
    },
    {
      storeId: foodStore.id,
      name: 'เซ็ตน้ำพริกหนุ่ม แคบหมูไร้มัน',
      description: 'น้ำพริกหนุ่มย่างเตาถ่านหอมกรุ่น ทานคู่แคบหมูกรอบอร่อยไร้มัน บรรจุสุญญากาศ',
      category: 'food',
      fulfillment: 'parcel_delivery',
      priceSatang: 14500,
      stock: 50,
    },
    {
      storeId: craftStore.id,
      name: 'ผ้าคลุมไหล่ทอมือย้อมครามธรรมชาติ',
      description: 'ผ้าฝ้ายทอมือจากกลุ่มแม่บ้าน ลวดลายเอกลักษณ์ล้านนา สีครามธรรมชาติผิวนุ่ม',
      category: 'craft',
      fulfillment: 'parcel_delivery',
      priceSatang: 48000,
      stock: 12,
    },
    {
      storeId: craftStore.id,
      name: 'กระเป๋าสานกระจูดลายโบราณ',
      description: 'งานจักสานทำมือ ทนทาน น้ำหนักเบา บุผ้าซับในพร้อมซิปปิดมิดชิด',
      category: 'craft',
      fulfillment: 'parcel_delivery',
      priceSatang: 32000,
      stock: 20,
    },
  ];

  for (const item of sampleProducts) {
    const existing = await db.query('SELECT id FROM products WHERE store_id=$1 AND name=$2', [
      item.storeId,
      item.name,
    ]);
    if (!existing.rowCount) {
      await db.query(
        `INSERT INTO products(id, store_id, name, description, category, fulfillment, price_satang, stock, reserved, active)
         VALUES($1, $2, $3, $4, $5, $6, $7, $8, 0, true)`,
        [
          randomUUID(),
          item.storeId,
          item.name,
          item.description,
          item.category,
          item.fulfillment,
          item.priceSatang,
          item.stock,
        ],
      );
    }
  }

  await db.query('COMMIT');
  console.log('Demo products seeded successfully!');
} catch (e) {
  await db.query('ROLLBACK');
  throw e;
} finally {
  await db.end();
}
