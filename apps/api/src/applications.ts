import {
  Inject,
  Injectable,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { PoolClient } from 'pg';
import { z } from 'zod';
import { Db } from './db';
import type { Actor } from './access';
export const applicationInput = z
  .object({
    name: z.string().trim().min(1).max(120),
    category: z.enum(['food', 'craft']),
    address: z.string().trim().min(5).max(500),
    phone: z
      .string()
      .trim()
      .regex(/^\+?[0-9 ()-]{8,20}$/),
    subdistrictId: z.string().min(1).max(20),
  })
  .strict();
export const revisionInput = applicationInput.extend({ version: z.number().int().positive() });
export const versionInput = z.object({ version: z.number().int().positive() }).strict();
export const reviewInput = versionInput.extend({
  decision: z.enum(['approved', 'rejected', 'changes_requested']),
  reason: z.string().trim().min(5).max(1000),
});
type Input = z.infer<typeof applicationInput>;
const select = `SELECT a.id,a.applicant_id AS "applicantId",u.display_name AS applicant,a.name,a.category,a.address,a.phone,a.subdistrict_id AS "subdistrictId",t.name_th AS subdistrict,d.id AS "districtId",d.name_th AS district,t.province_id AS "provinceId",p.name_th AS province,a.status,a.version,a.reason,a.store_id AS "storeId",a.updated_at AS "updatedAt" FROM merchant_applications a JOIN app_users u ON u.id=a.applicant_id JOIN subdistricts t ON t.id=a.subdistrict_id JOIN districts d ON d.id=t.district_id JOIN provinces p ON p.id=t.province_id`;
@Injectable()
export class Applications {
  constructor(@Inject(Db) private readonly db: Db) {}
  async areas() {
    return (
      await this.db.pool.query(
        `SELECT t.id,t.name_th AS name,d.id AS "districtId",d.name_th AS district,p.id AS "provinceId",p.name_th AS province FROM subdistricts t JOIN districts d ON d.id=t.district_id JOIN provinces p ON p.id=t.province_id ORDER BY p.name_th,d.name_th,t.name_th`,
      )
    ).rows;
  }
  async list(a: Actor, review = false) {
    if (review && !['ADMIN', 'SUPER_ADMIN'].includes(a.role)) throw new ForbiddenException();
    return (
      await this.db.pool.query(
        `${select} WHERE ${review ? "a.applicant_id<>$1 AND a.status<>'draft' AND ($2='SUPER_ADMIN' OR t.province_id=ANY($3::text[]))" : 'a.applicant_id=$1'} ORDER BY a.updated_at DESC LIMIT 100`,
        [a.id, a.role, a.provinceIds].slice(0, review ? 3 : 1),
      )
    ).rows;
  }
  private async row(c: PoolClient, id: string, version?: number) {
    const row = (await c.query(`${select} WHERE a.id=$1 FOR UPDATE OF a`, [id])).rows[0];
    if (!row) throw new ForbiddenException();
    return row;
  }
  private version(row: { version: number }, expected: number) {
    if (row.version !== expected)
      throw new ConflictException('คำขอมีการเปลี่ยนแปลงแล้ว กรุณาโหลดข้อมูลล่าสุด');
  }
  private async area(c: PoolClient, id: string) {
    if (!(await c.query('SELECT 1 FROM subdistricts WHERE id=$1', [id])).rowCount)
      throw new BadRequestException('ไม่พบตำบลนี้');
  }
  private async event(c: PoolClient, id: string, a: Actor, event: string, reason = '') {
    const row = (await c.query(`${select} WHERE a.id=$1`, [id])).rows[0];
    await c.query(
      'INSERT INTO application_history(id,application_id,actor_id,event,reason,snapshot) VALUES($1,$2,$3,$4,$5,$6)',
      [randomUUID(), id, a.id, event, reason, row],
    );
    return row;
  }
  async create(a: Actor, v: Input) {
    if (!['USER', 'MERCHANT'].includes(a.role))
      throw new ForbiddenException('ใช้บัญชีผู้สมัครเพื่อยื่นคำขอ');
    return this.db.transaction(async (c) => {
      await c.query('SELECT id FROM app_users WHERE id=$1 FOR UPDATE', [a.id]);
      if (
        (
          await c.query(
            "SELECT 1 FROM merchant_applications WHERE applicant_id=$1 AND status IN ('draft','submitted','changes_requested')",
            [a.id],
          )
        ).rowCount
      )
        throw new ConflictException('มีคำขอที่ยังไม่สิ้นสุด กรุณาดำเนินการคำขอเดิม');
      await this.area(c, v.subdistrictId);
      const id = randomUUID();
      await c.query(
        'INSERT INTO merchant_applications(id,applicant_id,name,category,address,phone,subdistrict_id) VALUES($1,$2,$3,$4,$5,$6,$7)',
        [id, a.id, v.name, v.category, v.address, v.phone, v.subdistrictId],
      );
      return this.event(c, id, a, 'draft');
    });
  }
  async edit(a: Actor, id: string, v: Input & { version: number }) {
    return this.db.transaction(async (c) => {
      const row = await this.row(c, id);
      if (row.applicantId !== a.id) throw new ForbiddenException();
      this.version(row, v.version);
      if (!['draft', 'changes_requested'].includes(row.status))
        throw new ConflictException('แก้ไขได้เฉพาะฉบับร่างหรือคำขอที่ให้แก้ไข');
      await this.area(c, v.subdistrictId);
      await c.query(
        'UPDATE merchant_applications SET name=$1,category=$2,address=$3,phone=$4,subdistrict_id=$5,version=version+1,updated_at=now() WHERE id=$6',
        [v.name, v.category, v.address, v.phone, v.subdistrictId, id],
      );
      return this.event(c, id, a, 'edited');
    });
  }
  async submit(a: Actor, id: string, version: number) {
    return this.db.transaction(async (c) => {
      const row = await this.row(c, id);
      if (row.applicantId !== a.id) throw new ForbiddenException();
      this.version(row, version);
      if (!['draft', 'changes_requested'].includes(row.status))
        throw new ConflictException('คำขอนี้ส่งตรวจไปแล้วหรือสิ้นสุดแล้ว');
      await c.query(
        "UPDATE merchant_applications SET status='submitted',version=version+1,reason='',updated_at=now() WHERE id=$1",
        [id],
      );
      return this.event(c, id, a, 'submitted');
    });
  }
  async review(a: Actor, id: string, v: z.infer<typeof reviewInput>) {
    return this.db.transaction(async (c) => {
      const row = await this.row(c, id);
      if (
        !['ADMIN', 'SUPER_ADMIN'].includes(a.role) ||
        row.applicantId === a.id ||
        (a.role === 'ADMIN' && !a.provinceIds.includes(row.provinceId))
      )
        throw new ForbiddenException();
      this.version(row, v.version);
      if (row.status !== 'submitted') throw new ConflictException('ตรวจได้เฉพาะคำขอที่รอตรวจ');
      let storeId = null;
      if (v.decision === 'approved') {
        const user = (
          await c.query('SELECT active FROM app_users WHERE id=$1 FOR UPDATE', [row.applicantId])
        ).rows[0];
        if (!user.active) throw new ConflictException('บัญชีผู้สมัครถูกปิดใช้งาน');
        storeId = randomUUID();
        await c.query(
          'INSERT INTO stores(id,name,category,address,subdistrict_id,active) VALUES($1,$2,$3,$4,$5,false)',
          [storeId, row.name, row.category, row.address, row.subdistrictId],
        );
        await c.query('INSERT INTO store_memberships VALUES($1,$2)', [row.applicantId, storeId]);
        await c.query(
          "INSERT INTO store_history(id,store_id,actor_id,event,after_data) VALUES($1,$2,$3,'store.created',$4)",
          [
            randomUUID(),
            storeId,
            a.id,
            { name: row.name, active: false, deliveryEnabled: false, applicationId: id },
          ],
        );
      }
      await c.query(
        'UPDATE merchant_applications SET status=$1,reason=$2,store_id=$3,version=version+1,updated_at=now() WHERE id=$4',
        [v.decision, v.reason, storeId, id],
      );
      return this.event(c, id, a, v.decision, v.reason);
    });
  }
  async history(a: Actor, id: string) {
    return this.db.transaction(async (c) => {
      const row = await this.row(c, id);
      const reviewer =
        row.status !== 'draft' &&
        (a.role === 'SUPER_ADMIN' ||
          (a.role === 'ADMIN' && a.provinceIds.includes(row.provinceId)));
      if (row.applicantId !== a.id && !reviewer) throw new ForbiddenException();
      return (
        await c.query(
          'SELECT h.event,h.reason,h.created_at AS "createdAt",u.display_name AS actor FROM application_history h JOIN app_users u ON u.id=h.actor_id WHERE application_id=$1 ORDER BY h.created_at DESC LIMIT 50',
          [id],
        )
      ).rows;
    });
  }
}
