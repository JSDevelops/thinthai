# @thinthai/worker

บริการประมวลผลงานเบื้องหลัง (Background Worker Service) สำหรับ ThinThai Platform

## หน้าที่หลัก

1. **Hold Sweeper**: ตรวจสอบและยกเลิกการจอง (`bookings`) และคำสั่งซื้อ (`orders`) ที่ค้างสถานะ pending/placed จนเลยกำหนด `expires_at` (TTL)
2. **Resource Release**: คืนจำนวนที่นั่ง (`departures.used`) และคืนสต๊อกสินค้าที่กันไว้ (`products.reserved`) กลับสู่ระบบอย่างปลอดภัยด้วย Database Transaction และ Row Locks
3. **Payment Expiration**: ปรับสถานะรายการชำระเงินที่หมดอายุเป็น `failed`
4. **Outbox & Notification Processing**: รองรับการส่งแจ้งเตือนและประมวลผล Event แบบ Idempotent

## วิธีการใช้งาน

### รันในโหมดพัฒนา (Watch)

```bash
npm run worker:dev
```

### รันแบบรอบเดียว (One-shot สำหรับ Cron Job)

```bash
npm run worker:sweep
# หรือ
node apps/worker/dist/index.js --once
```

### รันแบบ Daemon Service (Production)

```bash
npm run worker:start
```

## การตั้งค่าสภาพแวดล้อม (Environment Variables)

- `DATABASE_URL`: Connection string ไปยัง PostgreSQL
- `WORKER_INTERVAL_SECONDS`: รอบเวลาทำงานของ Loop (ค่าเริ่มต้น: 30 วินาที)
