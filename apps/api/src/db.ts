import {Injectable,OnModuleDestroy} from '@nestjs/common';
import {Pool,type PoolClient} from 'pg';
@Injectable()
export class Db implements OnModuleDestroy {
 readonly pool=new Pool({connectionString:process.env.DATABASE_URL,max:10,connectionTimeoutMillis:5000,statement_timeout:10000});
 async transaction<T>(work:(client:PoolClient)=>Promise<T>):Promise<T>{const c=await this.pool.connect();try{await c.query('BEGIN');const result=await work(c);await c.query('COMMIT');return result;}catch(e){await c.query('ROLLBACK');throw e;}finally{c.release();}}
 async onModuleDestroy(){await this.pool.end();}
}
