import {Inject,Injectable,UnauthorizedException,HttpException,ConflictException} from '@nestjs/common';
import {randomBytes,randomUUID,createHash} from 'node:crypto';
import type {Request,Response} from 'express';
import type {PoolClient} from 'pg';
import {Db} from './db';
import type {Actor} from './access';
import {hashPassword,verifyPassword,dummyHash} from './password';
const cookie='thinthai_session';
const options={httpOnly:true,sameSite:'strict' as const,path:'/api',secure:process.env.NODE_ENV==='production'};
const digest=(s:string)=>createHash('sha256').update(s).digest('hex');
function token(req:Request){return req.headers.cookie?.split(';').map(s=>s.trim()).find(s=>s.startsWith(cookie+'='))?.slice(cookie.length+1)??'';}
@Injectable()
export class Identity {
 constructor(@Inject(Db) private readonly db:Db){}
 async rate(req:Request,identity:string){
 // Atomic shared counters survive restarts. Do not trust forwarded IP headers.
 for(const [key,limit] of [[`ip:${req.ip}`,100],[`account:${identity}`,10]] as const){
 const row=(await this.db.pool.query(`INSERT INTO auth_rate_limits(key,count,resets_at) VALUES($1,1,now()+interval '15 minutes') ON CONFLICT(key) DO UPDATE SET count=CASE WHEN auth_rate_limits.resets_at<=now() THEN 1 ELSE auth_rate_limits.count+1 END,resets_at=CASE WHEN auth_rate_limits.resets_at<=now() THEN now()+interval '15 minutes' ELSE auth_rate_limits.resets_at END RETURNING count`,[digest(key)])).rows[0];
 if(row.count>limit)throw new HttpException('ลองทำรายการอีกครั้งใน 15 นาที',429);
 }
 }
 async actor(req:Request):Promise<Actor>{
 const id=(await this.db.pool.query(`SELECT u.id FROM auth_sessions s JOIN app_users u ON u.id=s.user_id WHERE s.token_hash=$1 AND s.expires_at>now() AND u.active`,[digest(token(req))])).rows[0]?.id;
 if(!id)throw new UnauthorizedException('กรุณาเข้าสู่ระบบ');return this.byId(id);
 }
 async byId(id:string):Promise<Actor>{
 const row=(await this.db.pool.query(`SELECT u.id,u.display_name AS name,
 ARRAY(SELECT role FROM system_roles WHERE user_id=u.id) AS roles,
 ARRAY(SELECT store_id::text FROM store_memberships WHERE user_id=u.id) AS stores,
 ARRAY(SELECT province_id FROM admin_province_scopes WHERE user_id=u.id) AS provinces FROM app_users u WHERE u.id=$1 AND u.active`,[id])).rows[0];
 if(!row)throw new UnauthorizedException();
 return {id:row.id,name:row.name,role:row.roles.includes('SUPER_ADMIN')?'SUPER_ADMIN':row.roles.includes('ADMIN')?'ADMIN':row.stores.length?'MERCHANT':'USER',storeIds:row.stores,provinceIds:row.provinces};
 }
 private async session(c:PoolClient,id:string,req:Request){const t=randomBytes(32).toString('hex');await c.query('DELETE FROM auth_sessions WHERE token_hash=$1 OR expires_at<=now()',[digest(token(req))]);await c.query("INSERT INTO auth_sessions(token_hash,user_id,expires_at) VALUES($1,$2,now()+interval '8 hours')",[digest(t),id]);return t;}
 private issue(res:Response,t:string){res.cookie(cookie,t,{...options,maxAge:8*3600000});}
 async register(req:Request,res:Response,input:{name:string;email:string;password:string}){
 await this.rate(req,input.email);const passwordHash=await hashPassword(input.password);const id=randomUUID();
 try{const t=await this.db.transaction(async c=>{await c.query('INSERT INTO app_users(id,auth_subject,display_name,email,password_hash) VALUES($1,$2,$3,$4,$5)',[id,`password:${id}`,input.name,input.email,passwordHash]);await c.query("INSERT INTO audit_events(id,actor_id,event) VALUES($1,$2,'account.registered')",[randomUUID(),id]);return this.session(c,id,req);});this.issue(res,t);return this.byId(id);}catch(e){if((e as {code?:string}).code==='23505')throw new ConflictException('ไม่สามารถสมัครด้วยข้อมูลนี้ได้');throw e;}
 }
 async login(req:Request,res:Response,input:{email:string;password:string}){
 await this.rate(req,input.email);const user=(await this.db.pool.query('SELECT id,password_hash,active FROM app_users WHERE email=$1',[input.email])).rows[0];
 const valid=await verifyPassword(input.password,user?.password_hash??dummyHash);
 if(!valid||!user?.active)throw new UnauthorizedException('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
 const t=await this.db.transaction(async c=>{
 // Lock against concurrent password changes; reject a credential that changed during hashing.
 const current=(await c.query('SELECT password_hash,active FROM app_users WHERE id=$1 FOR UPDATE',[user.id])).rows[0];
 if(!current?.active||current.password_hash!==user.password_hash)throw new UnauthorizedException('กรุณาเข้าสู่ระบบอีกครั้ง');
 await c.query("INSERT INTO audit_events(id,actor_id,event) VALUES($1,$2,'account.login')",[randomUUID(),user.id]);return this.session(c,user.id,req);});
 this.issue(res,t);return this.byId(user.id);
 }
 async logout(req:Request,res:Response){await this.db.pool.query('DELETE FROM auth_sessions WHERE token_hash=$1',[digest(token(req))]);res.clearCookie(cookie,options);return {ok:true};}
 async changePassword(req:Request,res:Response,input:{currentPassword:string;newPassword:string}){
 const a=await this.actor(req);await this.rate(req,`password:${a.id}`);const original=(await this.db.pool.query('SELECT password_hash FROM app_users WHERE id=$1',[a.id])).rows[0].password_hash;
 if(!await verifyPassword(input.currentPassword,original))throw new UnauthorizedException('รหัสผ่านปัจจุบันไม่ถูกต้อง');
 const updated=await hashPassword(input.newPassword);
 await this.db.transaction(async c=>{const row=await c.query('UPDATE app_users SET password_hash=$1 WHERE id=$2 AND password_hash=$3 AND active RETURNING id',[updated,a.id,original]);if(!row.rowCount)throw new UnauthorizedException('กรุณาเข้าสู่ระบบอีกครั้ง');await c.query('DELETE FROM auth_sessions WHERE user_id=$1',[a.id]);await c.query("INSERT INTO audit_events(id,actor_id,event) VALUES($1,$2,'account.password_changed')",[randomUUID(),a.id]);});
 res.clearCookie(cookie,options);return {ok:true};
 }
}
