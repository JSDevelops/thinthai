# ThinThai — หมุดถิ่นไทย

สัญลักษณ์หมุดทรงมน ช่องว่างรูปบ้าน สื่อถึงการเดินทางเข้าถึงชุมชน ตัวอักษร ThinThai วาดเป็นเส้นเวกเตอร์ ไม่มีการอ้างอิงฟอนต์ภายนอกในไฟล์โลโก้

## ไฟล์และการใช้งาน

- logo.svg: โลโก้หลักสีเขียวบนพื้นขาว/ครีม
- logo-reverse.svg: สีขาวและทองบนพื้นเข้ม
- logo-white.svg / logo-black.svg: รุ่นสีเดียว
- mark.svg / mark-white.svg / mark-black.svg: สัญลักษณ์เดี่ยว
- logo-transparent.png: PNG โปร่งใส กว้าง 1410 px
- icon-192.png / icon-512.png / icon-1024.png: ไอคอนบนพื้นสีทึบ ไม่ตัดมุมในไฟล์ ให้ระบบปฏิบัติการครอบเอง
- icon-maskable-512.png: เผื่อขอบสำหรับ maskable icon
- favicon.ico: รวม 16, 32, 48 px; icon.svg: favicon เวกเตอร์
- apple-icon.png: 180 px สำหรับหน้าจอหลัก Apple
- brand-board.png / .svg: ภาพรวมการใช้งาน

## สี

เขียว #00695C, ทอง #F2B66D, เขียวเข้ม #123F37, ครีม #FFF9F1

ใช้โลโก้แนวนอนกว้างอย่างน้อย 140 px; พื้นที่เล็กใช้สัญลักษณ์เดี่ยว เว้นรอบโลโก้อย่างน้อยหนึ่งในสี่ความกว้างหมุด ห้ามยืดผิดสัดส่วน ใส่เงา/กรอบตกแต่ง หรือใส่ข้อความเล็กใน favicon

## ติดตั้งแล้ว

หัวเว็บระบบจัดการและหน้า catalog ใช้ Brand component ร่วมกัน Next.js ใช้ app/icon.svg, app/favicon.ico, app/apple-icon.png พร้อม manifest.webmanifest และ theme color

Manifest เตรียมชื่อและไอคอนสำหรับหน้าจอหลัก ยังไม่ได้เพิ่ม service worker/offline หรืออ้างว่าเป็นแอป native

ไฟล์ที่เว็บใช้จริงอยู่ apps/web/public/brand ส่วนไฟล์ metadata อยู่ apps/web/app ส่งออกภาพซ้ำด้วย node scripts/build-brand.mjs หลังแก้ SVG

## การตรวจ

ตรวจโลโก้บน Chrome ที่ desktop 1440, tablet 820, mobile 390, metadata/icon asset URLs และ build Next.js
