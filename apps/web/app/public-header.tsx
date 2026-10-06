import Brand from './brand';
export default function PublicHeader() {
  return (
    <header className="public-header">
      <Brand tagline={false} />
      <nav aria-label="สำรวจ ThinThai">
        <a href="/trips">เที่ยว</a>
        <a href="/catalog">ช้อป</a>
        <a href="/bookings">ทริปของฉัน</a>
        <a href="/orders">คำสั่งซื้อ</a>
        <a className="nav-account" href="/workspace">
          บัญชี / จัดการ
        </a>
      </nav>
    </header>
  );
}
