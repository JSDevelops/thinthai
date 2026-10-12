# ThinThai — แผนเริ่มเฟส 0–1

วันที่: 8 ตุลาคม 2026 — ตรวจจาก working tree ปัจจุบันซึ่งมีงานแก้ไขเดิมที่ยังไม่ commit จำนวนมาก ไม่รีเซ็ตหรือรวมงานเหล่านั้นโดยอัตโนมัติ

## เป้าหมายและสถานะ

เริ่มตรวจฐานเดิมและเสริมความปลอดภัย ไม่ใช่ประกาศว่า Production พร้อมหรือเฟส1เสร็จแล้ว ภาพ UX/UI ใน design/previews เป็นข้อเสนอ ไม่ใช่ฟังก์ชันที่เชื่อมระบบแล้ว

คง Next.js / NestJS / PostgreSQL ใน monorepo แบ่งโมดูลใน API เดียวก่อน ไม่แยกฐานตามจังหวัด ข้อมูลร้านแต่ละร้านต้องแยกสิทธิ์ใน Backend ใช้ตารางสิทธิ์เป็นข้อกำหนดตรวจรับทุก endpoint

## บัญชีช่องว่างล่าสุด

| ลำดับ | หลักฐาน | สถานะ/งานที่ต้องทำ | เกณฑ์ผ่าน |
|---|---|---|---|
| P0-01 | apps/api/src/payments.ts | รอบนี้เพิ่ม sandbox opt-in และ owner-only สำหรับ create/get/simulate | Production เปิดจำลองไม่ได้ ผู้ใช้รวม Admin ใช้ payment ของคนอื่นไม่ได้ |
| P0-02 | payments.ts / holds.ts | ยังต้องตรวจการแข่งขันการจ่ายเงินกับการหมดอายุ/ยกเลิก และสถานะ target ก่อน settle | งานหมดอายุไม่ฟื้นกลับโดยผิดกฎ ไม่มีที่นั่ง/สต๊อกติดลบ |
| P0-03 | payments.ts | QR/payment เป็น simulation เท่านั้น ยังไม่เชื่อมผู้รับชำระจริง | webhook ตรวจลายเซ็น รับซ้ำ/มาช้าได้ และกระทบยอดได้ |
| P0-04 | apps/api/src/main.ts | rollout flag ไม่ใช่ใบรับรอง Production; ยังต้องตรวจ MFA/recovery/session และ config | ผ่าน security gate และ deploy rehearsal |
| P1-01 | apps/worker/README.md | Worker ยังเป็นโครงสร้างเริ่มต้น | หมดอายุ hold แม้ไม่มี request, retry ไม่ซ้ำ, มี failed-job queue |
| P1-02 | apps/admin/README.md | แอป Admin แยกยังไม่มี implementation; มี workspace เดิม | เจ้าหน้าที่ทำงานตาม scope ได้โดยไม่ใช้ข้อมูลจำลอง |
| P1-03 | .github/workflows/ci.yml | รอบนี้เพิ่ม integration job พร้อม PostgreSQL แยก | ตรวจผลบน CI จริงเมื่อ push; รอบนี้ไม่ได้ push |
| P1-04 | infra/README.md | ยังไม่มี Cloud/Staging/Backup ที่ตรวจยืนยัน | จัดสรรสภาพแวดล้อมและซ้อม restore ได้ |
| P1-05 | access.ts | มี4บทบาทและ scopeระดับร้าน/จังหวัด | เพิ่ม action-level, เขตย่อย, ทีมสาขา ตาม ACCESS.md |
| P1-06 | database/migrations/008* | ledgerเบื้องต้น, targetอ้างอิงแบบ polymorphic, ค่าธรรมเนียม5%คงที่ | ledgerปรับยอดด้วย reversal; ตรวจความสัมพันธ์และเวอร์ชันนโยบาย |
| P2-01 | design/previews | ที่พัก Driver Creator Live เป็นแนวทาง UI | พัฒนาหลังเส้นทางซื้อ/จองพื้นฐานผ่าน |

## ลำดับงานและผู้รับผิดชอบตามหน้าที่

1. Product + Backend: ตกลงขอบเขตนำร่องสินค้า/ทริป พื้นที่ ร้านทดสอบ และกฎยกเลิก สรุปสถานะจริง/จำลองของทุกปุ่ม
2. Backend + QA: ปิดช่องโหว่ payment และทดสอบ race ของ hold/stock/seat; แยก sandbox จาก provider จริง
3. Backend: ใช้ DATA_MODEL.md และ ACCESS.md เป็นข้อกำหนด ออก migration ใหม่ที่รองรับงานเดิม ห้ามแก้ migration ที่ถูกใช้แล้ว
4. Backend + Security: verification/recovery/MFA, session rotation/revocation, upload access, rate limits และ audit
5. Infrastructure: ทำ STAGING.md ให้ครบเมื่อมีบัญชีCloud region domain และงบ; ไม่ลบ guard เพื่อฝืนเปิด
6. QA + เจ้าของผลิตภัณฑ์: ทดสอบวงจรธุรกิจและสิทธิ์ด้วยบัญชีหลายร้านก่อนเปิดนำร่อง

## ประตูตรวจรับ

เฟส0: มี inventory/risk register/data model/permission matrix และ baseline tests พร้อมระบุสิ่งที่ยังไม่ได้ทดสอบ
เฟส1: stagingใช้งานนอกเครื่องได้, ไม่มี sandboxบนproduction, กู้บัญชีได้, MFAผู้ดูแล, ทดสอบข้ามร้าน/พื้นที่ผ่าน, secretsแยก, monitoringแจ้งเหตุ, ซ้อมbackup/restore และrollbackสำเร็จ

สิ่งที่ยังต้องตัดสินใจ: Cloud/region/domain/budget, SMS/email provider, payment provider, เกณฑ์เวลาข้อมูลสูญหาย/เวลาฟื้นระบบ, ทีมรับแจ้งเหตุและขอบเขตเริ่มขาย ไม่มีค่าใช้จ่ายหรือทรัพยากรCloudถูกสร้างในรอบนี้

## วิธีใช้ sandbox หลังการแก้ไข

ปิดเป็นค่าเริ่มต้น ต้องตั้ง NODE_ENV=development และ ENABLE_SANDBOX_PAYMENTS=true เฉพาะเครื่องพัฒนา แล้ว restart API จึงสร้าง/ยืนยัน paymentจำลองได้ NODE_ENV=production หรือ staging/preview ไม่อนุญาตแม้ตั้ง flagนี้ การทดสอบ HTTP ตั้ง NODE_ENV=test และ flagอย่างชัดเจน ไม่แก้ .env ส่วนตัวให้เปิดอัตโนมัติ

การอ่าน payment ใช้ได้เฉพาะเจ้าของรายการ งาน staffต้องสร้าง endpointตรวจ scope/action แยก; storeLedgerยังใช้สิทธิ์ร้านเดิม ไม่ให้ blanket Admin bypass
