export type Role = 'USER' | 'MERCHANT' | 'ADMIN' | 'SUPER_ADMIN';
export type Actor = {id:string;name:string;role:Role;storeIds:string[];provinceIds:string[]};
export type Store = {id:string;name:string;provinceId:string;province:string;district:string;subdistrict:string;category:'food'|'craft';lat:number|null;lng:number|null};
export function canManage(actor:Actor,store:Store):boolean {
 return actor.role==='SUPER_ADMIN' || (actor.role==='ADMIN' && actor.provinceIds.includes(store.provinceId)) || (actor.role==='MERCHANT' && actor.storeIds.includes(store.id));
}
export function canConfigureDelivery(actor:Actor,store:Store):boolean {
 return store.category==='food' && (actor.role==='ADMIN'||actor.role==='SUPER_ADMIN') && canManage(actor,store);
}
