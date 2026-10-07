import Link from 'next/link';
import Brand from './brand';

export default function PublicHeader() {
  return (
    <header className="public-header flex-header">
      <div className="header-brand">
        <Brand tagline={false} />
      </div>

      <nav className="header-nav" aria-label="สำรวจ ThinThai">
        <Link href="/trips">ทริปชุมชน</Link>
        <Link href="/trips?cat=culture">วิถีชุมชน</Link>
        <Link href="/catalog">ของดีชุมชน</Link>
        <Link href="/bookings">ทริปของฉัน</Link>
      </nav>

      <div className="header-actions">
        <button
          className="lang-selector-btn"
          type="button"
          aria-label="เปลี่ยนภาษา"
          title="เปลี่ยนภาษา"
        >
          <span className="lang-icon">🌐</span>
          <span>ไทย</span>
          <span className="lang-chevron">▾</span>
        </button>

        <Link className="btn-login-pill" href="/workspace">
          เข้าสู่ระบบ
        </Link>
      </div>
    </header>
  );
}
