# ThinThai Trips + Stays — UX/UI concept v1
วันที่: 7 ตุลาคม 2026
สร้างด้วย built-in image_gen (ui-mockup) โดยอ้างอิงแนวทาง ThinThai ในบทสนทนา

## ภาพส่งมอบ 9 หน้าจอ
1. thinthai-trip-discovery-v1.png — ค้นหาทริป / รายละเอียด / เลือกรอบ
2. thinthai-trip-booking-v1.png — ข้อมูลผู้จอง / ตรวจสอบคำขอ / สถานะรอผู้จัดยืนยัน
3. thinthai-stays-v1.png — ค้นหาที่พัก / เลือกห้อง / ตรวจสอบคำขอที่พัก

## Prompt set / design specification
Brand: Three large front-facing smartphone screens per landscape board, thin charcoal frames, ivory background, Thai typography and large touch targets. Teal #00695C, dark green #123F37, ivory #FFF9F1, warm gold #F2B66D. House-in-location-pin ThinThai symbol; fictional properties, prices and imagery. No fake reviews, verification or payment-success claims.
Trips discovery: Search with separate trip/stay tabs, location/date/people filters, authentic northern Thai village imagery. Example เดินชุมชน เรียนงานคราฟต์ by ชุมชนบ้านถิ่น, Chiang Mai, 3hours. Itinerary09:00–12:00, equipment and host included, accommodation/transport excluded. Crosslink to stays explicitly booked separately. Date18October2569, two adults ×650 =1300baht, morning round available and afternoon full, request-first flow.
Trip booking: Contact fields, optional special requests pending host acceptance, itinerary/meeting-point/price review, clear accommodation-not-included panel. Send request leads to pending host acceptance, unpaid state, subsequent payment and final confirmation separate. No QR ticket before final confirmation. Contact host and cancel-request actions.
Stays: Search checkin17October2569, checkout19October2569, two nights, two adults, one room. Fictional บ้านอุ่นใจ โฮมสเตย์, ห้องเตียงใหญ่ วิวสวน,1200baht/room/night, total2400 inclusive of example taxes/fees. Room photo, amenities, checkin14:00 checkout11:00. Example free-cancellation deadline15October2569 at12:00. Review dates/room/guests/contact/special requests and request-first CTA, unpaid, explicitly excludes trip charges.

## ขอบเขตและข้อแก้ไขก่อนพัฒนา
เป็นภาพแนวทาง ยังไม่ได้แก้โค้ด เพิ่มฐานข้อมูลที่พัก หรือเชื่อมการจ่ายเงิน
ร้าน/ชุมชน ภาพ ราคา เงื่อนไข และจำนวนว่างเป็นตัวอย่าง ไม่ใช่ข้อมูลเสนอขายจริง
ทริปและที่พักแยก availability เลขคำขอ ราคา เงื่อนไขยกเลิก และสถานะ แม้แสดงในบัญชีเดียวกันได้
ความจุทริปตรวจเป็นจำนวนคนต่อรอบ ส่วนที่พักตรวจห้องว่างทุกคืนที่เข้าพัก ราคาอาจต่างกันรายคืน
ข้อสังเกตภาพจาก AI: วันในสัปดาห์บนแถบปฏิทินภาพแรกยังไม่ตรงกับวันที่ และภาพสถานะทริปใส่เวลาส่งคำขอ18ต.ค.09:15ซึ่งหลังเริ่มทริป ต้องเปลี่ยนเป็น7ต.ค.2569เมื่อทำต้นแบบที่คลิกได้ ไม่ใช้ข้อความนี้เป็นข้อกำหนดธุรกิจ
ข้อความภาษาไทยและตัวอย่างติดต่อให้ตรวจซ้ำ ใช้ข้อมูลจำลองที่ชัดเจนและโลโก้ต้นฉบับใน UI จริง
