# ThinThai — Browser-first Frontend / Backend Blueprint

วันที่8ตุลาคม2026 · ขอบเขตยืนยัน: วางFrontend/Backendและเทคโนโลยีที่เกี่ยวข้องก่อน เพื่อทำเว็บแอปผ่านbrowserบนอุปกรณ์หลายประเภท เน้นทันสมัยและปลอดภัย

นี่คือโครงสร้างเป้าหมาย ยังไม่ได้สร้างfolder/featureตามต้นไม้ทั้งหมด ไม่ติดตั้งpackageหรืออัปเกรดframeworkในรอบออกแบบนี้

## 1. แนวทางที่เลือกเป็นฐานเสนอ

**Responsive Web App + Progressive Enhancement + PWAเมื่อพร้อม**

เปิดURLผ่านbrowserได้โดยไม่ต้องติดตั้งก่อน PWAเพิ่มการติดตั้งและofflineบางส่วนตามcapabilityของเครื่อง ไม่รับรองว่าทุกbrowserรองรับpush,background sync,continuous locationและLive captureเท่ากัน ต้องทดสอบและมีfallback

ชุดเป้าหมาย: Android/Chrome, iPhoneและiPad/Safari, Windows/Chrome+Edge+Firefox, macOS/Safari+Chrome; Linux/Chrome+Firefoxทดสอบcoreflow. ใช้browserรุ่นstableล่าสุดและรุ่นก่อนหน้าที่frameworkรองรับเป็นนโยบายร่าง ต้องบันทึกversionจริงในtest matrixก่อนrelease. ไม่สัญญารองรับbrowserเก่าทุกเวอร์ชัน

Driverผ่านbrowserเริ่มด้วยforeground operation+ตำแหน่งล่าสุด/เวลาอัปเดต หากปิดหน้าจอแล้วตำแหน่งไม่อัปเดต ให้เห็นstale/offlineและหยุดใช้ตำแหน่งนั้นตัดสินใจ ห้ามอ้างว่าติดตามเบื้องหลังได้ตลอดเหมือนnativeโดยไม่มีผลทดสอบ

## 2. Technology matrix

| ชั้น | ฐานเสนอ | เหตุผลและขอบเขต |
|---|---|---|
| Frontend | Next.js App Router + React + TypeScript | ต่อจากrepoเดิม หน้าpublicใช้server rendering; interactiveส่วนจำเป็นใช้client |
| UI | CSS design tokens + CSS Modules/stylesheetที่จัดขอบเขต + semantic components | ใช้ของเดิมก่อน ไม่เปลี่ยนทั้งแอปเป็นUIframeworkใหม่เพื่อความทันสมัยอย่างเดียว |
| Design system | packages/ui พร้อมform/table/dialog/navigation/feedback | ตรวจkeyboard,focus,contrast,large text และresponsive |
| ภาษา | packages/i18n + browserlocale + Intl formatting | ไทย/อังกฤษเป็นเป้าหมายเริ่มต้น; ผู้ใช้overrideได้ ไม่ใช้AIเดาภาษาเครื่อง |
| Client data | typed fetch wrapper + API contracts | เริ่มง่าย; เพิ่มquery libraryเมื่อcache/retry/invalidationซับซ้อนจริง |
| Backend | NestJS + TypeScript บนNodeสายที่รองรับ | module/guards/services/adapters; validateconfigและDTO |
| Validation | Zodที่มีอยู่ + shared public DTOเท่าที่ปลอดภัย | backendvalidateซ้ำเสมอ ไม่แชร์DBmodel/secretเข้าbrowser |
| API | REST /api/v1 + OpenAPI | contract,error,pagination,idempotencyร่วมทุกsurface |
| Database | PostgreSQL managedเมื่อdeploy; PostGISเมื่อเพิ่มพื้นที่จริง | transaction,constraints,indexes; queryผ่านpgที่มีอยู่และparameterized SQL |
| Jobs | Worker + PostgreSQL outbox/jobsเสนอเริ่มต้น | durable,retry,leaseและdedup; brokerแยกเมื่อจำเป็น |
| Files | S3-compatible object storage + CDN | publicmediaแยกprivateเอกสารและproof |
| Realtime | SSEหรือWebSocketเลือกตามทิศทางข้อมูล; polling fallback | backendauthorizeทุกchannel/reconnect,ไม่ใช้socketmessageแทนtransaction |
| PWA | manifest,service workerที่ออกแบบcache policy | manifestเดิมไม่แปลว่าoffline/pushพร้อมแล้ว |
| Test | testsเดิม + isolatedDB + browser testsบนChromium/Firefox/WebKit | เพิ่มdeviceจริงโดยเฉพาะSafari/push/location |
| Operations | CI,observability,secrets,backups,compatibledeploy | runtimeversion/patchตรวจsupportและadvisoryก่อนล็อก |

OBSERVED manifest ณ รอบนี้: Next16.3.8, React19.3.0, Nest12.1.2, Node>=24<25; เป็นสิ่งที่ระบุในไฟล์ ไม่ใช่ข้อรับรองversionล่าสุดหรือปลอดช่องโหว่ ต้องตรวจlockfile,installedversions,compatibilityและadvisoryก่อนเปลี่ยน dependency

ORM/Tailwind/Redis/Kubernetesไม่ใช่ข้อบังคับของระบบนี้ เลือกเพิ่มเมื่อมีประโยชน์และต้นทุนชัดเจน

## 3. โครงสร้างFrontendเป้าหมาย

```text
apps/web/
  app/
    (public)/           Home, discovery, catalog, trips, stays, content
    (auth)/             sign-in, signup, verification, recovery
    (customer)/         account, orders, bookings, rewards
    partner/            business switcher, products, bookings, staff
    driver/             eligibility, offers, active job, earnings
  features/
    identity/ commerce/ trips/ stays/ food/ creator/
  components/           app-specific composition
  lib/
    api/                typed client, error handling, request IDs
    server/             server-only configuration/helpers
  public/               original branding and public static assets

apps/admin/
  app/                  scoped operations UI, separate staff entry
  features/             moderation, geography, finance, permissions

packages/ui/            shared tokens and accessible primitives
packages/contracts/    public request/response/event definitions
packages/i18n/         translation dictionaries and formatting
packages/config/       shared non-secret build/type conventions
```

Next route groupsในวงเล็บไม่เพิ่มURL path; วางหน้าHomeเพียงจุดเดียว อย่าสร้างpageซ้ำrootขณะย้าย. Auth UIไม่ต้องซ้ำในทุกsurface; protectedlayoutsช่วยUXแต่APIยังต้องauthorizeเอง. Adminแยกแอปเป็นtargetตามscaffoldเดิม แต่ไม่ต้องแยกdeploymentทุกส่วนตั้งแต่แรก

Design systemครอบคลุมสี/spacing/type/large controls/loading/empty/error/offline/no-permission. สร้างtokenจากbrandassetจริง ไม่ใช้ภาพgeneratedเป็นsourcecode. Feature-specific componentsอยู่features; sharedUIไม่รู้businessrulesหรือimportserver modules

## 4. โครงสร้างBackendเป้าหมาย

```text
apps/api/src/
  main.ts
  app.module.ts
  config/               typed validated configuration
  common/               request IDs, error mapping, security boundaries
  modules/
    identity/ access/ businesses/ geography/
    catalog/ commerce/ trips/ stays/ food/
    dispatch/ rides/ services/
    payments/ accounting/ creator/ content/
    notifications/ support/ audit/
  infrastructure/
    database/           pool, transaction runner, migration interfaces
    storage/            authorized upload/download adapters
    providers/          payment, maps, messaging, video adapters

apps/worker/src/        bootstrap, claim loops, schedulers, handlers
packages/domain/       server-side shared transitions/value rules
database/migrations/   additive migrations, data migration records
tests/                 unit, access, integration, browser, concurrency
```

ตัวอย่างภายในmodules/stays: controllerรับHTTP → application serviceประสานusecase/transaction → domainตรวจtransition/ราคา → repositoryอ่านเขียนDB. Provideradapterแยกจากdomainและmocktest. อย่าสร้างไฟล์เปล่าทุกโมดูลแล้วนับเป็นฟังก์ชันเสร็จ ให้เพิ่มตามvertical slice

## 5. Browser security และcache contract

- เสนอsame-origin `/api` gatewayสำหรับwebแต่ละsurface ใช้Secure+HttpOnly cookieและSameSiteที่เหมาะสม ตรวจCSRF/Originสำหรับmutation; อย่าใช้localStorageเก็บsessiontokenระยะยาว
- หากAdminใช้คนละorigin ให้ออกแบบlogin/sessionและCORSallowlistชัด ไม่ใช้wildcardกับcredentialsหรือsharedparentdomaincookieโดยอัตโนมัติ
- Sessionตรวจ/เพิกถอนฝั่งserver; MFAstaff; authorizationในAPIทุกresource. Reverse proxyไม่ถือเป็นการอนุญาตสิทธิ์
- Private account/payment/admin responsesเป็นno-store; cachepubliccatalogได้โดยไม่ใช้cacheตัดสินราคา/จำนวนสุดท้าย
- Service workercacheเฉพาะasset/publicข้อมูลที่อนุญาต ห้ามcacheเอกสารส่วนตัวและpaymentresponsesแบบเหมารวม; logoutล้างข้อมูลผูกบัญชีที่device
- Offlineแสดงสถานะชัด เก็บdraftที่ไม่อ่อนไหวได้ แต่ห้ามแสดงจองหรือชำระสำเร็จก่อนserverยืนยัน และไม่replayการจ่ายเงินเงียบ ๆ
- CSP/security headers,parameterizedSQL,inputvalidation,uploadchecksและsanitizedrenderingทำงานร่วมกัน ไม่มีframeworkใดทำให้ปลอดภัยโดยอัตโนมัติ

## 6. Foundation plan ที่เริ่มก่อนเลือกบริการนำร่อง

| งาน | สิ่งที่จะสร้างในขั้นลงมือ | เกณฑ์ตรวจรับ |
|---|---|---|
| W0 Baseline | ตรวจbuild/tests/installedversionsและเส้นทางปัจจุบัน | มีผลจริง ไม่รีเซ็ตงานค้าง |
| W1 Contracts & boundaries | APIerror/types,configvalidation,moduleimports,health/readiness | ไม่มีsecretในclientbundle; failedconfigหยุดอย่างชัดเจน |
| W2 Responsive shell | Customer/Partner/Driver/Admin layoutsและsharedUI | keyboard+320pxขึ้นไปไม่มีเนื้อหาสำคัญหลุด; tablet/desktopใช้งานได้ |
| W3 Secure identity | session/recovery/MFA/grantsและprotectedAPI | crossbusiness/area/actionและrevocationtestsผ่าน |
| W4 Platform services | DBtransaction/outbox/storage/observability | retryไม่ซ้ำ,ไฟล์privateอ่านข้ามเจ้าของไม่ได้,alertตรวจได้ |
| W5 Staging readiness | CIbrowsermatrix,deploy/backup/restore | environmentแยก,smokeและrestoreมีหลักฐาน |

W0เริ่มได้ทันทีในงานถัดไป; W1–W4ทยอยทำตามdependencyและคงrouteเดิมระหว่างย้าย. W5ต้องมีงบ/Cloud/region/domainก่อนจัดสรรจริง หลังฐานพร้อมจึงเลือกmoduleธุรกิจแรกมาทำครบวงจร

## 7. Browser acceptance matrix

Coreflows: เปิดหน้าpublic,ค้นหา,login/recovery,formvalidation,account,ซื้อ/จองตามscopeต้องทำงานด้วยbrowserปกติ. Featureตรวจcapability: install,push,camera,geolocation,Live. มีfallbackเช่นเลือกหมุดเอง อัปโหลดไฟล์จากเครื่อง หรือแสดงnotificationในแอป ไม่แสดงcontrolที่ทำไม่ได้โดยไม่มีคำอธิบาย

PlaywrightWebKitไม่ใช่การรับรองSafariบนiPhoneจริง ต้องมีdevicecheckสำหรับkeyboard/safearea/camera/permission/background. ทดสอบnetworkช้า,rotate,zoom,large text,sessionหมดอายุและreloadระหว่างmutationด้วย

## 8. อ้างอิงทางการ

- [Next.js browser support](https://nextjs.org/docs/architecture/supported-browsers) — ตรวจversion supportและfeatureเพิ่มเติมก่อนrelease
- [NestJS Authorization](https://docs.nestjs.com/security/authorization) — authenticationกับauthorizationเป็นคนละส่วน ต้องกำหนดpolicyของThinThaiเอง
- [MDN PWA progressive enhancement](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/What_is_a_progressive_web_app) — เว็บปกติเป็นฐาน เพิ่มความสามารถตามbrowser
- [MDN background operation](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Offline_and_background_operation) — background APIsมีข้อจำกัด ไม่ใช่processที่ทำงานตลอดเวลา

ก่อนแก้Next.js codeต้องอ่านคู่มือที่ติดตั้งในnode_modulesตามapps/web/AGENTS.md ไม่มีการแก้Next.js codeในงานเอกสารครั้งนี้
