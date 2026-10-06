import {
  Inject,
  Injectable,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { PoolClient } from 'pg';
import { Db } from './db';
import { canManage, canConfigureDelivery, type Actor, type Store } from './access';
import { distanceKm, type StoreInput } from './store-input';
const select = `SELECT s.id,s.name,s.category,s.address,s.active,s.version,s.delivery_enabled AS "deliveryEnabled",s.delivery_radius_km::float8 AS "radiusKm",s.subdistrict_id AS "subdistrictId",p.id AS "provinceId",d.id AS "districtId",p.name_th AS province,d.name_th AS district,t.name_th AS subdistrict,s.latitude::float8 AS lat,s.longitude::float8 AS lng FROM stores s JOIN subdistricts t ON t.id=s.subdistrict_id JOIN districts d ON d.id=t.district_id JOIN provinces p ON p.id=t.province_id`;
type RecordStore = Store & {
  address: string;
  active: boolean;
  version: number;
  deliveryEnabled: boolean;
  radiusKm: number | null;
  subdistrictId: string;
};
@Injectable()
export class Stores {
  constructor(@Inject(Db) private readonly db: Db) {}
  async list(a: Actor): Promise<RecordStore[]> {
    return (
      await this.db.pool.query(
        `${select} WHERE $1='SUPER_ADMIN' OR ($1='ADMIN' AND p.id=ANY($2::text[])) OR ($1='MERCHANT' AND s.id=ANY($3::uuid[])) ORDER BY s.created_at,s.id`,
        [a.role, a.provinceIds, a.storeIds],
      )
    ).rows;
  }
  async one(a: Actor, id: string) {
    const row = (await this.db.pool.query(`${select} WHERE s.id=$1`, [id])).rows[0] as
      RecordStore | undefined;
    if (!row || !canManage(a, row)) throw new ForbiddenException();
    return row;
  }
  async areas(a: Actor) {
    if (a.role === 'USER') throw new ForbiddenException();
    return (
      await this.db.pool.query(
        `SELECT t.id,t.name_th AS name,d.id AS "districtId",d.name_th AS district,p.id AS "provinceId",p.name_th AS province FROM subdistricts t JOIN districts d ON d.id=t.district_id JOIN provinces p ON p.id=t.province_id WHERE $1<>'ADMIN' OR p.id=ANY($2::text[]) ORDER BY p.name_th,d.name_th,t.name_th`,
        [a.role, a.provinceIds],
      )
    ).rows;
  }
  private async area(c: PoolClient, a: Actor, id: string) {
    const row = (await c.query('SELECT province_id FROM subdistricts WHERE id=$1', [id])).rows[0];
    if (!row) throw new BadRequestException('ไม่พบตำบลนี้');
    if (a.role === 'ADMIN' && !a.provinceIds.includes(row.province_id))
      throw new ForbiddenException('อยู่นอกจังหวัดที่รับผิดชอบ');
  }
  private async locked(c: PoolClient, a: Actor, id: string, version: number) {
    const row = (await c.query(`${select} WHERE s.id=$1 FOR UPDATE OF s`, [id])).rows[0] as
      RecordStore | undefined;
    if (!row || !canManage(a, row)) throw new ForbiddenException();
    if (row.version !== version)
      throw new ConflictException('ข้อมูลถูกแก้ไขแล้ว กรุณาปิดฟอร์มและเปิดใหม่');
    return row;
  }
  private async audit(c: PoolClient, a: Actor, id: string, event: string, before: unknown) {
    const after = (await c.query(`${select} WHERE s.id=$1`, [id])).rows[0];
    await c.query(
      'INSERT INTO store_history(id,store_id,actor_id,event,before_data,after_data) VALUES($1,$2,$3,$4,$5,$6)',
      [randomUUID(), id, a.id, event, before, after],
    );
    return after;
  }
  async create(a: Actor, input: StoreInput) {
    if (a.role === 'USER') throw new ForbiddenException();
    return this.db.transaction(async (c) => {
      await this.area(c, a, input.subdistrictId);
      const id = randomUUID();
      await c.query(
        'INSERT INTO stores(id,name,address,category,subdistrict_id,latitude,longitude,active) VALUES($1,$2,$3,$4,$5,$6,$7,$8)',
        [
          id,
          input.name,
          input.address,
          input.category,
          input.subdistrictId,
          input.lat,
          input.lng,
          input.active,
        ],
      );
      if (a.role === 'MERCHANT')
        await c.query('INSERT INTO store_memberships VALUES($1,$2)', [a.id, id]);
      return this.audit(c, a, id, 'store.created', null);
    });
  }
  async update(a: Actor, id: string, input: StoreInput & { version: number }) {
    return this.db.transaction(async (c) => {
      const old = await this.locked(c, a, id, input.version);
      await this.area(c, a, input.subdistrictId);
      // Moving a pin/area or changing category/status requires a fresh delivery approval.
      const reset =
        old.lat !== input.lat ||
        old.lng !== input.lng ||
        old.subdistrictId !== input.subdistrictId ||
        old.category !== input.category ||
        old.active !== input.active;
      await c.query(
        `UPDATE stores SET name=$1,address=$2,category=$3,subdistrict_id=$4,latitude=$5,longitude=$6,active=$7,version=version+1,delivery_enabled=CASE WHEN $8 THEN false ELSE delivery_enabled END,delivery_radius_km=CASE WHEN $8 THEN NULL ELSE delivery_radius_km END WHERE id=$9`,
        [
          input.name,
          input.address,
          input.category,
          input.subdistrictId,
          input.lat,
          input.lng,
          input.active,
          reset,
          id,
        ],
      );
      return this.audit(c, a, id, 'store.updated', old);
    });
  }
  async configure(
    a: Actor,
    id: string,
    input: { version: number; enabled: boolean; radiusKm: number | null },
  ) {
    return this.db.transaction(async (c) => {
      const old = await this.locked(c, a, id, input.version);
      if (!canConfigureDelivery(a, old))
        throw new ForbiddenException('ตั้งค่าได้เฉพาะร้านอาหารในพื้นที่ดูแล');
      if (input.enabled && (!old.active || old.lat === null || old.lng === null))
        throw new BadRequestException('เปิดร้านและปักหมุดก่อนเปิดจัดส่ง');
      await c.query(
        'UPDATE stores SET delivery_enabled=$1,delivery_radius_km=$2,version=version+1 WHERE id=$3',
        [input.enabled, input.radiusKm, id],
      );
      return this.audit(c, a, id, 'delivery.updated', old);
    });
  }
  async check(a: Actor, id: string, point: { lat: number; lng: number }) {
    const s = await this.one(a, id);
    if (!canConfigureDelivery(a, s)) throw new ForbiddenException();
    if (!s.deliveryEnabled || s.lat === null || s.lng === null || s.radiusKm === null)
      return { eligible: false, distanceKm: null, reason: 'ยังไม่เปิดจัดส่ง' };
    const distance = distanceKm({ lat: s.lat, lng: s.lng }, point);
    return {
      eligible: distance <= s.radiusKm,
      distanceKm: Math.round(distance * 1000) / 1000,
      reason: distance <= s.radiusKm ? 'อยู่ในรัศมีจัดส่ง' : 'อยู่นอกรัศมีจัดส่ง',
    };
  }
  async history(a: Actor, id: string) {
    await this.one(a, id);
    return (
      await this.db.pool.query(
        'SELECT h.event,h.created_at AS "createdAt",u.display_name AS actor,h.before_data AS before,h.after_data AS after FROM store_history h JOIN app_users u ON u.id=h.actor_id WHERE store_id=$1 ORDER BY h.created_at DESC,h.id LIMIT 50',
        [id],
      )
    ).rows;
  }
}
