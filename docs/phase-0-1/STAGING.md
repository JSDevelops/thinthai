# Staging และแผนตรวจรับก่อนProduction

ยังไม่มีการสร้างCloudหรือdeployในรอบนี้ ต้องเลือกบัญชี/region/domain/งบก่อนจัดสรรทรัพยากร

## Environment

แยกฐาน บัญชีบริการ storage และsecretsระหว่างdev/test/staging/prod ไม่มีข้อมูลลูกค้าจริงในtestโดยตรง Managed PostgreSQL private access และleast privilege; API HTTPS; Frontendใช้ API_ORIGINที่ถูกต้อง; migration runnerปัจจุบันจำกัดlocalhost55433 ต้องทำcloud migration workflowใหม่ ห้ามถอดข้อจำกัดโดยไม่แยกtest/prod

## Secrets / configuration

Secret managerแทนrepo; templateไม่ใส่keyจริง; validateค่าที่จำเป็นเมื่อstartup. sandbox paymentsปิดบนstaging/prod; payment test providerต้องเป็นadapterจริงแยกจากsimulate endpoint. ALLOW_PROD_ROLLOUTเพียงflagไม่ใช่security gate. สำหรับwebhookต้องมีroute/body/signature handlingต่างจากbrowser-origin middlewareเดิมโดยไม่ลดการป้องกันrouteอื่น

## Delivery pipeline

CI: install lockfile→format/typecheck/unit→isolated PostgreSQL integration→build. เพิ่มbrowser E2Eสำหรับauth/ซื้อ/จอง/ยกเลิกพร้อมfixtureแยก. ก่อนdeploy: backup→migrationแบบexpand→deploy→health/smoke→เฝ้าดู; rollbackแอปต้องใช้schemaที่เข้ากันได้ ห้าม down migrationที่ทำลายข้อมูลแบบอัตโนมัติ

## Observability

Request/correlation ID; logsตัดpassword/token/OTP/contact; metrics APIerror/latency/DBpool/slowqueries/workerlag/paymentpending; alertมีเจ้าของและrunbook. ไม่บันทึกsecretในerrorresponse

## Backup / incident

ตกลง RPO(ข้อมูลสูญหายสูงสุด)และRTO(เวลาฟื้นสูงสุด)ตามงบก่อนเลือกแผน; สำรองDB+WAL/PITR และobject storage; จำกัดสิทธิ์ลบbackup; restoreไปenvironmentแยกแล้วตรวจจำนวน/ความสัมพันธ์/ธุรกรรม ไม่อ้างว่ามีbackupเท่ากับกู้ได้. ฝึกกู้ระบบและตรวจหลักฐานรายงานก่อนgo-live

## Acceptance checklist — ยังไม่ผ่านจนมีหลักฐาน

- [ ] เจ้าของและAdminใช้MFA/recoveryที่ทดสอบได้
- [ ] Testข้ามtenant/area/action/fileผ่าน
- [ ] จองพร้อมกัน/หมดอายุ/จ่ายล่าช้า/ยกเลิกผ่าน
- [ ] webhookตรวจsignature/dedup/retryผ่าน
- [ ] Refundและsettlementกระทบยอดได้
- [ ] Restoreและrollbackซ้อมสำเร็จพร้อมเวลาที่วัด
- [ ] Monitoringแจ้งเหตุถึงผู้รับผิดชอบ
- [ ] Load testตามconcurrency/transactions/mediaที่ตกลง (ยังไม่กำหนดตัวเลขความจุ)
- [ ] เจ้าของผลิตภัณฑ์ตรวจรับเส้นทางครบทั้งลูกค้า/Partner/Admin

ฟังก์ชันใหม่เปิดเป็นรายพื้นที่/กลุ่มด้วยfeature flagsที่Backendควบคุม แยกfoodzoneจากบริการอื่น; เงื่อนไขข้อมูลส่วนตัว/การเงิน/การขนส่งให้ผู้รับผิดชอบตรวจข้อกำหนดที่ใช้จริงก่อนเปิด
