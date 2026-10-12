'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { tripApi, tripDate, money } from './trip-shared';

type Booking = {
  id: string;
  storeName: string;
  title: string;
  meetingPoint: string;
  startsAt: string;
  seats: number;
  unitPriceSatang: number;
  contactName: string;
  phone: string;
  status: string;
  version: number;
  history: { status: string; reason: string; createdAt: string }[];
};

type PaymentIntent = {
  id: string;
  amountSatang: number;
  amountBaht: number;
  status: string;
  qrPayload: string;
  providerRef: string;
  expiresAt: string;
  targetSummary: string;
};

const labels: Record<string, string> = {
  pending: 'รอยืนยัน',
  confirmed: 'ยืนยันแล้ว',
  cancelled: 'ผู้เดินทางยกเลิก',
  rejected: 'ผู้ให้บริการยกเลิก',
  completed: 'เดินทางเสร็จแล้ว',
};

const actions: Record<string, string> = {
  confirm: 'ยืนยันการจอง',
  reject: 'ปฏิเสธ / ยกเลิกทริป',
  complete: 'จบทริป',
  cancel: 'ยกเลิกการจอง',
};

export default function BookingsPanel({ manage = false }: { manage?: boolean }) {
  const [rows, setRows] = useState<Booking[]>([]),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [selected, setSelected] = useState<{ b: Booking; action: string } | null>(null),
    [reason, setReason] = useState(''),
    [activePayment, setActivePayment] = useState<{
      booking: Booking;
      payment: PaymentIntent;
    } | null>(null),
    [paymentSuccess, setPaymentSuccess] = useState(false);

  async function load() {
    setLoading(true);
    setError('');
    try {
      setRows(await tripApi('bookings/' + (manage ? 'manage' : 'my')));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [manage]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || busy) return;
    setBusy(true);
    setError('');
    try {
      await tripApi('bookings/' + selected.b.id + '/actions', {
        version: selected.b.version,
        action: selected.action,
        reason,
      });
      setSelected(null);
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function openPromptPay(b: Booking) {
    setBusy(true);
    setError('');
    setPaymentSuccess(false);
    try {
      const payment: PaymentIntent = await tripApi('payments', {
        targetType: 'booking',
        targetId: b.id,
        method: 'promptpay',
      });
      setActivePayment({ booking: b, payment });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function handleSimulatePay() {
    if (!activePayment || busy) return;
    setBusy(true);
    setError('');
    try {
      await tripApi(`payments/${activePayment.payment.id}/simulate`, {});
      setPaymentSuccess(true);
      setTimeout(async () => {
        setActivePayment(null);
        setPaymentSuccess(false);
        await load();
      }, 1500);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel bookings-panel">
      <div className="panel-head">
        <h2>{manage ? 'การจองของชุมชน' : 'การจองของฉัน'}</h2>
        <button disabled={loading || busy} className="outline" onClick={load}>
          โหลดการจองใหม่
        </button>
      </div>
      <p>ระบบจองและชำระเงินชุมชน · กันที่นั่ง 30 นาที และยกเลิกเองได้ก่อนเริ่มทริป</p>
      {error && (
        <p role="alert" className="error">
          {error} <Link href="/workspace">เข้าสู่ระบบ</Link>
        </p>
      )}

      {/* PromptPay Modal */}
      {activePayment && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
          }}
          onClick={() => setActivePayment(null)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '20px',
              maxWidth: '420px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              textAlign: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                background: '#003b64',
                color: '#fff',
                padding: '12px',
                borderRadius: '12px',
                marginBottom: '16px',
                fontWeight: 700,
                fontSize: '16px',
                letterSpacing: '1px',
              }}
            >
              PROMPTPAY · พร้อมเพย์
            </div>

            <h3 style={{ fontSize: '18px', color: '#1b382b', margin: '0 0 6px' }}>
              {activePayment.booking.title}
            </h3>
            <p style={{ color: '#556a62', fontSize: '13px', margin: '0 0 16px' }}>
              จำนวน {activePayment.booking.seats} ท่าน · อ้างอิง {activePayment.payment.providerRef}
            </p>

            <div
              style={{
                fontSize: '28px',
                fontWeight: 800,
                color: '#00695c',
                marginBottom: '16px',
              }}
            >
              ฿
              {activePayment.payment.amountBaht.toLocaleString('th-TH', {
                minimumFractionDigits: 2,
              })}
            </div>

            {/* QR Code Container */}
            <div
              style={{
                background: '#f8f9fa',
                border: '2px dashed #00695c',
                borderRadius: '16px',
                padding: '20px',
                display: 'inline-block',
                marginBottom: '16px',
              }}
            >
              <svg width="180" height="180" viewBox="0 0 180 180" fill="none">
                <rect width="180" height="180" fill="white" rx="8" />
                {/* Simulated EMVCo QR Blocks */}
                <rect x="15" y="15" width="45" height="45" fill="#003b64" rx="4" />
                <rect x="25" y="25" width="25" height="25" fill="white" rx="2" />
                <rect x="32" y="32" width="11" height="11" fill="#003b64" />

                <rect x="120" y="15" width="45" height="45" fill="#003b64" rx="4" />
                <rect x="130" y="25" width="25" height="25" fill="white" rx="2" />
                <rect x="137" y="32" width="11" height="11" fill="#003b64" />

                <rect x="15" y="120" width="45" height="45" fill="#003b64" rx="4" />
                <rect x="25" y="130" width="25" height="25" fill="white" rx="2" />
                <rect x="32" y="137" width="11" height="11" fill="#003b64" />

                {/* Pattern Data Dots */}
                <circle cx="90" cy="37" r="6" fill="#00695c" />
                <circle cx="75" cy="75" r="5" fill="#d37827" />
                <circle cx="105" cy="75" r="5" fill="#003b64" />
                <circle cx="90" cy="90" r="7" fill="#00695c" />
                <circle cx="75" cy="105" r="5" fill="#003b64" />
                <circle cx="105" cy="105" r="5" fill="#d37827" />
                <circle cx="90" cy="143" r="6" fill="#00695c" />

                <rect x="70" y="20" width="8" height="25" fill="#003b64" />
                <rect x="102" y="20" width="8" height="25" fill="#003b64" />
                <rect x="125" y="80" width="35" height="8" fill="#003b64" />
                <rect x="125" y="105" width="20" height="8" fill="#003b64" />
                <rect x="20" y="80" width="35" height="8" fill="#003b64" />
                <rect x="20" y="100" width="20" height="8" fill="#003b64" />
                <rect x="135" y="135" width="25" height="25" fill="#00695c" rx="4" />
              </svg>
              <div style={{ fontSize: '11px', color: '#666', marginTop: '6px' }}>
                สแกนด้วยแอปธนาคารใดก็ได้
              </div>
            </div>

            <div style={{ fontSize: '12px', color: '#888', marginBottom: '20px' }}>
              ⏱️ หมดอายุใน 30 นาที (ระบบจะคืนที่นั่งอัตโนมัติหากไม่ชำระ)
            </div>

            {paymentSuccess ? (
              <div
                style={{
                  background: '#e8f5e9',
                  color: '#2e7d32',
                  padding: '12px',
                  borderRadius: '10px',
                  fontWeight: 700,
                }}
              >
                🎉 ชำระเงินสำเร็จ! ยืนยันการจองเรียบร้อยแล้ว
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  type="button"
                  style={{
                    background: '#00695c',
                    color: '#fff',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                  disabled={busy}
                  onClick={handleSimulatePay}
                >
                  {busy ? 'กำลังตรวจสอบยอด…' : '✓ จำลองชำระเงินสำเร็จ (Sandbox)'}
                </button>
                <button
                  type="button"
                  className="outline"
                  onClick={() => setActivePayment(null)}
                  disabled={busy}
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {selected && (
        <form className="auth-form" onSubmit={submit}>
          <h3>
            {actions[selected.action]} · {selected.b.title}
          </h3>
          <label>
            เหตุผลการจอง
            <input
              required
              minLength={3}
              maxLength={300}
              value={reason}
              disabled={busy}
              onChange={(e) => setReason(e.target.value)}
            />
          </label>
          <button disabled={busy}>บันทึกสถานะการจอง</button>
          <button
            type="button"
            className="outline"
            disabled={busy}
            onClick={() => setSelected(null)}
          >
            กลับ
          </button>
        </form>
      )}

      {loading ? (
        <p>กำลังโหลด…</p>
      ) : !rows.length && !error ? (
        <p className="empty">
          ยังไม่มีการจอง <Link href="/trips">ค้นหาทริป</Link>
        </p>
      ) : null}

      <div className="application-list">
        {rows.map((b) => {
          const future = new Date(b.startsAt) > new Date();
          const options = manage
            ? b.status === 'pending' && future
              ? ['confirm', 'reject']
              : b.status === 'confirmed'
                ? future
                  ? ['reject']
                  : ['complete']
                : []
            : b.status === 'pending' && future
              ? ['cancel']
              : [];

          const canPay = !manage && b.status === 'pending' && future;

          return (
            <article className="application-card booking-card" key={b.id}>
              <div className="panel-head">
                <h3>{b.title}</h3>
                <span className="badge">{labels[b.status]}</span>
              </div>
              <p>
                เลขการจอง {b.id.slice(0, 8)} · {b.storeName}
              </p>
              <p>
                <strong>{tripDate(b.startsAt)} (เวลาไทย)</strong>
              </p>
              <p>จุดนัดพบ: {b.meetingPoint}</p>
              <p>
                {b.seats} คน · รวม {money(b.seats * b.unitPriceSatang)} บาท
              </p>
              <p>
                ผู้เดินทาง: {b.contactName} · {b.phone}
              </p>
              <div
                className="store-actions"
                style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}
              >
                {canPay && (
                  <button
                    type="button"
                    style={{
                      background: '#00695c',
                      color: '#fff',
                      border: 'none',
                      fontWeight: 700,
                    }}
                    disabled={busy}
                    onClick={() => openPromptPay(b)}
                  >
                    💳 ชำระเงิน (PromptPay)
                  </button>
                )}
                {options.map((action) => (
                  <button
                    disabled={busy}
                    key={action}
                    className="outline"
                    onClick={() => {
                      setSelected({ b, action });
                      setReason('');
                    }}
                  >
                    {actions[action]}
                  </button>
                ))}
              </div>
              <details>
                <summary>ประวัติการจอง</summary>
                {b.history.map((h, i) => (
                  <p key={i}>
                    {labels[h.status]} · {h.reason} · {tripDate(h.createdAt)}
                  </p>
                ))}
              </details>
            </article>
          );
        })}
      </div>
    </section>
  );
}
