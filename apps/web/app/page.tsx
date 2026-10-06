'use client';

import { useState } from 'react';
import Link from 'next/link';
import PublicHeader from './public-header';

interface CommunityItem {
  id: string;
  name: string;
  province: string;
  category: string;
  imageUrl: string;
  tripPrice: number;
  duration: string;
  groupType: string;
  workshopTitle: string;
}

interface CraftItem {
  id: string;
  title: string;
  category: string;
  price: number;
  imageUrl: string;
  artisan: string;
}

const COMMUNITIES: CommunityItem[] = [
  {
    id: 'mae-kampong',
    name: 'แม่กำปอง',
    province: 'เชียงใหม่',
    category: 'ธรรมชาติ',
    imageUrl:
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80',
    tripPrice: 600,
    duration: '2 ชั่วโมง',
    groupType: 'กลุ่มเล็ก',
    workshopTitle: 'เรียนทอผ้ากับชุมชน',
  },
  {
    id: 'koh-kret',
    name: 'เกาะเกร็ด',
    province: 'นนทบุรี',
    category: 'วัฒนธรรม',
    imageUrl:
      'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1000&q=80',
    tripPrice: 450,
    duration: '3 ชั่วโมง',
    groupType: 'กลุ่มครอบครัว',
    workshopTitle: 'ปั้นดินเผาโบราณเกาะเกร็ด',
  },
  {
    id: 'baan-rak-thai',
    name: 'บ้านรักไทย',
    province: 'แม่ฮ่องสอน',
    category: 'ธรรมชาติ',
    imageUrl:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
    tripPrice: 950,
    duration: '1 วันเต็ม',
    groupType: 'กลุ่มเล็ก',
    workshopTitle: 'ล่องเรือชมสายหมอก & ชิมชายูนนาน',
  },
];

const CRAFT_ITEMS: CraftItem[] = [
  {
    id: 'craft-1',
    title: 'กระเป๋าสานจากเส้นพลาสติก',
    category: 'งานฝีมือชุมชน',
    price: 350,
    imageUrl:
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=600&q=80',
    artisan: 'กลุ่มแม่บ้านริมคลอง',
  },
  {
    id: 'craft-2',
    title: 'เซรามิกงานดินเผา',
    category: 'ของดีท้องถิ่น',
    price: 250,
    imageUrl:
      'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=600&q=80',
    artisan: 'ช่างปั้นเกาะเกร็ด',
  },
  {
    id: 'craft-3',
    title: 'ผ้าทอมือลายพื้นเมือง',
    category: 'งานฝีมือชุมชน',
    price: 690,
    imageUrl:
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80',
    artisan: 'กลุ่มทอผ้าโบราณ',
  },
];

const CATEGORIES = [
  { id: 'all', label: 'ทั้งหมด', icon: '✨' },
  { id: 'nature', label: 'ธรรมชาติ', icon: '🌿' },
  { id: 'culture', label: 'วัฒนธรรม', icon: '🛕' },
  { id: 'food', label: 'อาหาร', icon: '🍲' },
  { id: 'craft', label: 'งานฝีมือ', icon: '🧵' },
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Booking Drawer State (Mockup 3)
  const [activeBooking, setActiveBooking] = useState<CommunityItem | null>(null);
  const [selectedDate, setSelectedDate] = useState('13 พ.ย.');
  const [guestCount, setGuestCount] = useState(2);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  const filteredCommunities = COMMUNITIES.filter((item) => {
    const matchCategory =
      selectedCategory === 'all' ||
      item.category.toLowerCase().includes(selectedCategory) ||
      (selectedCategory === 'nature' && item.category === 'ธรรมชาติ') ||
      (selectedCategory === 'culture' && item.category === 'วัฒนธรรม');
    const matchQuery =
      searchQuery.trim() === '' ||
      item.name.includes(searchQuery) ||
      item.province.includes(searchQuery) ||
      item.workshopTitle.includes(searchQuery);
    return matchCategory && matchQuery;
  });

  const handleOpenBooking = (item: CommunityItem) => {
    setActiveBooking(item);
    setBookingConfirmed(false);
  };

  const handleCloseBooking = () => {
    setActiveBooking(null);
  };

  return (
    <div className="public-site">
      <PublicHeader />

      <main className="home-main flex-home-layout">
        {/* ===================== HERO SECTION ===================== */}
        <section className="flex-hero" aria-label="แนะนำการท่องเที่ยวชุมชน">
          {/* Left Column: Typography, Search Box, Category Pills */}
          <div className="hero-left-content">
            <div className="hero-badge">เที่ยวไทยให้ถึงถิ่น · LOCAL ROOTS</div>
            <h1 className="hero-main-title">
              เที่ยวใกล้ชิด
              <br />
              <span>วิถีชุมชน</span>
            </h1>
            <p className="hero-subtitle">
              พบที่เที่ยว กิจกรรม และของดีจากคนในพื้นที่ที่รอให้คุณไปสัมผัส
            </p>

            {/* Flex Search Capsule */}
            <form
              className="flex-search-capsule"
              onSubmit={(e) => {
                e.preventDefault();
              }}
            >
              <span className="search-icon" aria-hidden="true">
                🔍
              </span>
              <input
                className="search-input-field"
                type="text"
                placeholder="อยากไปที่ไหน? (เช่น แม่กำปอง, เชียงใหม่)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="search-btn-pill" type="submit">
                ค้นหา
              </button>
            </form>

            {/* Category Pills (Flex container) */}
            <div className="category-pills-row" role="tablist">
              {CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    className={'cat-pill-btn' + (isActive ? ' active' : '')}
                    onClick={() => setSelectedCategory(cat.id)}
                    role="tab"
                    aria-selected={isActive}
                  >
                    <span className="cat-icon">{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Hero Visual with soft blend */}
          <div className="hero-right-visual">
            <div className="hero-img-frame">
              <img
                src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
                alt="หมู่บ้านท่ามกลางธรรมชาติสายหมอก"
                className="hero-main-photo"
              />
              <div className="hero-photo-gradient" />
              <div className="hero-floating-badge">
                <span className="pulse-dot" />
                <span>เปิดรับนักเดินทางวันนี้ · 12 ชุมชน</span>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== MOBILE QUICK CATEGORIES (Mockup 2) ===================== */}
        <section className="mobile-quick-categories">
          <div className="mobile-greeting-block">
            <h2>วันนี้ไปไหนดี?</h2>
            <p>พบที่เที่ยว กิจกรรม และของดีจากคนในพื้นที่</p>
          </div>
          <div className="quick-cat-grid">
            <Link href="/trips" className="quick-cat-card">
              <span className="quick-icon">⛰️</span>
              <span className="quick-label">เที่ยว</span>
            </Link>
            <Link href="/trips?cat=กิจกรรม" className="quick-cat-card">
              <span className="quick-icon">👥</span>
              <span className="quick-label">กิจกรรม</span>
            </Link>
            <Link href="/trips?cat=ที่พัก" className="quick-cat-card">
              <span className="quick-icon">🏡</span>
              <span className="quick-label">ที่พัก</span>
            </Link>
            <Link href="/catalog" className="quick-cat-card">
              <span className="quick-icon">🛍️</span>
              <span className="quick-label">ของฝาก</span>
            </Link>
          </div>
        </section>

        {/* ===================== SECTION 1: ชุมชนน่าเที่ยว ===================== */}
        <section className="flex-content-section" aria-label="ชุมชนน่าเที่ยว">
          <div className="section-flex-header">
            <div>
              <h2 className="section-title-text">ชุมชนน่าเที่ยว</h2>
              <span className="section-sub-text">
                สัมผัสเสน่ห์วิถีชีวิตดั้งเดิมที่ดูแลโดยชุมชนแท้ 100%
              </span>
            </div>
            <Link className="see-all-arrow-link" href="/trips">
              <span>ดูทั้งหมด</span>
              <span className="arrow-icon">→</span>
            </Link>
          </div>

          <div className="community-cards-flex-grid">
            {filteredCommunities.map((item) => (
              <div
                key={item.id}
                className="community-destination-card"
                onClick={() => handleOpenBooking(item)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') handleOpenBooking(item);
                }}
              >
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="comm-card-photo"
                  loading="lazy"
                />
                <div className="comm-card-dark-gradient" />
                <div className="comm-card-tag-pill">ชุมชนแนะนำ</div>
                <div className="comm-card-text-content">
                  <h3 className="comm-card-title">{item.name}</h3>
                  <div className="comm-card-meta">
                    <span className="comm-pin-icon">📍</span>
                    <span>{item.province}</span>
                    <span className="comm-separator">·</span>
                    <span className="comm-price-hint">฿{item.tripPrice}/คน</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ===================== SECTION 2: ของดีชุมชน ===================== */}
        <section className="flex-content-section" aria-label="ของดีชุมชน">
          <div className="section-flex-header">
            <div>
              <h2 className="section-title-text">ของดีชุมชน</h2>
              <span className="section-sub-text">
                สินค้า OTOP งานหัตถศิลป์ และอาหารพื้นบ้าน รายได้ส่งตรงถึงมือช่างฝีมือ
              </span>
            </div>
            <Link className="see-all-arrow-link" href="/catalog">
              <span>ดูทั้งหมด</span>
              <span className="arrow-icon">→</span>
            </Link>
          </div>

          <div className="craft-products-flex-grid">
            {CRAFT_ITEMS.map((craft) => (
              <Link
                key={craft.id}
                href={`/catalog`}
                className="craft-item-horizontal-card"
              >
                <img
                  src={craft.imageUrl}
                  alt={craft.title}
                  className="craft-thumb-img"
                  loading="lazy"
                />
                <div className="craft-info-col">
                  <span className="craft-category-badge">{craft.category}</span>
                  <h3 className="craft-title-text">{craft.title}</h3>
                  <span className="craft-artisan-name">โดย {craft.artisan}</span>
                  <div className="craft-price-tag">฿{craft.price}</div>
                </div>
                <div className="craft-arrow-circle" aria-hidden="true">
                  ›
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ===================== BANNER ===================== */}
        <section className="flex-community-banner">
          <div className="banner-icon-box">🌿</div>
          <div className="banner-text-group">
            <h3>ทุกการเดินทาง มีชุมชนอยู่เบื้องหลัง</h3>
            <p>ร่วมกระจายรายได้สู่คนท้องถิ่น อนุรักษ์ภูมิปัญญา และสัมผัสไทยให้ถึงถิ่น</p>
          </div>
          <Link href="/trips" className="banner-cta-btn">
            ออกไปค้นพบ →
          </Link>
        </section>

        <p className="footnote-text">
          ThinThai (เที่ยวไทยให้ถึงถิ่น) — แพลตฟอร์มท่องเที่ยวชุมชนเชิงสร้างสรรค์
        </p>
      </main>

      {/* ===================== SLIDE-OVER BOOKING DRAWER (Mockup 3) ===================== */}
      {activeBooking && (
        <div
          className="booking-drawer-backdrop"
          onClick={handleCloseBooking}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="booking-drawer-sheet"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Navigation */}
            <div className="drawer-top-bar">
              <button
                type="button"
                className="drawer-back-btn"
                onClick={handleCloseBooking}
              >
                ‹ กลับ
              </button>
              <button
                type="button"
                className={'drawer-bookmark-btn' + (isBookmarked ? ' active' : '')}
                onClick={() => setIsBookmarked(!isBookmarked)}
              >
                {isBookmarked ? '❤️ บันทึกแล้ว' : '🤍 บันทึก'}
              </button>
            </div>

            {/* Workshop Hero Photo */}
            <div className="drawer-photo-wrap">
              <img
                src="https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80"
                alt="เรียนทอผ้ากับชุมชน"
                className="drawer-workshop-img"
              />
              <div className="drawer-photo-overlay" />
            </div>

            {/* Workshop Title & Location */}
            <div className="drawer-body-content">
              <h2 className="drawer-workshop-title">
                {activeBooking.workshopTitle}
              </h2>
              <div className="drawer-location-row">
                <span className="drawer-pin">📍</span>
                <span>
                  {activeBooking.name}, {activeBooking.province}
                </span>
              </div>

              {/* Badges */}
              <div className="drawer-badges-row">
                <div className="drawer-badge-pill">
                  <span>⏱</span>
                  <span>{activeBooking.duration}</span>
                </div>
                <div className="drawer-badge-pill">
                  <span>👥</span>
                  <span>{activeBooking.groupType}</span>
                </div>
              </div>

              {/* Date Selection */}
              <div className="drawer-form-section">
                <label className="drawer-section-label">เลือกวัน</label>
                <div className="drawer-date-pills">
                  {['13 พ.ย.', '14 พ.ย.', '15 พ.ย.'].map((date) => (
                    <button
                      key={date}
                      type="button"
                      className={
                        'drawer-date-pill' +
                        (selectedDate === date ? ' active' : '')
                      }
                      onClick={() => setSelectedDate(date)}
                    >
                      {date}
                    </button>
                  ))}
                </div>
              </div>

              {/* Guest Counter */}
              <div className="drawer-form-section">
                <div className="guest-counter-row">
                  <div>
                    <label className="drawer-section-label">ผู้เข้าร่วม</label>
                    <div className="guest-counter-sub">
                      ฿{activeBooking.tripPrice} / คน
                    </div>
                  </div>
                  <div className="counter-controls">
                    <button
                      type="button"
                      className="counter-btn"
                      onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                      disabled={guestCount <= 1}
                    >
                      −
                    </button>
                    <span className="counter-value">{guestCount}</span>
                    <button
                      type="button"
                      className="counter-btn"
                      onClick={() => setGuestCount(guestCount + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Policy row */}
              <div className="drawer-policy-row">
                <span className="policy-icon">📋</span>
                <span className="policy-text">เงื่อนไขการจองและนโยบายชุมชน</span>
                <span className="policy-arrow">›</span>
              </div>

              {bookingConfirmed && (
                <div className="booking-success-box">
                  ✅ จองสำเร็จแล้ว! เตรียมออกเดินทางวันที่ {selectedDate} ({guestCount} คน)
                </div>
              )}
            </div>

            {/* Sticky Bottom Bar */}
            <div className="drawer-sticky-bottom">
              <div className="drawer-price-col">
                <div className="drawer-price-number">
                  ฿{(activeBooking.tripPrice * guestCount).toLocaleString('th-TH')}
                  <small> / {guestCount} คน</small>
                </div>
                <div className="drawer-price-note">รวมอาหารและอุปกรณ์ชุมชน</div>
              </div>
              <button
                type="button"
                className="drawer-checkout-btn"
                onClick={() => {
                  setBookingConfirmed(true);
                  setTimeout(() => {
                    alert(
                      `🎉 ทำการจอง "${activeBooking.workshopTitle}" วันที่ ${selectedDate} สำหรับ ${guestCount} ท่าน เรียบร้อยแล้ว!`
                    );
                    handleCloseBooking();
                  }, 400);
                }}
              >
                ตรวจรายการ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="public-footer flex-footer">
        <strong>ThinThai</strong>
        <span>เที่ยวไทยให้ถึงถิ่น · โครงการเพื่อการท่องเที่ยวชุมชนยั่งยืน</span>
        <Link href="/workspace">สำหรับผู้ประกอบการ / เข้าสู่ระบบ</Link>
      </footer>
    </div>
  );
}
