'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import PublicHeader from '../public-header';
import Landscape from '../landscape';
import { categories, money, tripDate, tripApi, type Trip } from '../trip-shared';

export default function TripsClient({ initialTrips = [] }: { initialTrips?: Trip[] }) {
  const searchParams = useSearchParams();
  const urlCat = searchParams?.get('cat') || searchParams?.get('category') || '';

  const [rows, setRows] = useState<Trip[]>(initialTrips),
    [loading, setLoading] = useState(initialTrips.length === 0),
    [error, setError] = useState(''),
    [notice, setNotice] = useState(''),
    [query, setQuery] = useState(''),
    [category, setCategory] = useState(''),
    [selected, setSelected] = useState<Trip | null>(null),
    [departure, setDeparture] = useState(''),
    [seats, setSeats] = useState(1),
    [name, setName] = useState(''),
    [phone, setPhone] = useState(''),
    [busy, setBusy] = useState(false);
  const nonce = useRef('');

  useEffect(() => {
    if (urlCat) {
      if (urlCat in categories) {
        setCategory(urlCat);
      } else if (urlCat === 'ธรรมชาติ') {
        setCategory('nature');
      } else if (urlCat === 'วัฒนธรรม' || urlCat === 'วิถี' || urlCat === 'กิจกรรม') {
        setCategory('culture');
      } else if (urlCat === 'อาหาร') {
        setCategory('food');
      } else if (urlCat === 'งานฝีมือ') {
        setCategory('craft');
      }
    }
  }, [urlCat]);

  async function load() {
    setLoading(true);
    try {
      const data = await tripApi('trips');
      setRows(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // If no initial trips were passed from SSR, load them on client
    if (initialTrips.length === 0) {
      void load();
    }
  }, [initialTrips]);

  function changed() {
    nonce.current = '';
    setNotice('');
  }

  function choose(t: Trip) {
    setSelected(t);
    setDeparture(t.departures.find((d) => d.active && d.remaining > 0)?.id ?? '');
    setSeats(1);
    changed();
    setError('');
    setTimeout(
      () =>
        document
          .getElementById('book-trip')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
      0,
    );
  }

  async function book(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || busy) return;
    setBusy(true);
    setError('');
    nonce.current ||= crypto.randomUUID();
    try {
      const result = await tripApi('bookings', {
        departureId: departure,
        seats,
        expectedPriceSatang: selected.priceSatang,
        contactName: name,
        phone,
        requestKey: nonce.current,
      });
      setNotice('บันทึกคำขอจองแล้ว · ' + result.id.slice(0, 8));
      setSelected(null);
      nonce.current = '';
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const filtered = rows.filter(
    (t) =>
      (!category || t.category === category) &&
      [t.title, t.province, t.storeName, t.description]
        .join(' ')
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const current = selected?.departures.find((d) => d.id === departure);

  return (
    <div className="public-site">
      <PublicHeader />
      <main className="catalog-page trips-page">
        <section className="trips-intro">
          <span className="eyebrow">GO LOCAL WITH THINTHAI</span>
          <h1>ออกไปพบถิ่นใหม่ ๆ</h1>
          <p>เลือกกิจกรรมที่ชอบ จองรอบที่ใช่ แล้วไปสัมผัสเรื่องราวของชุมชน</p>
        </section>
        <p className="notice">
          การจองรุ่นทดลอง · กันที่นั่งเมื่อส่งคำขอ รอผู้ประกอบการยืนยัน · ยังไม่รับชำระเงินจริง
        </p>
        <div className="trip-filters">
          <label>
            ค้นหาทริป
            <input
              type="search"
              placeholder="ชื่อทริป จังหวัด หรือชุมชน"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <label>
            กิจกรรม
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">ทุกกิจกรรม</option>
              {Object.entries(categories).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <button
            disabled={loading || busy}
            className="outline"
            onClick={() => {
              setError('');
              void load();
            }}
          >
            โหลดรอบใหม่
          </button>
        </div>
        {error && (
          <p role="alert" className="error">
            {error} <Link href="/workspace">เข้าสู่ระบบ</Link>
          </p>
        )}
        {notice && (
          <p role="status" className="success">
            {notice} <Link href="/bookings">ดูทริปของฉัน</Link>
          </p>
        )}
        {selected && (
          <section id="book-trip" className="panel booking-form">
            <h2>จอง · {selected.title}</h2>
            <p>จุดนัดพบ: {selected.meetingPoint}</p>
            <form onSubmit={book}>
              <fieldset disabled={busy} className="editor-fields">
                <label>
                  รอบเดินทาง (เวลาไทย)
                  <select
                    required
                    value={departure}
                    onChange={(e) => {
                      changed();
                      setDeparture(e.target.value);
                      setSeats(1);
                    }}
                  >
                    <option value="">เลือกรอบ</option>
                    {selected.departures
                      .filter((d) => d.active)
                      .map((d) => (
                        <option key={d.id} value={d.id} disabled={d.remaining < 1}>
                          {tripDate(d.startsAt)} · เหลือ {d.remaining} ที่
                        </option>
                      ))}
                  </select>
                </label>
                <label>
                  จำนวนผู้เดินทาง
                  <input
                    type="number"
                    required
                    min={1}
                    max={Math.min(10, current?.remaining ?? 10)}
                    step="1"
                    value={seats}
                    onChange={(e) => {
                      changed();
                      setSeats(Number(e.target.value));
                    }}
                  />
                </label>
                <label>
                  ชื่อผู้ติดต่อ
                  <input
                    required
                    maxLength={100}
                    autoComplete="name"
                    value={name}
                    onChange={(e) => {
                      changed();
                      setName(e.target.value);
                    }}
                  />
                </label>
                <label>
                  เบอร์โทรติดต่อ
                  <input
                    type="tel"
                    autoComplete="tel"
                    required
                    minLength={8}
                    maxLength={20}
                    value={phone}
                    onChange={(e) => {
                      changed();
                      setPhone(e.target.value);
                    }}
                  />
                </label>
                <strong>
                  รวม {money(selected.priceSatang * seats)} บาท · {money(selected.priceSatang)}{' '}
                  บาท/คน
                </strong>
                <p>
                  ยกเลิกได้ก่อนผู้ประกอบการยืนยันและก่อนเริ่มทริป
                  เมื่อยืนยันแล้วกรุณาติดต่อผู้ประกอบการผ่านรายละเอียดการจอง
                  ไม่มีการเรียกเก็บเงินในขั้นตอนนี้
                </p>
                <div className="store-actions">
                  <button disabled={busy || !departure}>ส่งคำขอจองทดลอง</button>
                  <button type="button" className="outline" onClick={() => setSelected(null)}>
                    ปิด
                  </button>
                </div>
              </fieldset>
            </form>
          </section>
        )}
        {loading ? (
          <p role="status">กำลังโหลดทริป…</p>
        ) : (
          <>
            <p>{filtered.length} ทริปที่พบ</p>
            {!filtered.length && (
              <section className="empty">
                ยังไม่พบทริปที่ตรงกับการค้นหา ลองเปลี่ยนคำค้นหรือกลับมาใหม่
              </section>
            )}
            <div className="product-grid trip-grid">
              {filtered.map((t) => (
                <article className={'trip-card trip-' + t.category} key={t.id}>
                  <div className="trip-art">
                    <Landscape />
                    <span className="badge">{categories[t.category]}</span>
                  </div>
                  <div className="store-body">
                    <small>
                      {t.province} · {t.durationHours} ชั่วโมง
                    </small>
                    <h2>{t.title}</h2>
                    <p>{t.storeName}</p>
                    <p>{t.description}</p>
                    <details>
                      <summary>จุดนัดพบและเงื่อนไข</summary>
                      <p>{t.meetingPoint}</p>
                      <p>
                        ราคาเป็นรายคน โปรดอ่านรายละเอียดสิ่งที่รวมในทริปด้านบน รอบแสดงตามเวลาไทย
                      </p>
                    </details>
                    <div className="trip-price">
                      <strong>
                        {money(t.priceSatang)} ฿ <small>/ คน</small>
                      </strong>
                      <button
                        disabled={busy || !t.departures.some((d) => d.remaining > 0 && d.active)}
                        onClick={() => choose(t)}
                      >
                        {t.departures.some((d) => d.remaining > 0 && d.active)
                          ? 'เลือกรอบ'
                          : 'ที่นั่งเต็ม'}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
