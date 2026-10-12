# แบบข้อมูลเป้าหมายและ invariants

แบบนี้เป็น logical model สำหรับ migrationถัดไป ไม่ได้สร้างตารางใหม่ในรอบนี้

## ฐานที่มีแล้ว

app_users, system_roles, auth_sessions, store_memberships, admin_province_scopes, provinces/districts/subdistricts, stores, products, orders, trips/departures/bookings, payments, ledger_entries และประวัติ/audit ตาม migrations001–008

## ขยายเป็นโมดูล

- Identity: users 1:N verified_contacts/sessions; roles+permissions+scoped grants แทนการตัดสินใจจากroleอย่างเดียว
- Business: organization 1:N branches/stores; user M:N organizationผ่านmembership/action grants; storeเดิมต้องมีแผนbackfillก่อนบังคับ NOT NULL
- Geography: province→district→subdistrict; geometryของservice areaแยกจากเขตปกครองและผูกservice_type ข้อจำกัดอาหารไม่ใช้ข้ามหมวด
- Commerce: checkout 1:N merchant orders; order 1:N immutable line snapshots; inventory reservations มีexpiryและreferenceที่กันซ้ำ
- Trips: trip→departure→capacity reservation; quantityและholdต้องเปลี่ยนในtransaction
- Lodging: property→room_type→inventory_by_date; reservationและnights ยืนยันด้วยช่วง [checkin,checkout), 20–21เท่ากับ1คืน ไม่กันคืน21
- Payments: payment attempt→provider events; unique provider+event_id และrequest idempotency; ถ้าคงtarget_type/idต้องมีenforced validationหรือtransaction entityที่มีFK
- Accounting: journal entries/linesพร้อมreference, integer minor units+currency, debit=creditเมื่อใช้double-entry, reversalอ้างอิงรายการเดิม; payouts/refundsแยกstate; ห้ามลบประวัติการเงินตามparentโดยไม่มีนโยบาย
- Delivery: job→offers→assignment→events; รับงานได้คนเดียวด้วยatomic transition; location latest/historyแยกอายุข้อมูล
- Creator: friendship pairมีcanonical unique pair และpending/accepted/blocked; ป้องกันself-friend; eligible countมาจากserver; policy version500ไม่ใช่clientflag; referral attribution→reward pending/available/reversed; points ledgerแยกcash ledger
- Media: file metadataในDB, binaryในobject storage, owner/visibility/scanning state และ signed accessสำหรับprivate

## Invariantsที่ต้องทดสอบ

1. จองห้อง/ที่นั่ง/สต๊อกชิ้นสุดท้ายพร้อมกัน: ไม่มีoverbooking
2. จ่ายช้าแข่งกับหมดอายุ: กฎคืนเงิน/คืนholdชัด ไม่มีการคืนซ้ำหรือฟื้นรายการผิดสถานะ
3. webhookซ้ำ/ผิดลำดับ/worker retry: ไม่มีjournal/reward/notificationที่มีผลซ้ำ
4. price/fee/promotion snapshotsไม่เปลี่ยนตามcatalogภายหลัง
5. payoutไม่เท่ากับcustomer payment; work completeไม่เท่ากับpaid
6. referralต้องรอเงื่อนไขสำเร็จ; คะแนน/รายได้ไม่เกิดเพียงเพื่อนครบ500

เริ่มindexตามtenant/store+status+timeและqueryจริง; paginateด้วยstable order; ใช้connection pool; วัดก่อนpartition/replica/shard; การอ่านavailabilityและเงินที่ต้องสดใช้แหล่งauthoritative
