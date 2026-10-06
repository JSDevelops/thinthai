import {z} from 'zod';
export const coordinates={lat:z.number().min(-90).max(90),lng:z.number().min(-180).max(180)};
const fields={name:z.string().trim().min(1).max(120),address:z.string().trim().max(500),category:z.enum(['food','craft']),subdistrictId:z.string().min(1).max(20),lat:coordinates.lat.nullable(),lng:coordinates.lng.nullable(),active:z.boolean()};
const paired=(v:{lat:number|null;lng:number|null})=>(v.lat===null)===(v.lng===null);
export const createStore=z.object(fields).strict().refine(paired,'ต้องระบุพิกัดทั้งสองค่า');
export const updateStore=z.object({...fields,version:z.number().int().positive()}).strict().refine(paired,'ต้องระบุพิกัดทั้งสองค่า');
export const deliveryInput=z.object({version:z.number().int().positive(),enabled:z.boolean(),radiusKm:z.number().min(0.1).max(30).nullable()}).strict().refine(v=>v.enabled?v.radiusKm!==null:v.radiusKm===null);
export const checkInput=z.object(coordinates).strict();
export type StoreInput=z.infer<typeof createStore>;
export function distanceKm(a:{lat:number;lng:number},b:{lat:number;lng:number}){const radians=(n:number)=>n*Math.PI/180;const dlat=radians(b.lat-a.lat),dlng=radians(b.lng-a.lng);const h=Math.sin(dlat/2)**2+Math.cos(radians(a.lat))*Math.cos(radians(b.lat))*Math.sin(dlng/2)**2;return 6371.0088*2*Math.asin(Math.sqrt(Math.min(1,Math.max(0,h))));}
