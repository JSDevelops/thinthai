import Link from 'next/link';
import Brand from './brand';

export default function PublicHeader() {
  return (
    <header className="public-header">
      <Brand tagline={false} />
      <nav aria-label="สำรวจ ThinThai">
        <Link href="/trips">เที่ยว</Link>
        <Link href="/catalog">ช้อป</Link>
        <Link href="/bookings">ทริปของฉัน</Link>
        <Link href="/orders">คำสั่งซื้อ</Link>
        <Link className="nav-account" href="/workspace">
          บัญชี / จัดการ
        </Link>
      </nav>
    </header>
  );
}
