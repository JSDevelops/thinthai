# ThinThai FOOD — UX/UI concept v1
วันที่: 7 ตุลาคม 2026
เครื่องมือ: built-in image_gen; use case: ui-mockup

## ชุดภาพ
1. thinthai-food-discovery-v1.png — อาหารใกล้คุณ / ร้านและเมนู / เลือกเมนู
2. thinthai-food-order-tracking-v1.png — ตะกร้า / ยืนยันคำสั่งซื้อ / ติดตามอาหาร

## Prompt set / design specification
Part 1: Three complete front-facing smartphone screens on an ivory landscape board, Thai typography, teal #00695C, dark green #123F37, ivory #FFF9F1, gold #F2B66D. ThinThai brand continuity from shopping reference. Delivery address first, delivery/pickup toggle, search, food categories, filters and nearby restaurants. Example vendor ครัวถิ่นเหนือ, delivery25 baht, estimated30–45 minutes. Menu rows basil chicken rice75, chicken fried rice90, Thai tea35. Customization screen selects mild spice and fried egg +15, quantity1, final90; ingredient disclosure, note input and add-to-cart CTA. Photos and business data are mock examples; no ratings or verified claims.
Part 2: Three matching complete smartphone screens. One restaurant and two meals: basil chicken rice with mild spice and egg90, chicken fried rice90, each quantity1. Food180 + shipping25 - discount10 = total195. Cart groups selected meals with editable options and quantities. Confirmation shows masked sample contact, editable address, static destination map explicitly labeled sample, delivery estimate, cash on delivery and final total. Tracking is restaurant accepted and preparing, shipping and completion pending with empty circles, not checkmarks. Payment remains unpaid COD, no live courier location. Contact restaurant and support actions.

## ขอบเขตและข้อสังเกตก่อนเขียนแอป
ภาพแนวทางเท่านั้น ยังไม่ได้แก้โค้ดหรือเชื่อมจัดส่ง ชำระเงิน ติดตามผู้ส่ง หรือส่วนลด
ร้าน บุคคล อาหาร ราคา ที่อยู่ เวลา และสารก่อภูมิแพ้เป็นตัวอย่าง การใช้จริงต้องให้ร้านยืนยันข้อมูล
เก็บเงินปลายทางแสดงเฉพาะร้านที่รองรับ ตรวจราคาตัวเลือก สต๊อก เวลาเปิดร้าน และโซนส่งอีกครั้งที่เซิร์ฟเวอร์
หนึ่งร้านต่อหนึ่งคำสั่งซื้ออาหาร เปลี่ยนร้านต้องแจ้งผู้ใช้ก่อนเปลี่ยนตะกร้า
โซนจัดส่งอาหารไม่ใช้บังคับกับสินค้าพัสดุหรือทริป
เวลาบน status bar และ timeline ในภาพเป็นข้อมูลประกอบ ต้องใช้เวลาจริงที่สอดคล้องกันเมื่อพัฒนา
ก่อนใช้งานจริงตรวจข้อความภาษาไทยและจัดวางด้วยองค์ประกอบ UI จริง ใช้โลโก้ต้นฉบับในโปรเจกต์
