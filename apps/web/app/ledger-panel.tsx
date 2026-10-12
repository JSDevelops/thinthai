'use client';
import { useEffect, useState } from 'react';

type LedgerEntry = {
  id: string;
  paymentId: string;
  targetType: string;
  grossSatang: number;
  feeSatang: number;
  netSatang: number;
  status: string;
  createdAt: string;
};

type LedgerSummary = {
  storeId: string;
  totalGrossSatang: number;
  totalGrossBaht: number;
  totalFeeSatang: number;
  totalFeeBaht: number;
  totalNetSatang: number;
  totalNetBaht: number;
  entries: LedgerEntry[];
};

export default function LedgerPanel({ stores }: { stores: { id: string; name: string }[] }) {
  const [selectedStoreId, setSelectedStoreId] = useState<string>(stores[0]?.id || '');
  const [summary, setSummary] = useState<LedgerSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function loadLedger(storeId: string) {
    if (!storeId) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/v1/stores/${storeId}/ledger`, {
        headers: { 'X-ThinThai-Action': '1' },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'ไม่สามารถโหลดข้อมูลบัญชีได้');
      setSummary(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (selectedStoreId) {
      void loadLedger(selectedStoreId);
    }
  }, [selectedStoreId]);

  return (
    <section className="panel ledger-panel">
      <div className="panel-head">
        <div>
          <h2>รายได้และบัญชีชุมชน (Community Ledger)</h2>
          <p style={{ color: '#556a62', fontSize: '13px', margin: '4px 0 0' }}>
            สรุปยอดเงินจากการจองทริปและสินค้าชุมชน พร้อมรายงานการกระทบยอดรอโอนสู่ชาวบ้าน
          </p>
        </div>
        {stores.length > 1 && (
          <select
            value={selectedStoreId}
            onChange={(e) => setSelectedStoreId(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #ccc' }}
          >
            {stores.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {error && (
        <div role="alert" className="error" style={{ margin: '16px 0' }}>
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <p>กำลังโหลดรายงานบัญชี…</p>
      ) : summary ? (
        <div>
          {/* Summary Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              margin: '20px 0',
            }}
          >
            <div
              style={{
                background: '#f4fbf7',
                border: '1px solid #c2e7d3',
                borderRadius: '12px',
                padding: '16px',
              }}
            >
              <div style={{ fontSize: '12px', color: '#00695c', fontWeight: 600 }}>
                ยอดรับรวมทั้งหมด
              </div>
              <div
                style={{ fontSize: '24px', fontWeight: 700, color: '#004d40', marginTop: '6px' }}
              >
                ฿{summary.totalGrossBaht.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: '11px', color: '#556a62', marginTop: '4px' }}>
                จากทริปและสินค้าชุมชน
              </div>
            </div>

            <div
              style={{
                background: '#fff9f0',
                border: '1px solid #f6deb3',
                borderRadius: '12px',
                padding: '16px',
              }}
            >
              <div style={{ fontSize: '12px', color: '#d37827', fontWeight: 600 }}>
                สนับสนุนแพลตฟอร์ม (5%)
              </div>
              <div
                style={{ fontSize: '24px', fontWeight: 700, color: '#b55d14', marginTop: '6px' }}
              >
                ฿{summary.totalFeeBaht.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: '11px', color: '#556a62', marginTop: '4px' }}>
                ดูแลเซิร์ฟเวอร์และการตลาดชุมชน
              </div>
            </div>

            <div
              style={{
                background: '#fdfbf7',
                border: '2px solid #00695c',
                borderRadius: '12px',
                padding: '16px',
              }}
            >
              <div style={{ fontSize: '12px', color: '#00695c', fontWeight: 700 }}>
                ยอดสุทธิส่งตรงถึงชุมชน (95%)
              </div>
              <div
                style={{ fontSize: '24px', fontWeight: 800, color: '#00695c', marginTop: '6px' }}
              >
                ฿{summary.totalNetBaht.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </div>
              <div
                style={{ fontSize: '11px', color: '#2e7d32', marginTop: '4px', fontWeight: 600 }}
              >
                ✓ บันทึกลงบัญชีรอโอน
              </div>
            </div>
          </div>

          {/* Transactions table */}
          <h3 style={{ fontSize: '16px', margin: '24px 0 12px', color: '#1b382b' }}>
            ประวัติธุรกรรม ({summary.entries.length} รายการ)
          </h3>

          {summary.entries.length === 0 ? (
            <p className="empty">ยังไม่มีรายการชำระเงินที่ยืนยันในระบบสำหรับร้านนี้</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr
                    style={{
                      background: '#f4f6f4',
                      textAlign: 'left',
                      borderBottom: '2px solid #e0e0e0',
                    }}
                  >
                    <th style={{ padding: '10px 12px' }}>วันที่ / เวลา</th>
                    <th style={{ padding: '10px 12px' }}>ประเภท</th>
                    <th style={{ padding: '10px 12px' }}>ยอดรับ (฿)</th>
                    <th style={{ padding: '10px 12px' }}>ค่าธรรมเนียม (฿)</th>
                    <th style={{ padding: '10px 12px' }}>ยอดสุทธิ (฿)</th>
                    <th style={{ padding: '10px 12px' }}>สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.entries.map((entry) => (
                    <tr key={entry.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '10px 12px', color: '#555' }}>
                        {new Date(entry.createdAt).toLocaleString('th-TH', {
                          timeZone: 'Asia/Bangkok',
                        })}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span className="badge" style={{ fontSize: '11px' }}>
                          {entry.targetType === 'booking' ? '🏕️ จองทริป' : '📦 สินค้า'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', fontWeight: 600 }}>
                        {(entry.grossSatang / 100).toLocaleString('th-TH', {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td style={{ padding: '10px 12px', color: '#d37827' }}>
                        -
                        {(entry.feeSatang / 100).toLocaleString('th-TH', {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td style={{ padding: '10px 12px', fontWeight: 700, color: '#00695c' }}>
                        {(entry.netSatang / 100).toLocaleString('th-TH', {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            background: entry.status === 'pending_payout' ? '#e8f5e9' : '#e0e0e0',
                            color: entry.status === 'pending_payout' ? '#2e7d32' : '#333',
                          }}
                        >
                          {entry.status === 'pending_payout' ? 'รอรอบโอนเงิน' : entry.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}
