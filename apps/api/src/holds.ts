import { Inject, Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { PoolClient } from 'pg';
import { Db } from './db';

@Injectable()
export class Holds {
  private readonly logger = new Logger(Holds.name);

  constructor(@Inject(Db) private readonly db: Db) {}

  async sweepExpired(): Promise<{ expiredBookings: number; expiredOrders: number }> {
    return this.db.transaction(async (c: PoolClient) => {
      let expiredBookings = 0;
      let expiredOrders = 0;

      // 1. Expire pending bookings past expires_at
      const staleBookings = (
        await c.query<{
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
        await c.query(
          `UPDATE departures SET used = used - $1, version = version + 1 WHERE id = $2`,
          [b.seats, b.departure_id],
        );
        await c.query(
          `UPDATE bookings SET status = 'cancelled', version = version + 1 WHERE id = $1`,
          [b.id],
        );
        await c.query(
          `INSERT INTO booking_history (id, booking_id, actor_id, status, reason)
           VALUES ($1, $2, $3, 'cancelled', 'หมดเวลาชำระเงิน (ระบบคืนที่นั่งอัตโนมัติ)')`,
          [randomUUID(), b.id, b.buyer_id],
        );
        expiredBookings++;
      }

      // 2. Expire placed orders past expires_at
      const staleOrders = (
        await c.query<{ id: string; buyer_id: string }>(
          `SELECT o.id, o.buyer_id
           FROM orders o
           WHERE o.status = 'placed' AND o.expires_at <= now()
           FOR UPDATE OF o LIMIT 50`,
        )
      ).rows;

      for (const o of staleOrders) {
        const items = (
          await c.query<{ product_id: string; quantity: number }>(
            `SELECT product_id, quantity FROM order_items WHERE order_id = $1`,
            [o.id],
          )
        ).rows;

        for (const item of items) {
          await c.query(
            `UPDATE products SET reserved = reserved - $1, version = version + 1, updated_at = now()
             WHERE id = $2`,
            [item.quantity, item.product_id],
          );
        }

        await c.query(
          `UPDATE orders SET status = 'cancelled', version = version + 1, updated_at = now() WHERE id = $1`,
          [o.id],
        );
        await c.query(
          `INSERT INTO order_history (id, order_id, actor_id, status, reason)
           VALUES ($1, $2, $3, 'cancelled', 'หมดเวลาชำระเงิน (ระบบคืนสต๊อกอัตโนมัติ)')`,
          [randomUUID(), o.id, o.buyer_id],
        );
        expiredOrders++;
      }

      if (expiredBookings > 0 || expiredOrders > 0) {
        this.logger.log(
          `Swept expired holds: ${expiredBookings} bookings released, ${expiredOrders} orders released.`,
        );
      }

      return { expiredBookings, expiredOrders };
    });
  }
}
