# ThinThai — Decisions & Executable Backlog

PROPOSED baseline, 8ตุลาคม2026. ผู้รับผิดชอบในตารางเป็นหน้าที่ที่ต้องมี ไม่ใช่บุคคลที่แต่งตั้งแล้ว

คำยืนยันล่าสุด: ผู้ใช้ต้องการวางFrontend/Backendและเทคโนโลยีเว็บbrowserก่อนเลือกหมวดธุรกิจ ให้ใช้ [WEB_STACK.md](WEB_STACK.md) เป็นจุดเริ่มต้น งานFoundation-W0–W4มาก่อนการเปิดfeatureเชิงพาณิชย์ การเลือกบริการนำร่องยังOPEN

## 1. ADR register

| ADR | ข้อเสนอและเหตุผล | ทางเลือก/ต้นทุน | เงื่อนไขทบทวน |
|---|---|---|---|
| ADR-01 | Modular monolithต่อฐานNestJSเพื่อทำtransactionและดูแลได้ง่าย | Microservicesเพิ่มnetwork failure/deploy/observability | ทีมแยกอิสระหรือคอขวดที่วัดได้ |
| ADR-02 | PostgreSQLร่วมโดยมีเจ้าของข้อมูล/tenant scope ไม่แยกจังหวัด | DBต่อtenantแยกได้มากแต่migration/opsสูง | isolation/compliance/scaleต้องการจริง |
| ADR-03 | Durable outbox/jobsในDBเริ่มต้น แยกWorker | Brokerแยกเหมาะเมื่อthroughput/routingซับซ้อน | backlog/DBloadหรือqueuefeaturesจำเป็น |
| ADR-04 | Object storageและvideo serviceเฉพาะ | เก็บbinaryในDB/ทำtranscodingเองเพิ่มภาระ | ต้นทุนหรือข้อจำกัดข้อมูล/บริการเปลี่ยน |
| ADR-05 | รุ่นแรกcheckoutต่อร้าน เพื่อครบวงจรก่อน | Multi-vendor paymentครั้งเดียวต้องallocation/refundมากขึ้น | productยืนยันความสำคัญข้ามร้าน |
| ADR-06 | Server-side grantsตามbusiness/area/service/action | roleเดียวง่ายแต่กว้างเกิน | ปรับschemaจากtests/requirements |
| ADR-07 | Payment adapter/inbox/journalแยกdomain status | ผูกproviderโดยตรงเริ่มเร็วแต่ย้ายและreconcileยาก | providerความสามารถ/เงื่อนไขเลือกแล้ว |

สถานะทั้งหมด PROPOSED. ADRแต่ละข้อเมื่อยอมรับต้องบันทึกผู้ตัดสินใจ วันที่ ผลกระทบ และmigrationที่เกี่ยวข้อง ไม่เปลี่ยนเป็นACCEPTEDโดยอัตโนมัติจากการสร้างเอกสาร

## 2. Open decisions

| ID | ต้องตัดสินใจ | ข้อเสนอ/ผลกระทบ |
|---|---|---|
| OPEN-01 | บริการรุ่นนำร่อง | ผู้ใช้ให้ทำFrontend/Backend foundationก่อน; ยังไม่เลือกบริการ |
| OPEN-02 | จังหวัด/ร้าน/ที่พักนำร่อง | ภาพเชียงใหม่ไม่ถือเป็นการเลือกจริง |
| OPEN-03 | ทีม งบลงทุน งบเดือน วันเป้าหมาย | บล็อกการเลือกทรัพยากร/commitวันส่ง |
| OPEN-04 | Provider/region/domain | บล็อกadapter contractขั้นสุดท้ายและstaging |
| OPEN-05 | hold expiry/cancellation/refund/fee | บล็อกsettlement semanticsเงินจริง |
| OPEN-06 | Creator500นับอย่างไรและรวมแต้มไหม | ยืนยันเฉพาะthreshold; mutual/reviewเป็นข้อเสนอ |
| OPEN-07 | RPO/RTO/load/retention | บล็อกcapacityและแผนbackupที่รับรองได้ |
| OPEN-08 | เจ้าหน้าที่support/security/finance | ต้องมีownerก่อนเปิดจริง |

ส่วนที่เดินหน้าต่อได้โดยไม่รอทั้งหมด: evidence inventory, testsของกฎที่ชัด, mappingข้อมูล, threat model,contract drafts. ไม่สร้างCloudที่มีค่าใช้จ่ายหรือใช้อัตราค่าธรรมเนียมจากภาพเป็นของจริง

## 3. Backlog เฟส0–1

| ID | งานและผู้รับผิดชอบตามหน้าที่ | Dependency | ผลส่งมอบ/เกณฑ์ตรวจรับ |
|---|---|---|---|
| A0-01 | Backend+QA ตรวจbaselineปัจจุบัน | ไม่มี | feature→route→API→table→test พร้อมผลจริงและgap |
| A0-02 | Product กฎและขอบเขตรุ่นแรก | OPEN-01/02/05 | versioned rule catalog + happy/error paths |
| A0-03 | Backend transaction race review | A0-01 | hold/payment/cancel lock orderและconcurrency tests |
| A0-04 | Security permission inventory | A0-01 | endpoint/action/scope matrixและnegative tests |
| A0-05 | Architect data migration mapping | A0-01/02 | store→business/branch,ledger plan,compatibility |
| A0-06 | Product+Infra workload/cost worksheet | OPEN-03/07 | SLO/workload/งบที่รับทราบและprovider shortlist |
| A1-01 | Backend identity & grants | A0-04/05 | verification/recovery/MFA/revocation,scoped tests |
| A1-02 | Backend durable jobs/outbox | A0-03/05 | expiryไม่มีrequestก็ทำงาน,lease/retryไม่ซ้ำ,failed jobs |
| A1-03 | Backend payment provider adapter | A0-02/03 + OPEN-04/05 | signedinbox,duplicate/latepayment,reconcileในsandboxจริง |
| A1-04 | QA CI+browser coverage | A0-01 และงานfeature | isolatedDB/fixtures,auth/order/booking/errorflow |
| A1-05 | Infra staging+observability | OPEN-03/04/07 + A1-01 | นอกเครื่องเข้าได้,secretsแยก,alert/restore/rollbackซ้อม |
| A1-06 | Product+QA pilot review | A1-01–05 | ทุกrelease gateมีหลักฐานและownerก่อนgo-live |

ลำดับทำจริงให้เริ่มA0-01 → A0-03/A0-04ตามความเสี่ยง โดยไม่รอการสร้างหน้าใหม่ทุกหน้า เอกสารนี้ยังไม่ได้ดำเนินงานเหล่านี้หรือแต่งตั้งทีม

## 4. Traceability matrix ตั้งต้น

| Requirement | Design owner | Test | Backlog |
|---|---|---|---|
| Tenant/area isolation | Identity+Businesses | ร้านA/BและAdminพื้นที่A/B read/write/export/file | A0-04,A1-01 |
| Foodzoneไม่ปิดหมวดอื่น | Geography+Food | outsidezoneห้ามinstantfoodแต่จองทริปได้ | A0-02,A1-04 |
| ไม่ขายเกินจำนวน | Inventory/Trips/Stays | สองrequestแย่งหน่วยสุดท้าย | A0-03 |
| Duplicateเงินไม่ซ้ำ | Payments+Accounting | webhook/keyเดิมซ้ำ10ครั้ง journalผลเดียว | A1-03 |
| Latepaymentไม่ฟื้นholdผิด | Domain+Payments | expiryแข่งsettlement,เงินเข้าexceptionที่ตรวจได้ | A0-03,A1-03 |
| Driverคนเดียวต่อjob | Dispatch | acceptพร้อมกัน/offerหมดอายุ | เฟสDriverถัดไป |
| Creator500 | Creator | 499/500/duplicatefriend/reversal | เฟสCreatorถัดไปหลังOPEN-06 |
| กู้ระบบได้ | Infra | restoreและrollbackวัดเวลา | A1-05 |

## 5. Prompt ลงมือรอบถัดไป

```text
MODE: AUDIT / BASELINE
โครงการ: /Users/3designs/ThinThai-Turism Platform
อ่าน docs/architecture-planning/baseline-v0.1/README.md และเอกสารที่ลิงก์
ใช้ docs/phase-0-1 เป็นหลักฐานเดิม ไม่ถือว่าข้อเสนอเท่ากับimplementation

งานเดียว: A0-01 ตรวจbaselineปัจจุบันและสร้างfeature evidence matrix
ตรวจworking treeและrepo instructionsก่อนเริ่ม รักษางานผู้ใช้อื่นทั้งหมด
ตรวจcustomer auth,merchant review,products,orders,trips,holds,payments
ผูกแต่ละflowกับroute/API/table/provider/testและระบุreal/mock/missing
เลือกทดสอบที่เหมาะสมในenvironmentแยก ห้ามใช้DBลูกค้าหรือเปิดsandboxบนproduction
หากมีการรันทดสอบที่setupต้องเขียนข้อมูล ให้ยืนยันว่าเป็นtestDBที่แยกจริงก่อน
ไม่อ่านหรือเผยsecret ไม่deploy ไม่แก้businesscodeนอกขอบเขตaudit
ห้ามอ้างผลทดสอบเก่าแทนการรันปัจจุบัน

ผลส่งมอบ: feature matrix,คำสั่ง/ผลทดสอบจริง,risksจัดลำดับ,
ความขัดแย้งระหว่างdocsกับcode และรายการA0-03/A0-04ที่ควรทำต่อ
ถ้าtool/dependencyขาด ให้ระบุสิ่งที่ตรวจไม่ได้และทำส่วนread-onlyต่อ
จบเมื่อทุกflowที่กำหนดมีหลักฐานหรือระบุmissingพร้อมเหตุผล
```

## 6. วิธีรักษาเอกสารให้ตรงระบบ

ทุกงานอ้างrequirement/ADR IDและเพิ่มหลักฐานทดสอบในPR/รายงาน. แบบเป้าหมายกับobserved inventoryแยกส่วน. เมื่อpolicyเปลี่ยนมีeffective dateและผู้ยืนยัน. ไม่ใช้Promptใหม่ลบล้างกฎเก่าโดยไม่แก้source-of-truth. เอกสารphase0–1เดิมยังใช้ได้ หากพบขัดกันให้สร้างdecisionบันทึก ไม่เลือกข้อใดเงียบ ๆ
