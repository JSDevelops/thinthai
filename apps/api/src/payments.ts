import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { PoolClient } from 'pg';
import { z } from 'zod';
import { Db } from './db';
import { canManage, type Actor } from './access';
import { Holds } from './holds';
import { ownsPayment, sandboxPaymentsEnabled } from './payment-policy';

export const paymentCreateInput = z
  .object({
    targetType: z.enum(['booking', 'order']),
    targetId: z.uuid(),
    method: z.enum(['promptpay', 'card', 'sandbox']).default('promptpay'),
  })
  .strict();

export type PaymentCreateInput = z.infer<typeof paymentCreateInput>;

@Injectable()
export class Payments {
  constructor(
    @Inject(Db) private readonly db: Db,
    @Inject(Holds) private readonly holds: Holds,
  ) {}

  private generatePromptPayQr(amountBaht: number, ref: string): string {
    // Generates EMVCo standard payload for PromptPay QR simulation
    const amountStr = amountBaht.toFixed(2);
    const amountTag = `54${amountStr.length.toString().padStart(2, '0')}${amountStr}`;
    return `00020101021229370016A000000677010111011300668000000005802TH5303764${amountTag}62${ref.length.toString().padStart(2, '0')}${ref}6304`;
  }

  private requireSandbox() {
    if (
      !sandboxPaymentsEnabled({
        NODE_ENV: process.env.NODE_ENV,
        ENABLE_SANDBOX_PAYMENTS: process.env.ENABLE_SANDBOX_PAYMENTS,
      })
    ) {
      throw new ForbiddenException('ระบบชำระเงินจำลองปิดอยู่');
    }
  }

  async createIntent(a: Actor, input: PaymentCreateInput) {
    this.requireSandbox();
    // 1. Run sweep first to ensure stale holds are expired
    await this.holds.sweepExpired();

    return this.db.transaction(async (c: PoolClient) => {
      let amountSatang = 0;
      let targetSummary = '';
      let storeId = '';

      if (input.targetType === 'booking') {
        const booking = (
          await c.query<{
            id: string;
            buyer_id: string;
            status: string;
            seats: number;
            unit_price_satang: number;
            title: string;
            expires_at: Date;
            departure_id: string;
          }>(
            `SELECT b.id, b.buyer_id, b.status, b.seats, b.unit_price_satang, b.title, b.expires_at, b.departure_id
             FROM bookings b WHERE b.id = $1 FOR UPDATE`,
            [input.targetId],
          )
        ).rows[0];

        if (!booking) throw new NotFoundException('ไม่พบรายการจอง');
        if (!ownsPayment(a.id, booking.buyer_id)) {
          throw new ForbiddenException('ไม่มีสิทธิ์ชำระเงินสำหรับรายการจองนี้');
        }
        if (booking.status !== 'pending') {
          throw new BadRequestException(
            `รายการจองนี้อยู่ในสถานะ ${booking.status} แล้ว ไม่สามารถเปิดชำระเงินได้`,
          );
        }
        if (new Date(booking.expires_at).getTime() <= Date.now()) {
          throw new ConflictException(
            'รายการจองนี้หมดเวลาชำระเงินแล้ว ระบบได้ยกเลิกและคืนที่นั่งแล้ว',
          );
        }

        amountSatang = booking.seats * booking.unit_price_satang;
        targetSummary = `จองทริป ${booking.title} (${booking.seats} ท่าน)`;

        const storeRow = (
          await c.query<{ store_id: string }>(
            `SELECT t.store_id FROM departures d JOIN trips t ON t.id = d.trip_id WHERE d.id = $1`,
            [booking.departure_id],
          )
        ).rows[0];
        storeId = storeRow?.store_id || '';
      } else {
        const order = (
          await c.query<{
            id: string;
            buyer_id: string;
            store_id: string;
            status: string;
            subtotal_satang: string;
            expires_at: Date;
          }>(
            `SELECT o.id, o.buyer_id, o.store_id, o.status, o.subtotal_satang, o.expires_at
             FROM orders o WHERE o.id = $1 FOR UPDATE`,
            [input.targetId],
          )
        ).rows[0];

        if (!order) throw new NotFoundException('ไม่พบคำสั่งซื้อ');
        if (!ownsPayment(a.id, order.buyer_id)) {
          throw new ForbiddenException('ไม่มีสิทธิ์ชำระเงินสำหรับคำสั่งซื้อนี้');
        }
        if (order.status !== 'placed') {
          throw new BadRequestException(
            `คำสั่งซื้อนี้อยู่ในสถานะ ${order.status} แล้ว ไม่สามารถเปิดชำระเงินได้`,
          );
        }
        if (new Date(order.expires_at).getTime() <= Date.now()) {
          throw new ConflictException(
            'คำสั่งซื้อนี้หมดเวลาชำระเงินแล้ว ระบบได้ยกเลิกและคืนสต๊อกแล้ว',
          );
        }

        amountSatang = Number(order.subtotal_satang);
        targetSummary = `คำสั่งซื้อสินค้าชุมชน`;
        storeId = order.store_id;
      }

      // Check if active pending payment exists for this target
      const existing = (
        await c.query<{
          id: string;
          amount_satang: string;
          status: string;
          qr_payload: string;
          provider_ref: string;
          expires_at: Date;
        }>(
          `SELECT id, amount_satang, status, qr_payload, provider_ref, expires_at
           FROM payments
           WHERE target_type = $1 AND target_id = $2 AND status = 'pending' AND expires_at > now()
           ORDER BY created_at DESC LIMIT 1`,
          [input.targetType, input.targetId],
        )
      ).rows[0];

      if (existing) {
        return {
          id: existing.id,
          targetType: input.targetType,
          targetId: input.targetId,
          amountSatang: Number(existing.amount_satang),
          amountBaht: Number(existing.amount_satang) / 100,
          status: existing.status,
          qrPayload: existing.qr_payload,
          providerRef: existing.provider_ref,
          expiresAt: existing.expires_at,
          targetSummary,
          storeId,
        };
      }

      const paymentId = randomUUID();
      const providerRef = `TT-${Date.now().toString().slice(-8)}`;
      const amountBaht = amountSatang / 100;
      const qrPayload = this.generatePromptPayQr(amountBaht, providerRef);
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

      await c.query(
        `INSERT INTO payments (id, user_id, target_type, target_id, amount_satang, method, status, provider_ref, qr_payload, expires_at)
         VALUES ($1, $2, $3, $4, $5, 'promptpay', 'pending', $6, $7, $8)`,
        [
          paymentId,
          a.id,
          input.targetType,
          input.targetId,
          amountSatang,
          providerRef,
          qrPayload,
          expiresAt,
        ],
      );

      return {
        id: paymentId,
        targetType: input.targetType,
        targetId: input.targetId,
        amountSatang,
        amountBaht,
        status: 'pending',
        qrPayload,
        providerRef,
        expiresAt,
        targetSummary,
        storeId,
      };
    });
  }

  async simulatePay(a: Actor, paymentId: string) {
    this.requireSandbox();
    return this.db.transaction(async (c: PoolClient) => {
      const payment = (
        await c.query<{
          id: string;
          user_id: string;
          target_type: string;
          target_id: string;
          amount_satang: string;
          status: string;
          expires_at: Date;
        }>(`SELECT * FROM payments WHERE id = $1 FOR UPDATE`, [paymentId])
      ).rows[0];

      if (!payment) throw new NotFoundException('ไม่พบรายการชำระเงิน');
      if (!ownsPayment(a.id, payment.user_id)) {
        throw new ForbiddenException('ไม่มีสิทธิ์ยืนยันรายการชำระเงินนี้');
      }
      if (payment.status !== 'pending') {
        throw new BadRequestException(`รายการนี้อยู่ในสถานะ ${payment.status} แล้ว`);
      }
      if (new Date(payment.expires_at).getTime() <= Date.now()) {
        throw new ConflictException('รายการชำระเงินหมดอายุแล้ว');
      }

      const grossAmount = Number(payment.amount_satang);
      const platformFee = Math.round(grossAmount * 0.05); // 5% fee for community platform
      const netMerchant = grossAmount - platformFee;
      let storeId = '';

      // Update payment to succeeded
      await c.query(
        `UPDATE payments SET status = 'succeeded', version = version + 1, updated_at = now() WHERE id = $1`,
        [payment.id],
      );

      if (payment.target_type === 'booking') {
        const booking = (
          await c.query<{ id: string; departure_id: string }>(
            `SELECT id, departure_id FROM bookings WHERE id = $1 FOR UPDATE`,
            [payment.target_id],
          )
        ).rows[0];

        if (booking) {
          await c.query(
            `UPDATE bookings SET status = 'confirmed', version = version + 1 WHERE id = $1`,
            [booking.id],
          );
          await c.query(
            `INSERT INTO booking_history (id, booking_id, actor_id, status, reason)
             VALUES ($1, $2, $3, 'confirmed', 'ชำระเงินสำเร็จผ่านระบบ PromptPay (จำลอง)')`,
            [randomUUID(), booking.id, a.id],
          );

          const storeRow = (
            await c.query<{ store_id: string }>(
              `SELECT t.store_id FROM departures d JOIN trips t ON t.id = d.trip_id WHERE d.id = $1`,
              [booking.departure_id],
            )
          ).rows[0];
          storeId = storeRow?.store_id || '';
        }
      } else {
        const order = (
          await c.query<{ id: string; store_id: string }>(
            `SELECT id, store_id FROM orders WHERE id = $1 FOR UPDATE`,
            [payment.target_id],
          )
        ).rows[0];

        if (order) {
          await c.query(
            `UPDATE orders SET status = 'accepted', version = version + 1, updated_at = now() WHERE id = $1`,
            [order.id],
          );
          await c.query(
            `INSERT INTO order_history (id, order_id, actor_id, status, reason)
             VALUES ($1, $2, $3, 'accepted', 'ชำระเงินสำเร็จผ่านระบบ PromptPay (จำลอง)')`,
            [randomUUID(), order.id, a.id],
          );
          storeId = order.store_id;
        }
      }

      // Record in ledger for community store
      if (storeId) {
        await c.query(
          `INSERT INTO ledger_entries (id, payment_id, store_id, gross_amount_satang, platform_fee_satang, net_merchant_satang, status)
           VALUES ($1, $2, $3, $4, $5, $6, 'pending_payout')`,
          [randomUUID(), payment.id, storeId, grossAmount, platformFee, netMerchant],
        );
      }

      return {
        paymentId: payment.id,
        targetType: payment.target_type,
        targetId: payment.target_id,
        status: 'succeeded',
        amountSatang: grossAmount,
        platformFeeSatang: platformFee,
        netMerchantSatang: netMerchant,
        storeId,
      };
    });
  }

  async get(a: Actor, paymentId: string) {
    const payment = (
      await this.db.pool.query<{
        id: string;
        user_id: string;
        target_type: string;
        target_id: string;
        amount_satang: string;
        method: string;
        status: string;
        provider_ref: string;
        qr_payload: string;
        expires_at: Date;
        created_at: Date;
      }>(`SELECT * FROM payments WHERE id = $1`, [paymentId])
    ).rows[0];

    if (!payment) throw new NotFoundException('ไม่พบข้อมูลการชำระเงิน');
    if (!ownsPayment(a.id, payment.user_id)) {
      throw new ForbiddenException();
    }

    const amountSatang = Number(payment.amount_satang);
    return {
      id: payment.id,
      targetType: payment.target_type,
      targetId: payment.target_id,
      amountSatang,
      amountBaht: amountSatang / 100,
      method: payment.method,
      status: payment.status,
      providerRef: payment.provider_ref,
      qrPayload: payment.qr_payload,
      expiresAt: payment.expires_at,
      createdAt: payment.created_at,
    };
  }

  async storeLedger(a: Actor, storeId: string) {
    const store = (
      await this.db.pool.query<{ id: string; category: 'food' | 'craft'; province_id: string }>(
        `SELECT s.id, s.category, t.province_id
         FROM stores s JOIN subdistricts t ON t.id = s.subdistrict_id WHERE s.id = $1`,
        [storeId],
      )
    ).rows[0];

    if (
      !store ||
      !canManage(a, {
        id: store.id,
        provinceId: store.province_id,
      } as unknown as import('./access').Store)
    ) {
      throw new ForbiddenException('ไม่มีสิทธิ์ดูบัญชีรายได้ของร้านนี้');
    }

    const entries = (
      await this.db.pool.query<{
        id: string;
        payment_id: string;
        gross_amount_satang: string;
        platform_fee_satang: string;
        net_merchant_satang: string;
        status: string;
        created_at: Date;
        target_type: string;
      }>(
        `SELECT l.id, l.payment_id, l.gross_amount_satang, l.platform_fee_satang, l.net_merchant_satang, l.status, l.created_at, p.target_type
         FROM ledger_entries l
         JOIN payments p ON p.id = l.payment_id
         WHERE l.store_id = $1
         ORDER BY l.created_at DESC LIMIT 100`,
        [storeId],
      )
    ).rows;

    let totalGrossSatang = 0;
    let totalFeeSatang = 0;
    let totalNetSatang = 0;

    const formatted = entries.map((e) => {
      const gross = Number(e.gross_amount_satang);
      const fee = Number(e.platform_fee_satang);
      const net = Number(e.net_merchant_satang);
      totalGrossSatang += gross;
      totalFeeSatang += fee;
      totalNetSatang += net;
      return {
        id: e.id,
        paymentId: e.payment_id,
        targetType: e.target_type,
        grossSatang: gross,
        feeSatang: fee,
        netSatang: net,
        status: e.status,
        createdAt: e.created_at,
      };
    });

    return {
      storeId,
      totalGrossSatang,
      totalGrossBaht: totalGrossSatang / 100,
      totalFeeSatang,
      totalFeeBaht: totalFeeSatang / 100,
      totalNetSatang,
      totalNetBaht: totalNetSatang / 100,
      entries: formatted,
    };
  }
}
