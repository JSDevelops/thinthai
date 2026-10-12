'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import PublicHeader from './public-header';
import { tripApi, tripDate, type Trip } from './trip-shared';

type Departure = {
  id: string;
  startsAt: string;
  capacity: number;
  remaining: number;
  active: boolean;
};

type CommunityItem = {
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
};

const DEFAULT_COMMUNITIES: CommunityItem[] = [
  {
    id: 'comm-1',
    name: 'บ้านแม่กำปอง',
    province: 'เชียงใหม่',
    category: 'ธรรมชาติ',
    imageUrl:
      'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=800&q=80',
    tripPrice: 650,
    priceSatang: 65000,
    duration: '3 ชั่วโมง',
    groupType: 'กลุ่มเล็ก',
    workshopTitle: 'สัมผัสวิถีชุมชน',
    meetingPoint: 'ศาลากลางหมู่บ้านแม่กำปอง',
    description: 'เรียนรู้วิถีชีวิตชาวบ้านริมลำธาร ชิมใบชาหมักเมี่ยงโบราณ และเดินสำรวจธรรมชาติ',
    departures: [
      {
        id: 'dep-101',
        startsAt: new Date(Date.now() + 86400000 * 2).toISOString(),
        capacity: 8,
        remaining: 6,
        active: true,
      },
    ],
  },
  {
    id: 'comm-2',
    name: 'บ้านป่าบงเปียง',
    province: 'เชียงใหม่',
    category: 'ธรรมชาติ',
    imageUrl:
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    tripPrice: 850,
    priceSatang: 85000,
    duration: '4 ชั่วโมง',
    groupType: 'กลุ่มเล็ก',
    workshopTitle: 'ชมนาขั้นบันไดและสัมผัสวิถีปกาเกอะญอ',
    meetingPoint: 'จุดชมวิวนาขั้นบันไดป่าบงเปียง',
    description: 'สูดอากาศบริสุทธิ์ท่ามกลางนาข้าวขั้นบันไดที่สวยที่สุดในไทย และวิถีเกษตรชุมชน',
    departures: [
      {
        id: 'dep-102',
        startsAt: new Date(Date.now() + 86400000 * 3).toISOString(),
        capacity: 6,
        remaining: 4,
        active: true,
      },
    ],
  },
  {
    id: 'comm-3',
    name: 'ชุมชนบ้านศิลาดาด',
    province: 'สุโขทัย',
    category: 'วัฒนธรรม',
    imageUrl:
      'https://images.unsplash.com/photo-1609137144820-2d08a54d5b24?auto=format&fit=crop&w=800&q=80',
    tripPrice: 550,
    priceSatang: 55000,
    duration: '2.5 ชั่วโมง',
    groupType: 'ครอบครัว',
    workshopTitle: 'เวิร์กช็อปเครื่องปั้นสังคโลกโบราณ',
    meetingPoint: 'เตาเผาโบราณบ้านศิลาดาด',
    description: 'ปั้นดินเผาเขียนลายสังคโลกด้วยตนเอง พร้อมฟังเรื่องราวประวัติศาสตร์จากครูช่าง',
    departures: [
      {
        id: 'dep-103',
        startsAt: new Date(Date.now() + 86400000 * 4).toISOString(),
        capacity: 10,
        remaining: 8,
        active: true,
      },
    ],
  },
  {
    id: 'comm-4',
    name: 'ชุมชนริมน้ำจันทบูร',
    province: 'จันทบุรี',
    category: 'อาหาร',
    imageUrl:
      'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=800&q=80',
    tripPrice: 490,
    priceSatang: 49000,
    duration: '2 ชั่วโมง',
    groupType: 'กลุ่มเล็ก',
    workshopTitle: 'ชิมขนมโบราณและงานพลอยเมืองจันท์',
    meetingPoint: 'สะพานวัดโรมันคาทอลิกจันทบุรี',
    description: 'เดินลัดเลาะชุมชนเก่าร้อยปี ชิมก๋วยเตี๋ยวต้มยำกั้งและขนมโก๋โบราณ',
    departures: [
      {
        id: 'dep-104',
        startsAt: new Date(Date.now() + 86400000 * 5).toISOString(),
        capacity: 12,
        remaining: 10,
        active: true,
      },
    ],
  },
];

const SERVICES = [
  { id: 'shopping', label: 'ช็อปปิ้ง', icon: '🛍️', href: '/catalog', bg: '#fef3e2' },
  { id: 'food', label: 'สั่งอาหาร', icon: '🍲', href: '/catalog?cat=souvenir', bg: '#fde8e8' },
  { id: 'stay', label: 'ที่พัก', icon: '🏡', href: '/trips?cat=nature', bg: '#e8f5e9' },
  { id: 'ride', label: 'เรียกรถ', icon: '🚗', href: '#ride', bg: '#fffde7' },
  { id: 'service', label: 'บริการ', icon: '🛠️', href: '#service', bg: '#e8f4fd' },
  { id: 'community', label: 'ชุมชนวิถี', icon: '🌿', href: '/trips', bg: '#e0f2f1' },
];

const categoryImages: Record<string, string> = {
  nature:
    'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=800&q=80',
  culture:
    'https://images.unsplash.com/photo-1609137144820-2d08a54d5b24?auto=format&fit=crop&w=800&q=80',
  food: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=800&q=80',
  craft:
    'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
};

const categoryDict: Record<string, string> = {
  nature: 'ธรรมชาติ',
  culture: 'วัฒนธรรม',
  food: 'อาหาร',
  craft: 'งานฝีมือ',
};

export default function Page() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [communities, setCommunities] = useState<CommunityItem[]>(DEFAULT_COMMUNITIES);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set(['comm-1']));

  // Slide-over Drawer State (Screen 2)
  const [activeBooking, setActiveBooking] = useState<CommunityItem | null>(null);
  const [selectedDepartureId, setSelectedDepartureId] = useState('');
  const [guestCount, setGuestCount] = useState(2);
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirmedBookingId, setConfirmedBookingId] = useState('');
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [activeServiceModal, setActiveServiceModal] = useState<'ride' | 'service' | null>(null);
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
          groupType: 'กลุ่มเล็ก',
          workshopTitle: t.title,
          meetingPoint: t.meetingPoint,
          description: t.description,
          departures: t.departures || [],
          isReal: true,
        }));
        setCommunities((prev) => {
          const ids = new Set(DEFAULT_COMMUNITIES.map((m) => m.id));
          return [...DEFAULT_COMMUNITIES, ...mapped.filter((p) => !ids.has(p.id))];
        });
      }
    } catch {
      // Graceful fallback to default mock communities
    }
  }, []);

  useEffect(() => {
    void loadRealTrips();
  }, [loadRealTrips]);

  const toggleWishlist = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setWishlist((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

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
    setGuestCount(2);
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
    <div className="public-site concept-theme">
      <PublicHeader />

      <main className="home-main concept-home-layout">
        {/* ===================== GREETING & SEARCH (Screen 1) ===================== */}
        <section className="concept-search-section">
          <h1 className="concept-greeting-title">วันนี้ อยากไปไหน?</h1>

          {/* Search Capsule Input */}
          <form
            className="concept-search-bar"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <span className="search-lens-icon">🔍</span>
            <input
              type="text"
              className="concept-search-input"
              placeholder="ค้นหาช็อปปิ้ง สั่งอาหาร ที่พัก ชุมชนวิถี"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </section>

        {/* ===================== 6 CORE SERVICES GRID ===================== */}
        <section className="concept-services-grid" aria-label="หมวดหมู่บริการหลัก">
          {SERVICES.map((srv) => {
            const isModal = srv.id === 'ride' || srv.id === 'service';
            return isModal ? (
              <button
                key={srv.id}
                type="button"
                className="concept-service-item service-modal-trigger"
                onClick={() => setActiveServiceModal(srv.id as 'ride' | 'service')}
              >
                <div className="service-icon-box" style={{ backgroundColor: srv.bg }}>
                  <span className="service-emoji">{srv.icon}</span>
                </div>
                <span className="service-label-text">{srv.label}</span>
              </button>
            ) : (
              <Link key={srv.id} href={srv.href} className="concept-service-item">
                <div className="service-icon-box" style={{ backgroundColor: srv.bg }}>
                  <span className="service-emoji">{srv.icon}</span>
                </div>
                <span className="service-label-text">{srv.label}</span>
              </Link>
            );
          })}
        </section>

        {/* ===================== FEATURED BANNER ("เที่ยวใกล้ชุมชน") ===================== */}
        <section className="concept-featured-banner">
          <div className="banner-visual-frame">
            <img
              src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
              alt="เที่ยวใกล้ชุมชน สัมผัสเสน่ห์วิถีถิ่นไทย"
              className="banner-cover-photo"
            />
            <div className="banner-gradient-mask" />
            <div className="banner-content-box">
              <h2 className="banner-heading">เที่ยวใกล้ชุมชน</h2>
              <p className="banner-subheading">สัมผัสเสน่ห์วิถีถิ่นไทย</p>
              <Link href="/trips" className="banner-yellow-cta-btn">
                สำรวจชุมชนวิถี →
              </Link>
            </div>
          </div>
        </section>

        {/* ===================== "ชุมชนน่าไป" DESTINATIONS ===================== */}
        <section className="concept-destinations-section">
          <div className="section-head-row">
            <h2 className="section-main-heading">ชุมชนน่าไป</h2>
            <Link href="/trips" className="see-all-link">
              ดูทั้งหมด →
            </Link>
          </div>

          <div className="destinations-horizontal-scroll">
            {filteredCommunities.map((item) => {
              const isFav = wishlist.has(item.id);
              return (
                <div
                  key={item.id}
                  className="destination-card"
                  onClick={() => handleOpenBooking(item)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') handleOpenBooking(item);
                  }}
                >
                  <div className="card-photo-wrap">
                    <img src={item.imageUrl} alt={item.name} className="destination-photo" />
                    <button
                      type="button"
                      className={'card-heart-btn' + (isFav ? ' active' : '')}
                      onClick={(e) => toggleWishlist(item.id, e)}
                      aria-label="บันทึกรายการโปรด"
                    >
                      {isFav ? '❤️' : '🤍'}
                    </button>
                  </div>
                  <div className="card-info-wrap">
                    <h3 className="destination-title">{item.name}</h3>
                    <p className="destination-location">{item.province}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* ===================== SLIDE-OVER DETAIL & BOOKING SHEET (Screen 2) ===================== */}
      {activeBooking && (
        <div
          className="booking-drawer-backdrop"
          onClick={handleCloseBooking}
          role="dialog"
          aria-modal="true"
        >
          <div className="concept-detail-sheet" onClick={(e) => e.stopPropagation()}>
            {/* Top Navigation */}
            <div className="sheet-top-controls">
              <button
                type="button"
                className="circle-control-btn back-btn"
                onClick={handleCloseBooking}
                aria-label="ย้อนกลับ"
              >
                ‹
              </button>
              <button
                type="button"
                className="circle-control-btn heart-btn"
                onClick={() => toggleWishlist(activeBooking.id)}
                aria-label="บันทึกรายการโปรด"
              >
                {wishlist.has(activeBooking.id) ? '❤️' : '🤍'}
              </button>
            </div>

            {/* Parallax Hero Photo */}
            <div className="sheet-hero-image-wrap">
              <img
                src={activeBooking.imageUrl}
                alt={activeBooking.workshopTitle}
                className="sheet-hero-photo"
              />
            </div>

            {/* Sheet White Card Body */}
            <div className="sheet-card-body">
              <h2 className="sheet-title">{activeBooking.workshopTitle}</h2>
              <div className="sheet-location-row">
                <span className="pin-icon">📍</span>
                <span>{activeBooking.province}</span>
              </div>

              {/* 3 Pills: Duration, Group, Tag */}
              <div className="sheet-pills-row">
                <div className="sheet-pill">⏱ 3 ชั่วโมง</div>
                <div className="sheet-pill">👥 กลุ่มเล็ก</div>
                <div className="sheet-pill green-pill">🍃 กิจกรรมชุมชน</div>
              </div>

              {/* Section: สิ่งที่จะได้สัมผัส (3 Circular Icons) */}
              <div className="sheet-highlights-section">
                <h3 className="sheet-section-title">สิ่งที่จะได้สัมผัส</h3>
                <div className="highlights-icons-row">
                  <div className="highlight-item">
                    <div className="highlight-icon-circle">🚶‍♂️</div>
                    <div className="highlight-text-wrap">
                      <strong>เดินชมชุมชน</strong>
                      <span>สัมผัสวิถีชีวิตของคนในท้องถิ่น</span>
                    </div>
                  </div>

                  <div className="highlight-item">
                    <div className="highlight-icon-circle">🧶</div>
                    <div className="highlight-text-wrap">
                      <strong>เรียนรู้งานฝีมือ</strong>
                      <span>ลองทำงานหัตถกรรมกับชาวบ้าน</span>
                    </div>
                  </div>

                  <div className="highlight-item">
                    <div className="highlight-icon-circle">🍲</div>
                    <div className="highlight-text-wrap">
                      <strong>ชิมอาหารพื้นบ้าน</strong>
                      <span>ลิ้มรสเมนูท้องถิ่นจากวัตถุดิบสดใหม่</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section: เลือกรอบเดินทาง (3 Column Selectors) */}
              <div className="sheet-departure-section">
                <h3 className="sheet-section-title">เลือกรอบเดินทาง</h3>
                <div className="departure-selectors-grid">
                  {/* Selector 1: Date */}
                  <div className="selector-box">
                    <span className="selector-label">📅 วันที่เดินทาง</span>
                    <select
                      className="selector-select"
                      value={selectedDepartureId}
                      onChange={(e) => setSelectedDepartureId(e.target.value)}
                      disabled={bookingConfirmed}
                    >
                      {activeBooking.departures.map((d) => (
                        <option key={d.id} value={d.id}>
                          {tripDate(d.startsAt)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Selector 2: Time */}
                  <div className="selector-box">
                    <span className="selector-label">🕒 เวลา</span>
                    <div className="selector-value">09:00 ▾</div>
                  </div>

                  {/* Selector 3: Participants Stepper */}
                  <div className="selector-box">
                    <span className="selector-label">👥 จำนวนคน</span>
                    <div className="stepper-controls">
                      <button
                        type="button"
                        className="stepper-btn"
                        onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                        disabled={guestCount <= 1 || bookingConfirmed}
                      >
                        −
                      </button>
                      <span className="stepper-value">{guestCount}</span>
                      <button
                        type="button"
                        className="stepper-btn"
                        onClick={() => setGuestCount(guestCount + 1)}
                        disabled={guestCount >= 10 || bookingConfirmed}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="sheet-contact-section">
                <label className="sheet-section-title" style={{ display: 'block' }}>
                  ข้อมูลผู้ติดต่อ
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input
                    type="text"
                    className="sheet-input-field"
                    placeholder="ชื่อ-นามสกุล ผู้ติดต่อ *"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    disabled={bookingConfirmed || busy}
                  />
                  <input
                    type="tel"
                    className="sheet-input-field"
                    placeholder="เบอร์โทรศัพท์ (เช่น 0812345678) *"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={bookingConfirmed || busy}
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="sheet-error-box" role="alert">
                  ⚠️ {error}
                </div>
              )}

              {/* Booking Success Card with PromptPay CTA */}
              {bookingConfirmed && (
                <div className="sheet-success-box" role="status">
                  🎉 บันทึกคำขอจองสำเร็จแล้ว! (รหัส: {confirmedBookingId.slice(0, 8)})
                  <br />
                  <small style={{ color: '#2e7d32' }}>
                    จำนวน {guestCount} ท่าน · ระบบกันที่นั่งให้แล้ว 30 นาที
                  </small>
                  <div style={{ marginTop: '10px' }}>
                    <Link href="/bookings" className="sheet-pay-cta-btn">
                      💳 ดำเนินการชำระเงิน (PromptPay) →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Bottom Bar */}
            <div className="sheet-sticky-footer">
              <div className="sheet-price-col">
                <div className="sheet-price-num">
                  ฿{(activeBooking.tripPrice * guestCount).toLocaleString('th-TH')}
                </div>
                <div className="sheet-price-unit">รวม {guestCount} คน</div>
              </div>

              {bookingConfirmed ? (
                <Link href="/bookings" className="sheet-primary-cta-btn">
                  ดูทริปของฉัน
                </Link>
              ) : (
                <button
                  type="button"
                  className="sheet-primary-cta-btn"
                  disabled={busy}
                  onClick={handleConfirmBooking}
                >
                  {busy ? 'กำลังบันทึก…' : 'ตรวจสอบการจอง →'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================== RIDE MODAL (เรียกรถ) ===================== */}
      {activeServiceModal === 'ride' && (
        <div
          className="booking-drawer-backdrop"
          onClick={() => setActiveServiceModal(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="concept-detail-sheet service-modal-sheet"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header-row">
              <h2 className="modal-title">🚗 เรียกรถชุมชน</h2>
              <button
                type="button"
                className="circle-control-btn close-modal-btn"
                onClick={() => setActiveServiceModal(null)}
                aria-label="ปิด"
              >
                ✕
              </button>
            </div>
            <div className="modal-body-scroll">
              <p className="modal-desc">
                บริการเดินทางและรถรับ-ส่งท้องถิ่นโดยคนขับในชุมชน ราคากลางเป็นธรรม ปลอดภัย ได้มาตรฐาน
              </p>

              <div className="service-options-list">
                <div className="service-option-card">
                  <div className="service-option-icon">🛺</div>
                  <div className="service-option-info">
                    <strong>รถสองแถวท้องถิ่น (สองแถวแดง / สองแถวชุมชน)</strong>
                    <span>รับ-ส่งตามจุดท่องเที่ยวและเส้นทางในหมู่บ้าน</span>
                    <span className="service-option-price">เริ่มต้น 40 - 80 บาท / คน</span>
                  </div>
                </div>

                <div className="service-option-card">
                  <div className="service-option-icon">🚐</div>
                  <div className="service-option-info">
                    <strong>รถตู้ / รถนำเที่ยวกลุ่ม</strong>
                    <span>เดินทางเป็นกลุ่มส่วนตัว สะดวกสบาย พร้อมคนขับชำนาญทาง</span>
                    <span className="service-option-price">เริ่มต้น 1,500 บาท / วัน</span>
                  </div>
                </div>

                <div className="service-option-card">
                  <div className="service-option-icon">🛻</div>
                  <div className="service-option-info">
                    <strong>รถกระบะขึ้นดอย / ชมวิวธรรมชาติ</strong>
                    <span>สำหรับเส้นทางลาดชันและจุดชมวิวยอดดอย</span>
                    <span className="service-option-price">เริ่มต้น 500 บาท / เที่ยว</span>
                  </div>
                </div>
              </div>

              <div className="service-contact-box">
                <span className="contact-label">ศูนย์ประสานงานรถบริการชุมชน:</span>
                <a href="tel:053123456" className="service-phone-link">
                  📞 053-123-456
                </a>
                <p className="service-note-text">
                  * สามารถแจ้งจุดรับและจุดส่งแก่ผู้ประสานงาน หรือสอบถามที่พักของคุณได้ตลอด 24 ชม.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== SERVICES MODAL (บริการ) ===================== */}
      {activeServiceModal === 'service' && (
        <div
          className="booking-drawer-backdrop"
          onClick={() => setActiveServiceModal(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="concept-detail-sheet service-modal-sheet"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header-row">
              <h2 className="modal-title">🛠️ บริการในชุมชน</h2>
              <button
                type="button"
                className="circle-control-btn close-modal-btn"
                onClick={() => setActiveServiceModal(null)}
                aria-label="ปิด"
              >
                ✕
              </button>
            </div>
            <div className="modal-body-scroll">
              <p className="modal-desc">
                บริการและสิ่งอำนวยความสะดวกจากภูมิปัญญาท้องถิ่น
                เพื่อให้คุณสัมผัสวิถีไทยได้อย่างลึกซึ้ง
              </p>

              <div className="service-options-list">
                <div className="service-option-card">
                  <div className="service-option-icon">🧭</div>
                  <div className="service-option-info">
                    <strong>ไกด์ท้องถิ่น / ผู้นำทางชุมชน</strong>
                    <span>ฟังเรื่องเล่าประวัติศาสตร์และวิถีชาวบ้านจากครูช่างและปราชญ์ท้องถิ่น</span>
                    <span className="service-option-price">300 - 500 บาท / ทริป</span>
                  </div>
                </div>

                <div className="service-option-card">
                  <div className="service-option-icon">👘</div>
                  <div className="service-option-info">
                    <strong>เช่าชุดพื้นเมือง / ล้านนาถ่ายภาพ</strong>
                    <span>ชุดผ้าทอมือและเครื่องประดับเงินแท้ ถ่ายภาพมุมสวยในชุมชน</span>
                    <span className="service-option-price">150 - 250 บาท / วัน</span>
                  </div>
                </div>

                <div className="service-option-card">
                  <div className="service-option-icon">💆</div>
                  <div className="service-option-info">
                    <strong>นวดแผนไทย & ประคบสมุนไพรสด</strong>
                    <span>ผ่อนคลายด้วยสมุนไพรพื้นบ้านปลูกเองในชุมชน</span>
                    <span className="service-option-price">250 บาท / ชั่วโมง</span>
                  </div>
                </div>

                <div className="service-option-card">
                  <div className="service-option-icon">🚴</div>
                  <div className="service-option-info">
                    <strong>เช่าจักรยาน / มอเตอร์ไซค์เที่ยวชุมชน</strong>
                    <span>ปั่นชมสวน เลียบลำธาร และแวะร้านค้าท้องถิ่น</span>
                    <span className="service-option-price">เริ่มต้น 80 บาท / วัน</span>
                  </div>
                </div>
              </div>

              <div className="service-contact-box">
                <span className="contact-label">สอบถามหรือจองบริการล่วงหน้า:</span>
                <a href="tel:053123456" className="service-phone-link">
                  📞 053-123-456 (ศูนย์ข้อมูลชุมชน)
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
