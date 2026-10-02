export type Context='personal'|'business';
export type TxType='income'|'expense';
export type Transaction={id:string;context:Context;type:TxType;amount:number;categoryId:string;description:string;date:string;sourceDestination?:string;hppAmount:number;attachmentId?:string;createdAt:string;updatedAt:string};
export type Capital={id:string;kind:'initial'|'add'|'withdraw';amount:number;description:string;date:string};
export type Debt={id:string;context:Context;kind:'debt'|'receivable';personName:string;principal:number;description:string;date:string;dueDate?:string};
export type Payment={id:string;debtId:string;amount:number;date:string;note?:string};
export type Category={id:string;context:Context;type:TxType;name:string;archived:boolean;createdAt:string};
export type Goal={id:string;month:string;revenueTarget:number;profitTarget:number};
export type Limit={id:string;categoryId?:string;amount:number;warningThreshold:number};
export const money=(n:number)=>new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(Number.isFinite(n)?n:0);
export const shortMoney=(n:number)=>new Intl.NumberFormat('id-ID',{notation:'compact',maximumFractionDigits:1}).format(n);
export const localDate=(d=new Date())=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
export const monthKey=(d=new Date())=>localDate(d).slice(0,7);
export const validAmount=(n:number)=>Number.isSafeInteger(n)&&n>0&&n<=1_000_000_000_000;
export type Period='today'|'week'|'month'|'year'|'custom';
export function bounds(period:Period,anchor=new Date(),custom?:{from:string;to:string}){
 const d=new Date(anchor.getFullYear(),anchor.getMonth(),anchor.getDate());let start=new Date(d),end=new Date(d);
 if(period==='week'){start.setDate(d.getDate()-(d.getDay()+6)%7);end=new Date(start);end.setDate(start.getDate()+6)}
 if(period==='month'){start=new Date(d.getFullYear(),d.getMonth(),1);end=new Date(d.getFullYear(),d.getMonth()+1,0)}
 if(period==='year'){start=new Date(d.getFullYear(),0,1);end=new Date(d.getFullYear(),11,31)}
 if(period==='custom'&&custom){return {from:custom.from,to:custom.to}}
 return {from:localDate(start),to:localDate(end)};
}
export function previousBounds(b:{from:string;to:string}){const a=new Date(`${b.from}T12:00:00`),z=new Date(`${b.to}T12:00:00`);if(a.getDate()===1&&z.getDate()===new Date(z.getFullYear(),z.getMonth()+1,0).getDate()){
 if(a.getMonth()===0&&z.getMonth()===11&&a.getFullYear()===z.getFullYear())return {from:`${a.getFullYear()-1}-01-01`,to:`${a.getFullYear()-1}-12-31`};
 if(a.getMonth()===z.getMonth()&&a.getFullYear()===z.getFullYear()){const p=new Date(a.getFullYear(),a.getMonth()-1,1);return {from:localDate(p),to:localDate(new Date(a.getFullYear(),a.getMonth(),0))}}
 }const days=Math.round((z.getTime()-a.getTime())/86400000)+1;z.setDate(a.getDate()-1);a.setDate(a.getDate()-days);return {from:localDate(a),to:localDate(z)}}
export const inBounds=(date:string,b:{from:string;to:string})=>date>=b.from&&date<=b.to;
export function summary(tx:Transaction[],capitals:Capital[],b?:{from:string;to:string}){
 const rows=b?tx.filter(x=>inBounds(x.date,b)):tx;
 const personal=rows.filter(x=>x.context==='personal');const business=rows.filter(x=>x.context==='business');
 const sum=(xs:Transaction[],type:TxType)=>xs.filter(x=>x.type===type).reduce((a,x)=>a+x.amount,0);
 const income=sum(personal,'income'),expense=sum(personal,'expense'),revenue=sum(business,'income'),cost=sum(business,'expense');
 const hpp=business.filter(x=>x.type==='income').reduce((a,x)=>a+(x.hppAmount||0),0);
 const capitalsIn=(b?capitals.filter(x=>inBounds(x.date,b)):capitals).filter(x=>x.kind!=='withdraw').reduce((a,x)=>a+x.amount,0);
 const capitalsOut=(b?capitals.filter(x=>inBounds(x.date,b)):capitals).filter(x=>x.kind==='withdraw').reduce((a,x)=>a+x.amount,0);
 const profit=revenue-hpp-cost;
 return {income,expense,net:income-expense,revenue,hpp,cost,profit,capital:capitalsIn,withdraw:capitalsOut,personalBalance:income-expense,businessBalance:capitalsIn+profit-capitalsOut};
}
export function debtState(debt:Debt,payments:Payment[],today=localDate()) {const paid=payments.filter(x=>x.debtId===debt.id).reduce((a,x)=>a+x.amount,0);const remaining=Math.max(0,debt.principal-paid);return {paid,remaining,status:remaining===0?'Lunas':debt.dueDate&&debt.dueDate<today?'Jatuh tempo':paid>0?'Sebagian':'Belum dibayar'};}
export function dailySeries(tx:Transaction[],capitals:Capital[],context:Context,b:{from:string;to:string}){
 const data: {date:string;positive:number;negative:number;balance:number}[]=[];let day=new Date(`${b.from}T12:00:00`);const end=new Date(`${b.to}T12:00:00`);let count=0;
 const all=summary(tx,capitals); let balance=context==='personal'?all.personalBalance:all.businessBalance;
 const future=tx.filter(x=>x.context===context&&x.date>b.to);const futureCap=context==='business'?capitals.filter(x=>x.date>b.to):[];
 const futureSum=summary(future,futureCap);balance-=context==='personal'?futureSum.personalBalance:futureSum.businessBalance;
 const reverseDays=Math.round((end.getTime()-day.getTime())/86400000)+1;
 // Starting balance excludes all in-range movements.
 const rangeRows=tx.filter(x=>x.context===context&&inBounds(x.date,b));const rangeCap=context==='business'?capitals.filter(x=>inBounds(x.date,b)):[];const rangeSum=summary(rangeRows,rangeCap);balance-=context==='personal'?rangeSum.personalBalance:rangeSum.businessBalance;
 const step=Math.max(1,Math.ceil(reverseDays/31));let p=0,n=0;
 while(day<=end&&count<370){const date=localDate(day);const t=rangeRows.filter(x=>x.date===date);const c=rangeCap.filter(x=>x.date===date);const s=summary(t,c);const move=context==='personal'?s.personalBalance:s.businessBalance;balance+=move;p+=context==='personal'?s.income:s.revenue;n+=context==='personal'?s.expense:s.hpp+s.cost;count++;if(count%step===0||date===b.to){data.push({date,positive:p,negative:n,balance});p=0;n=0}day.setDate(day.getDate()+1)}return data;
}
export const defaultCategories: Omit<Category,'createdAt'>[]=[
 ['personal','income',['Gaji','Freelance','Hadiah','Lainnya']],['personal','expense',['Makan & Minum','Transportasi','Belanja','Tagihan','Kesehatan','Lainnya']],['business','income',['Penjualan','Jasa','Lainnya']],['business','expense',['Stok/Modal Produk','Server','Domain','Iklan','Biaya Admin','Operasional','Lainnya']]
].flatMap(([context,type,names])=>(names as string[]).map(name=>({id:`${context}-${type}-${name.toLowerCase().replace(/[^a-z]+/g,'-')}`,context:context as Context,type:type as TxType,name,archived:false})));
