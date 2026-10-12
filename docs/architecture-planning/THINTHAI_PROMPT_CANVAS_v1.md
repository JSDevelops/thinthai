# ThinThai — Architecture & Prompt Canvas

วันที่: 8 ตุลาคม 2026 · รุ่น 0.1 · สถานะ: ร่างสำหรับตัดสินใจก่อนเฟส 0–1

เอกสารนี้เป็น Canvas ตั้งต้นพร้อมตัวอย่างที่เติมจากบริบท ThinThai และชุด Prompt สำหรับทำงานทีละข้อ ไม่ใช่ข้อสรุปว่าทุกฟังก์ชันพัฒนาแล้ว หรืออนุมัติให้เปิด Production

## A. วิธีใช้ Canvas

ใช้ Prompt สามชั้น: **Master Context → Module Brief → Task Prompt**

- Master Context: เป้าหมาย กลุ่มผู้ใช้ กฎที่ยืนยันแล้ว และข้อจำกัดร่วม ใช้เป็นบริบททุกงาน
- Module Brief: ขอบเขต กฎข้อมูล สถานะ สิทธิ์ และกรณีผิดพลาดของโมดูลที่กำลังทำ
- Task Prompt: งานเดียวที่ตรวจรับได้ ระบุไฟล์ที่เกี่ยวข้อง ผลส่งมอบ และเงื่อนไขจบงาน

สูตรประกอบ Prompt: **บทบาท + หลักฐาน + เป้าหมาย + ขอบเขต + กฎ + คุณภาพ + ผลส่งมอบ + วิธีตรวจรับ + ขอบเขตการลงมือทำ**

ไม่ต้องส่งประวัติการสนทนาทั้งหมดซ้ำทุกครั้ง ให้แนบรุ่นของเอกสารและเฉพาะส่วนที่เกี่ยวข้อง ถ้ากฎเปลี่ยนให้แก้แหล่งข้อมูลหลักและบันทึกเหตุผล ไม่เพิ่มกฎขัดกันในหลาย Prompt

ป้ายสถานะทุกข้อ:

| ป้าย | ความหมาย |
|---|---|
| CONFIRMED | ผู้ใช้ยืนยันความต้องการแล้ว แต่ไม่ได้แปลว่าพัฒนาเสร็จ |
| OBSERVED | พบจากไฟล์หรือผลทดสอบ ต้องระบุหลักฐานและวันที่ |
| PROPOSED | ข้อเสนอรอตัดสินใจ ห้ามรายงานว่าอนุมัติแล้ว |
| OPEN | ยังขาดข้อมูล ใช้ตัวแปรหรือแยกทางเลือกไว้ |

## B. Canvas ภาพรวม 16 ช่อง

| ID | องค์ประกอบ Prompt | ตัวอย่างสำหรับ ThinThai | สิ่งที่ต้องได้ |
|---|---|---|---|
| C01 | บทบาทและโหมดงาน | สถาปนิกระบบ วิเคราะห์ก่อนแก้โค้ด | ขอบเขตอำนาจและผลส่งมอบ |
| C02 | ปัญหาและคุณค่า | เชื่อมนักท่องเที่ยวกับธุรกิจและวิถีชุมชน | เป้าหมายที่วัดผลได้ |
| C03 | หลักฐานปัจจุบัน | โค้ด Next.js/NestJS/PostgreSQL และภาพ UX/UI | รายการจริง/จำลอง/ยังไม่มี |
| C04 | ผู้ใช้และสิทธิ์ | ลูกค้า Partner Driver Creator Admin | ตารางบทบาท × การกระทำ × ขอบเขต |
| C05 | ขอบเขตรุ่นแรก | เสนอสินค้าและทริปก่อน เพิ่มที่พักลำดับถัดไป | In scope / Later / Out of scope |
| C06 | เส้นทางและกฎธุรกิจ | จอง → กันจำนวน → จ่าย → ใช้งาน/ยกเลิก | แผนภาพสถานะและข้อห้าม |
| C07 | UX/UI และภาษา | ทุกวัย มือถือ/แท็บเล็ต/คอมพิวเตอร์ | หน้าจอ สถานะผิดพลาด และเกณฑ์เข้าถึง |
| C08 | โครงสร้างซอฟต์แวร์ | Modular monolith และ Worker แยกการรัน | C4 Context / Container และโมดูล |
| C09 | ข้อมูลและเจ้าของข้อมูล | ร้าน ห้องพัก ออเดอร์ การชำระ และรางวัล | ERD, constraints, retention |
| C10 | API และระบบภายนอก | การจอง Payment Maps OTP Live | สัญญา API / Webhook / ความล้มเหลว |
| C11 | ความปลอดภัย | ตรวจสิทธิ์ทุก API และจำกัดข้อมูลแต่ละธุรกิจ | Threat model และรายการตรวจที่มีหลักฐาน |
| C12 | ปริมาณและคุณภาพ | ผู้ใช้พร้อมกัน งานเขียน วิดีโอ ตำแหน่ง | เป้าหมายวัดได้และแผน Load test |
| C13 | การเงินและ Creator | รายได้แยกคะแนน เพื่อน 500 คน | Ledger, eligibility, reconciliation |
| C14 | ปฏิบัติการและต้นทุน | Deploy Backup Monitoring Incident | Runbook, RPO/RTO, งบและผู้รับผิดชอบ |
| C15 | ทดสอบและตรวจรับ | แข่งจองห้องเดียว/รับ Webhook ซ้ำ | Test matrix และเกณฑ์ผ่าน |
| C16 | แผนส่งมอบและการเปลี่ยนแปลง | งานย่อยมีลำดับและ dependency | Backlog, ADR, Decision log |

## C. เติม Canvas ทีละช่อง

### C01 — บทบาท เป้าหมายของ AI และขอบเขตการทำงาน

**ตัวอย่าง Prompt**

> ทำหน้าที่เป็นสถาปนิกซอฟต์แวร์และผู้ทบทวนข้อกำหนดของ ThinThai อธิบายภาษาไทยที่เจ้าของผลิตภัณฑ์เข้าใจได้ งานรอบนี้คือออกแบบสถาปัตยกรรมและแผนตรวจรับ ยังไม่แก้โค้ดธุรกิจ ไม่รัน migration ไม่เปิดบริการ Cloud ที่มีค่าใช้จ่าย ระบุข้อเท็จจริง ข้อเสนอ และข้อมูลที่ยังขาดแยกกัน

สำหรับงานพัฒนาภายหลัง ให้เปลี่ยนโหมดเป็น IMPLEMENT เฉพาะงานที่อนุมัติแล้ว ไม่ต้องขออนุญาตซ้ำสำหรับการแก้ไขและทดสอบที่อยู่ในขอบเขตนั้น การอนุมัติสถาปัตยกรรมไม่ใช่การอนุมัติ Deploy Production หรือธุรกรรมเงินจริง

**ตรวจรับ:** ทราบชัดว่าจะส่งมอบเอกสาร โค้ด หรือผลทดสอบ และอะไรอยู่นอกงานครั้งนี้

### C02 — เป้าหมายธุรกิจและการวัดผล

CONFIRMED: ThinThai เป็นแพลตฟอร์ม Multi-Vendor สำหรับท่องเที่ยววิถีชุมชนไทย รวมช้อป อาหาร ทริป ที่พัก เรียกรถ บริการ และ Creator

> ออกแบบ ThinThai เพื่อให้ลูกค้าค้นพบชุมชน ซื้อหรือจองได้สะดวก และให้ธุรกิจท้องถิ่นจัดการรายการได้ด้วยตนเอง แปลงเป้าหมายเป็นตัวชี้วัด เช่น อัตราจบรายการ เวลาจัดการออเดอร์ ความผิดพลาดของการจอง และการกระทบยอดเงิน ระบุ baseline และ target เป็น OPEN หากยังไม่มีข้อมูลจริง

OPEN: พื้นที่นำร่อง จำนวนธุรกิจ ทีมงาน งบลงทุน งบรายเดือน วันเปิดตัว และลำดับความสำคัญของรายได้แต่ละหมวด

อย่าใช้จำนวนหน้าจอหรือยอดสมัครอย่างเดียวเป็นหลักฐานว่าผลิตภัณฑ์สำเร็จ

### C03 — หลักฐานและสถานะของระบบ

โครงการอ้างอิง: `/Users/3designs/ThinThai-Turism Platform`

OBSERVED จากการอ่านในบทสนทนาก่อนหน้า: มี Next.js, NestJS, PostgreSQL, Flutter scaffold, migration คำสั่งซื้อ/ทริป/การชำระเงิน และภาพต้นแบบหลายชุด ระบบชำระเงินมีเส้นทางจำลอง ส่วน Admin/Worker แยกแอปยังมีเอกสารระบุว่าเป็นโครงสร้างเริ่มต้น ต้องตรวจใหม่เมื่อเริ่มงาน เพราะไฟล์อาจเปลี่ยนแล้ว

> อ่านข้อกำหนด repo และไฟล์ที่เกี่ยวข้องก่อนสรุป ตรวจ commit/สถานะไฟล์โดยไม่ทับงานเดิม จัดตาราง feature → UI → API → database → integration → tests → deploy ระบุหลักฐานที่ตรวจจริง ภาพออกแบบไม่ใช่หลักฐานว่าฟังก์ชันใช้งานได้ และผลทดสอบเก่าไม่ใช่ผลทดสอบของเวอร์ชันปัจจุบัน

ห้ามแนบค่าจาก `.env`, secret, OTP, token หรือข้อมูลลูกค้าจริงใน Prompt ใช้ตัวอย่างที่ปิดบังข้อมูลและ fixture สมมติ

### C04 — ผู้ใช้ บทบาท และธุรกิจหลายราย

| กลุ่ม | ขอบเขตที่เสนอ |
|---|---|
| ลูกค้า | ข้อมูลส่วนตัว รายการซื้อ/จองของตน |
| เจ้าของธุรกิจ | ธุรกิจ สาขา ทีม และรายการของตน |
| ผู้จัดการ/พนักงาน | สิทธิ์เฉพาะธุรกิจและสาขาที่มอบหมาย |
| Driver | ประเภทงานที่อนุมัติและงานที่ได้รับสิทธิ์ |
| Creator | เนื้อหาและผลการแนะนำของตน ไม่ได้เห็นข้อมูลส่วนตัวผู้ซื้อโดยอัตโนมัติ |
| Admin พื้นที่ | พื้นที่และบริการที่ได้รับมอบหมาย |
| ปฏิบัติการ/การเงิน/ช่วยเหลือ | ความสามารถแยกตามหน้าที่ |
| Super Admin | จัดการนโยบายและสิทธิ์ พร้อมประวัติการใช้งาน |

> ออกแบบ authorization แบบบทบาทร่วมกับขอบเขตทรัพยากร หนึ่งบัญชีมีหลายบทบาทและสังกัดหลายธุรกิจได้ ตรวจสิทธิ์ read/write/export/approve ทั้ง API, file access, background jobs และช่องทาง realtime ค่า business_id จาก client ไม่ใช่หลักฐานสิทธิ์ ห้ามเลือก Admin หรือ Super Admin จากหน้าสมัครสาธารณะ

**ตัวอย่างตรวจรับ:** พนักงานร้าน A ส่ง ID ของร้าน B มาโดยตรง ต้องไม่อ่าน แก้ ดาวน์โหลด หรืออนุมานข้อมูลส่วนตัวของร้าน B ได้

### C05 — ขอบเขตและลำดับการเปิดใช้

PROPOSED: เปิดธุรกรรมสินค้าและทริปที่มีฐานอยู่แล้วให้ครบก่อน ที่พักเป็นช่วงต่อไป อาหาร/Driver ตามมา และ Live/รายได้ Creator หลังระบบเงินและดูแลเนื้อหาพร้อม

> แยกขอบเขตของแพลตฟอร์มทั้งหมดออกจากรุ่นเปิดตัว เสนอ release slice ที่ครบลูกค้า–Partner–Admin–การเงิน–ช่วยเหลือ ระบุ dependency และสิ่งที่เลื่อนออกไป ห้ามถือว่าการออกแบบทุกเมนูหมายถึงต้องเปิดทุกเมนูพร้อมกัน

OPEN: อาจเลือกที่พักเป็นรุ่นแรกแทนได้ตามเป้าหมายธุรกิจ ต้องตัดสินใจก่อนกำหนดแผนทีมและกำหนดส่ง

### C06 — กฎที่ห้ามผิดและสถานะธุรกิจ

| Rule ID | ข้อกำหนด | สถานะ |
|---|---|---|
| BR-FOOD-01 | เขตส่งอาหารมีผลเฉพาะอาหาร ไม่ปิดหมวดอื่น | CONFIRMED |
| BR-AREA-01 | แยกจังหวัด/อำเภอ/ตำบลจาก polygon หรือรัศมีบริการ | PROPOSED ตามความต้องการพื้นที่ |
| BR-BOOK-01 | กันห้อง/ที่นั่ง/สต็อกอย่างถูกต้องเมื่อคำขอเกิดพร้อมกัน | PROPOSED ข้อกำหนดความถูกต้อง |
| BR-PAY-01 | งาน การจ่าย คืนเงิน และจ่ายรายได้เป็นสถานะแยก | PROPOSED |
| BR-DRIVER-01 | อนุมัติส่งอาหารไม่ให้สิทธิ์รับผู้โดยสารอัตโนมัติ | PROPOSED |
| BR-CREATOR-01 | ต้องมีเพื่อน 500 คนก่อนมีรายได้จากช่องทาง Creator | CONFIRMED |
| BR-CREATOR-02 | นับเพื่อนตอบรับกัน ผ่านการตรวจ และยื่นอนุมัติแยก | PROPOSED รายละเอียดการบังคับใช้ |

> สร้าง state machine แต่ละบริการ พร้อม actor, precondition, transition, event, side effect และวิธีชดเชยเมื่อผิดพลาด ห้ามเปลี่ยนเป็น paid หรือ confirmed จากการกดปุ่มหน้าเว็บเพียงอย่างเดียว

ตัวอย่าง: การพัก 20–21 ตุลาคมคิดหนึ่งคืน ใช้ช่วง [check-in, check-out) ภาพต้นแบบที่วาดแถบคร่อมผิดไม่ถือเป็นกฎฐานข้อมูล

### C07 — UX/UI ภาษา และการเข้าถึง

CONFIRMED: ใช้งานง่ายทุกวัย รองรับมือถือ แท็บเล็ต คอมพิวเตอร์ ใช้เอกลักษณ์ ThinThai เขียว–ครีม–ทอง และให้ที่พักมีทางเข้าชัดเจน

> ออกแบบ responsive ตามงานของแต่ละบทบาท ใช้โลโก้จริงของโครงการ ไม่คัดลอกโลโก้ที่เพี้ยนจากภาพสร้าง ระบุ loading/empty/error/offline/permission-denied/success ทุก flow สำคัญ แนะนำภาษาจาก browser/OS locale และจำภาษาที่ผู้ใช้เลือก ไม่ต้องใช้ AI ตรวจภาษาเครื่อง ตั้งเป้าการเข้าถึง WCAG 2.2 AA และระบุวิธีทดสอบจริง

Driver ต้องมีการจัดการสัญญาณขาด ตำแหน่งเก่า และการส่งสถานะซ้ำ ส่วน backend ต้องเป็นผู้ยืนยันสถานะสุดท้าย ไม่รับรองว่าทุกอุปกรณ์ทำงานได้จากภาพ responsive เพียงอย่างเดียว

### C08 — สถาปัตยกรรมและเทคโนโลยี

PROPOSED: คงฐาน Next.js + TypeScript, NestJS modular monolith, PostgreSQL; เพิ่ม Worker สำหรับงานนอกคำขอ และ PostGIS สำหรับข้อมูลพื้นที่เมื่อเริ่มใช้งานจริง

> จัดทำ C4 Context แสดงผู้ใช้และผู้ให้บริการภายนอก และ Container view แสดง Web/Partner/Admin, API, Worker, DB, object storage และ integration แยกขอบเขตความเชื่อถือ เปรียบเทียบทางเลือกที่มีผลต่อต้นทุนหรือการดูแลด้วย ADR พร้อมเงื่อนไขทบทวน ห้ามเลือก Microservices หรือแยก DB ตามจังหวัดโดยไม่มีปัญหาและผลวัดรองรับ

โมดูลเป้าหมาย: Identity & Access; Businesses & Memberships; Areas; Catalog & Stock; Orders; Trips; Stays; Food; Dispatch; Services; Payments & Ledger; Creator & Rewards; Content & Moderation; Notifications; Support & Audit

โมดูลเจ้าของข้อมูลเป็นผู้แก้ข้อมูลของตน การส่งเหตุการณ์หลังบันทึกธุรกรรมควรพิจารณา transactional outbox เพื่อไม่ให้บันทึกสำเร็จแต่ลืมแจ้งงานต่อ ทุก consumer ต้องรับเหตุการณ์ซ้ำได้อย่างปลอดภัย

### C09 — ข้อมูล ฐานข้อมูลขนาดใหญ่ และการเติบโต

> สร้าง ERD เชิงแนวคิดก่อน schema จริง ระบุเจ้าของข้อมูล ความสัมพันธ์ key/index/unique/check constraint ขอบเขต transaction และการเก็บประวัติ แยกไฟล์ภาพ/วิดีโอออกจาก DB โดยเก็บ reference และ metadata ระบุ retention, deletion, backup และการเข้าถึงตามประเภทข้อมูล

| กลุ่มข้อมูล | แนวทางตั้งต้น |
|---|---|
| บัญชี ธุรกิจ สินค้า การจอง เงิน | PostgreSQL เป็นแหล่งข้อมูลหลัก |
| ไฟล์สาธารณะ/เอกสารส่วนตัว | Object storage แยกสิทธิ์และวงจรอายุ |
| ตำแหน่ง Driver | แยกตำแหน่งล่าสุดและประวัติ จำกัดอายุข้อมูล |
| ค้นหา | เริ่มจากความสามารถที่ทดสอบคุณภาพภาษาไทยได้ แล้วค่อยแยก search service เมื่อจำเป็น |
| สถิติหนัก | แยกงานวิเคราะห์ออกจากคำขอซื้อ/จอง |
| Cache | ใช้เร่งข้อมูลอ่าน ไม่เป็นหลักฐานสุดท้ายของเงินและจำนวนคงเหลือ |

ตัวอย่าง entities: users, businesses, branches, memberships, roles/scopes, areas/service_zones, products/stock_movements, orders/items, trips/departures/bookings, properties/room_types/inventory_nights/stay_bookings, delivery_jobs/offers, quotes/appointments, payments/refunds/journals, friendships/creator_applications/referrals/rewards, content/reports/audit_events

อย่าให้ตารางสถานะเดียวครอบทุกธุรกิจจนสูญเสียกฎเฉพาะ และอย่าเก็บยอดเงินเป็น floating point

### C10 — API และระบบภายนอก

> ระบุ endpoint/event contract, validation, authorization, pagination, error format, idempotency, timeout, retry และ versioning ให้มีตัวอย่าง request/response ใช้ข้อมูลสมมติ แยก browser request จาก provider webhook เพราะการตรวจ Origin/CSRF กับการตรวจลายเซ็น Webhook มีหน้าที่ต่างกัน

ตัวอย่างคำขอจองที่พัก (สัญญาเสนอ ไม่ใช่ API ที่ยืนยันว่ามีแล้ว):

```http
POST /api/v1/stay-bookings
Idempotency-Key: <unique-request-key>
Content-Type: application/json

{
  "propertyId": "<property-id>",
  "roomTypeId": "<room-type-id>",
  "checkIn": "2026-10-20",
  "checkOut": "2026-10-21",
  "rooms": 1,
  "guests": 2
}
```

Server คำนวณราคา ตรวจจำนวน และกันห้องเอง ไม่เชื่อราคา user ส่งมา; conflict คืนรหัสและข้อความที่ UI ทำต่อได้; สำเร็จคืน bookingId, state, quoted price, currency และ expiresAt

ระบบภายนอกที่ต้องตัดสินใจ: รับชำระ/คืนเงิน/โอนรายได้, OTP/email, maps/geocoding/routing, push, video/Live, moderation และ monitoring แต่ละรายการต้องมี sandbox, quota, outage behavior, ค่าใช้จ่าย และวิธีย้ายออก

### C11 — ความปลอดภัยและข้อมูลส่วนบุคคล

> ทำ threat model ตามข้อมูลและขอบเขตความเชื่อถือ รวมบัญชีถูกยึด การข้ามร้าน/พื้นที่ การอัปโหลดไฟล์ การปลอม Webhook การปั่นรางวัล และการใช้สิทธิ์เจ้าหน้าที่เกินหน้าที่ ผูกข้อควบคุมกับ ASVS เวอร์ชันที่ตรวจสอบแล้วโดยไม่แต่งเลขข้อ ระบุหลักฐานทดสอบและความเสี่ยงที่ยังเหลือ

ข้อเสนอ: MFA สำหรับ Admin/การเงิน; สิทธิ์ขั้นต่ำ; session revocation; rate limits; secret management; encryption; บันทึกประวัติโดยไม่ใส่ secret; signed URL สำหรับเอกสาร; ตรวจไฟล์; แยกสภาพแวดล้อม; สำรองและซ้อมกู้คืน

RLS เป็นตัวเสริม หากเลือกใช้ต้องตรวจ app DB role, owner/BYPASSRLS และ transaction context ไม่ใช้เป็นคำรับประกันว่าข้อมูลแยกร้านแล้ว

เรื่องนโยบายข้อมูล ภาษี เงื่อนไขจ่ายรางวัล และข้อกำกับธุรกิจ ให้บันทึกเป็นประเด็นส่งผู้รับผิดชอบตรวจ ไม่ประกาศว่าผ่านกฎหมายจากเอกสาร Prompt นี้

### C12 — ปริมาณงานและเป้าหมายคุณภาพ

OPEN: ตัวเลขจริงต้องตกลงก่อน sizing และประเมินราคา ไม่มีข้อมูลรองรับคำว่า “รองรับล้านคน” ในขณะนี้

ตัวอย่างสมมติสำหรับฝึกเขียน Prompt ไม่ใช่เป้าหมายที่อนุมัติหรือผลทดสอบ:

| มิติ | ตัวอย่างเป้าหมาย | วิธีตรวจ |
|---|---|---|
| โหลด | 100 read requests/s และ 10 booking attempts/s ต่อเนื่อง 30 นาที | Load test บนข้อมูลสมมติและ environment ที่ระบุ |
| API อ่าน | p95 ≤ 500 ms ภายใต้โหลดข้างต้น | วัดจากขอบ API ไม่รวมผู้ให้บริการภายนอกและไฟล์สื่อ |
| ความถูกต้อง | ไม่ขายเกินจำนวนในชุดทดสอบพร้อมกัน | ตรวจฐานข้อมูลหลัง concurrent tests |
| ความพร้อมใช้ | เป้าหมายร่าง 99.9% ต่อเดือน | นิยาม successful request, ช่วงวัด และข้อยกเว้นให้ชัด |
| กู้คืน | RPO ≤ 15 นาที; RTO ≤ 4 ชั่วโมง เป็นร่าง | ซ้อมคืนระบบและวัดผลจริง |

> สร้าง workload model แยกสมาชิกทั้งหมด ผู้ใช้พร้อมกัน RPS งานเขียน DB, active riders×ความถี่พิกัด, ผู้ชม Live×ระยะเวลา และขนาดไฟล์ต่อวัน ใช้ตัวเลขเป็นสมมติฐานที่เปลี่ยนได้ ห้ามรับรอง capacity จนมี benchmark

### C13 — การเงิน เพื่อน และรางวัล Creator

> ออกแบบ ledger ที่ตรวจสอบรายการย้อนหลังได้ แยกรายได้ร้าน Driver Creator คะแนน และคูปอง ระบุ gross/fee/refund/net/currency/policy version และการกระทบยอด รายการที่ลงบัญชีแล้วแก้ด้วย reversal/adjustment ที่มีเหตุผล ไม่ลบย้อนหลังตามปกติ

ข้อเสนอสำหรับเพื่อน500คน: unique mutual friendships ที่ยังมีผล → eligible to apply → pending review → approved → earning eligible referrals. ไม่จ่ายเงินจากการชวนเพื่อนเพียงอย่างเดียว ไม่ให้ client กำหนด count หรือ approved

OPEN ที่ต้องตัดสินใจ: 500 ใช้เฉพาะเงินหรือรวมแต้ม; การนับเพื่อน; เมื่อยอดลดลง; attribution window; รายการยกเลิก/คืนเงิน; self-referral; การเปิดเผยสปอนเซอร์; อัตรารางวัล; ผู้รับภาระส่วนลด; เกณฑ์จ่ายเงิน; ช่องทางอุทธรณ์

> เก็บ pending/available/paid/reversed เป็นสถานะแยก ตรวจ events ซ้ำและข้อพิพาทย้อนหลังได้ ไม่อ้างว่าครบ500แล้วมีรายได้แน่นอน

### C14 — Deploy ดูแลระบบ และต้นทุน

> เสนอ Dev/Staging/Production แยกข้อมูลและ secrets; CI ตรวจ static/type/tests/build/dependency ตามความเหมาะสม; ทดสอบ migration และ deployment rollback; monitoring metrics/logs/traces; runbook สำหรับ DB outage, payment delay, queue backlog และ Live abuse; กำหนดผู้รับผิดชอบแจ้งเหตุ

ต้องกำหนด backup/PITR, restore drill, RPO/RTO, retention, deletion, budget alerts และค่าใช้จ่ายต่อออเดอร์/ผู้ชมวิดีโอ ไม่เลือกรุ่น Cloud จากจำนวนสมาชิกเพียงอย่างเดียว

ตรวจ official version/support/advisory อีกครั้งก่อนล็อก dependency อย่าตีความเลขเวอร์ชันใน manifest ว่าปลอดภัยหรือเข้ากันได้ทั้งหมดโดยไม่ทดสอบ

### C15 — ตรวจรับจากพฤติกรรมและหลักฐาน

> ใช้ Given–When–Then พร้อมผูก Requirement ID → API/data rule → test → ผลทดสอบ ระบุ test ที่ยังไม่ได้รันอย่างตรงไปตรงมา การ build ผ่านหรือมีภาพหน้าจอไม่เท่ากับพร้อม Production

| Test ID | เหตุการณ์ | ผลที่ต้องได้ |
|---|---|---|
| AT-ACCESS-01 | พนักงานร้านAขออ่าน/แก้รายการร้านB | ปฏิเสธโดยไม่เปิดเผยข้อมูล |
| AT-BOOK-01 | ห้องเหลือ1 คนสองคนจองพร้อมกัน | ยอมรับได้เพียง1 อีกคนได้รับ conflict; ไม่ขายเกิน |
| AT-PAY-01 | Webhook สำเร็จเดิมเข้าซ้ำ10ครั้ง | ผลทางเงินและธุรกิจเกิดเพียงครั้งเดียว |
| AT-PAY-02 | เงินสำเร็จหลัง hold หมดอายุ | ไม่ยืนยันเกิน inventory; ใช้นโยบายคืนเงิน/ตรวจสอบที่ตกลง |
| AT-AREA-01 | ลูกค้าอยู่นอกเขตส่งอาหาร | ไม่สั่งอาหารส่งทันที แต่ใช้ที่พัก/ทริป/ช้อปได้ |
| AT-RIDER-01 | สองคนรับข้อเสนองานเดียวกัน | งานมีผู้รับที่ยืนยันเพียงคนเดียว |
| AT-CREATOR-01 | มีเพื่อน499 หรือ500แต่ยังไม่อนุมัติ | ยังไม่เปิดรับรายได้ตามนโยบายที่ยืนยัน |
| AT-REWARD-01 | ส่ง event รางวัลซ้ำ | ไม่เพิ่มยอดซ้ำ มี reference ตรวจย้อนหลัง |
| AT-RESTORE-01 | กู้จาก backup ใน environment ทดสอบ | ตรวจความครบและวัด RPO/RTO ได้ |

### C16 — งานย่อย การตัดสินใจ และเงื่อนไขจบ

> แบ่งงานให้มี output ตรวจรับได้ ไม่ใช้คำว่า “ทำระบบทั้งหมดให้สมบูรณ์” เป็น task เดียว ทุกงานระบุ owner, dependency, risk, files, migration, tests, rollback และสิ่งที่ยังเปิดค้าง เก็บ ADR เมื่อเลือกทางสถาปัตยกรรมที่เปลี่ยนยาก

แม่แบบ ADR: ID / ปัญหา / ข้อจำกัด / ทางเลือก / ข้อเสนอ / ผลดีและต้นทุน / สถานะ / ผู้ตัดสินใจ / วันที่ / เงื่อนไขทบทวน

ตัวอย่าง ADR-001: เสนอ modular monolith เพราะทีมและโหลดจริงยังไม่ทราบ ต้องการ transaction ที่ตรวจสอบง่าย แลกกับการ deploy โมดูลหลักร่วมกัน; ทบทวนเมื่อผลวัดแสดงคอขวดเฉพาะโมดูลหรือทีมต้อง deploy แยกอย่างอิสระ

## D. Module Brief ตัวอย่าง — ที่พัก

```text
MODULE: Stays
MODE: DESIGN
GOAL: จองห้องโดยไม่ขายเกินและตรวจรายการเงินได้
ACTORS: ลูกค้า, เจ้าของที่พัก, พนักงานที่ได้รับสิทธิ์, Adminตามพื้นที่, การเงิน
IN SCOPE: ประเภทห้อง, inventoryรายคืน, ราคา, hold, booking, cancellation
LATER: เชื่อม channel manager ภายนอก, dynamic pricing
RULES:
- ใช้วันเข้าพัก/ออกใน timezoneที่พัก; เช็กเอาต์ไม่ใช่คืนที่ขาย
- Snapshot ราคาและนโยบายเมื่อสร้างรายการ
- holdมีวันหมดอายุ และหมดอายุอย่างถูกต้องแม้ workerล่าช้า
- Payment confirmed ไม่รับรองว่ามีห้องหาก holdหมดอายุ; ต้องมี recovery policy
- Ownerแก้ได้เฉพาะที่พักที่ได้รับสิทธิ์
FAILURES: ห้องหมดพร้อมกัน, retryเดิม, paymentล่าช้า, ยกเลิกซ้ำ, workerหยุด
DELIVERABLES: ERDแนวคิด, state diagram, sequence, API contract, test matrix
ACCEPTANCE: AT-ACCESS-01, AT-BOOK-01, AT-PAY-01, AT-PAY-02
OPEN: holdกี่นาที, cancellation policy, confirmทันทีหรือรอที่พัก, refund timing
```

## E. Task Prompt ตัวอย่าง — งานเล็กที่ตรวจรับได้

```text
อ่าน Master Context รุ่น0.1 และ Module Brief: Stays
งานรอบนี้: ออกแบบการกันห้องเมื่อคำขอพร้อมกัน ยังไม่แก้โค้ด

ตรวจ schema/transaction patterns ที่มีอยู่ และอ้างไฟล์ที่อ่านจริง
เปรียบเทียบอย่างน้อย2วิธีที่เหมาะกับ inventoryของที่พักนี้
เสนอวิธีเดียวพร้อมเหตุผล ขอบเขต lock และ failure recovery
แสดง sequence ของผู้ใช้2คนจองห้องสุดท้าย พร้อม request key
ครอบคลุม hold expiry, paymentหลังหมดอายุ, retry และ cancellation
ส่งมอบ ADRร่าง, pseudocode, ข้อจำกัดDB และ Given–When–Then tests
หากไม่มีข้อมูลให้ทำเครื่องหมาย OPEN ห้ามกำหนดนโยบายคืนเงินเอง
จบงานเมื่อทุก scenarioมีผลลัพธ์และการตรวจรับที่อธิบายได้
```

แม่แบบสำหรับงาน IMPLEMENT ในอนาคต:

```text
MODE: IMPLEMENT
อ้างอิง Requirement/ADR ที่ยอมรับแล้ว: <IDs + version>
งานเดียว: <พฤติกรรมที่ต้องเปลี่ยน>
ขอบเขตไฟล์/โมดูล: <paths>
กฎห้ามผิด: <rule IDs>
ผลตรวจรับ: <Given–When–Then>
การเปลี่ยนข้อมูล: <migration/compatibility/backup ถ้ามี>
ทดสอบ: <commands + scenarios>
ไม่อยู่ในขอบเขต: <ฟังก์ชันที่ไม่ต้องแตะ>
ตรวจงานเดิมก่อนแก้ ไม่ทับสิ่งที่ไม่เกี่ยวข้อง ไม่เปิดProductionหรือใช้เงินจริง
รายงานไฟล์ที่เปลี่ยน ผลที่ตรวจจริง สิ่งที่ยังไม่ตรวจ และความเสี่ยงที่เหลือ
```

## F. Master Prompt ฉบับประกอบ — ใช้เริ่มงานสถาปัตยกรรมได้

```text
คุณคือสถาปนิกซอฟต์แวร์ของ ThinThai ร่วมรับผิดชอบความถูกต้องของธุรกรรม
ความปลอดภัย UX/UI การดูแลระบบ และต้นทุน อธิบายภาษาไทยชัดเจน

[MODE]
DESIGN: สร้างสถาปัตยกรรมและแผนก่อนเฟส0–1 ยังไม่แก้โค้ดธุรกิจ
ไม่รัน migration ไม่เปิดCloudที่มีค่าใช้จ่าย ไม่DeployProductionหรือรับเงินจริง
สร้าง/ปรับเอกสารตามขอบเขตนี้ได้ แยกข้อเสนอจากการตัดสินใจของเจ้าของโครงการ

[CONTEXT]
ThinThai คือ Multi-Vendor & Easy Apps สำหรับการท่องเที่ยววิถีชุมชนไทย
แนวคิด: แอปเดียวครบ จองทริป ช้อปสินค้าชุมชน เที่ยวไทยให้ถึงถิ่น
ผู้ใช้: ลูกค้า, เจ้าของธุรกิจ/ทีมงาน, Driver, Creator,
Adminพื้นที่, ปฏิบัติการ, การเงิน, ช่วยเหลือ และ Super Admin
ขอบเขตระยะยาว: ช้อป อาหาร ทริป ที่พัก เรียกรถ บริการ ชุมชน/Live/รางวัล

[EVIDENCE]
โครงการ /Users/3designs/ThinThai-Turism Platform
ตรวจ repo instructions, README, manifests, schema/migrations, API,
tests และ design references ที่เกี่ยวข้องก่อนสรุป
ระบุ commit/วันที่/ขอบเขตที่ตรวจ ไม่อ่านหรือเผย secret
ฐานที่เคยพบ: Next.js, NestJS, PostgreSQL, Flutter scaffold
แต่ต้องตรวจซ้ำ ไม่ถือว่าภาพUX/UIหรือโค้ดจำลองเป็นฟังก์ชันที่เสร็จจริง
จัดทุกข้อเป็น CONFIRMED / OBSERVED / PROPOSED / OPEN

[CONFIRMED REQUIREMENTS]
- ใช้งานมือถือ แท็บเล็ต คอมพิวเตอร์ เน้นง่ายสำหรับทุกวัย
- ใช้เอกลักษณ์ ThinThai และให้ที่พักมีทางเข้าชัดเจน
- แยกพื้นที่จังหวัด อำเภอ ตำบล พร้อมหมุด
- เขตส่งอาหารจำกัดอาหารเท่านั้น ไม่ปิดหมวดอื่น
- ผู้ประกอบการหลายรายและหลายประเภท
- Creator ต้องมีเพื่อน500คนก่อนมีรายได้ช่องทางนี้
รายละเอียดการนับ/อนุมัติ/แต้ม/สิทธิ์หลังจำนวนลดลง ยังต้องกำหนดแยก

[ARCHITECTURE DIRECTION — PROPOSED]
ต่อยอดฐานเดิมเป็น modular monolith แบ่งเจ้าของข้อมูลตามธุรกิจ
Web/Partner/Admin ใช้APIร่วมที่ตรวจสิทธิ์ทุกคำขอ
เพิ่ม Worker สำหรับงานเบื้องหลัง แยกไฟล์ไป object storage
ใช้PostGISเมื่อทำเขตพื้นที่ และใช้บริการวิดีโอเฉพาะทางเมื่อเปิดLive
Cacheและsearchเพิ่มเติมตามผลวัด ไม่แยกmicroservices/DBตามจังหวัดโดยไม่มีเหตุผล
บันทึกทางเลือก ผลกระทบ และเงื่อนไขทบทวนในADR

[BUSINESS & DATA]
กำหนด state machine แยกงาน/จ่ายเงิน/คืนเงิน/โอนรายได้
กันinventoryด้วยกฎDB/transaction รองรับconcurrencyและidempotency
คำนวณราคาและสิทธิ์ฝั่งserver เก็บsnapshotและpolicy version
เงินใช้หน่วยย่อยพร้อมcurrency แยกledgerเงินกับpoints/coupons
วิเคราะห์repeat/out-of-order events, expiry, cancellationและcompensation
สิทธิ์ครอบคลุมbusiness/branch/area/serviceและการexport/file/realtime/worker

[SECURITY & OPERATIONS]
ทำthreat model และverification matrix อิงASVSเวอร์ชันที่ตรวจแล้ว
MFAสำหรับงานสิทธิ์สูง; rate limits; session recovery; secret management
แยกDev/Staging/Production; private files; audit; data retention
ออกแบบprovider webhookแยกจากbrowser CSRF และverify signature
มีbackup/PITR, restore drill, monitoring, incident/rollback runbook
ระบุประเด็นprivacy/ธุรกิจที่ต้องส่งผู้รับผิดชอบตรวจ ไม่รับรองกฎหมายเอง

[UX]
Responsive, ไทย/อังกฤษเป็นข้อเสนอเริ่มต้นและรองรับเพิ่มภาษา
แนะนำlocaleจากอุปกรณ์และให้เปลี่ยนเอง
ออกแบบloading/empty/error/offline/permission states
เสนอWCAG2.2AAเป็นเป้าหมายพร้อมวิธีตรวจ ไม่อ้างว่าผ่านจนทดสอบ

[OPEN INPUTS]
พื้นที่นำร่อง=<OPEN>; รุ่นแรก=<PROPOSED สินค้าและทริป>
ทีม/ทักษะ=<OPEN>; งบลงทุน/เดือน=<OPEN>; วันเป้าหมาย=<OPEN>
ผู้ใช้พร้อมกัน/RPS/ออเดอร์/Driver/Live=<OPEN>
Cloud/region/payment/maps/OTP/video=<OPEN>
นโยบายค่าธรรมเนียม/คืนเงิน/Creator/retention/RPO/RTO=<OPEN>
ใช้สมมติฐานเพื่อเปรียบเทียบได้ แต่ติดป้ายและบอกผลกระทบ ห้ามแต่งข้อมูลจริง

[DELIVERABLES]
1. สรุปบริบท ขอบเขตและสถานะหลักฐานปัจจุบัน
2. Canvas และdecision register พร้อมคำถามที่มีผลต่อการออกแบบ
3. C4 Context/Container และtrust boundaries
4. Module ownership, conceptual ERD, permission matrix
5. State/sequence: จองพร้อมกัน, webhookซ้ำ/ช้า, รับงานพร้อมกัน, Creator eligibility
6. API/integration contracts และfailure behavior
7. Threat model และquality/load/backup/cost assumptions
8. ADRร่างพร้อมทางเลือกและข้อเสนอ
9. Backlogตามdependency พร้อมacceptance criteriaและrelease gates
10. Promptย่อยทีละงานที่นำไปใช้ต่อได้ และรายการสิ่งที่ยังไม่ตรวจ

[ACCEPTANCE & WORKFLOW]
ผูกRequirement → Design → Test ทุกกฎสำคัญ
ทดสอบข้ามร้าน/พื้นที่, overselling, duplicate payment/reward,
late payment, expired offer, backup restore และoffline recovery
ห้ามรายงานผลทดสอบที่ไม่ได้รัน หรือรับรองรองรับโหลดโดยไม่มีbenchmark
เริ่มจากทบทวนC01–C06 แล้วเสนอการตัดสินใจสำคัญก่อนรายละเอียดC07–C16
ถามเฉพาะข้อมูลที่ขาดและทำให้ออกแบบต่างกันอย่างมีนัยสำคัญ
เดินหน้าส่วนที่ไม่ขึ้นกับคำตอบได้ และจบด้วยงานย่อยถัดไปที่ตรวจรับได้
```

## G. แผนประกอบ Prompt ทีละรอบ ก่อนเฟส0–1

| รอบ | ส่งให้ AI ทำ | ผลส่งมอบ | Gate |
|---|---|---|---|
| A | C01–C05: เป้าหมาย หลักฐาน ผู้ใช้ รุ่นแรก | Project brief และscope | เจ้าของโครงการเลือกขอบเขตนำร่อง |
| B | C06 + C13: กฎธุรกรรมและรางวัล | Rule catalog + open policy list | ไม่มีกฎสำคัญขัดกัน |
| C | C08–C10: โมดูล ข้อมูล API | C4 + ERD + ownership + ADR | ตรวจเส้นทางข้อมูลและintegrationได้ |
| D | C04 + C11: สิทธิ์และความปลอดภัย | Permission/threat matrix | มีวิธีป้องกันและตรวจทดสอบ |
| E | C07 + C12 + C14: UX คุณภาพ ต้นทุน | Quality scenarios + workload + operations | เป้าหมายเหมาะกับงบและทีม |
| F | C15–C16: ตรวจรับและแผนงาน | Backlog + test mapping + master promptรุ่น1 | แต่ละงานพร้อมเริ่มและตรวจรับได้ |

Definition of Ready ก่อนเริ่มพัฒนา: มีactor/scope/rules/state/data owner/error/acceptance/dependencies ชัด และไม่มีOPENที่เปลี่ยนแกนของงานนั้น

Definition of Done ของงานพัฒนา: พฤติกรรมตรงเกณฑ์ ตรวจสิทธิ์ ข้อมูลถูกต้อง ทดสอบตามความเสี่ยง เอกสารตรงโค้ด มีmonitoring/rollbackตามผลกระทบ และรายงานสิ่งที่ยังไม่ทำ

## H. Decision register ตั้งต้น

| ID | เรื่องที่ต้องเลือก | ข้อเสนอเริ่มต้น | ผลกระทบ |
|---|---|---|---|
| D01 | พื้นที่นำร่อง | OPEN ไม่ถือว่าเชียงใหม่ในภาพคือคำตอบจริง | ร้าน/ที่พัก/ทีมดูแลและแผนที่ |
| D02 | ธุรกรรมแรก | PROPOSED สินค้าและทริปจากฐานเดิม | ขอบเขตschemaและเวลาพัฒนา |
| D03 | งบ/ทีม/เวลา | OPEN | เลือกบริการmanagedและrelease size |
| D04 | เป้าหมายโหลด | OPEN ใช้ตัวอย่างC12เพื่อหารือ | sizingและbenchmark |
| D05 | เงินและผู้ให้บริการ | OPEN | settlement,refund,webhookและoperational cost |
| D06 | ที่พักconfirmแบบใด | OPEN | inventory hold, payment timing |
| D07 | Creator500 | ยืนยันthreshold; รายละเอียดOPEN | เพื่อน คะแนน รายได้ และอุทธรณ์ |
| D08 | Live | PROPOSED เปิดหลังmoderation/งบพร้อม | video costและทีมเฝ้าระวัง |
| D09 | recovery/retention | OPEN | ค่าbackupและขั้นตอนข้อมูลส่วนตัว |
| D10 | แอปDriver | PROPOSED ทดลองเว็บก่อน ประเมินFlutterจริง | location/push/background reliability |

## I. แหล่งอ้างอิงและขอบเขตการใช้

Canvas16ช่องและPromptในเอกสารนี้เป็นการสังเคราะห์เฉพาะThinThai ไม่ใช่ชื่อมาตรฐานสากลหรือการรับรองระบบ ใช้แนวคิดจากเอกสารทางการดังต่อไปนี้ ตรวจอ่าน8ตุลาคม2026:

- [arc42 overview](https://arc42.org/overview/): กรอบบันทึกบริบท โครงสร้าง การตัดสินใจ คุณภาพ และความเสี่ยง เอกสารนี้ไม่ได้คัดลอกtemplateทั้งชุด
- [C4 diagrams](https://c4model.com/diagrams): ใช้ContextและContainerอธิบายภาพใหญ่และหน่วยที่รันระบบ
- [OWASP ASVS](https://owasp.org/projects/asvs): ฐานข้อกำหนดตรวจความปลอดภัย ต้องผูกกับเวอร์ชันและหลักฐานทดสอบ
- [W3C WCAG2.2](https://www.w3.org/TR/WCAG22/): อ้างอิงเป้าหมายการเข้าถึง ไม่ใช่หลักฐานว่าUIผ่านแล้ว
- [PostgreSQL RLS](https://www.postgresql.org/docs/current/ddl-rowsecurity.html): พิจารณาการจำกัดข้อมูลระดับแถวและข้อยกเว้นตามDB role
- [PostgreSQL PITR](https://www.postgresql.org/docs/current/continuous-archiving.html): แนวทางbackupและกู้ตามเวลา ต้องเลือกตามเวอร์ชันที่ใช้งานจริง
- [Stripe webhooks](https://docs.stripe.com/webhooks): ตัวอย่างข้อกำหนดรับเหตุการณ์ภายนอก การตรวจลายเซ็นและduplicate ไม่ใช่การเลือกStripeล่วงหน้า

หากใช้เอกสารcurrentกับPostgreSQL16ในโครงการ ต้องตรวจรายละเอียดเวอร์ชัน16ก่อนนำคำสั่งไปใช้จริง แหล่งอ้างอิงไม่แทนการทดสอบระบบThinThai
