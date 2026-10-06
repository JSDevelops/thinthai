import {chromium} from 'playwright';
import {readFile,mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {randomUUID,randomBytes} from 'node:crypto';
import {config} from 'dotenv';
import pg from 'pg';
config({quiet:true});
const url=new URL(process.env.DATABASE_URL);if(url.hostname!=='127.0.0.1'||url.port!=='55433'||url.pathname!=='/thinthai_dev')throw Error('UI tests require isolated local dev database');
const credentials=await readFile('.local/dev-accounts.md','utf8');const line=credentials.split('\n').find(l=>l.startsWith('| SUPER_ADMIN |'));if(!line)throw Error('Run db:seed first');const [, ,email,password]=line.split('|').map(v=>v.trim());
const db=new pg.Pool({connectionString:url.href});const browser=await chromium.launch({headless:true,channel:process.env.PLAYWRIGHT_CHANNEL??'chrome'});const newEmail=`ui-${randomUUID()}@test.invalid`;const newPassword=randomBytes(18).toString('base64url');
try{
const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));await mkdir('design/previews/auth',{recursive:true});
for(const [name,width,height] of [['desktop',1440,1000],['tablet',820,1180],['mobile',390,844]]){
 await page.setViewportSize({width,height});await page.goto('http://127.0.0.1:3200/workspace');await page.getByRole('heading',{name:'เข้าสู่ระบบ',exact:true}).waitFor();
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,name+' auth overflow');await page.screenshot({path:`design/previews/auth/${name}-login.png`,fullPage:true});
 await page.getByLabel('อีเมล',{exact:true}).fill(email);await page.getByLabel('รหัสผ่าน',{exact:true}).fill(password);await page.getByRole('button',{name:'เข้าสู่ระบบ',exact:true}).click();await page.getByRole('heading',{name:'ครัวริมคลอง',exact:true}).waitFor();
 await page.reload();await page.getByRole('heading',{name:'ครัวริมคลอง',exact:true}).waitFor();
 await page.getByRole('button',{name:'พื้นที่จัดส่งอาหาร',exact:true}).click();await page.getByRole('heading',{name:'ร้านอาหารและพื้นที่',exact:true}).waitFor();assert.equal(await page.locator('.store').count(),2);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,name+' dashboard overflow');
 await page.screenshot({path:`design/previews/auth/${name}-dashboard.png`,fullPage:true});await page.getByRole('button',{name:'ออกจากระบบ',exact:true}).click();await page.getByRole('heading',{name:'เข้าสู่ระบบ',exact:true}).waitFor();console.log(name+' login / refresh / scope / logout passed');
}
await page.getByRole('button',{name:'ยังไม่มีบัญชี สมัครสมาชิก'}).click();await page.getByLabel('ชื่อที่แสดง').fill('สมาชิกทดสอบหน้าจอ');await page.getByLabel('อีเมล',{exact:true}).fill(newEmail);await page.getByLabel('รหัสผ่าน',{exact:true}).fill(newPassword);await page.getByLabel('ยืนยันรหัสผ่าน').fill(newPassword);await page.getByRole('button',{name:'สมัครสมาชิก',exact:true}).click();await page.getByText('บัญชีผู้ใช้ทั่วไปไม่มีสิทธิ์จัดการร้านค้า',{exact:true}).waitFor();
assert.equal(await page.getByRole('button',{name:'พื้นที่จัดส่งอาหาร',exact:true}).count(),0);
await page.getByRole('button',{name:'เปลี่ยนรหัสผ่าน',exact:true}).click();await page.getByLabel('รหัสผ่านปัจจุบัน').fill(newPassword);await page.getByLabel('รหัสผ่านใหม่',{exact:true}).fill(newPassword+'-updated');await page.getByRole('button',{name:'บันทึกรหัสผ่าน'}).click();await page.getByText('เปลี่ยนรหัสผ่านแล้ว กรุณาเข้าสู่ระบบใหม่ อุปกรณ์อื่นถูกออกจากระบบด้วย').waitFor();
// Registration mode may be retained after signup; choose the login form explicitly.
if(await page.getByRole('button',{name:'มีบัญชีแล้ว เข้าสู่ระบบ'}).count())await page.getByRole('button',{name:'มีบัญชีแล้ว เข้าสู่ระบบ'}).click();
await page.getByLabel('อีเมล',{exact:true}).fill(newEmail);await page.getByLabel('รหัสผ่าน',{exact:true}).fill(newPassword+'-updated');await page.getByRole('button',{name:'เข้าสู่ระบบ',exact:true}).click();await page.getByText('บัญชีผู้ใช้ทั่วไปไม่มีสิทธิ์จัดการร้านค้า',{exact:true}).waitFor();assert.deepEqual(errors,[]);console.log('Signup / password change / new-password login passed. No browser runtime errors.');
}finally{
await browser.close();const user=(await db.query('SELECT id FROM app_users WHERE email=$1',[newEmail])).rows[0];if(user){await db.query('DELETE FROM audit_events WHERE actor_id=$1',[user.id]);await db.query('DELETE FROM app_users WHERE id=$1',[user.id]);}await db.end();
}
