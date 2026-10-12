'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import PublicHeader from '../public-header';

type Product = {
  id: string;
  storeId: string;
  stock: number;
  name: string;
  description: string;
  priceSatang: number;
  fulfillment: string;
  storeName: string;
  hasImage: boolean;
  version: number;
  category?: string;
};

const methods: Record<string, string> = {
  instant_food_delivery: 'ส่งอาหารทันที',
  parcel_delivery: 'ส่งพัสดุ',
  pickup: 'รับที่ร้าน',
};

const PRODUCT_IMAGES: Record<string, string> = {
  กระเป๋าสานจากกก:
    'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=600&q=80',
  ผ้าฝ้ายย้อมคราม:
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80',
  แก้วเซรามิกแฮนด์เมด:
    'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
  ชาใบดอยเชียงใหม่:
    'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
  ผ้าคลุมไหล่ทอมือย้อมครามธรรมชาติ:
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80',
  ข้าวซอยไก่สูตรโบราณ:
    'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=600&q=80',
  'เซ็ตน้ำพริกหนุ่ม แคบหมูไร้มัน':
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
};

function getProductPhoto(p: Product): string {
  if (p.hasImage) return `/api/v1/products/${p.id}/image?v=${p.version}`;
  if (PRODUCT_IMAGES[p.name]) return PRODUCT_IMAGES[p.name];
  if (p.category === 'craft')
    return 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80';
  return 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=600&q=80';
}

function getCurrentLocation(
  onSuccess: (lat: string, lng: string) => void,
  onError: (msg: string) => void,
) {
  if (typeof window === 'undefined' || !navigator.geolocation) {
    onError('อุปกรณ์นี้ไม่รองรับการระบุตำแหน่ง GPS');
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      onSuccess(pos.coords.latitude.toFixed(6), pos.coords.longitude.toFixed(6));
    },
    (err) => {
      onError('ไม่สามารถระบุตำแหน่งได้: ' + (err.message || 'กรุณาอนุญาตการเข้าถึงตำแหน่ง'));
    },
    { enableHighAccuracy: true, timeout: 10000 },
  );
}

function Card({
  p,
  onAdd,
  isFavorite,
  onToggleFavorite,
}: {
  p: Product;
  onAdd: (p: Product) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}) {
  const [lat, setLat] = useState(''),
    [lng, setLng] = useState(''),
    [result, setResult] = useState(''),
    [busy, setBusy] = useState(false),
    [showDeliveryCheck, setShowDeliveryCheck] = useState(false);

  const photoUrl = getProductPhoto(p);

  return (
    <article className="product-card catalog-product-card">
      <div className="product-photo-wrap">
        <img src={photoUrl} alt={p.name} className="catalog-product-img" loading="lazy" />
        <button
          type="button"
          className={'catalog-heart-btn' + (isFavorite ? ' active' : '')}
          onClick={() => onToggleFavorite(p.id)}
          aria-label="บันทึกรายการโปรด"
        >
          {isFavorite ? '❤️' : '🤍'}
        </button>
      </div>

      <div className="catalog-card-body">
        <h2 className="catalog-product-title">{p.name}</h2>
        <p className="catalog-store-name">{p.storeName}</p>

        <div className="catalog-price-action-row">
          <div className="catalog-price-wrap">
            <strong className="catalog-price-val">
              {Math.round(p.priceSatang / 100).toLocaleString('th-TH')} บาท
            </strong>
          </div>

          <button
            type="button"
            className="catalog-circle-add-btn"
            onClick={() => onAdd(p)}
            aria-label="เพิ่มลงตะกร้า"
            title="เพิ่มลงตะกร้า"
          >
            <span className="plus-symbol">+</span>
            <span className="sr-only">เพิ่มลงตะกร้า</span>
          </button>
        </div>

        {p.fulfillment === 'instant_food_delivery' && (
          <div className="delivery-check-accordion">
            <button
              type="button"
              className="text-link-btn"
              onClick={() => setShowDeliveryCheck(!showDeliveryCheck)}
            >
              {showDeliveryCheck ? '▲ ซ่อนตรวจพื้นที่' : '▼ ตรวจพื้นที่ส่งอาหาร'}
            </button>
            {showDeliveryCheck && (
              <form
                className="delivery-inline-form"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setBusy(true);
                  try {
                    const res = await fetch('/api/v1/catalog/' + p.id + '/availability', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', 'X-ThinThai-Action': '1' },
                      body: JSON.stringify({ point: { lat: Number(lat), lng: Number(lng) } }),
                    });
                    const data = await res.json();
                    setResult(res.ok ? data.reason : data.message);
                  } catch {
                    setResult('ตรวจพื้นที่ไม่สำเร็จ');
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                <div className="form-inline-inputs">
                  <input
                    type="number"
                    required
                    step="any"
                    placeholder="ละติจูด"
                    min="-90"
                    max="90"
                    value={lat}
                    onChange={(e) => {
                      setLat(e.target.value);
                      setResult('');
                    }}
                  />
                  <input
                    type="number"
                    required
                    step="any"
                    placeholder="ลองจิจูด"
                    min="-180"
                    max="180"
                    value={lng}
                    onChange={(e) => {
                      setLng(e.target.value);
                      setResult('');
                    }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                  <button disabled={busy} className="mini-btn">
                    ตรวจ
                  </button>
                  <button
                    type="button"
                    className="mini-btn outline"
                    disabled={busy}
                    onClick={() => {
                      getCurrentLocation(
                        (newLat, newLng) => {
                          setLat(newLat);
                          setLng(newLng);
                          setResult('ระบุตำแหน่งพิกัดปัจจุบันแล้ว');
                        },
                        (err) => setResult(err),
                      );
                    }}
                  >
                    📍 ใช้พิกัดปัจจุบัน
                  </button>
                </div>
                {result && (
                  <p role="status" className="delivery-status-note">
                    {result}
                  </p>
                )}
              </form>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

export default function Catalog() {
  const [rows, setRows] = useState<Product[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(''),
    [query, setQuery] = useState(''),
    [selectedCategory, setSelectedCategory] = useState<'all' | 'craft' | 'souvenir'>('all'),
    [favorites, setFavorites] = useState<Set<string>>(new Set()),
    [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  const [cart, setCart] = useState<{ p: Product; quantity: number }[]>([]),
    [recipient, setRecipient] = useState(''),
    [phone, setPhone] = useState(''),
    [address, setAddress] = useState(''),
    [lat, setLat] = useState(''),
    [lng, setLng] = useState(''),
    [busy, setBusy] = useState(false),
    [notice, setNotice] = useState('');
  const key = useRef('');

  async function load() {
    setLoading(true);
    try {
      const r = await fetch('/api/v1/catalog', { cache: 'no-store' });
      if (!r.ok) throw Error('โหลดสินค้าไม่สำเร็จ');
      setRows(await r.json());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    key.current = crypto.randomUUID();
    try {
      const saved = localStorage.getItem('thinthai_cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setCart(parsed);
      }
    } catch {
      // ignore storage access error
    }
    void load();
  }, []);

  useEffect(() => {
    try {
      if (cart.length > 0) {
        localStorage.setItem('thinthai_cart', JSON.stringify(cart));
      } else {
        localStorage.removeItem('thinthai_cart');
      }
    } catch {
      // ignore storage access error
    }
  }, [cart]);

  function changed() {
    key.current = crypto.randomUUID();
    setNotice('');
  }

  function toggleFavorite(id: string) {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function add(p: Product) {
    if (busy) return;
    setError('');
    if (
      cart.length &&
      (cart[0].p.storeId !== p.storeId || cart[0].p.fulfillment !== p.fulfillment)
    ) {
      setError('สั่งได้ครั้งละร้านและวิธีรับสินค้าเดียวกัน กรุณาจบรายการเดิมหรือล้างตะกร้าก่อน');
      return;
    }
    const exists = cart.find((i) => i.p.id === p.id);
    if ((exists?.quantity ?? 0) >= Math.min(p.stock, 99)) {
      setError('จำนวนเกินสต๊อกที่แสดงหรือเกิน 99 ชิ้น');
      return;
    }
    if (!exists && cart.length >= 20) {
      setError('เลือกได้ไม่เกิน 20 รายการ');
      return;
    }
    changed();
    setCart(
      exists
        ? cart.map((i) => (i.p.id === p.id ? { ...i, quantity: i.quantity + 1 } : i))
        : [...cart, { p, quantity: 1 }],
    );
  }

  async function checkout(e: React.FormEvent) {
    e.preventDefault();
    if (!cart.length) return;
    setBusy(true);
    setError('');
    try {
      const r = await fetch('/api/v1/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-ThinThai-Action': '1' },
        body: JSON.stringify({
          storeId: cart[0].p.storeId,
          fulfillment: cart[0].p.fulfillment,
          items: cart.map((i) => ({
            productId: i.p.id,
            quantity: i.quantity,
            expectedPriceSatang: i.p.priceSatang,
          })),
          recipient,
          phone,
          address,
          requestKey: key.current,
          ...(cart[0].p.fulfillment === 'instant_food_delivery'
            ? { point: { lat: Number(lat), lng: Number(lng) } }
            : {}),
        }),
      });
      const data = await r.json();
      if (!r.ok)
        throw Error(r.status === 401 ? 'กรุณาเข้าสู่ระบบก่อนยืนยันคำสั่งซื้อ' : data.message);
      setNotice('บันทึกคำสั่งซื้อ ' + data.id.slice(0, 8) + ' แล้ว');
      setCart([]);
      setRecipient('');
      setPhone('');
      setAddress('');
      setLat('');
      setLng('');
      key.current = crypto.randomUUID();
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const totalCartCount = cart.reduce((n, i) => n + i.quantity, 0);
  const subtotal = cart.reduce((sum, i) => sum + i.p.priceSatang * i.quantity, 0);

  const filteredRows = rows.filter((p) => {
    const matchesQuery =
      query.trim() === '' ||
      (p.name + ' ' + p.storeName + ' ' + p.description)
        .toLowerCase()
        .includes(query.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' ||
      (selectedCategory === 'craft' &&
        (p.category === 'craft' ||
          p.name.includes('ผ้า') ||
          p.name.includes('กระเป๋า') ||
          p.name.includes('แก้ว') ||
          p.name.includes('หัตถกรรม'))) ||
      (selectedCategory === 'souvenir' &&
        (p.category === 'food' ||
          p.name.includes('ชา') ||
          p.name.includes('น้ำพริก') ||
          p.name.includes('ข้าวซอย') ||
          p.name.includes('ของฝาก')));

    return matchesQuery && matchesCategory;
  });

  return (
    <div className="catalog-page-container">
      <PublicHeader />

      <main className="catalog-page concept-catalog-layout">
        {/* ===================== SCREEN 3 TOP BAR ===================== */}
        <div className="concept-catalog-topbar">
          <Link href="/" className="catalog-top-back-btn" aria-label="ย้อนกลับ">
            ‹
          </Link>
          <h1 className="catalog-screen-title">ของดีจากชุมชน</h1>
          <button
            type="button"
            className="catalog-top-cart-icon-btn"
            onClick={() => setIsCartDrawerOpen(!isCartDrawerOpen)}
            aria-label={`ตะกร้าสินค้า ${totalCartCount} ชิ้น`}
          >
            🛒
            {totalCartCount > 0 && <span className="cart-badge-counter">{totalCartCount}</span>}
          </button>
        </div>

        {/* ===================== SEARCH BAR ===================== */}
        <section className="catalog-search-section">
          <div className="catalog-search-capsule">
            <span className="search-lens-symbol">🔍</span>
            <input
              type="text"
              className="catalog-search-field"
              placeholder="ค้นหาสินค้าและร้านค้า"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </section>

        {/* ===================== FILTER CHIPS ===================== */}
        <section className="catalog-category-chips" aria-label="หมวดหมู่สินค้า">
          <button
            type="button"
            className={'catalog-chip' + (selectedCategory === 'all' ? ' active' : '')}
            onClick={() => setSelectedCategory('all')}
          >
            ทั้งหมด
          </button>
          <button
            type="button"
            className={'catalog-chip' + (selectedCategory === 'craft' ? ' active' : '')}
            onClick={() => setSelectedCategory('craft')}
          >
            งานฝีมือ
          </button>
          <button
            type="button"
            className={'catalog-chip' + (selectedCategory === 'souvenir' ? ' active' : '')}
            onClick={() => setSelectedCategory('souvenir')}
          >
            ของฝาก
          </button>
        </section>

        {/* ===================== STATUS NOTICES ===================== */}
        {notice && (
          <p className="success" role="status">
            {notice} <Link href="/orders">ดูคำสั่งซื้อ</Link>
          </p>
        )}
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}

        {/* ===================== 2-COLUMN PRODUCT GRID (SCREEN 3) ===================== */}
        {loading ? (
          <div className="catalog-loading-state">
            <p>กำลังโหลดสินค้าชุมชน…</p>
          </div>
        ) : (
          <div className="catalog-grid-2col product-grid">
            {filteredRows.map((p) => (
              <Card
                key={p.id}
                p={p}
                onAdd={add}
                isFavorite={favorites.has(p.id)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        )}

        {!loading && !error && filteredRows.length === 0 && (
          <p className="empty">ยังไม่มีสินค้าที่พร้อมขายในหมวดนี้</p>
        )}

        {/* ===================== CART PANEL / CHECKOUT DRAWER ===================== */}
        {/* Rendered directly on page to satisfy e2e testing while styling as a modern clean panel */}
        <section
          className={
            'panel cart-panel concept-cart-drawer' +
            (cart.length > 0 || isCartDrawerOpen ? ' is-visible' : ' is-collapsed')
          }
        >
          <div className="panel-head">
            <h2>ตะกร้า · {totalCartCount} ชิ้น</h2>
            {cart.length > 0 && (
              <button
                disabled={busy}
                className="outline"
                onClick={() => {
                  changed();
                  setCart([]);
                }}
              >
                ล้างตะกร้า
              </button>
            )}
          </div>

          {cart.length === 0 ? (
            <p className="cart-empty-text">เลือกสินค้าที่ต้องการด้านบน</p>
          ) : (
            <form onSubmit={checkout}>
              <fieldset disabled={busy} className="editor-fields">
                <p className="cart-store-summary">
                  {cart[0].p.storeName} · {methods[cart[0].p.fulfillment]}
                </p>
                {cart.map((i) => (
                  <div className="cart-line" key={i.p.id}>
                    <span className="cart-item-name">{i.p.name}</span>
                    <label>
                      จำนวน {i.p.name}
                      <input
                        type="number"
                        min="1"
                        max="99"
                        step="1"
                        required
                        value={i.quantity}
                        onChange={(e) => {
                          changed();
                          setCart(
                            cart.map((v) =>
                              v.p.id === i.p.id ? { ...v, quantity: Number(e.target.value) } : v,
                            ),
                          );
                        }}
                      />
                    </label>
                    <strong className="cart-line-price">
                      {((i.p.priceSatang * i.quantity) / 100).toLocaleString('th-TH', {
                        minimumFractionDigits: 2,
                      })}{' '}
                      บาท
                    </strong>
                    <button
                      type="button"
                      className="outline mini-remove-btn"
                      onClick={() => {
                        changed();
                        setCart(cart.filter((v) => v.p.id !== i.p.id));
                      }}
                    >
                      นำออก
                    </button>
                  </div>
                ))}

                <h3 className="cart-subtotal-heading">
                  ยอดสินค้า {(subtotal / 100).toLocaleString('th-TH', { minimumFractionDigits: 2 })}{' '}
                  บาท
                </h3>
                <p className="cart-footnote-text">ยอดนี้ยังไม่รวมค่าส่งและไม่มีการเรียกเก็บเงิน</p>

                <div className="form-grid">
                  <label>
                    ชื่อผู้รับ
                    <input
                      required
                      maxLength={100}
                      autoComplete="name"
                      value={recipient}
                      onChange={(e) => {
                        changed();
                        setRecipient(e.target.value);
                      }}
                    />
                  </label>
                  <label>
                    เบอร์ผู้รับ
                    <input
                      required
                      type="tel"
                      minLength={8}
                      maxLength={20}
                      autoComplete="tel"
                      value={phone}
                      onChange={(e) => {
                        changed();
                        setPhone(e.target.value);
                      }}
                    />
                  </label>
                </div>

                {cart[0].p.fulfillment !== 'pickup' && (
                  <label>
                    ที่อยู่จัดส่ง
                    <textarea
                      required
                      minLength={5}
                      maxLength={500}
                      value={address}
                      onChange={(e) => {
                        changed();
                        setAddress(e.target.value);
                      }}
                    />
                  </label>
                )}

                {cart[0].p.fulfillment === 'instant_food_delivery' && (
                  <>
                    <div className="form-grid">
                      <label>
                        ละติจูดปลายทาง
                        <input
                          required
                          type="number"
                          step="any"
                          min="-90"
                          max="90"
                          value={lat}
                          onChange={(e) => {
                            changed();
                            setLat(e.target.value);
                          }}
                        />
                      </label>
                      <label>
                        ลองจิจูดปลายทาง
                        <input
                          required
                          type="number"
                          step="any"
                          min="-180"
                          max="180"
                          value={lng}
                          onChange={(e) => {
                            changed();
                            setLng(e.target.value);
                          }}
                        />
                      </label>
                    </div>
                    <button
                      type="button"
                      className="outline"
                      disabled={busy}
                      style={{ marginBottom: '14px', width: '100%' }}
                      onClick={() => {
                        getCurrentLocation(
                          (newLat, newLng) => {
                            changed();
                            setLat(newLat);
                            setLng(newLng);
                            setNotice('ปักหมุดพิกัดปัจจุบันเรียบร้อย');
                          },
                          (err) => setError(err),
                        );
                      }}
                    >
                      📍 ปักหมุดจากตำแหน่งปัจจุบัน (GPS)
                    </button>
                  </>
                )}

                <button className="checkout-button">
                  {busy ? 'กำลังยืนยัน…' : 'ยืนยันคำสั่งซื้อทดลอง'}
                </button>
              </fieldset>
            </form>
          )}
        </section>

        {/* ===================== FLOATING STICKY CART BAR (SCREEN 3) ===================== */}
        {cart.length > 0 && (
          <div className="floating-cart-bar-container">
            <button
              type="button"
              className="floating-cart-bar"
              onClick={() => {
                setIsCartDrawerOpen(true);
                const el = document.querySelector('.cart-panel');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <span className="cart-bar-left">🛒 ตะกร้า • {totalCartCount} ชิ้น</span>
              <span className="cart-bar-right">ดูตะกร้า →</span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
