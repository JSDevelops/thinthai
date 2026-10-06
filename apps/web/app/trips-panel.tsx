'use client';
import { useEffect, useState } from 'react';
import { categories, tripApi, tripDate, money, type Trip } from './trip-shared';
import BookingsPanel from './bookings-panel';
const blank = {
  title: '',
  description: '',
  meetingPoint: '',
  category: 'nature',
  durationHours: 3,
  price: '',
  active: false,
};
export default function TripsPanel({ stores }: { stores: { id: string; name: string }[] }) {
  const [rows, setRows] = useState<Trip[]>([]),
    [error, setError] = useState(''),
    [notice, setNotice] = useState(''),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [store, setStore] = useState(stores[0]?.id ?? ''),
    [form, setForm] = useState(blank),
    [editing, setEditing] = useState<Trip | null>(null),
    [show, setShow] = useState(false),
    [round, setRound] = useState<Trip | null>(null),
    [starts, setStarts] = useState(''),
    [capacity, setCapacity] = useState(10);
  async function load() {
    setLoading(true);
    try {
      setRows(await tripApi('trips/manage'));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load();
  }, []);
  async function run(fn: () => Promise<unknown>) {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await fn();
      setNotice('บันทึกทริปแล้ว');
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    await run(async () => {
      const { price, ...rest } = form;
      await tripApi(editing ? 'trips/' + editing.id : 'stores/' + store + '/trips', {
        ...rest,
        priceSatang: Math.round(Number(price) * 100),
        ...(editing ? { version: editing.version } : {}),
      });
      setShow(false);
      setEditing(null);
    });
  }
  async function addRound(e: React.FormEvent) {
    e.preventDefault();
    if (!round || busy) return;
    await run(async () => {
      await tripApi('trips/' + round.id + '/departures', {
        startsAt: starts + ':00+07:00',
        capacity,
      });
      setRound(null);
    });
  }
  return (
    <>
      <section className="panel trips-panel">
        <div className="panel-head">
          <div>
            <h2>ทริปและรอบเดินทาง</h2>
            <p>เปิดรอบตามเวลาไทย จัดการเฉพาะชุมชนที่คุณดูแล</p>
          </div>
          <button
            disabled={busy || !stores.length}
            onClick={() => {
              setForm(blank);
              setEditing(null);
              setShow(true);
            }}
          >
            เพิ่มทริป
          </button>
          <button className="outline" disabled={busy || loading} onClick={load}>
            โหลดทริปใหม่
          </button>
        </div>
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        {notice && (
          <p role="status" className="success">
            {notice}
          </p>
        )}
        {show && (
          <form className="product-editor" onSubmit={save}>
            <h3>{editing ? 'แก้ไขทริป' : 'สร้างทริป'}</h3>
            <fieldset className="editor-fields" disabled={busy}>
              {!editing && (
                <label>
                  ผู้ให้บริการ
                  <select
                    aria-label="ผู้ให้บริการ"
                    required
                    value={store}
                    onChange={(e) => setStore(e.target.value)}
                  >
                    <option value="">เลือกชุมชน</option>
                    {stores.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <label>
                ชื่อทริป
                <input
                  required
                  minLength={3}
                  maxLength={150}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </label>
              <label>
                รายละเอียดและสิ่งที่รวม
                <textarea
                  required
                  minLength={10}
                  maxLength={1000}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </label>
              <label>
                จุดนัดพบและช่องทางติดต่อ
                <textarea
                  required
                  minLength={5}
                  maxLength={500}
                  value={form.meetingPoint}
                  onChange={(e) => setForm({ ...form, meetingPoint: e.target.value })}
                />
              </label>
              <label>
                ประเภทกิจกรรม
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {Object.entries(categories).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                ระยะเวลา (ชั่วโมง)
                <input
                  type="number"
                  min="1"
                  max="168"
                  step="1"
                  required
                  value={form.durationHours}
                  onChange={(e) => setForm({ ...form, durationHours: Number(e.target.value) })}
                />
              </label>
              <label>
                ราคาต่อคน (บาท)
                <input
                  type="number"
                  min="0.01"
                  max="1000000"
                  step="0.01"
                  required
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </label>
              <label>
                การแสดงผล
                <select
                  aria-label="การแสดงผล"
                  value={form.active ? 'on' : 'off'}
                  onChange={(e) => setForm({ ...form, active: e.target.value === 'on' })}
                >
                  <option value="off">ฉบับร่าง / พักรับจอง</option>
                  <option value="on">เผยแพร่เมื่อมีรอบและร้านเปิดใช้งาน</option>
                </select>
              </label>
              <p>
                การแก้ไขมีผลกับการจองใหม่ การจองเดิมเก็บราคา รายละเอียดจุดนัดพบ และวันเดินทางเดิม
              </p>
              <div className="store-actions">
                <button>บันทึกทริป</button>
                <button type="button" className="outline" onClick={() => setShow(false)}>
                  ปิดฟอร์ม
                </button>
              </div>
            </fieldset>
          </form>
        )}
        {round && (
          <form className="product-editor" onSubmit={addRound}>
            <h3>เพิ่มรอบ · {round.title}</h3>
            <fieldset className="editor-fields" disabled={busy}>
              <label>
                วันและเวลาเดินทาง (ไทย)
                <input
                  type="datetime-local"
                  required
                  value={starts}
                  onChange={(e) => setStarts(e.target.value)}
                />
              </label>
              <label>
                จำนวนที่นั่ง
                <input
                  type="number"
                  min="1"
                  max="1000"
                  step="1"
                  required
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                />
              </label>
              <p>
                เปิดรอบล่วงหน้าอย่างน้อย 1 ชั่วโมง วันและความจุของรอบบันทึกแล้วแก้ไม่ได้
                ให้ปิดรอบและสร้างรอบใหม่
              </p>
              <div className="store-actions">
                <button>บันทึกรอบ</button>
                <button type="button" className="outline" onClick={() => setRound(null)}>
                  ปิดฟอร์มรอบ
                </button>
              </div>
            </fieldset>
          </form>
        )}
        {loading ? (
          <p>กำลังโหลด…</p>
        ) : !rows.length ? (
          <p className="empty">ยังไม่มีทริป เพิ่มทริปแรกของชุมชนได้เลย</p>
        ) : null}
        <div className="application-list">
          {rows.map((t) => (
            <article className="application-card managed-trip" key={t.id}>
              <span className="badge">{t.active ? 'เผยแพร่' : 'ฉบับร่าง / พักรับจอง'}</span>
              <h3>{t.title}</h3>
              <p>
                {t.storeName} · {t.province} · {money(t.priceSatang)} บาท/คน
              </p>
              <div className="store-actions">
                <button
                  className="outline"
                  disabled={busy}
                  onClick={() => {
                    setEditing(t);
                    setForm({
                      title: t.title,
                      description: t.description,
                      meetingPoint: t.meetingPoint,
                      category: t.category,
                      durationHours: t.durationHours,
                      price: String(t.priceSatang / 100),
                      active: t.active,
                    });
                    setShow(true);
                  }}
                >
                  แก้ไขทริป
                </button>
                <button
                  disabled={busy}
                  onClick={() => {
                    setRound(t);
                    setStarts('');
                    setCapacity(10);
                  }}
                >
                  เพิ่มรอบ
                </button>
              </div>
              <ul className="departure-list">
                {t.departures.map((d) => (
                  <li key={d.id}>
                    <span>
                      {tripDate(d.startsAt)} · เหลือ {d.remaining}/{d.capacity} ที่ ·{' '}
                      {d.active ? 'เปิดรับ' : 'ปิดรับ'}
                    </span>
                    <button
                      className="outline"
                      disabled={busy}
                      onClick={() =>
                        run(() =>
                          tripApi('departures/' + d.id, { version: d.version, active: !d.active }),
                        )
                      }
                    >
                      {d.active ? 'ปิดรับรอบนี้' : 'เปิดรับรอบนี้'}
                    </button>
                  </li>
                ))}
              </ul>
              <p className="footnote">
                ปิดรับรอบจะหยุดการจองใหม่ การจองเดิมยังอยู่ ให้จัดการยกเลิกแยกในรายการด้านล่าง
              </p>
            </article>
          ))}
        </div>
      </section>
      <BookingsPanel manage />
    </>
  );
}
