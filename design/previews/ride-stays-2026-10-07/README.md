# ThinThai Ride + Accommodation connection — UX/UI v1
วันที่: 7 ตุลาคม 2026
เครื่องมือ: built-in image_gen; use case: ui-mockup

## ภาพส่งมอบ
- thinthai-ride-selection-v1.png: ไปที่ไหน / ยืนยันจุดรับ / เลือกรถ
- thinthai-ride-matching-v1.png: ตรวจสอบ / กำลังหาคนขับ / รถกำลังมารับ
- thinthai-ride-journey-v1.png: ระหว่างเดินทาง / สรุปเที่ยว

## Prompt set / design specification
Identity: ThinThai teal #00695C, dark green #123F37, ivory #FFF9F1, gold #F2B66D, Thai typography, large controls, full front-facing phones in ivory landscape boards. House-pin brand mark, explicit fictional data footer.
Selection: Three phones showing destination entry, hotel address quick actions, pickup pin and notes, then vehicle selection with passenger/luggage capacities and sample ETA/price. Origin บ้านอุ่นใจ โฮมสเตย์ lobby entrance; destination ชุมชนบ้านถิ่น. Two passengers and two small bags; selected white sedan350baht, larger vehicle450 and van700 as unselected examples. Hotel can be pickup or destination; costs separate from lodging/trip booking.
Matching: Three phones showing route/car/cash/quote review, pending driver matching with no assigned driver, and assigned driver arrival view. Fictional driverคุณต้น, plateทะเบียนตัวอย่าง, example location/ETA, contact controls and pickup notes. Cash remains unpaid. No fake verification/reviews.
Journey: Two phones showing illustrative route in progress with share/help controls and arrival summary. Fare350baht includes example service charges. Arrival is complete but cash receipt still pending. Five unselected rating stars, fare summary, report issue and return-home controls. No passenger button pretending to confirm driver receipt.

## ขอบเขต
ภาพออกแบบเท่านั้น ยังไม่ได้แก้โค้ดหรือเชื่อมแผนที่จริง GPS ระบบจับคู่รถ การโทร แชต หรือชำระเงิน
ที่พักใช้เป็นจุดรับ/ปลายทาง ไม่ใช่เพิ่มห้องพักลงคำสั่งซื้อรถ และไม่รวมค่าที่พักหรือทริป
ข้อมูลราคา ความจุ เวลา คนขับ และแผนที่เป็นสมมติ ต้องตรวจจากผู้ให้บริการจริงก่อนใช้งาน
ปุ่มแชร์ต้องให้ผู้ใช้เลือกเอง ตำแหน่งต้องแสดงเวลาที่อัปเดตล่าสุดเมื่อข้อมูลขาดช่วง
พื้นที่บริการรถตั้งค่าแยกจากโซนส่งอาหาร
ก่อนเขียน UI ตรวจข้อความไทย ไอคอนและระยะห่าง ใช้สินทรัพย์โลโก้จริง แผนที่ในภาพไม่ใช่ข้อมูลนำทาง
