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
};
const methods: Record<string, string> = {
  instant_food_delivery: 'ส่งอาหารทันที',
  parcel_delivery: 'ส่งพัสดุ',
  pickup: 'รับที่ร้าน',
};
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
function Card({ p, onAdd }: { p: Product; onAdd: (p: Product) => void }) {
  const [lat, setLat] = useState(''),
    [lng, setLng] = useState(''),
    [result, setResult] = useState(''),
    [busy, setBusy] = useState(false);
  return (
    <article className="product-card">
      {p.hasImage ? (
        <img src={'/api/v1/products/' + p.id + '/image?v=' + p.version} alt={p.name} />
      ) : (
        <div className="product-placeholder">สินค้าชุมชน</div>
      )}
      <div className="store-body">
        <span className="badge">{p.storeName}</span>
        <h2>{p.name}</h2>
        <p>{p.description}</p>
        <strong>
          {(p.priceSatang / 100).toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท
        </strong>
        <p>{methods[p.fulfillment]}</p>
        <button type="button" onClick={() => onAdd(p)}>
          เพิ่มลงตะกร้า
        </button>
        {p.fulfillment === 'instant_food_delivery' && (
          <form
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
            <label>
              ละติจูดจัดส่ง
              <input
                type="number"
                required
                step="any"
                min="-90"
                max="90"
                value={lat}
                onChange={(e) => {
                  setLat(e.target.value);
                  setResult('');
                }}
              />
            </label>
            <label>
              ลองจิจูดจัดส่ง
              <input
                type="number"
                required
                step="any"
                min="-180"
                max="180"
                value={lng}
                onChange={(e) => {
                  setLng(e.target.value);
                  setResult('');
                }}
              />
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button disabled={busy}>ตรวจพื้นที่จัดส่ง</button>
              <button
                type="button"
                className="outline"
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
            <p role="status">{result}</p>
          </form>
        )}
      </div>
    </article>
  );
}
export default function Catalog() {
  const [rows, setRows] = useState<Product[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(''),
    [query, setQuery] = useState('');
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
  const subtotal = cart.reduce((sum, i) => sum + i.p.priceSatang * i.quantity, 0);
  return (
    <>
      <PublicHeader />
      <main className="catalog-page">
        <div className="trips-intro">
          <span className="eyebrow">LOCAL FINDS</span>
          <h1>สินค้าจากชุมชน</h1>
          <p>เลือกของดี สัมผัสรสชาติและงานฝีมือท้องถิ่น</p>
        </div>
        <p className="notice">
          ระบบสั่งซื้อทดลองในเครื่อง ยอดสินค้าไม่รวมค่าส่ง ยังไม่มีการเรียกเก็บเงินจริง
        </p>
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
        <section className="panel cart-panel">
          <div className="panel-head">
            <h2>ตะกร้า · {cart.reduce((n, i) => n + i.quantity, 0)} ชิ้น</h2>
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
            <p>เลือกสินค้าที่ต้องการด้านล่าง</p>
          ) : (
            <form onSubmit={checkout}>
              <fieldset disabled={busy} className="editor-fields">
                <p>
                  {cart[0].p.storeName} · {methods[cart[0].p.fulfillment]}
                </p>
                {cart.map((i) => (
                  <div className="cart-line" key={i.p.id}>
                    <span>{i.p.name}</span>
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
                    <strong>
                      {((i.p.priceSatang * i.quantity) / 100).toLocaleString('th-TH', {
                        minimumFractionDigits: 2,
                      })}{' '}
                      บาท
                    </strong>
                    <button
                      type="button"
                      className="outline"
                      onClick={() => {
                        changed();
                        setCart(cart.filter((v) => v.p.id !== i.p.id));
                      }}
                    >
                      นำออก
                    </button>
                  </div>
                ))}
                <h3>
                  ยอดสินค้า {(subtotal / 100).toLocaleString('th-TH', { minimumFractionDigits: 2 })}{' '}
                  บาท
                </h3>
                <p>ยอดนี้ยังไม่รวมค่าส่งและไม่มีการเรียกเก็บเงิน</p>
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
                <p className="footnote">
                  ตรวจราคาและจำนวนอีกครั้งเมื่อยืนยัน ตะกร้าเก็บเฉพาะหน้านี้
                  หากราคาปรับให้ล้างตะกร้าและเลือกใหม่
                </p>
              </fieldset>
            </form>
          )}
        </section>
        <label>
          ค้นหาสินค้าหรือร้าน
          <input value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <button disabled={busy || loading} className="outline" onClick={load}>
          โหลดสินค้าใหม่
        </button>
        {loading ? (
          <p>กำลังโหลด…</p>
        ) : (
          <div className="product-grid">
            {rows
              .filter((p) => (p.name + ' ' + p.storeName).includes(query))
              .map((p) => (
                <Card key={p.id} p={p} onAdd={add} />
              ))}
          </div>
        )}
        {!loading && !error && rows.length === 0 && (
          <p className="empty">ยังไม่มีสินค้าที่พร้อมขาย</p>
        )}
      </main>
    </>
  );
}
