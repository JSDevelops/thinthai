'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import StoreEditor from '../store-editor';
import ApplicationsPanel from '../applications-panel';
import ProductsPanel from '../products-panel';
import Brand from '../brand';
import TripsPanel from '../trips-panel';
import OrdersPanel from '../orders-panel';
type Account = { id: string; name: string; role: string };
type Store = {
  id: string;
  name: string;
  province: string;
  district: string;
  subdistrict: string;
  category: string;
  active: boolean;
  deliveryEnabled: boolean;
  radiusKm: number | null;
  lat: number | null;
  lng: number | null;
};
class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}
async function api(path: string, body?: unknown) {
  const res = await fetch('/api/v1/' + path, {
    cache: 'no-store',
    ...(body !== undefined
      ? {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-ThinThai-Action': '1' },
          body: JSON.stringify(body),
        }
      : {}),
  });
  const data = await res.json();
  if (!res.ok) throw new ApiError(data.message ?? 'ทำรายการไม่สำเร็จ', res.status);
  return data;
}
export default function Page() {
  const [confirmPassword, setConfirmPassword] = useState('');
  const [editor, setEditor] = useState<{
    id: string | null;
    mode: 'store' | 'delivery' | 'history';
  } | null>(null);
  const [me, setMe] = useState<Account | null>(null),
    [stores, setStores] = useState<Store[]>([]),
    [tab, setTab] = useState('overview'),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [query, setQuery] = useState('');
  const [checking, setChecking] = useState(true),
    [register, setRegister] = useState(false),
    [email, setEmail] = useState(''),
    [password, setPassword] = useState(''),
    [name, setName] = useState(''),
    [notice, setNotice] = useState(''),
    [passwordOpen, setPasswordOpen] = useState(false),
    [currentPassword, setCurrentPassword] = useState(''),
    [newPassword, setNewPassword] = useState('');
  function reset() {
    setEditor(null);
    setRegister(false);
    setMe(null);
    setStores([]);
    setTab('overview');
    setPasswordOpen(false);
    setCurrentPassword('');
    setNewPassword('');
  }
  async function load() {
    setChecking(true);
    setError('');
    try {
      const a = await api('me');
      const rows = await api('stores');
      setMe(a);
      setStores(rows);
    } catch (e) {
      reset();
      if (!(e instanceof ApiError && e.status === 401)) setError((e as Error).message);
    } finally {
      setChecking(false);
    }
  }
  useEffect(() => {
    void load();
  }, []);
  async function login(event: React.FormEvent) {
    event.preventDefault();
    if (register && password !== confirmPassword) {
      setError('รหัสผ่านทั้งสองช่องไม่ตรงกัน');
      return;
    }
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const a = await api(
        register ? 'auth/register' : 'auth/login',
        register ? { name, email, password } : { email, password },
      );
      const rows = await api('stores');
      setMe(a);
      setStores(rows);
      setPassword('');
      setRegister(false);
      setTab('overview');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function changeTab(next: string) {
    setEditor(null);
    setBusy(true);
    setError('');
    try {
      const rows = await api(next === 'delivery' ? 'food-delivery' : 'stores');
      setStores(rows);
      setQuery('');
      setTab(next);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) reset();
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function logout() {
    setBusy(true);
    setError('');
    try {
      await api('logout', {});
      reset();
      setNotice('ออกจากระบบแล้ว');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function changePassword(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api('auth/password', { currentPassword, newPassword });
      reset();
      setPassword('');
      setNotice('เปลี่ยนรหัสผ่านแล้ว กรุณาเข้าสู่ระบบใหม่ อุปกรณ์อื่นถูกออกจากระบบด้วย');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function saved() {
    setEditor(null);
    setNotice('บันทึกข้อมูลแล้ว');
    await changeTab(tab);
  }
  function openEditor(id: string | null, mode: 'store' | 'delivery' | 'history') {
    setNotice('');
    setEditor({ id, mode });
    setTimeout(
      () =>
        document
          .getElementById('store-editor')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
      0,
    );
  }
  const isAdmin = me && ['ADMIN', 'SUPER_ADMIN'].includes(me.role);
  const rows = stores.filter((s) =>
    [s.name, s.province, s.district, s.subdistrict].some((v) => v.includes(query)),
  );
  return (
    <div className="shell">
      <aside>
        <Brand reverse />
        <div className="menu-label">พื้นที่จัดการ</div>
        <nav aria-label="เมนูหลัก">
          <button
            disabled={!me || busy}
            aria-current={tab === 'overview' ? 'page' : undefined}
            onClick={() => changeTab('overview')}
          >
            ภาพรวม
          </button>
          <button
            disabled={!me || busy}
            aria-current={tab === 'stores' ? 'page' : undefined}
            onClick={() => changeTab('stores')}
          >
            ร้านค้า
          </button>
          {isAdmin && (
            <button
              disabled={busy}
              aria-current={tab === 'delivery' ? 'page' : undefined}
              onClick={() => changeTab('delivery')}
            >
              พื้นที่จัดส่งอาหาร
            </button>
          )}
          {me && (
            <button
              disabled={busy}
              aria-current={tab === 'applications' ? 'page' : undefined}
              onClick={() => changeTab('applications')}
            >
              {isAdmin ? 'ตรวจคำขอเปิดร้าน' : 'สมัครผู้ประกอบการ'}
            </button>
          )}
          {me && me.role !== 'USER' && (
            <button
              disabled={busy}
              aria-current={tab === 'products' ? 'page' : undefined}
              onClick={() => changeTab('products')}
            >
              สินค้า
            </button>
          )}
          {me && (
            <button
              disabled={busy}
              aria-current={tab === 'orders' ? 'page' : undefined}
              onClick={() => changeTab('orders')}
            >
              คำสั่งซื้อ
            </button>
          )}
          {me && me.role !== 'USER' && (
            <button
              disabled={busy}
              aria-current={tab === 'trips' ? 'page' : undefined}
              onClick={() => changeTab('trips')}
            >
              ทริปและการจอง
            </button>
          )}
        </nav>
        <div className="aside-note">
          ชุมชนเติบโต
          <br />
          การเดินทางมีความหมาย
        </div>
      </aside>
      <main>
        <header>
          <div>
            <span className="eyebrow">THINTHAI WORKSPACE</span>
            <h1>
              {tab === 'trips'
                ? 'ทริปและการจอง'
                : tab === 'orders'
                  ? 'คำสั่งซื้อ'
                  : tab === 'products'
                    ? 'จัดการสินค้า'
                    : tab === 'applications'
                      ? isAdmin
                        ? 'ตรวจคำขอเปิดร้าน'
                        : 'สมัครผู้ประกอบการ'
                      : tab === 'delivery'
                        ? 'พื้นที่จัดส่งอาหาร'
                        : tab === 'stores'
                          ? 'ร้านค้าในความดูแล'
                          : 'ยินดีต้อนรับสู่ ThinThai'}
            </h1>
          </div>
          {me && (
            <button className="outline" disabled={busy} onClick={logout}>
              ออกจากระบบ
            </button>
          )}
        </header>
        <div className="workspace-links">
          <Link href="/trips">เที่ยวและจองทริป</Link>
          <Link href="/catalog">เลือกสินค้า</Link>
          <Link href="/bookings">ทริปของฉัน</Link>
        </div>
        <div className="notice">
          รุ่นพัฒนาในเครื่อง • บัญชีบันทึกในฐานข้อมูลแล้ว • ร้านค้าเป็นข้อมูลตัวอย่าง •
          ยังไม่รับชำระเงินจริง
        </div>
        {me && (
          <section className="account-bar">
            <strong>{me.name}</strong>
            <span className="badge">{me.role}</span>
            <button
              className="outline"
              disabled={busy}
              onClick={() => setPasswordOpen(!passwordOpen)}
            >
              เปลี่ยนรหัสผ่าน
            </button>
          </section>
        )}
        {error && (
          <div role="alert" className="error">
            {error}
          </div>
        )}
        {notice && (
          <p role="status" className="success">
            {notice}
          </p>
        )}
        {passwordOpen && (
          <form className="auth-form password-form" onSubmit={changePassword}>
            <h2>เปลี่ยนรหัสผ่าน</h2>
            <label htmlFor="current-password">รหัสผ่านปัจจุบัน</label>
            <input
              id="current-password"
              type="password"
              autoComplete="current-password"
              required
              maxLength={128}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <label htmlFor="new-password">รหัสผ่านใหม่</label>
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={15}
              maxLength={128}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              aria-describedby="password-hint"
            />
            <small id="password-hint">
              อย่างน้อย 15 ตัวอักษร การเปลี่ยนรหัสผ่านจะออกจากระบบทุกอุปกรณ์
            </small>
            <button disabled={busy}>บันทึกรหัสผ่าน</button>
          </form>
        )}
        <div aria-live="polite">{busy ? 'กำลังโหลดข้อมูล…' : ''}</div>
        {checking ? (
          <section className="empty" role="status">
            กำลังตรวจสอบบัญชี…
          </section>
        ) : !me ? (
          <section className="auth-layout">
            <div className="welcome">
              <span className="eyebrow">LOCAL ROOTS, LASTING MEMORIES</span>
              <h2>
                เชื่อมคน เชื่อมชุมชน
                <br />
                เริ่มต้นที่นี่
              </h2>
              <p>แอปเดียวครบ จองทริป ช้อปสินค้าชุมชน</p>
              <p>เที่ยวไทยให้ถึงถิ่น สัมผัสวิถีชีวิต วัฒนธรรมและธรรมชาติอันงดงาม</p>
              <div className="pills">
                <span>เที่ยว</span>
                <span>ช้อป</span>
                <span>สัมผัสชุมชน</span>
              </div>
            </div>
            <form className="auth-form" onSubmit={login}>
              <h2>{register ? 'สร้างบัญชี ThinThai' : 'เข้าสู่ระบบ'}</h2>
              <p>
                {register
                  ? 'สมัครเป็นผู้ใช้ทั่วไป เริ่มต้นการเดินทางกับเรา'
                  : 'ใช้บัญชีของคุณเพื่อเข้าถึงพื้นที่จัดการ'}
              </p>
              {register && (
                <>
                  <label htmlFor="name">ชื่อที่แสดง</label>
                  <input
                    id="name"
                    autoComplete="name"
                    required
                    maxLength={100}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </>
              )}
              <label htmlFor="email">อีเมล</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <label htmlFor="password">รหัสผ่าน</label>
              <input
                id="password"
                type="password"
                autoComplete={register ? 'new-password' : 'current-password'}
                required
                minLength={register ? 15 : 1}
                maxLength={128}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-describedby="auth-hint"
              />
              {register && (
                <>
                  <label htmlFor="confirm-password">ยืนยันรหัสผ่าน</label>
                  <input
                    id="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={15}
                    maxLength={128}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </>
              )}
              <small id="auth-hint">
                {register
                  ? 'ใช้รหัสผ่านอย่างน้อย 15 ตัวอักษร บัญชีใหม่ไม่มีสิทธิ์ผู้ดูแล'
                  : 'กรอกอีเมลและรหัสผ่านของบัญชีคุณ'}
              </small>
              <button disabled={busy || checking} type="submit">
                {busy ? 'กำลังดำเนินการ…' : register ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}
              </button>
              <button
                type="button"
                className="outline"
                disabled={busy}
                onClick={() => {
                  setRegister(!register);
                  setError('');
                  setPassword('');
                  setConfirmPassword('');
                }}
              >
                {register ? 'มีบัญชีแล้ว เข้าสู่ระบบ' : 'ยังไม่มีบัญชี สมัครสมาชิก'}
              </button>
              <p className="footnote">รุ่นนี้ยังไม่รองรับยืนยันอีเมลและลืมรหัสผ่าน</p>
            </form>
          </section>
        ) : tab === 'trips' ? (
          <TripsPanel stores={stores} />
        ) : tab === 'orders' ? (
          <OrdersPanel canManage={me.role !== 'USER'} />
        ) : tab === 'products' ? (
          <ProductsPanel stores={stores} />
        ) : tab === 'applications' ? (
          <ApplicationsPanel review={!!isAdmin} onRefresh={load} />
        ) : (
          <>
            <section className="stats">
              <article>
                <small>บัญชีที่ใช้งาน</small>
                <h2>{me.name}</h2>
                <p>ตรวจสิทธิ์จากเซิร์ฟเวอร์</p>
              </article>
              <article>
                <small>ร้านค้าที่แสดงในหน้านี้</small>
                <h2>
                  {stores.length} <small>ร้าน</small>
                </h2>
                <p>
                  {me.role === 'ADMIN'
                    ? 'เฉพาะจังหวัดที่ได้รับมอบหมาย'
                    : me.role === 'MERCHANT'
                      ? 'เฉพาะร้านที่เป็นสมาชิก'
                      : 'ตามสิทธิ์ของบัญชี'}
                </p>
              </article>
              <article>
                <small>ระบบจัดส่งอาหาร</small>
                <h2>{stores.filter((s) => s.deliveryEnabled).length} ร้าน</h2>
                <p>หมวดอื่นไม่ถูกจำกัดด้วยพื้นที่จัดส่งอาหาร</p>
              </article>
            </section>
            {editor && (
              <div id="store-editor">
                <StoreEditor
                  key={(editor.id ?? 'new') + editor.mode}
                  {...editor}
                  onClose={() => setEditor(null)}
                  onSaved={saved}
                />
              </div>
            )}
            <section className="panel">
              <div className="panel-head">
                <div>
                  <h2>{tab === 'delivery' ? 'ร้านอาหารและพื้นที่' : 'ร้านค้าและชุมชน'}</h2>
                  <p>
                    {tab === 'delivery'
                      ? 'ตั้งค่ารัศมีและตรวจจุดจัดส่งอาหาร'
                      : 'สร้างและแก้ไขร้านค้าที่คุณดูแล'}
                  </p>
                </div>
                {me.role !== 'USER' && tab !== 'delivery' && (
                  <button onClick={() => openEditor(null, 'store')}>เพิ่มร้านค้า</button>
                )}
                <label>
                  ค้นหาร้านหรือพื้นที่
                  <input
                    placeholder="จังหวัด อำเภอ ตำบล"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </label>
              </div>
              {rows.length === 0 ? (
                <div className="empty">
                  {me.role === 'USER'
                    ? 'บัญชีผู้ใช้ทั่วไปไม่มีสิทธิ์จัดการร้านค้า'
                    : 'ไม่พบร้านค้าที่ตรงกับการค้นหา'}
                </div>
              ) : (
                <div className="store-grid">
                  {rows.map((s) => (
                    <article className="store" key={s.id}>
                      <div className={'store-art ' + s.category}>
                        <span>{s.category === 'food' ? 'อาหารท้องถิ่น' : 'สินค้าชุมชน'}</span>
                        <strong>
                          {s.category === 'food' ? 'รสชาติแห่งถิ่น' : 'เสน่ห์งานฝีมือ'}
                        </strong>
                      </div>
                      <div className="store-body">
                        <h3>{s.name}</h3>
                        <p>
                          {s.province} / {s.district} / {s.subdistrict}
                        </p>
                        <p className="coordinates">
                          พิกัด {s.lat ?? 'ยังไม่ระบุ'}, {s.lng ?? 'ยังไม่ระบุ'}
                        </p>
                        <span className="badge">
                          {s.category === 'food'
                            ? s.deliveryEnabled
                              ? 'จัดส่งรัศมี ' + s.radiusKm + ' กม.'
                              : 'จัดส่งอาหาร: ยังไม่เปิด'
                            : 'ส่งพัสดุ: ไม่ใช้โซนอาหาร'}
                        </span>
                        <p>{s.active ? 'เปิดร้าน' : 'พักร้าน'}</p>
                        <div className="store-actions">
                          <button className="outline" onClick={() => openEditor(s.id, 'store')}>
                            แก้ไขร้าน
                          </button>
                          {isAdmin && s.category === 'food' && (
                            <button onClick={() => openEditor(s.id, 'delivery')}>
                              ตั้งค่าจัดส่ง
                            </button>
                          )}
                          <button className="outline" onClick={() => openEditor(s.id, 'history')}>
                            ประวัติ
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
            <p className="footnote">
              บันทึกร้านค้าและโซนรัศมีได้แล้ว • ยังไม่เชื่อมคำสั่งซื้อ คนขับ หรือการชำระเงิน
            </p>
          </>
        )}
      </main>
    </div>
  );
}
