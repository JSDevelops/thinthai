import {config} from 'dotenv';
import {readFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import pg from 'pg';
config({quiet:true});
const test=process.argv.includes('--test');const url=new URL(test?process.env.TEST_DATABASE_URL:process.env.DATABASE_URL);
if(url.hostname!=='127.0.0.1'||url.port!=='55433'||url.pathname!==(test?'/thinthai_test':'/thinthai_dev'))throw Error('Migration runner is restricted to isolated local ThinThai databases.');
const db=new pg.Client({connectionString:url.href});await db.connect();
try{await db.query('BEGIN');await db.query("SELECT pg_advisory_xact_lock(hashtextextended('thinthai-migrations',0))");
await db.query('CREATE TABLE IF NOT EXISTS schema_migrations(name text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())');
const dir=new URL('../database/migrations/',import.meta.url);
for(const file of (await readdir(dir)).filter(n=>/^\d{3}_.*\.sql$/.test(n)).sort()){
 const sql=await readFile(new URL(file,dir),'utf8');const checksum=createHash('sha256').update(sql).digest('hex');const old=(await db.query('SELECT checksum FROM schema_migrations WHERE name=$1',[file])).rows[0];
 if(old){if(old.checksum!==checksum)throw Error(`Applied migration changed: ${file}`);continue;}
 // Legacy 001 contained its own transaction; runner now owns the atomic transaction.
 await db.query(sql.replace(/^BEGIN;\s*$/gm,'').replace(/^COMMIT;\s*$/gm,''));
 await db.query('INSERT INTO schema_migrations(name,checksum) VALUES($1,$2)',[file,checksum]);console.log(`Applied ${file}`);
}await db.query('COMMIT');console.log('Migrations up to date.');
}catch(e){await db.query('ROLLBACK');throw e;}finally{await db.end();}
