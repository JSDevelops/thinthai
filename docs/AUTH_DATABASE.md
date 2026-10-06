# บัญชีและฐานข้อมูล

## โครงสร้าง
- app_users: ชื่อ อีเมลรูปแบบมาตรฐาน password hash และสถานะ active
- auth_sessions: hash ของ token อายุ 8 ชั่วโมง ไม่เก็บ token ดิบในฐานข้อมูล
- store_memberships: สมาชิกของร้านค้า
- system_roles + admin_province_scopes: สิทธิ์ระดับระบบและจังหวัด
- provinces → districts → subdistricts → stores: ความสัมพันธ์พื้นที่พร้อม foreign key
- auth_rate_limits: ตัวนับแบบ atomic ใน PostgreSQL คงอยู่หลัง restart
- audit_events: การสมัคร เข้าสู่ระบบสำเร็จ และเปลี่ยนรหัสผ่าน โดยไม่บันทึกรหัสผ่าน/token

## รหัสผ่านและการเข้าถึง
scrypt N=131072, r=8, p=1 พร้อม salt สุ่มแยกแต่ละรหัสผ่านและ timing-safe comparison อ้างอิง [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#scrypt)

รหัสผ่านใหม่ 15–128 ตัวอักษร ไม่ตัดช่องว่างในรหัสผ่าน บัญชีที่ไม่มีอยู่ใช้ dummy hash เพื่อลดความต่างของเวลาตรวจสอบ การเข้าสู่ระบบผิดใช้ข้อความเดียวกัน ไม่รับ role หรือ storeIds ในการสมัคร

คุกกี้ HttpOnly / SameSite=Strict; ตรวจ origin และ action header สำหรับการเขียน; SQL parameterized; body จำกัด 8KB; session อ่านสิทธิ์จากฐานข้อมูลทุกครั้ง การเปลี่ยนรหัสผ่านตรวจการแก้ไขพร้อมกันและยกเลิกทุกเซสชันใน transaction เดียว

จำกัดคำขอ authentication 10 ครั้งต่อ identity / 15 นาที และ 100 ครั้งต่อ IP / 15 นาที นับคำขอสำเร็จด้วยเพื่อจำกัดค่าใช้จ่าย hashing ระบบในเครื่องไม่ trust forwarded headers จึงเห็น IP ของ proxy เดียวกัน ต้องออกแบบ trusted proxy และ rate limit ตามผู้ใช้จริงก่อน deployment

## API
| Method | Path | การทำงาน |
|---|---|---|
| POST | /api/v1/auth/register | name, email, password → USER |
| POST | /api/v1/auth/login | email, password → session |
| POST | /api/v1/auth/password | currentPassword, newPassword → เพิกถอนทุก session |
| POST | /api/v1/logout | เพิกถอน session ปัจจุบัน |
| GET | /api/v1/me | ข้อมูลบัญชีและสิทธิ์ปัจจุบัน |
| GET | /api/v1/stores | ร้านค้าตามสิทธิ์ |
| GET | /api/v1/stores/:id | รายละเอียดร้านที่เข้าถึงได้ |
| GET | /api/v1/food-delivery | ร้านอาหารในพื้นที่สิทธิ์ Admin/Super Admin |

/demo/accounts และ /demo/session ถูกถอดออกแล้ว

## ข้อจำกัดระยะนี้
ยังไม่มีการยืนยันอีเมล/กู้บัญชี/MFA, UI มอบสิทธิ์ผู้ประกอบการ, CRUD ร้าน, PostGIS, โซนจัดส่ง และการชำระเงิน ตาราง audit ยังไม่ใช่ระบบ compliance ครบวงจร ต้องเพิ่ม retention/cleanup ของ rate limit และ audit ก่อนเปิดบริการ ระบบ seed และ DB superuser ที่ใช้ในเครื่องไม่ใช่แบบสิทธิ์ฐานข้อมูลสำหรับ production

Migration runner ใช้ transaction + advisory lock และ checksum ป้องกัน migration เดิมถูกแก้ รันซ้ำโดยไม่ลบข้อมูล รายการ migration ไม่ใช้เป็น seed จึงกำหนดข้อมูลเริ่มต้นแยกได้
