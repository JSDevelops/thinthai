'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import PublicHeader from './public-header';
import {
  tripApi,
  tripDate,
  categories as categoryDict,
  type Trip,
  type Departure,
} from './trip-shared';

interface CommunityItem {
  id: string;
  name: string;
  province: string;
  category: string;
  imageUrl: string;
  tripPrice: number;
  priceSatang: number;
  duration: string;
  groupType: string;
  workshopTitle: string;
  meetingPoint?: string;
  description?: string;
  departures: Departure[];
  isReal?: boolean;
}

interface CraftItem {
  id: string;
  title: string;
  category: string;
  price: number;
  imageUrl: string;
  artisan: string;
}

const DEFAULT_COMMUNITIES: CommunityItem[] = [
  {
    id: 'mae-kampong',
    name: 'แม่กำปอง',
    province: 'เชียงใหม่',
    category: 'ธรรมชาติ',
    imageUrl:
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80',
    tripPrice: 600,
    priceSatang: 60000,
    duration: '2 ชั่วโมง',
    groupType: 'กลุ่มเล็ก',
    workshopTitle: 'เรียนทอผ้ากับชุมชน',
    meetingPoint: 'ศูนย์บริการนักท่องเที่ยวแม่กำปอง จ.เชียงใหม่',
    departures: [],
  },
  {
    id: 'koh-kret',
    name: 'เกาะเกร็ด',
    province: 'นนทบุรี',
    category: 'วัฒนธรรม',
    imageUrl:
      'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1000&q=80',
    tripPrice: 450,
    priceSatang: 45000,
    duration: '3 ชั่วโมง',
    groupType: 'กลุ่มครอบครัว',
    workshopTitle: 'ปั้นดินเผาโบราณเกาะเกร็ด',
    meetingPoint: 'ท่าเรือวัดสนามเหนือ เกาะเกร็ด จ.นนทบุรี',
    departures: [],
  },
  {
    id: 'baan-rak-thai',
    name: 'บ้านรักไทย',
    province: 'แม่ฮ่องสอน',
    category: 'ธรรมชาติ',
    imageUrl:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
    tripPrice: 950,
    priceSatang: 95000,
    duration: '1 วันเต็ม',
    groupType: 'กลุ่มเล็ก',
    workshopTitle: 'ล่องเรือชมสายหมอก & ชิมชายูนนาน',
    meetingPoint: 'ริมทะเลสาบบ้านรักไทย จ.แม่ฮ่องสอน',
    departures: [],
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

const categoryImages: Record<string, string> = {
  nature:
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80',
  culture:
    'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1000&q=80',
  food: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80',
  craft:
    'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1000&q=80',
};

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [communities, setCommunities] = useState<CommunityItem[]>(DEFAULT_COMMUNITIES);

  // Booking Drawer State
  const [activeBooking, setActiveBooking] = useState<CommunityItem | null>(null);
  const [selectedDepartureId, setSelectedDepartureId] = useState('');
  const [guestCount, setGuestCount] = useState(1);
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirmedBookingId, setConfirmedBookingId] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const nonce = useRef('');

  const loadRealTrips = useCallback(async () => {
    try {
      const data: Trip[] = await tripApi('trips');
      if (Array.isArray(data) && data.length > 0) {
        const mapped: CommunityItem[] = data.map((t) => ({
          id: t.id,
          name: t.storeName,
          province: t.province,
          category: categoryDict[t.category] || t.category,
          imageUrl: categoryImages[t.category] || categoryImages.culture,
          tripPrice: Math.round(t.priceSatang / 100),
          priceSatang: t.priceSatang,
          duration: `${t.durationHours} ชั่วโมง`,
          groupType: 'ชุมชนท้องถิ่น',
          workshopTitle: t.title,
          meetingPoint: t.meetingPoint,
          description: t.description,
          departures: t.departures || [],
          isReal: true,
        }));
        setCommunities(mapped);
      }
    } catch {
      // Fallback to default community items if API offline or during initial build
    }
  }, []);

  useEffect(() => {
    void loadRealTrips();
  }, [loadRealTrips]);

  const filteredCommunities = communities.filter((item) => {
    const matchCategory =
      selectedCategory === 'all' ||
      item.category.toLowerCase().includes(selectedCategory) ||
      (selectedCategory === 'nature' && item.category.includes('ธรรมชาติ')) ||
      (selectedCategory === 'culture' && item.category.includes('วัฒนธรรม')) ||
      (selectedCategory === 'food' && item.category.includes('อาหาร')) ||
      (selectedCategory === 'craft' && item.category.includes('ฝีมือ'));
    const matchQuery =
      searchQuery.trim() === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.province.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.workshopTitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchQuery;
  });

  const handleOpenBooking = (item: CommunityItem) => {
    setActiveBooking(item);
    const validDep = item.departures.find((d) => d.remaining > 0);
    setSelectedDepartureId(validDep ? validDep.id : item.departures[0]?.id || '');
    setGuestCount(1);
    setError('');
    setBookingConfirmed(false);
    setConfirmedBookingId('');
    nonce.current = '';
  };

  const handleCloseBooking = () => {
    setActiveBooking(null);
    setError('');
  };

  const handleConfirmBooking = async () => {
    if (!activeBooking || busy) return;

    if (activeBooking.departures.length === 0) {
      setError('ทริปนี้ยังไม่มีรอบเดินทางที่เปิดรับจอง กรุณาดูรายการรอบเพิ่มเติมที่หน้าทริป');
      return;
    }

    if (!selectedDepartureId) {
      setError('กรุณาเลือกรอบเดินทางที่ต้องการจอง');
      return;
    }

    if (!contactName.trim()) {
      setError('กรุณาระบุชื่อ-นามสกุลของผู้ติดต่อ');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 8) {
      setError('กรุณาระบุเบอร์โทรศัพท์ที่ถูกต้อง (อย่างน้อย 8 หลัก)');
      return;
    }

    setBusy(true);
    setError('');
    nonce.current ||= crypto.randomUUID();

    try {
      const result = await tripApi('bookings', {
        departureId: selectedDepartureId,
        seats: guestCount,
        expectedPriceSatang: activeBooking.priceSatang,
        contactName: contactName.trim(),
        phone: phone.trim(),
        requestKey: nonce.current,
      });

      setConfirmedBookingId(result.id);
      setBookingConfirmed(true);
      nonce.current = '';
      void loadRealTrips();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
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
              <span className="quick-label">ทริปชุมชน</span>
            </Link>
            <Link href="/trips?cat=culture" className="quick-cat-card">
              <span className="quick-icon">👥</span>
              <span className="quick-label">วิถีชุมชน</span>
            </Link>
            <Link href="/trips?cat=food" className="quick-cat-card">
              <span className="quick-icon">🍲</span>
              <span className="quick-label">อาหารพื้นถิ่น</span>
            </Link>
            <Link href="/catalog" className="quick-cat-card">
              <span className="quick-icon">🛍️</span>
              <span className="quick-label">ของดีชุมชน</span>
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
              <Link key={craft.id} href={`/catalog`} className="craft-item-horizontal-card">
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
          <div className="booking-drawer-sheet" onClick={(e) => e.stopPropagation()}>
            {/* Top Navigation */}
            <div className="drawer-top-bar">
              <button type="button" className="drawer-back-btn" onClick={handleCloseBooking}>
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
                src={activeBooking.imageUrl}
                alt={activeBooking.workshopTitle}
                className="drawer-workshop-img"
              />
              <div className="drawer-photo-overlay" />
            </div>

            {/* Workshop Title & Location */}
            <div className="drawer-body-content">
              <div className="drawer-notice-bar">
                การจองรุ่นทดลอง · กันที่นั่งเมื่อส่งคำขอ รอผู้ประกอบการยืนยัน ·
                ยังไม่รับชำระเงินจริง
              </div>

              <h2 className="drawer-workshop-title">{activeBooking.workshopTitle}</h2>
              <div className="drawer-location-row">
                <span className="drawer-pin">📍</span>
                <span>
                  {activeBooking.name}, {activeBooking.province}
                </span>
              </div>

              {activeBooking.meetingPoint && (
                <div className="drawer-location-row">
                  <span className="drawer-pin">🚩</span>
                  <span style={{ fontSize: '13px' }}>จุดนัดพบ: {activeBooking.meetingPoint}</span>
                </div>
              )}

              {activeBooking.description && (
                <p style={{ fontSize: '13px', color: '#556a62', margin: '0', lineHeight: 1.5 }}>
                  {activeBooking.description}
                </p>
              )}

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

              {/* Departure Selection */}
              <div className="drawer-form-section">
                <label className="drawer-section-label">รอบเดินทาง</label>
                {activeBooking.departures.length > 0 ? (
                  <div className="drawer-departure-list">
                    {activeBooking.departures.map((d) => {
                      const isSelected = selectedDepartureId === d.id;
                      const isFull = d.remaining <= 0;
                      return (
                        <button
                          key={d.id}
                          type="button"
                          disabled={isFull || bookingConfirmed}
                          className={'drawer-departure-btn' + (isSelected ? ' active' : '')}
                          onClick={() => {
                            setSelectedDepartureId(d.id);
                            setError('');
                          }}
                        >
                          <span>📅 {tripDate(d.startsAt)}</span>
                          <span className="drawer-remaining-tag">
                            {isFull ? 'เต็มแล้ว' : `ว่าง ${d.remaining} ที่`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="drawer-location-row" style={{ color: '#d37827' }}>
                    <span>
                      ⚠️ ยังไม่มีรอบเปิดรับจองสำหรับรายการนี้ ตรวจสอบรอบทั้งหมดได้ที่{' '}
                      <Link href="/trips" style={{ textDecoration: 'underline' }}>
                        หน้าค้นหาทริป
                      </Link>
                    </span>
                  </div>
                )}
              </div>

              {/* Guest Counter */}
              <div className="drawer-form-section">
                <div className="guest-counter-row">
                  <div>
                    <label className="drawer-section-label">จำนวนผู้เข้าร่วม</label>
                    <div className="guest-counter-sub">
                      ฿{activeBooking.tripPrice.toLocaleString('th-TH')} / คน
                    </div>
                  </div>
                  <div className="counter-controls">
                    <button
                      type="button"
                      className="counter-btn"
                      onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                      disabled={guestCount <= 1 || bookingConfirmed}
                    >
                      −
                    </button>
                    <span className="counter-value">{guestCount}</span>
                    <button
                      type="button"
                      className="counter-btn"
                      onClick={() => {
                        const maxSeats = Math.min(
                          10,
                          activeBooking.departures.find((d) => d.id === selectedDepartureId)
                            ?.remaining || 10,
                        );
                        setGuestCount((prev) => Math.min(maxSeats, prev + 1));
                      }}
                      disabled={
                        bookingConfirmed ||
                        guestCount >=
                          Math.min(
                            10,
                            activeBooking.departures.find((d) => d.id === selectedDepartureId)
                              ?.remaining || 10,
                          )
                      }
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Contact Information Form */}
              <div className="drawer-form-section">
                <label className="drawer-section-label">ข้อมูลผู้ติดต่อ</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input
                    type="text"
                    className="drawer-input-field"
                    placeholder="ชื่อ-นามสกุล ผู้ติดต่อ *"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    disabled={bookingConfirmed || busy}
                  />
                  <input
                    type="tel"
                    className="drawer-input-field"
                    placeholder="เบอร์โทรศัพท์ติดต่อ (เช่น 0812345678) *"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={bookingConfirmed || busy}
                  />
                </div>
              </div>

              {/* Policy row */}
              <div className="drawer-policy-row">
                <span className="policy-icon">📋</span>
                <span className="policy-text">เงื่อนไขการจองและนโยบายชุมชน</span>
                <span className="policy-arrow">›</span>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="drawer-error-box" role="alert">
                  ⚠️ {error}
                  {error.includes('เข้าสู่ระบบ') && (
                    <Link href="/workspace">ไปหน้าเข้าสู่ระบบ →</Link>
                  )}
                </div>
              )}

              {/* Success Box */}
              {bookingConfirmed && (
                <div className="booking-success-box" role="status">
                  🎉 บันทึกคำขอจองสำเร็จแล้ว! (รหัส: {confirmedBookingId.slice(0, 8)})
                  <br />
                  <small style={{ color: '#2e7d32' }}>
                    จำนวน {guestCount} ท่าน · บันทึกในระบบหลังบ้านแล้ว
                  </small>
                  <br />
                  <Link href="/bookings">ดูสถานะการจองใน &quot;ทริปของฉัน&quot; →</Link>
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
                <div className="drawer-price-note">รวมอุปกรณ์และกิจกรรมชุมชน</div>
              </div>
              {bookingConfirmed ? (
                <Link
                  href="/bookings"
                  className="drawer-checkout-btn"
                  style={{ textAlign: 'center', textDecoration: 'none' }}
                >
                  ดูทริปของฉัน
                </Link>
              ) : (
                <button
                  type="button"
                  className="drawer-checkout-btn"
                  disabled={busy || (activeBooking.departures.length > 0 && !selectedDepartureId)}
                  onClick={handleConfirmBooking}
                >
                  {busy ? 'กำลังบันทึก...' : 'ส่งคำขอจอง'}
                </button>
              )}
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
