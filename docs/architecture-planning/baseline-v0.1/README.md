# ThinThai Architecture Baseline 0.1

วันที่ 8 ตุลาคม 2026 · สถานะ: แบบตั้งต้นสำหรับพัฒนาต่อ ไม่ใช่การอนุมัติ Production

## วัตถุประสงค์

แปลง [Prompt Canvas](../THINTHAI_PROMPT_CANVAS_v1.md) เป็นสถาปัตยกรรมที่ระบุองค์ประกอบ เจ้าของข้อมูล สิทธิ์ ลำดับธุรกรรม และงานพัฒนาที่ตรวจรับได้ ใช้ฐานโครงการเดิมโดยไม่เริ่มใหม่ทั้งหมด

## เอกสารชุดนี้

0. [WEB_STACK.md](WEB_STACK.md) — เริ่มอ่านตรงนี้: Frontend/Backend สำหรับเว็บผ่านเบราว์เซอร์ ตามคำยืนยันล่าสุดของผู้ใช้
1. [SYSTEM.md](SYSTEM.md) — ภาพปัจจุบัน/เป้าหมาย แผนผังระบบ โมดูล การรันระบบ และขอบเขตการเชื่อถือ
2. [DATA_AND_FLOWS.md](DATA_AND_FLOWS.md) — แบบข้อมูล ความถูกต้องธุรกรรม และสถานการณ์สำคัญ
3. [SECURITY_AND_OPERATIONS.md](SECURITY_AND_OPERATIONS.md) — สิทธิ์ ความเสี่ยง คุณภาพ การสำรอง การปล่อยรุ่น และค่าใช้จ่าย
4. [DECISIONS_AND_BACKLOG.md](DECISIONS_AND_BACKLOG.md) — ข้อเสนอการตัดสินใจ งานย่อย ลำดับพัฒนา และ Prompt เริ่มงานถัดไป

เอกสารเดิมที่ใช้ร่วมกัน: [แผนเฟส0–1](../../phase-0-1/PLAN.md), [แบบข้อมูลเดิม](../../phase-0-1/DATA_MODEL.md), [สิทธิ์เดิม](../../phase-0-1/ACCESS.md), [Staging](../../phase-0-1/STAGING.md)

## สถานะข้อกำหนด

- CONFIRMED = ความต้องการที่ผู้ใช้ระบุ ไม่ได้หมายความว่าพัฒนาแล้ว
- OBSERVED = สิ่งที่พบจากไฟล์ ระบุวันที่และขอบเขตการตรวจ
- PROPOSED = แนวทางตั้งต้น ยังเปลี่ยนได้ตามข้อจำกัด
- OPEN = ต้องมีคำตอบก่อนตัดสินใจในงานที่เกี่ยวข้อง

## สิ่งที่ถือเป็นโจทย์ร่วม

- ThinThai เป็น Multi-Vendor & Easy Apps สำหรับท่องเที่ยววิถีชุมชนไทย
- ครอบคลุมช้อป อาหาร ทริป ที่พัก เรียกรถ บริการ และเนื้อหา/Live ของผู้ใช้
- ใช้บัญชีเดียว เชื่อมบทบาทลูกค้า Partner Driver Creator และเจ้าหน้าที่ตามสิทธิ์
- รองรับมือถือ แท็บเล็ต คอมพิวเตอร์ และหลายภาษา
- จัดการจังหวัด อำเภอ ตำบล และหมุดสถานที่
- กฎเขตส่งอาหารไม่ปิดการเข้าถึงบริการประเภทอื่น
- Creator ต้องมีเพื่อน500คนก่อนมีรายได้ช่องทางนี้ รายละเอียดการนับ/อนุมัติยังเป็นข้อเสนอ

## ข้อเสนอแกนสถาปัตยกรรม

Next.js / TypeScript สำหรับเว็บ → NestJS API แบบ modular monolith → PostgreSQL เป็นข้อมูลหลัก; Worker แยก process สำหรับงานเบื้องหลัง; object storage สำหรับไฟล์; เชื่อม payment/maps/OTP/video ผ่าน adapter แยกขอบเขต

Web/Partner/Admin เป็นพื้นที่ใช้งานคนละกลุ่มแต่ใช้กฎจาก Backend ร่วมกัน Driver และแอปมือถือใช้ API เดียวกันตามสิทธิ์ ไม่คัดลอกกฎเงิน/สต๊อกไปคำนวณต่างกันในแต่ละ client

ผู้ใช้ยืนยันล่าสุดให้วางโครงสร้างFrontend/Backendและเทคโนโลยีสำหรับเว็บผ่านเบราว์เซอร์ก่อนเลือกธุรกรรมรุ่นนำร่อง จึงเริ่มด้วยweb foundationในWEB_STACK ไม่ถือว่าสินค้าและทริปได้รับเลือกแล้ว และไม่มีข้อกำหนดให้เริ่มnative appตอนนี้

## หลักฐานการตรวจครั้งนี้

อ่าน working tree ที่ HEAD `308bb0d` วันที่8ตุลาคม2026 ซึ่งมี staged/unstaged/untracked work เดิมจำนวนมาก หมายเลข commit ไม่แทนไฟล์ทั้งหมดที่อ่าน

| สิ่งที่พบ | หลักฐาน | ความหมาย |
|---|---|---|
| ขอบเขตmodules/APIเดียวและWorkerเป็นแนวทางเดิม | docs/ARCHITECTURE.md | ใช้ต่อเนื่อง ไม่เสนอรื้อระบบ |
| มีusers/stores/orders/trips/paymentsเบื้องต้น | database/migrations/001–008 | พบ schema ไม่ยืนยันว่าตารางจริง migrateครบ |
| จำกัดsandboxเป็นdevelopment/testและopt-in | apps/api/src/payment-policy.ts; payments.ts | มีguardและowner checksในโค้ด ไม่ใช่payment providerจริง |
| มีintegration jobใช้PostgreSQLแยก | .github/workflows/ci.yml | มีconfiguration ไม่ได้ตรวจผลCIล่าสุด |
| Frontend API originกำหนดด้วยenvได้ | apps/web/next.config.ts | ไม่ควรใช้ข้อสรุปเก่าว่าผูกlocalhostเท่านั้น |
| AdminและWorkerแยกแอปยังเป็นscaffoldตามREADME | apps/admin/README.md; apps/worker/README.md | ต้องทำimplementationและตรวจจริงก่อนเปิด |
| domain/contractsยังเป็นโครงสร้างเริ่มต้น | packages/domain/README.md; packages/contracts/README.md | แผนแชร์กฎและAPIยังต้องลงมือ |

ครั้งนี้สร้างเอกสารเท่านั้น ไม่รันDB migration ไม่เปลี่ยนแอป ไม่Deploy ไม่ใช้เงินจริง และไม่ได้รันทดสอบธุรกรรม/โหลด/เจาะระบบใหม่ ตรวจเพียงความครบและลิงก์ของเอกสาร

## แผนอ่านและเริ่มงาน

1. อ่านSYSTEMเพื่อยืนยันขอบเขตและเจ้าของแต่ละโมดูล
2. อ่านDATA_AND_FLOWSเพื่อยืนยันกฎจอง/เงิน/ไรเดอร์/Creator
3. ใช้SECURITY_AND_OPERATIONSกำหนดวิธีพิสูจน์ความพร้อม
4. เลือกงานA0-01ในDECISIONS_AND_BACKLOGเป็นงานลงมือถัดไป

## แหล่งอ้างอิง

แบบนี้สังเคราะห์จากบริบทและหลักฐานThinThai; แหล่งทางการช่วยกำหนดวิธีบันทึกและตรวจ ไม่ใช่การรับรองว่าThinThaiผ่านแล้ว

- [arc42](https://arc42.org/overview/) — โครงสร้างเอกสารการออกแบบและการตัดสินใจ
- [C4](https://c4model.com/diagrams) — มุมมองContextและContainer
- [OWASP ASVS](https://owasp.org/projects/asvs) — ข้อกำหนดตรวจความปลอดภัยแบบระบุเวอร์ชัน
- [WCAG2.2](https://www.w3.org/TR/WCAG22/) — เป้าหมายการเข้าถึง
- [PostgreSQL RLS](https://www.postgresql.org/docs/current/ddl-rowsecurity.html) และ [PITR](https://www.postgresql.org/docs/current/continuous-archiving.html) — ตรวจเอกสารเวอร์ชันที่ติดตั้งก่อนimplementation
- [Payment webhook reference](https://docs.stripe.com/webhooks) — ตัวอย่างsignature/deduplication ไม่ได้เลือกStripeไว้ล่วงหน้า
