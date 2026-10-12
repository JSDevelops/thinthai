# ThinThai Shopping & Live — UX/UI concept v1
วันที่: 7 ตุลาคม 2026
สร้างด้วย built-in image_gen (ui-mockup) โดยอ้างอิงภาพแนวทาง ThinThai ในบทสนทนา

## ภาพส่งมอบ
- thinthai-shopping-flow-v1.png: ช้อป/Live carousel → รายละเอียดสินค้า → ตะกร้าแยกร้าน → ตรวจสอบคำสั่งซื้อ → ผลการสั่งซื้อ
- thinthai-live-shopping-v1.png: รับชม Live และแผงเลือกสินค้า

## Prompt set / design specification
Shopping board: Five complete front-facing smartphone screens on an ivory landscape board. ThinThai teal #00695C, dark green #123F37, ivory #FFF9F1, warm gold #F2B66D. Readable Thai labels and large touch targets. Shop includes horizontally swipeable live vendor cards below header, categories and a two-column product grid. Product is a handmade woven bag from ร้านบ้านจักสาน at 350 baht. Basket groups two vendors; only the bag shop is selected, scarf from another shop remains saved and unselected. Checkout adds 40 baht shipping, total 390 baht, cash on delivery. Result shows order submitted, awaiting merchant confirmation, and explicitly not paid. Example reference TT-DEMO-001. No fake verification/rating/payment claims. Mock shops and data clearly labeled. Consistent ThinThai identity from the previous Home/Login/Profile reference.

Live board: Two complete front-facing smartphone screens with the same brand and product. Customer viewer shows a Thai craftswoman demonstrating the bag, shop header, LIVE badge, follow, close, sound and share controls, three short chat comments, pinned product card at 350 baht, comment input and shopping bag. Second screen retains live video above a rounded bottom sheet containing product photo, natural-color choice, quantity stepper, shipping note, add-to-cart and product-details actions. No primary app bottom navigation over immersive video, no real payment QR or success claims.

## ขอบเขต
ภาพแนวทางการออกแบบเท่านั้น ยังไม่ได้เชื่อม Live ระบบชำระเงิน หรือเปลี่ยนโค้ดแอป
ราคา ชื่อร้าน บุคคล ภาพสินค้า และข้อความแชตเป็นตัวอย่าง
สถานะเก็บเงินปลายทางและการรองรับตะกร้าหลายร้านเป็นข้อเสนอ UX ยังต้องพัฒนาความสามารถฝั่งระบบ
ก่อนนำไปเขียน UI ให้ใช้สถานะ pending ที่แยกจาก completed ชัดเจน ตรวจข้อความและไอคอนอีกครั้ง และใช้สินทรัพย์โลโก้จริงของโปรเจกต์
