# ThinThai — Security, Quality & Operations

PROPOSED controls: ต้องมีimplementationและผลตรวจจึงนับว่าผ่าน เอกสารไม่รับรองความปลอดภัยหรือcapacity

## 1. Permission model

การอนุญาต = identity active + action grant + resource scope + service eligibility + state preconditions. Default deny; resource IDจากclientต้องlookupและตรวจเจ้าของ ไม่ให้เลือกscopeด้วยheaderเอง

| Actor | ขอบเขตอ่าน | สิทธิ์เขียนสำคัญ | ข้อห้าม |
|---|---|---|---|
| Customer | รายการ/ข้อมูลตน | สร้างซื้อ/จอง/ขอยกเลิก | paymentคนอื่นแม้ทราบID |
| Business owner | ธุรกิจและสาขาที่สังกัด | ทีม ราคา สินค้า ตามgrant | ให้สิทธิ์เกินอำนาจตน |
| Staff | สาขาและactionที่มอบ | เตรียมงาน/เช็กอิน | เปลี่ยนบัญชีรับเงินโดยปริยาย |
| Driver | offer/jobของตนและข้อมูลจำเป็น | accept/status/proof | ดูตำแหน่งหรือติดต่อทุกลูกค้า |
| Creator | เนื้อหา/referral aggregateของตน | สร้างเนื้อหา/ยื่นสิทธิ์ | ดูข้อมูลส่วนตัวผู้ซื้อโดยปริยาย |
| Area Admin | area hierarchy+service+action | reviewผู้ประกอบการ/zoneตามgrant | คืนเงินหรือใช้ข้อมูลข้ามพื้นที่โดยปริยาย |
| Finance | รายการการเงินตามscope | prepare/approveตามหน้าที่ | self-approveเมื่อpolicyกำหนดแยกคน |
| Support | caseที่มีสิทธิ์และข้อมูลปิดบัง | ประสาน/บันทึกเหตุผล | exportข้อมูลทุกธุรกิจ |
| Super Admin | ตามexplicit grants | สิทธิ์/นโยบายที่ได้รับมอบ | bypass customer-payment ownershipโดยเงียบ |

ทุกAPI/list/detail/export/file/realtime/jobมีpolicy. ถอนmembershipต้องลดสิทธิ์sessionที่ค้างตามนโยบายที่ทดสอบได้. Emergency accessถ้าจำเป็นต้องมีเหตุผล อายุสิทธิ์ และaudit ไม่สร้างbackdoorถาวร

## 2. Threat register

| ID | ความเสี่ยง | Controlเสนอ | หลักฐานตรวจ |
|---|---|---|---|
| SEC-01 | ข้ามtenant/area | policyรวม, scoped query, DBconstraint; RLSถ้าเลือก | negative testsหลายร้าน/พื้นที่/action |
| SEC-02 | OTP/sessionถูกโจมตี | rate controls,expiry,single use,rotation,recovery,MFAstaff | abuse/replay/revocation tests |
| SEC-03 | ปลอมจ่าย/รับซ้ำ | signature,inboxunique,idempotent journal | malformed/duplicate/out-of-order tests |
| SEC-04 | เปลี่ยนบัญชีรับเงิน | step-up auth,notification,cooldown/reviewตามpolicy | ทดสอบaccount changeและaudit |
| SEC-05 | เอกสารรั่ว/ไฟล์อันตราย | ownership,signedURL,scan,content limits,private storage | unauthorizedfile/oversize/type tests |
| SEC-06 | ปั่นเพื่อน/referral | canonical friendships,eligibility server,review/reversal | self/refund/replay/synthetic cases |
| SEC-07 | secret/PIIในLog | allowlist/redaction,secretsmanager,leastprivilege | log inspection/secret scan |
| SEC-08 | Liveละเมิด/คุกคาม | report/block/moderator/stop stream/appeal | rehearsalและผู้รับแจ้งเหตุ |
| SEC-09 | แก้ข้อความเป็นscript | contextual encoding,validation,CSPตามแอป | stored/reflected injection tests |

ใช้ASVSเป็นchecklistแบบระบุเวอร์ชันและความเกี่ยวข้อง ไม่แต่งหมายเลขข้อ; ก่อนเปิดจริงมีผู้ทบทวนความปลอดภัยที่ไม่ใช่เพียงผู้เขียนfeature

## 3. Data governance

จัดชั้นpublic listing / internal operations / personal contacts / sensitive documents / finance records / secrets. แต่ละกลุ่มมีowner,purpose,readers,retention,deletion/export handlingและbackup behavior

ไม่เก็บOTP/plaintextpassword/tokenในlog; เอกสารตรวจผู้ประกอบการไม่วางpublicbucket. ข้อมูลคนขับย้อนหลังจำกัดอายุและการดู; analyticsใช้aggregateเท่าที่ทำได้. การขอลบบัญชีต้องแยกpersonal dataออกจากtransaction evidenceตามpolicyที่ผู้รับผิดชอบตรวจแล้ว ไม่อ้างว่าการsoft-deleteเท่ากับลบข้อมูลครบ

## 4. Workload worksheet — OPEN

ก่อนเลือกCloud/ขนาดเครื่องให้กรอก: active users/day, peak sessions, read/write RPS, bookings/s, listings, orders/day, fileGB/day, active riders, location interval, live channels, concurrent viewers, recording retention

ตัวอย่างวิธีคิด ไม่ใช่capacityที่รับรอง:
- location writes/s ≈ active riders ÷ update interval(seconds)
- media storage/day ≈ files/day × average bytes × rendition factor
- streaming costขึ้นกับจำนวนผู้ชม×เวลาชมและรูปแบบผู้ให้บริการ ไม่ใช่แค่จำนวนผู้ถ่ายทอด

Quality targetsที่ต้องตัดสินใจ: p95 API latencyที่กำหนดendpoint/โหลด, availability SLI/window, hold cleanup lag, webhook backlog, RPO/RTO, accessibility WCAG2.2AA, supported browsers/devices

ข้อมูลไม่ครบให้ทำscenarioเล็ก/กลาง/โตเพื่อเปรียบเทียบ ระบุสมมติฐานและราคา ณ วันที่ตรวจ ไม่กำหนดงบหรือสัญญาcapacityแทนเจ้าของโครงการ

## 5. Deployment และการกู้คืน

Dev/Test/Staging/Productionใช้DB,storage,secretsและprovider credentialsแยกกัน. Webhook stagingใช้provider sandboxจริง ส่วนsimulate endpointปัจจุบันเปิดเฉพาะdev/testตามguardที่อ่านพบ

Pipelineเป้าหมาย: lockfile install → format/types → unit/access → DBintegration → browser flow → build → staged migration rehearsal → deploy staging → smoke → release gate → production rolloutตามการอนุมัติ

ขั้นschemaใช้expand/compatible rolloutก่อนcontract. Health/readinessไม่เปิดsecret. ติดcorrelationIDตลอดAPI/provider/job. Metrics: latency,error,DBpool/locks,queue age,hold expiry,unreconciled money,dispatch unassigned,uploadfail

Backup/PITRต้องครอบDBและobject lifecycle ซ้อมrestoreในenvironmentแยก ตรวจjournal totals,relationshipsและmedia references พร้อมเวลาที่วัด. Replicaไม่ใช่backup; infrastructure/configและกุญแจถอดรหัสต้องมีแผนกู้ด้วย

Runbookขั้นต่ำ: DB unavailable,provider outage,payment succeeded but booking expired,queue stalled,double-dispatch attempt,credential leak,Live incident. ระบุผู้รับเหตุและการสื่อสารลูกค้า รวมวิธีหยุดฟังก์ชันเฉพาะพื้นที่/บริการโดยไม่ปิดทุกระบบ

## 6. Release gates

- [ ] Scopeและpolicyที่บล็อกงานได้รับคำตอบ มีversion
- [ ] Ownership/area/action/file/export testsผ่าน
- [ ] Concurrent reservation/payment expiry/retry testsผ่าน
- [ ] Providerเงินจริงมีsandbox rehearsal,signatureและreconciliation
- [ ] MFA/recovery/session revocationและsecretsตรวจแล้ว
- [ ] Browser flowsลูกค้า/Partner/Adminและmobile viewportผ่าน
- [ ] Restore/rollbackมีผลทดสอบและเวลาเทียบเป้าหมาย
- [ ] Alertมีowner/runbookและทดสอบส่งถึงผู้รับผิดชอบ
- [ ] Load testตรงworkloadที่ตกลง ไม่มีคำรับรองจากภาพหรือbuildอย่างเดียว
- [ ] Support/refund/incidentและข้อกำหนดข้อมูลมีผู้รับผิดชอบ

ทุกช่องยังไม่ถือว่าผ่านในเอกสารฉบับนี้
