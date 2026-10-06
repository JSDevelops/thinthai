export type Departure={id:string;startsAt:string;capacity:number;remaining:number;active:boolean;version:number};
export type Trip={id:string;storeId:string;storeName:string;province:string;title:string;description:string;meetingPoint:string;category:string;durationHours:number;priceSatang:number;active:boolean;version:number;departures:Departure[]};
export const categories:Record<string,string>={nature:'ธรรมชาติ',culture:'วิถีและวัฒนธรรม',food:'อาหารท้องถิ่น',craft:'งานฝีมือ'};
export const money=(satang:number)=>(satang/100).toLocaleString('th-TH',{minimumFractionDigits:2});
export const tripDate=(value:string)=>new Date(value).toLocaleString('th-TH',{timeZone:'Asia/Bangkok',dateStyle:'medium',timeStyle:'short'});
export async function tripApi(path:string,body?:unknown){const res=await fetch('/api/v1/'+path,{cache:'no-store',...(body===undefined?{}:{method:'POST',headers:{'Content-Type':'application/json','X-ThinThai-Action':'1'},body:JSON.stringify(body)})});const data=await res.json();if(!res.ok)throw Error(res.status===401?'กรุณาเข้าสู่ระบบก่อนทำรายการ':data.message??'ทำรายการไม่สำเร็จ');return data;}
