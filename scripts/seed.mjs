import {config} from 'dotenv';
import {randomBytes,randomUUID} from 'node:crypto';
import {mkdirSync,writeFileSync,existsSync} from 'node:fs';
import pg from 'pg';
import passwordModule from '../apps/api/dist/password.js';
config({quiet:true});
const url=new URL(process.env.DATABASE_URL);if(url.hostname!=='127.0.0.1'||url.port!=='55433'||url.pathname!=='/thinthai_dev'||process.env.NODE_ENV==='production')throw Error('Seed supports only isolated local development.');
const db=new pg.Client({connectionString:url.href});await db.connect();
try{await db.query('BEGIN');await db.query("SELECT pg_advisory_xact_lock(hashtextextended('thinthai-seed',0))");
if((await db.query("SELECT 1 FROM app_users WHERE auth_subject='seed:super'")).rowCount){console.log('Seed already exists; passwords unchanged.');await db.query('COMMIT');}
else{
const accounts=[['user','ผู้ใช้ตัวอย่าง','USER'],['merchant','ผู้ประกอบการตัวอย่าง','MERCHANT'],['admin','ผู้ดูแลเชียงใหม่','ADMIN'],['super','ผู้ดูแลระบบกลาง','SUPER_ADMIN']];
const credentials=[];const ids={};
for(const [key,name,role] of accounts){const id=randomUUID();ids[key]=id;const pw=randomBytes(18).toString('base64url');const email=`${key}@thinthai.test`;await db.query('INSERT INTO app_users(id,auth_subject,display_name,email,password_hash) VALUES($1,$2,$3,$4,$5)',[id,`seed:${key}`,name,email,await passwordModule.hashPassword(pw)]);if(['ADMIN','SUPER_ADMIN'].includes(role))await db.query('INSERT INTO system_roles VALUES($1,$2)',[id,role]);credentials.push(`| ${role} | ${email} | ${pw} |`);}
await db.query("INSERT INTO provinces VALUES('50','เชียงใหม่'),('75','สมุทรสงคราม') ON CONFLICT DO NOTHING");
await db.query("INSERT INTO districts VALUES('5001','50','เมืองเชียงใหม่'),('5007','50','แม่ริม'),('7503','75','อัมพวา') ON CONFLICT DO NOTHING");
await db.query("INSERT INTO subdistricts VALUES('500107','5001','50','สุเทพ'),('500701','5007','50','ริมใต้'),('750301','7503','75','อัมพวา') ON CONFLICT DO NOTHING");
const store=randomUUID();await db.query("INSERT INTO stores(id,name,subdistrict_id,latitude,longitude,category) VALUES($1,'ครัวถิ่นเหนือ','500107',18.788,98.965,'food'),($2,'งานผ้าชุมชน','500701',18.913,98.943,'craft'),($3,'ครัวริมคลอง','750301',13.425,99.956,'food')",[store,randomUUID(),randomUUID()]);
await db.query('INSERT INTO store_memberships VALUES($1,$2)',[ids.merchant,store]);await db.query("INSERT INTO admin_province_scopes VALUES($1,'50')",[ids.admin]);
mkdirSync('.local',{recursive:true,mode:0o700});const path='.local/dev-accounts.md';if(existsSync(path))throw Error('Credentials file exists; refusing to overwrite.');
writeFileSync(path,'# บัญชีสำหรับพัฒนาในเครื่องเท่านั้น\n\nรหัสผ่านสุ่มเฉพาะเครื่องนี้ ไม่ควรเผยแพร่หรือใช้กับระบบจริง\n\n| บทบาท | อีเมล | รหัสผ่าน |\n|---|---|---|\n'+credentials.join('\n')+'\n',{mode:0o600,flag:'wx'});
await db.query('COMMIT');console.log('Seed created. Credentials saved privately in .local/dev-accounts.md (not printed).');
}}catch(e){await db.query('ROLLBACK');throw e;}finally{await db.end();}
