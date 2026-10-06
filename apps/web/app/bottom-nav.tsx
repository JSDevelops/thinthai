'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/trips', label: 'เที่ยว', icon: '🏔️' },
    { href: '/catalog', label: 'ช้อป', icon: '🛍️' },
    { href: '/bookings', label: 'ทริปของฉัน', icon: '🎫' },
    { href: '/orders', label: 'คำสั่งซื้อ', icon: '📦' },
    { href: '/workspace', label: 'บัญชี', icon: '👤' },
  ];

  return (
    <nav className="mobile-bottom-nav" aria-label="เมนูหลักสำหรับมือถือ">
      {navItems.map((item) => {
        const isActive =
          item.href === '/workspace' ? pathname.startsWith('/workspace') : pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className="bottom-nav-icon">{item.icon}</span>
            <span className="bottom-nav-label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
