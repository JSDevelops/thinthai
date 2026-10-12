import { config } from 'dotenv';
import { resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { Pool, type PoolClient } from 'pg';

config({ path: resolve(__dirname, '../../../.env'), quiet: true });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('[Worker] Fatal: DATABASE_URL is not set.');
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
  max: 5,
  idleTimeoutMillis: 30000,
});

export interface SweepResult {
  expiredBookings: number;
  expiredOrders: number;
  expiredPayments: number;
}

export async function sweepExpiredHolds(client: PoolClient): Promise<SweepResult> {
  let expiredBookings = 0;
  let expiredOrders = 0;
  let expiredPayments = 0;

  // 1. Expire pending bookings past expires_at
  const staleBookings = (
    await client.query<{
      id: string;
      buyer_id: string;
      departure_id: string;
      seats: number;
    }>(
      `SELECT b.id, b.buyer_id, b.departure_id, b.seats
       FROM bookings b
       WHERE b.status = 'pending' AND b.expires_at <= now()
       FOR UPDATE OF b LIMIT 50`,
    )
  ).rows;

  for (const b of staleBookings) {
    await client.query(
      `UPDATE departures SET used = used - $1, version = version + 1 WHERE id = $2`,
      [b.seats, b.departure_id],
    );
    await client.query(
      `UPDATE bookings SET status = 'cancelled', version = version + 1 WHERE id = $1`,
      [b.id],
    );
    await client.query(
      `INSERT INTO booking_history (id, booking_id, actor_id, status, reason)
       VALUES ($1, $2, $3, 'cancelled', 'หมดเวลาชำระเงิน (ระบบเบื้องหลังคืนที่นั่งอัตโนมัติ)')`,
      [randomUUID(), b.id, b.buyer_id],
    );
    expiredBookings++;
  }

  // 2. Expire placed orders past expires_at
  const staleOrders = (
    await client.query<{ id: string; buyer_id: string }>(
      `SELECT o.id, o.buyer_id
       FROM orders o
       WHERE o.status = 'placed' AND o.expires_at <= now()
       FOR UPDATE OF o LIMIT 50`,
    )
  ).rows;

  for (const o of staleOrders) {
    const items = (
      await client.query<{ product_id: string; quantity: number }>(
        `SELECT product_id, quantity FROM order_items WHERE order_id = $1`,
        [o.id],
      )
    ).rows;

    for (const item of items) {
      await client.query(
        `UPDATE products SET reserved = reserved - $1, version = version + 1, updated_at = now()
         WHERE id = $2`,
        [item.quantity, item.product_id],
      );
    }

    await client.query(
      `UPDATE orders SET status = 'cancelled', version = version + 1, updated_at = now() WHERE id = $1`,
      [o.id],
    );
    await client.query(
      `INSERT INTO order_history (id, order_id, actor_id, status, reason)
       VALUES ($1, $2, $3, 'cancelled', 'หมดเวลาชำระเงิน (ระบบเบื้องหลังคืนสต๊อกอัตโนมัติ)')`,
      [randomUUID(), o.id, o.buyer_id],
    );
    expiredOrders++;
  }

  // 3. Mark stale pending payments as failed
  const stalePayments = (
    await client.query<{ id: string }>(
      `UPDATE payments
       SET status = 'failed', version = version + 1, updated_at = now()
       WHERE status = 'pending' AND expires_at <= now()
       RETURNING id`,
    )
  ).rows;
  expiredPayments = stalePayments.length;

  return { expiredBookings, expiredOrders, expiredPayments };
}

let isRunning = true;
let isBusy = false;

async function runWorkerIteration(): Promise<void> {
  if (isBusy || !isRunning) return;
  isBusy = true;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await sweepExpiredHolds(client);
    await client.query('COMMIT');

    if (result.expiredBookings > 0 || result.expiredOrders > 0 || result.expiredPayments > 0) {
      console.log(
        `[Worker] [${new Date().toISOString()}] Swept expired items: ` +
          `${result.expiredBookings} bookings, ${result.expiredOrders} orders, ${result.expiredPayments} payments.`,
      );
    }
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[Worker] Iteration error:', error);
  } finally {
    client.release();
    isBusy = false;
  }
}

async function main() {
  console.log('[Worker] ThinThai Background Worker starting...');
  const isOnce = process.argv.includes('--once');
  const intervalSeconds = Number(process.env.WORKER_INTERVAL_SECONDS ?? 30);

  if (isOnce) {
    console.log('[Worker] Running one-shot sweep iteration...');
    await runWorkerIteration();
    await pool.end();
    console.log('[Worker] Finished one-shot run.');
    process.exit(0);
  }

  console.log(`[Worker] Running in daemon mode (interval: ${intervalSeconds}s)...`);
  await runWorkerIteration();

  const timer = setInterval(() => {
    void runWorkerIteration();
  }, intervalSeconds * 1000);

  const shutdown = async (signal: string) => {
    console.log(`[Worker] Received ${signal}. Shutting down gracefully...`);
    isRunning = false;
    clearInterval(timer);
    try {
      await pool.end();
      console.log('[Worker] Database pool closed.');
      process.exit(0);
    } catch (err) {
      console.error('[Worker] Error during shutdown:', err);
      process.exit(1);
    }
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

if (require.main === module) {
  main().catch((err) => {
    console.error('[Worker] Fatal error:', err);
    process.exit(1);
  });
}
