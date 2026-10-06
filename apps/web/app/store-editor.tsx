'use client';
import { useEffect, useState } from 'react';
import LocationMap from './location-map';
type Store = {
  id: string;
  name: string;
  address: string;
  category: 'food' | 'craft';
  provinceId: string;
  districtId: string;
  subdistrictId: string;
  lat: number | null;
  lng: number | null;
  active: boolean;
  version: number;
  deliveryEnabled: boolean;
  radiusKm: number | null;
};
type Area = {
  id: string;
  name: string;
  districtId: string;
  district: string;
  provinceId: string;
  province: string;
};
type History = { event: string; actor: string; createdAt: string; after: Store };
async function request(path: string, body?: unknown) {
  const res = await fetch('/api/v1/' + path, {
    cache: 'no-store',
    ...(body === undefined
      ? {}
      : {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-ThinThai-Action': '1' },
          body: JSON.stringify(body),
        }),
  });
  const data = await res.json();
  if (!res.ok) throw Error(data.message ?? 'ทำรายการไม่สำเร็จ');
  return data;
}
export default function StoreEditor({
  id,
  mode,
  onClose,
  onSaved,
}: {
  id: string | null;
  mode: 'store' | 'delivery' | 'history';
  onClose: () => void;
  onSaved: () => void;
}) {
  const [store, setStore] = useState<Store | null>(null),
    [areas, setAreas] = useState<Area[]>([]),
    [history, setHistory] = useState<History[]>([]),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const [name, setName] = useState(''),
    [address, setAddress] = useState(''),
    [category, setCategory] = useState<'food' | 'craft'>('food'),
    [active, setActive] = useState(true),
    [province, setProvince] = useState(''),
    [district, setDistrict] = useState(''),
    [subdistrict, setSubdistrict] = useState(''),
    [lat, setLat] = useState<number | null>(null),
    [lng, setLng] = useState<number | null>(null),
    [enabled, setEnabled] = useState(false),
    [radius, setRadius] = useState('3'),
    [checkLat, setCheckLat] = useState(''),
    [checkLng, setCheckLng] = useState(''),
    [result, setResult] = useState('');
  useEffect(() => {
    let canceled = false;
    void (async () => {
      try {
        const [a, s, h] = await Promise.all([
          mode === 'store' ? request('areas') : Promise.resolve([]),
          id ? request('stores/' + id) : Promise.resolve(null),
          mode === 'history' ? request('stores/' + id + '/history') : Promise.resolve([]),
        ]);
        if (canceled) return;
        setAreas(a);
        setStore(s);
        setHistory(h);
        if (s) {
          setName(s.name);
          setAddress(s.address);
          setCategory(s.category);
          setActive(s.active);
          setProvince(s.provinceId);
          setDistrict(s.districtId);
          setSubdistrict(s.subdistrictId);
          setLat(s.lat);
          setLng(s.lng);
          setEnabled(s.deliveryEnabled);
          setRadius(String(s.radiusKm ?? 3));
        }
      } catch (e) {
        if (!canceled) setError((e as Error).message);
      } finally {
        if (!canceled) setLoading(false);
      }
    })();
    return () => {
      canceled = true;
    };
  }, [id, mode]);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (mode === 'delivery') {
        await request('stores/' + id + '/delivery', {
          version: store!.version,
          enabled,
          radiusKm: enabled ? Number(radius) : null,
        });
      } else {
        await request(id ? 'stores/' + id : 'stores', {
          name,
          address,
          category,
          subdistrictId: subdistrict,
          lat,
          lng,
          active,
          ...(id ? { version: store!.version } : {}),
        });
      }
      onSaved();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function check() {
    setBusy(true);
    setResult('');
    setError('');
    try {
      const r = await request('stores/' + id + '/delivery/check', {
        lat: Number(checkLat),
        lng: Number(checkLng),
      });
      setResult(r.reason + (r.distanceKm !== null ? ' · ' + r.distanceKm + ' กม. (เส้นตรง)' : ''));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const provinces = [...new Map(areas.map((a) => [a.provinceId, a.province])).entries()];
  const districts = [
    ...new Map(
      areas.filter((a) => a.provinceId === province).map((a) => [a.districtId, a.district]),
    ).entries(),
  ];
  const dirty =
    store && (enabled !== store.deliveryEnabled || (enabled && Number(radius) !== store.radiusKm));
  return (
    <section className="editor panel" aria-label="จัดการร้านค้า">
      <div className="panel-head">
        <h2>
          {mode === 'history'
            ? 'ประวัติการแก้ไข'
            : mode === 'delivery'
              ? 'ตั้งค่าจัดส่งอาหาร'
              : id
                ? 'แก้ไขร้านค้า'
                : 'เพิ่มร้านค้า'}
        </h2>
        <button className="outline" disabled={busy} onClick={onClose}>
          ปิดฟอร์ม
        </button>
      </div>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {loading ? (
        <p role="status">กำลังโหลด…</p>
      ) : mode === 'history' ? (
        <div>
          {history.length === 0 ? (
            <p>ยังไม่มีประวัติการแก้ไข</p>
          ) : (
            history.map((h, i) => (
              <article className="history-item" key={i}>
                <strong>
                  {h.event === 'store.created'
                    ? 'สร้างร้าน'
                    : h.event === 'delivery.updated'
                      ? 'ตั้งค่าจัดส่ง'
                      : 'แก้ไขร้าน'}
                </strong>
                <p>
                  {h.actor} · {new Date(h.createdAt).toLocaleString('th-TH')}
                </p>
                <p>
                  {h.after.name} · {h.after.active ? 'เปิดร้าน' : 'พักร้าน'} ·{' '}
                  {h.after.deliveryEnabled ? 'รัศมี ' + h.after.radiusKm + ' กม.' : 'ไม่เปิดจัดส่ง'}
                </p>
              </article>
            ))
          )}
        </div>
      ) : (
        (!id || store) && (
          <form onSubmit={save}>
            <fieldset disabled={busy} className="editor-fields">
              {mode === 'store' ? (
                <>
                  <div className="form-grid">
                    <label>
                      ชื่อร้าน
                      <input
                        required
                        maxLength={120}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </label>
                    <label>
                      หมวดร้าน
                      <select
                        aria-label="หมวดร้าน"
                        value={category}
                        onChange={(e) => setCategory(e.target.value as 'food' | 'craft')}
                      >
                        <option value="food">อาหาร</option>
                        <option value="craft">สินค้าชุมชน</option>
                      </select>
                    </label>
                    <label>
                      จังหวัด
                      <select
                        aria-label="จังหวัด"
                        required
                        value={province}
                        onChange={(e) => {
                          setProvince(e.target.value);
                          setDistrict('');
                          setSubdistrict('');
                        }}
                      >
                        <option value="">เลือกจังหวัด</option>
                        {provinces.map(([id, n]) => (
                          <option key={id} value={id}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      อำเภอ / เขต
                      <select
                        aria-label="อำเภอ / เขต"
                        required
                        value={district}
                        onChange={(e) => {
                          setDistrict(e.target.value);
                          setSubdistrict('');
                        }}
                      >
                        <option value="">เลือกอำเภอ</option>
                        {districts.map(([id, n]) => (
                          <option key={id} value={id}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      ตำบล / แขวง
                      <select
                        aria-label="ตำบล / แขวง"
                        required
                        value={subdistrict}
                        onChange={(e) => setSubdistrict(e.target.value)}
                      >
                        <option value="">เลือกตำบล</option>
                        {areas
                          .filter((a) => a.districtId === district)
                          .map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.name}
                            </option>
                          ))}
                      </select>
                    </label>
                    <label>
                      สถานะ
                      <select
                        aria-label="สถานะ"
                        value={active ? 'active' : 'paused'}
                        onChange={(e) => setActive(e.target.value === 'active')}
                      >
                        <option value="active">เปิดร้าน</option>
                        <option value="paused">พักร้าน</option>
                      </select>
                    </label>
                  </div>
                  <p className="footnote">
                    พื้นที่ยังเป็นชุดตัวอย่างในฐานข้อมูล ไม่ใช่รายชื่อครบประเทศ
                  </p>
                  <label>
                    รายละเอียดที่อยู่
                    <textarea
                      maxLength={500}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </label>
                  <h3>ตำแหน่งร้าน</h3>
                  <LocationMap
                    lat={lat}
                    lng={lng}
                    onPick={(a, b) => {
                      setLat(a);
                      setLng(b);
                    }}
                  />
                  <div className="form-grid">
                    <label>
                      ละติจูด
                      <input
                        type="number"
                        step="any"
                        min={-90}
                        max={90}
                        required={lng !== null}
                        value={lat ?? ''}
                        onChange={(e) =>
                          setLat(e.target.value === '' ? null : Number(e.target.value))
                        }
                      />
                    </label>
                    <label>
                      ลองจิจูด
                      <input
                        type="number"
                        step="any"
                        min={-180}
                        max={180}
                        required={lat !== null}
                        value={lng ?? ''}
                        onChange={(e) =>
                          setLng(e.target.value === '' ? null : Number(e.target.value))
                        }
                      />
                    </label>
                  </div>
                  <p className="footnote">
                    แก้หมุด พื้นที่ หมวด หรือสถานะร้าน จะปิดการจัดส่งเดิมเพื่อให้ผู้ดูแลตรวจใหม่
                    หมุดยังไม่ได้ตรวจเทียบขอบเขตตำบลอัตโนมัติ
                  </p>
                </>
              ) : (
                <>
                  <h3>{store?.name}</h3>
                  <p>กำหนดรัศมีรอบหมุดร้านเฉพาะการส่งอาหารทันที ไม่จำกัดสินค้าส่งพัสดุ</p>
                  <div className="form-grid">
                    <label>
                      การจัดส่ง
                      <select
                        aria-label="การจัดส่ง"
                        value={enabled ? 'on' : 'off'}
                        onChange={(e) => {
                          setEnabled(e.target.value === 'on');
                          setResult('');
                        }}
                      >
                        <option value="off">ปิดจัดส่ง</option>
                        <option value="on">เปิดจัดส่ง</option>
                      </select>
                    </label>
                    <label>
                      รัศมี (กม.)
                      <input
                        type="number"
                        min="0.1"
                        max="30"
                        step="0.01"
                        required={enabled}
                        disabled={!enabled}
                        value={radius}
                        onChange={(e) => {
                          setRadius(e.target.value);
                          setResult('');
                        }}
                      />
                    </label>
                  </div>
                  <LocationMap
                    lat={lat}
                    lng={lng}
                    radius={enabled ? Number(radius) : null}
                    delivery
                    onPick={(a, b) => {
                      setCheckLat(String(a));
                      setCheckLng(String(b));
                      setResult('');
                    }}
                  />
                  <p className="footnote">
                    รัศมี 0.1–30 กม. คำนวณเส้นตรง ไม่ใช่ระยะทางหรือเวลาขับรถ
                  </p>
                  <h3>ทดสอบจุดจัดส่ง</h3>
                  <div className="form-grid">
                    <label>
                      ละติจูดปลายทาง
                      <input
                        type="number"
                        step="any"
                        min={-90}
                        max={90}
                        value={checkLat}
                        onChange={(e) => {
                          setCheckLat(e.target.value);
                          setResult('');
                        }}
                      />
                    </label>
                    <label>
                      ลองจิจูดปลายทาง
                      <input
                        type="number"
                        step="any"
                        min={-180}
                        max={180}
                        value={checkLng}
                        onChange={(e) => {
                          setCheckLng(e.target.value);
                          setResult('');
                        }}
                      />
                    </label>
                  </div>
                  <button
                    type="button"
                    className="outline"
                    disabled={!!dirty || checkLat === '' || checkLng === ''}
                    onClick={check}
                  >
                    ตรวจพื้นที่
                  </button>
                  {dirty && <p>บันทึกการตั้งค่าก่อนทดสอบจุดจัดส่ง</p>}
                  {result && (
                    <p className="success" role="status">
                      {result}
                    </p>
                  )}
                </>
              )}
              <div className="editor-actions">
                <button type="submit">{busy ? 'กำลังบันทึก…' : 'บันทึก'}</button>
                <button type="button" className="outline" onClick={onClose}>
                  ยกเลิก
                </button>
              </div>
            </fieldset>
          </form>
        )
      )}
    </section>
  );
}
