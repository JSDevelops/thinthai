'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
type Order = {
  id: string;
  storeName: string;
  status: string;
  fulfillment: string;
  subtotalSatang: number;
  version: number;
  recipient: string;
  phone: string;
  address: string;
  createdAt: string;
  items: { productId: string; name: string; quantity: number; unitPriceSatang: number }[];
  history: { status: string; reason: string; createdAt: string }[];
};
const labels: Record<string, string> = {
  placed: 'รอร้านรับรายการ',
  accepted: 'ร้านรับรายการแล้ว',
  completed: 'เสร็จสิ้น',
  cancelled: 'ลูกค้ายกเลิก',
  rejected: 'ร้านปฏิเสธ',
};
const methods: Record<string, string> = {
  pickup: 'รับที่ร้าน',
  parcel_delivery: 'ส่งพัสดุ',
  instant_food_delivery: 'ส่งอาหารทันที',
};
export default function OrdersPanel({ canManage = false }: { canManage?: boolean }) {
  const [manage, setManage] = useState(false),
    [rows, setRows] = useState<Order[]>([]),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [loading, setLoading] = useState(true),
    [selected, setSelected] = useState<{ order: Order; action: string } | null>(null),
    [reason, setReason] = useState('');
  async function load() {
    setLoading(true);
    try {
      const r = await fetch('/api/v1/orders/' + (manage ? 'manage' : 'my'), { cache: 'no-store' });
      const data = await r.json();
      if (!r.ok) throw Error(r.status === 401 ? 'กรุณาเข้าสู่ระบบก่อนดูคำสั่งซื้อ' : data.message);
      setRows(data);
      setError('');
    } catch (e) {
      setRows([]);
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load();
    setSelected(null);
  }, [manage]);
  async function action(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setBusy(true);
    setError('');
    try {
      const r = await fetch('/api/v1/orders/' + selected.order.id + '/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-ThinThai-Action': '1' },
        body: JSON.stringify({ version: selected.order.version, action: selected.action, reason }),
      });
      const data = await r.json();
      if (!r.ok) throw Error(data.message);
      setSelected(null);
      setReason('');
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const actionNames: Record<string, string> = {
    accept: 'รับรายการ',
    reject: 'ปฏิเสธรายการ',
    complete: 'ทำรายการเสร็จสิ้น',
    cancel: 'ยกเลิกรายการ',
  };
  return (
    <section className="panel order-panel">
      <div className="panel-head">
        <h2>{manage ? 'รายการของร้าน' : 'คำสั่งซื้อของฉัน'}</h2>
        <button disabled={busy || loading} className="outline" onClick={load}>
          โหลดคำสั่งซื้อใหม่
        </button>
      </div>
      <p className="notice">
        คำสั่งซื้อสำหรับทดสอบในเครื่อง ยังไม่มีการรับเงิน ค่าส่ง หรือการเรียกคนขับ
      </p>
      {canManage && (
        <label>
          มุมมองคำสั่งซื้อ
          <select
            aria-label="มุมมองคำสั่งซื้อ"
            value={manage ? 'shop' : 'buyer'}
            disabled={busy}
            onChange={(e) => setManage(e.target.value === 'shop')}
          >
            <option value="buyer">คำสั่งซื้อของฉัน</option>
            <option value="shop">รายการของร้านที่ดูแล</option>
          </select>
        </label>
      )}
      {error && (
        <p className="error" role="alert">
          {error} <Link href="/workspace">เข้าสู่ระบบ</Link>
        </p>
      )}
      {loading ? (
        <p>กำลังโหลด…</p>
      ) : rows.length === 0 && !error ? (
        <p className="empty">ยังไม่มีคำสั่งซื้อ</p>
      ) : null}
      {selected && (
        <form className="auth-form order-confirm" onSubmit={action}>
          <h3>{actionNames[selected.action]}</h3>
          <p>
            รายการ {selected.order.id.slice(0, 8)} · {selected.order.storeName}
          </p>
          <label>
            เหตุผลการเปลี่ยนสถานะ
            <input
              required
              minLength={3}
              maxLength={300}
              disabled={busy}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </label>
          <button disabled={busy}>ยืนยันสถานะ</button>
          <button
            disabled={busy}
            type="button"
            className="outline"
            onClick={() => setSelected(null)}
          >
            กลับ
          </button>
        </form>
      )}
      <div className="application-list">
        {rows.map((o) => (
          <article className="order-card application-card" key={o.id}>
            <div className="panel-head">
              <h3>
                {o.storeName} · {o.id.slice(0, 8)}
              </h3>
              <span className="badge">{labels[o.status]}</span>
            </div>
            <p>
              {new Date(o.createdAt).toLocaleString('th-TH')} · {methods[o.fulfillment]}
            </p>
            <ul>
              {o.items.map((i) => (
                <li key={i.productId}>
                  {i.name} × {i.quantity} ·{' '}
                  {((i.unitPriceSatang * i.quantity) / 100).toLocaleString('th-TH', {
                    minimumFractionDigits: 2,
                  })}{' '}
                  บาท
                </li>
              ))}
            </ul>
            <strong>
              ยอดสินค้า{' '}
              {(o.subtotalSatang / 100).toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท
            </strong>
            <p>
              {o.recipient} · {o.phone}
              {o.address && ' · ' + o.address}
            </p>
            <div className="store-actions">
              {(manage
                ? o.status === 'placed'
                  ? ['accept', 'reject']
                  : o.status === 'accepted'
                    ? ['complete']
                    : []
                : o.status === 'placed'
                  ? ['cancel']
                  : []
              ).map((a) => (
                <button
                  key={a}
                  disabled={busy}
                  onClick={() => {
                    setSelected({ order: o, action: a });
                    setReason('');
                  }}
                >
                  {actionNames[a]}
                </button>
              ))}
            </div>
            <details>
              <summary>ประวัติรายการ</summary>
              {o.history.map((h, i) => (
                <p key={i}>
                  {labels[h.status]} · {h.reason} · {new Date(h.createdAt).toLocaleString('th-TH')}
                </p>
              ))}
            </details>
          </article>
        ))}
      </div>
    </section>
  );
}
