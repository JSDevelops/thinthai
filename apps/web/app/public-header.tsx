'use client';
import { useState } from 'react';
import Link from 'next/link';
import Brand from './brand';

export default function PublicHeader() {
  const [province, setProvince] = useState('เชียงใหม่');
  const [lang, setLang] = useState('ไทย');

  return (
    <header className="public-header flex-header">
      {/* Brand & Sub-pills (Location & Language as in mockup) */}
      <div className="header-brand-group">
        <Brand tagline={false} />

        <div className="location-lang-pills">
          <button
            type="button"
            className="header-pill-btn"
            onClick={() => setProvince(province === 'เชียงใหม่' ? 'น่าน' : 'เชียงใหม่')}
            title="เปลี่ยนจังหวัด"
          >
            <span>📍 {province}</span>
            <span className="chevron-icon">▾</span>
          </button>

          <button
            type="button"
            className="header-pill-btn"
            onClick={() => setLang(lang === 'ไทย' ? 'EN' : 'ไทย')}
            title="เปลี่ยนภาษา"
          >
            <span>{lang === 'ไทย' ? '🇹🇭 ไทย' : '🇬🇧 EN'}</span>
            <span className="chevron-icon">▾</span>
          </button>
        </div>
      </div>

      <nav className="header-nav" aria-label="สำรวจ ThinThai">
        <Link href="/catalog">ช็อปปิ้ง</Link>
        <Link href="/catalog?cat=souvenir">สั่งอาหาร</Link>
        <Link href="/trips?cat=nature">ที่พัก</Link>
        <Link href="/trips">ชุมชนวิถี</Link>
      </nav>

      <div className="header-actions">
        {/* Notification Bell with red badge */}
        <Link href="/orders" className="header-bell-btn" title="แจ้งเตือน" aria-label="แจ้งเตือน">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span className="bell-badge-dot" />
        </Link>

        <Link className="btn-login-pill" href="/workspace">
          เข้าสู่ระบบ
        </Link>
      </div>
    </header>
  );
}
