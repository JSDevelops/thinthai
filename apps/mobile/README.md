# ThinThai Mobile (พัฒนาด้วย Flutter)

แอปพลิเคชันมือถือ **ThinThai (เที่ยวไทยให้ถึงถิ่น)** ที่ได้รับการพัฒนาอย่างสมบูรณ์แบบ ถ่ายทอดเอกลักษณ์ภูมิปัญญาท้องถิ่นไทย ผสานความทันสมัยด้วย **Material 3 + iOS Cupertino Smooth Physics** เพื่อให้ได้ "อารมณ์และสัมผัสการใช้งานที่ดีที่สุด (Tactile & Emotional UX)"

---

## 🎨 เอกลักษณ์การออกแบบ (Design Philosophy & Emotional UX)

1. **Thai Heritage & Warm Earthy Palette:**
   - **Primary Teal:** `#00695C` (เขียวมรกตธรรมชาติ / นกยูงไทย สื่อถึงธรรมชาติอันอุดมสมบูรณ์)
   - **Accent Terracotta:** `#D37827` (ส้มอิฐดินเผา สื่อถึงความอบอุ่นและการต้อนรับของชุมชน)
   - **Warm Gold:** `#FFC578` (สีทองอร่าม สื่อถึงคุณค่าและภูมิปัญญา)
   - **Warm Silk Surface:** `#FFF9F1` & `#F6F7F3` (พื้นหลังโทนเยื่อกระดาษสา/ผ้าฝ้ายธรรมชาติ สบายตา)

2. **Micro-interactions & Tactile Feeling (อารมณ์การใช้งานที่ลื่นไหล):**
   - **HapticTap Feedback:** ทุกการสัมผัสปุ่มหรือการ์ดจะมีการย่อขยายแบบ Spring Physics (0.96x) ควบคู่กับการสั่น Haptic เบา ๆ เสมือนปุ่มจริง
   - **Floating Pill Navigation Bar:** แถบเมนูลอยทรงแคปซูล 5 แท็บ ปรับขนาดและสถานะด้วย `Curves.easeOutCubic` พร้อมป้ายแจ้งเตือน (Badges) สำหรับตะกร้าสินค้าและการจอง
   - **Parallax Slivers & Blur Effects:** แถบภาพปกทริปขยาย-หดได้เมื่อเลื่อนหน้าจอ พร้อมปุ่ม Glassmorphism ป้องกันการบดบังภาพถ่าย
   - **Interactive Booking Sheet & PromptPay QR:** เลือกระบุวันเดินทาง จำนวนคน พร้อมคิดยอดรวมและจำลองการจ่ายเงินผ่าน PromptPay QR ทันที บันทึกลงในระบบการจองแบบ Real-time

---

## 📱 หน้าจอและการทำงานหลัก (Screens & Features)

1. **HomeScreen (หน้าแรก):**
   - ค้นหาแบบ Real-time พร้อมปุ่มเคลียร์ข้อความ
   - หมวดหมู่แบบ Interactive Chips (ทั้งหมด, โฮมสเตย์, หัตถกรรม, อาหารพื้นบ้าน, ธรรมชาติ)
   - แบนเนอร์ไฮไลต์ประจำสัปดาห์
   - ชุมชนแนะนำ แตะเพื่อเปิดดูประวัติและภูมิปัญญาชุมชนได้ทันที
   - รายการทริปยอดนิยมพร้อมคะแนนรีวิว, ป้ายรับรองชุมชน, และปุ่มกดบันทึกทริป (Bookmark)

2. **TripDetailScreen (หน้ารายละเอียดทริป):**
   - Parallax Sliver AppBar พร้อมปุ่มย้อนกลับและบันทึก
   - ป้ายรับรองผู้นำทางชุมชน (Verified Community Host Badge) แตะเพื่อไปยังหน้าชุมชน
   - ไทม์ไลน์กำหนดการเดินทางแบบ Day-by-Day (Itinerary)
   - สิ่งที่ต้องเตรียมตัวและคำแนะนำ (Packing Tips)
   - แถบความยั่งยืน (บอกจำนวนต้นไม้ที่ร่วมปลูก และสัดส่วนรายได้ที่ส่งตรงถึงชาวบ้าน)
   - รีวิวจากนักเดินทางจริงพร้อมภาพถ่าย
   - Sticky Booking Bar ด้านล่างพร้อมปุ่ม "จองทริปตอนนี้"

3. **CommunityDetailScreen (หน้ารายละเอียดชุมชน):**
   - ประวัติความเป็นมา ภูมิปัญญาท้องถิ่น และการอนุรักษ์
   - ข้อมูลติดต่อผู้ประสานงานชุมชน
   - รายการทริปทั้งหมดของชุมชนนั้น ๆ
   - รายการสินค้าและงานคราฟต์ OTOP ของชุมชน

4. **ExploreScreen (สำรวจทริปถึงถิ่น):**
   - คัดกรองตามภูมิภาค (ทุกภาค, ภาคเหนือ, ภาคกลาง, ภาคอีสาน, ภาคใต้, ภาคตะวันออก)
   - ระบบปรับแต่งตัวกรองความต้องการ (Filter Modal) พร้อม Slider ปรับงบประมาณ
   - สลับมุมมองรายการ / แผนที่ (List / Map view toggle)

5. **MarketplaceScreen (ช้อปของดีชุมชน):**
   - เลือกดูงานฝีมือและของฝาก (อาหารและชา, ผ้าทอ, เครื่องหอม, งานจักสาน)
   - ระบบตะกร้าสินค้า (Shopping Cart) เพิ่ม-ลดจำนวนสินค้า
   - ชำระเงินผ่าน PromptPay QR พร้อมส่งรายได้ถึงชาวบ้าน 100%

6. **BookingsScreen (การจองและตั๋วเดินทาง):**
   - ตั๋วทริปที่กำลังจะมาถึง พร้อม **QR Code Pass** สำหรับเช็กอินกับผู้นำทางชุมชน
   - ปรับปรุงข้อมูลอัตโนมัติเมื่อกดจองทริปใหม่
   - ปุ่มโทรติดต่อผู้ดูแลชุมชนและเปิดแผนที่นำทาง

7. **ProfileScreen (พาสปอร์ตนักเดินทางชุมชน):**
   - พาสปอร์ตนักเดินทางพร้อมระดับและตราสัญลักษณ์ (Local Champion Badge)
   - มาตรวัดความยั่งยืน: จำนวนชุมชนที่สนับสนุน, จำนวนต้นไม้ที่ช่วยปลูก, ยอดเงินคืนสู่ชุมชน
   - ระบบสะสมตราประทับชุมชนเสมือนจริง (Passport Stamps) พร้อมรายละเอียดแต่ละตรา
   - ชีตเปิดดูทริปที่บันทึกไว้ (Saved Wishlist)

---

## 🏛️ สถาปัตยกรรมซอร์สโค้ด (Architecture)

```text
apps/mobile/
├── pubspec.yaml                 # กำหนด dependencies (google_fonts, intl, cupertino_icons)
├── README.md                    # เอกสารประกอบการใช้งาน
├── test/
│   └── app_state_test.dart      # Unit test ตรรกะ Bookmark, Booking, และ Cart
└── lib/
    ├── main.dart                # ทางเข้าแอปพลิเคชัน (MaterialApp + Theme)
    ├── core/
    │   └── theme/
    │       ├── app_colors.dart      # โทนสีอัตลักษณ์ ThinThai
    │       ├── app_typography.dart  # ฟอนต์โมเดิร์นภาษาไทย
    │       └── app_theme.dart       # Material 3 Theme Configuration
    ├── models/
    │   ├── trip_model.dart          # โครงสร้างทริป, แผนการเดินทาง (Itinerary)
    │   ├── community_model.dart     # ชุมชน, สินค้า OTOP, การจอง, ตะกร้าสินค้า
    │   └── passport_badge_model.dart# ตราประทับพาสปอร์ตและรีวิว
    ├── data/
    │   └── mock_data.dart           # ฐานข้อมูลจำลองชุมชนจริง 4 ภาค
    ├── state/
    │   └── app_state.dart           # Reactive State Manager (Bookmarks, Bookings, Cart, Impact)
    ├── widgets/
    │   ├── haptic_tap.dart          # สัมผัสการกดแบบสปริงและแรงสั่น
    │   ├── floating_nav_bar.dart    # แถบเมนูลอยตัว 5 แท็บพร้อม Badges
    │   ├── trip_card.dart           # การ์ดทริปพร้อม Bookmark toggle
    │   ├── category_chips.dart      # แถบเลือกหมวดหมู่แนวนอน
    │   ├── promptpay_qr_card.dart   # การ์ดแสดงผล PromptPay QR มาตรฐานไทย
    │   ├── filter_bottom_sheet.dart # ตัวกรองงบประมาณและภูมิภาค
    │   ├── passport_stamp_widget.dart# ตราประทับชุมชนกราฟิกวินเทจ
    │   └── booking_bottom_sheet.dart# ชีตจองทริปพร้อม PromptPay และบันทึกอัตโนมัติ
    └── screens/
        ├── main_scaffold.dart       # โครงสร้างหน้าจอหลักพร้อม IndexedStack
        ├── home_screen.dart         # หน้าแรก (Search, Category, Featured, Lists)
        ├── trip_detail_screen.dart  # หน้ารายละเอียดทริปและกำหนดการ
        ├── community_detail_screen.dart # หน้าเรื่องเล่าและประวัติชุมชน
        ├── explore_screen.dart      # หน้าค้นหาและคัดกรองตามภูมิภาค
        ├── marketplace_screen.dart  # ช้อปของดีชุมชนและระบบตะกร้า
        ├── bookings_screen.dart     # หน้าตั๋วเดินทางและ QR Code Pass
        └── profile_screen.dart      # พาสปอร์ตนักเดินทางและสถิติความยั่งยืน
```

---

## 🚀 วิธีการทดสอบและรันแอปพลิเคชัน

เมื่อติดตั้ง Flutter SDK บนเครื่องของคุณเรียบร้อยแล้ว:

```bash
cd "apps/mobile"

# 1. ติดตั้ง Dependencies
flutter pub get

# 2. รัน Unit Tests เพื่อทดสอบความถูกต้องของระบบ
flutter test

# 3. รันแอปพลิเคชันบน Simulator หรือ อุปกรณ์จริง
flutter run

# หรือรันเพื่อทดสอบบน Google Chrome / Web Browser
flutter run -d chrome
```
