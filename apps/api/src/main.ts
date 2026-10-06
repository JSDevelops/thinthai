import {Trips,tripCreate,tripEdit,departureCreate,departureState,bookingCreate,bookingAction} from './trips';
import 'reflect-metadata';
import {config} from 'dotenv';
import {resolve} from 'node:path';
import {randomUUID} from 'node:crypto';
import {Body,Controller,Get,Post,Param,Req,Res,Module,Inject,ForbiddenException,Catch,HttpException,type ArgumentsHost,type ExceptionFilter} from '@nestjs/common';
import {NestFactory} from '@nestjs/core';
import {json,type Request,type Response} from 'express';
import helmet from 'helmet';
import {z,ZodError} from 'zod';
import {Db} from './db';
import {Identity} from './identity';
import {Stores} from './stores';
import {Orders,checkoutInput,orderAction} from './orders';
import {Products,productCreate,productEdit,stockInput,imageInput} from './products';
import {Applications,applicationInput,revisionInput,versionInput,reviewInput} from './applications';
import {createStore,updateStore,deliveryInput,checkInput} from './store-input';
import {canConfigureDelivery} from './access';
config({path:resolve(__dirname,'../../../.env'),quiet:true});
const email=z.string().trim().toLowerCase().email().max(254);
const password=z.string().min(15).max(128);
const loginInput=z.object({email,password:z.string().min(1).max(128)}).strict();
const registerInput=z.object({name:z.string().trim().min(1).max(100),email,password}).strict();
@Catch() class Errors implements ExceptionFilter {
 catch(e:unknown,host:ArgumentsHost){const status=e instanceof ZodError?400:e instanceof HttpException?e.getStatus():[400,413].includes((e as {status?:number})?.status??0)?(e as {status:number}).status:500;const message=e instanceof ZodError?'ข้อมูลไม่ถูกต้อง กรุณาตรวจช่องที่กรอกและช่วงค่าที่กำหนด':e instanceof HttpException?e.message:'ระบบไม่สามารถทำรายการได้';const requestId=randomUUID();if(status>=500)console.error('Request failed',requestId,e instanceof Error?e.name:'Unknown');host.switchToHttp().getResponse<Response>().status(status).json({message,requestId});}
}
@Controller('api/v1') class Api {
 constructor(@Inject(Db) private readonly db:Db,@Inject(Identity) private readonly identity:Identity,@Inject(Stores) private readonly stores:Stores,@Inject(Applications) private readonly applications:Applications,@Inject(Products) private readonly products:Products,@Inject(Orders) private readonly orders:Orders,@Inject(Trips) private readonly trips:Trips){}
 @Get('applications/areas') async applicationAreas(@Req() req:Request){await this.identity.actor(req);return this.applications.areas();}
 @Get('applications') async applicationsList(@Req() req:Request){return this.applications.list(await this.identity.actor(req));}
 @Get('applications/review') async reviewList(@Req() req:Request){return this.applications.list(await this.identity.actor(req),true);}
 @Post('applications') async apply(@Req() req:Request,@Body() body:unknown){return this.applications.create(await this.identity.actor(req),applicationInput.parse(body));}
 @Post('applications/:id') async revise(@Req() req:Request,@Param('id') id:string,@Body() body:unknown){return this.applications.edit(await this.identity.actor(req),z.uuid().parse(id),revisionInput.parse(body));}
 @Post('applications/:id/submit') async submitApplication(@Req() req:Request,@Param('id') id:string,@Body() body:unknown){return this.applications.submit(await this.identity.actor(req),z.uuid().parse(id),versionInput.parse(body).version);}
 @Post('applications/:id/review') async reviewApplication(@Req() req:Request,@Param('id') id:string,@Body() body:unknown){return this.applications.review(await this.identity.actor(req),z.uuid().parse(id),reviewInput.parse(body));}
 @Get('applications/:id/history') async applicationHistory(@Req() req:Request,@Param('id') id:string){return this.applications.history(await this.identity.actor(req),z.uuid().parse(id));}
 @Get('stores/:id/products') async productList(@Req() req:Request,@Param('id') id:string){return this.products.list(await this.identity.actor(req),z.uuid().parse(id));}
 @Post('stores/:id/products') async productCreate(@Req() req:Request,@Param('id') id:string,@Body() body:unknown){return this.products.create(await this.identity.actor(req),z.uuid().parse(id),productCreate.parse(body));}
 @Post('products/:id') async productEdit(@Req() req:Request,@Param('id') id:string,@Body() body:unknown){return this.products.edit(await this.identity.actor(req),z.uuid().parse(id),productEdit.parse(body));}
 @Post('products/:id/stock') async productStock(@Req() req:Request,@Param('id') id:string,@Body() body:unknown){return this.products.stock(await this.identity.actor(req),z.uuid().parse(id),stockInput.parse(body));}
 @Post('products/:id/image') async productImage(@Req() req:Request,@Param('id') id:string,@Body() body:unknown){const a=await this.identity.actor(req);await this.identity.rate(req,'image:'+a.id);return this.products.upload(a,z.uuid().parse(id),imageInput.parse(body));}
 @Get('products/:id/image') async productImageRead(@Req() req:Request,@Param('id') id:string,@Res() res:Response){let a;try{a=await this.identity.actor(req);}catch(e){if(!(e instanceof HttpException)||e.getStatus()!==401)throw e;}const bytes=await this.products.image(z.uuid().parse(id),a);res.type('image/webp').send(bytes);}
 @Get('products/:id/history') async productHistory(@Req() req:Request,@Param('id') id:string){return this.products.history(await this.identity.actor(req),z.uuid().parse(id));}
 @Get('catalog') catalog(){return this.products.catalog();}
 @Post('catalog/:id/availability') availability(@Param('id') id:string,@Body() body:unknown){const v=z.object({point:checkInput.optional()}).strict().parse(body);return this.products.availability(z.uuid().parse(id),v.point);}
 @Get('orders/my') async myOrders(@Req() req:Request){return this.orders.list(await this.identity.actor(req),false);}
 @Get('orders/manage') async managedOrders(@Req() req:Request){return this.orders.list(await this.identity.actor(req),true);}
 @Post('orders') async checkout(@Req() req:Request,@Body() body:unknown){return this.orders.checkout(await this.identity.actor(req),checkoutInput.parse(body));}
 @Post('orders/:id/actions') async orderAction(@Req() req:Request,@Param('id') id:string,@Body() body:unknown){return this.orders.action(await this.identity.actor(req),z.uuid().parse(id),orderAction.parse(body));}
 @Get('trips') publicTrips(){return this.trips.catalog();}
 @Get('trips/manage') async managedTrips(@Req() req:Request){return this.trips.manage(await this.identity.actor(req));}
 @Post('stores/:id/trips') async createTrip(@Req() req:Request,@Param('id') id:string,@Body() body:unknown){return this.trips.create(await this.identity.actor(req),z.uuid().parse(id),tripCreate.parse(body));}
 @Post('trips/:id') async editTrip(@Req() req:Request,@Param('id') id:string,@Body() body:unknown){return this.trips.edit(await this.identity.actor(req),z.uuid().parse(id),tripEdit.parse(body));}
 @Post('trips/:id/departures') async addDeparture(@Req() req:Request,@Param('id') id:string,@Body() body:unknown){return this.trips.departure(await this.identity.actor(req),z.uuid().parse(id),departureCreate.parse(body));}
 @Post('departures/:id') async departureState(@Req() req:Request,@Param('id') id:string,@Body() body:unknown){return this.trips.departureState(await this.identity.actor(req),z.uuid().parse(id),departureState.parse(body));}
 @Get('bookings/my') async myBookings(@Req() req:Request){return this.trips.bookings(await this.identity.actor(req),false);}
 @Get('bookings/manage') async managedBookings(@Req() req:Request){return this.trips.bookings(await this.identity.actor(req),true);}
 @Post('bookings') async createBooking(@Req() req:Request,@Body() body:unknown){return this.trips.book(await this.identity.actor(req),bookingCreate.parse(body));}
 @Post('bookings/:id/actions') async changeBooking(@Req() req:Request,@Param('id') id:string,@Body() body:unknown){return this.trips.action(await this.identity.actor(req),z.uuid().parse(id),bookingAction.parse(body));}
 @Get('health') async health(){await this.db.pool.query('SELECT 1');return {status:'ok',storage:'postgresql',mode:'local-development'};}
 @Post('auth/register') register(@Req() req:Request,@Res({passthrough:true}) res:Response,@Body() body:unknown){return this.identity.register(req,res,registerInput.parse(body));}
 @Post('auth/login') login(@Req() req:Request,@Res({passthrough:true}) res:Response,@Body() body:unknown){return this.identity.login(req,res,loginInput.parse(body));}
 @Post('auth/password') password(@Req() req:Request,@Res({passthrough:true}) res:Response,@Body() body:unknown){return this.identity.changePassword(req,res,z.object({currentPassword:z.string().min(1).max(128),newPassword:password}).strict().parse(body));}
 @Post('logout') logout(@Req() req:Request,@Res({passthrough:true}) res:Response){return this.identity.logout(req,res);}
 @Get('me') me(@Req() req:Request){return this.identity.actor(req);}
 @Get('stores') async list(@Req() req:Request){return this.stores.list(await this.identity.actor(req));}
 @Get('stores/:id') async store(@Req() req:Request,@Param('id') id:string){return this.stores.one(await this.identity.actor(req),z.uuid().parse(id));}
 @Get('areas') async areas(@Req() req:Request){return this.stores.areas(await this.identity.actor(req));}
 @Post('stores') async create(@Req() req:Request,@Body() body:unknown){return this.stores.create(await this.identity.actor(req),createStore.parse(body));}
 @Post('stores/:id') async update(@Req() req:Request,@Param('id') id:string,@Body() body:unknown){return this.stores.update(await this.identity.actor(req),z.uuid().parse(id),updateStore.parse(body));}
 @Post('stores/:id/delivery') async configure(@Req() req:Request,@Param('id') id:string,@Body() body:unknown){return this.stores.configure(await this.identity.actor(req),z.uuid().parse(id),deliveryInput.parse(body));}
 @Post('stores/:id/delivery/check') async check(@Req() req:Request,@Param('id') id:string,@Body() body:unknown){return this.stores.check(await this.identity.actor(req),z.uuid().parse(id),checkInput.parse(body));}
 @Get('stores/:id/history') async history(@Req() req:Request,@Param('id') id:string){return this.stores.history(await this.identity.actor(req),z.uuid().parse(id));}
 @Get('food-delivery') async delivery(@Req() req:Request){const a=await this.identity.actor(req);if(!['ADMIN','SUPER_ADMIN'].includes(a.role))throw new ForbiddenException();return (await this.stores.list(a)).filter(s=>canConfigureDelivery(a,s));}
}
@Module({controllers:[Api],providers:[Db,Identity,Stores,Applications,Products,Orders,Trips]}) class App{}
async function start(){
 if(process.env.NODE_ENV==='production')throw Error('Local development only: production rollout requires verified email, recovery, MFA and deployment configuration.');
 if(!process.env.DATABASE_URL)throw Error('DATABASE_URL is required. Run db:start and db:migrate.');
 const origin=process.env.WEB_ORIGIN??'http://127.0.0.1:3200';if(origin!=='http://127.0.0.1:3200')throw Error('Local WEB_ORIGIN must be http://127.0.0.1:3200');
 const app=await NestFactory.create(App,{bodyParser:false});app.use(helmet());
 app.use((req:Request,res:Response,next:()=>void)=>{res.setHeader('Cache-Control','no-store');if(!['GET','HEAD'].includes(req.method)&&(req.headers.origin!==origin||req.headers['x-thinthai-action']!=='1'||!req.is('application/json'))){res.status(403).json({message:'แหล่งที่มาของคำขอไม่ถูกต้อง'});return;}next();});
 const normalJson=json({limit:'8kb'}),imageJson=json({limit:'3mb'});app.use((req:Request,res:Response,next:()=>void)=>{const parser=/^\/api\/v1\/products\/[a-f0-9-]{36}\/image$/.test(req.path)&&req.method==='POST'?imageJson:normalJson;parser(req,res,next);});app.useGlobalFilters(new Errors());app.enableShutdownHooks();await app.listen(Number(process.env.API_PORT??4200),'127.0.0.1');
}start().catch(e=>{console.error(e.message);process.exitCode=1;});
