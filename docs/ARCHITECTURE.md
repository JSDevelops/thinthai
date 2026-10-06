# สถาปัตยกรรมตั้งต้น

Web และ Admin ติดต่อ API ผ่านสัญญา API ไม่เชื่อมฐานข้อมูลโดยตรง API แบ่งโมดูลและจัดการธุรกรรม Worker ทำงานช้าผ่านคิวและ Outbox ข้อมูลสำคัญอยู่ PostgreSQL ส่วนไฟล์อยู่ Object Storage เมื่อเชื่อมจริง

packages/domain รองรับกฎร่วมของ API และ Worker ฝั่งเซิร์ฟเวอร์ packages/contracts เป็นข้อมูลที่เผยแพร่ได้ ไม่ export secret หรือ database connection ไปยังเว็บ

API modules: identity, communities, content, merchants, catalog, booking, commerce, food-delivery, payments, payouts, promotion, support, audit

ทุกโมดูลต้องกำหนดเจ้าของข้อมูล การเปลี่ยนสถานะ และการตรวจสิทธิ์ ยังไม่แยก Microservices และไม่ shard ตามจังหวัดตั้งแต่ต้น เพิ่ม cache, read replica, search และ data warehouse เมื่อมีผลวัดรองรับ

รูปแบบส่งมอบ: instant_food_delivery, parcel_delivery, pickup, service_booking จำกัดโซนเฉพาะแบบแรก การปิดโซนไม่เปลี่ยนรายการเก่าโดยอัตโนมัติ
