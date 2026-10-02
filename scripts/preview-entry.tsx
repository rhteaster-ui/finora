import React from 'react';
import {createRoot} from 'react-dom/client';
import Finora from '../components/Finora';
import {db,initialize} from '../lib/db';
import {monthKey,localDate} from '../lib/finance';
// This file is ONLY bundled by build-preview.mjs. It never enters the Next.js app.
async function sample(){
 const button=document.getElementById('demo-data') as HTMLButtonElement;button.disabled=true;
 try{await initialize();if(await db.transactions.count()>0&&!confirm('Ganti catatan di preview ini dengan data contoh?'))return;
 const month=monthKey(),today=localDate(),stamp=new Date().toISOString();
 await db.transaction('rw',[db.transactions,db.capitals,db.limits,db.goals,db.templates,db.events],async()=>{
 await db.transactions.clear();await db.capitals.clear();await db.limits.clear();await db.goals.clear();await db.templates.clear();await db.events.clear();
 const row=(id:string,context:'personal'|'business',type:'income'|'expense',amount:number,category:string,description:string,hppAmount=0)=>({id,context,type,amount,categoryId:`${context}-${type}-${category}`,description,date:today,hppAmount,createdAt:stamp,updatedAt:stamp,sourceDestination:'DANA'});
 await db.transactions.bulkPut([row('demo-1','personal','income',7500000,'gaji','Gaji bulanan'),row('demo-2','personal','income',850000,'freelance','Proyek desain'),row('demo-3','personal','expense',875000,'tagihan','Tagihan bulanan'),row('demo-4','personal','expense',1200000,'belanja','Belanja kebutuhan'),row('demo-5','personal','expense',420000,'makan-minum','Makan & kopi'),row('demo-6','business','income',5400000,'penjualan','Penjualan produk digital',2880000)]);
 await db.capitals.put({id:'demo-cap',kind:'initial',amount:2000000,description:'Modal awal',date:today});await db.templates.put({id:'demo-quick',context:'personal',type:'expense',amount:25000,hppAmount:0,categoryId:'personal-expense-makan-minum',description:'Kopi sore',sourceDestination:'DANA',createdAt:stamp});await db.limits.put({id:'demo-limit',amount:3000000,warningThreshold:.8});await db.goals.put({id:month,month,revenueTarget:7000000,profitTarget:3500000});});location.reload();
 }catch(e){alert('Preview memerlukan penyimpanan browser. Buka file HTML di browser biasa.')}finally{button.disabled=false}
}
const realFetch=window.fetch.bind(window);window.fetch=((url:any,options:any)=>String(url).includes('/api/agent')?Promise.resolve(new Response(JSON.stringify({error:'Preview lokal tidak terhubung ke Gemini. Jalankan source Next.js untuk mengaktifkan AI.'}),{status:503,headers:{'Content-Type':'application/json'}})):realFetch(url,options)) as typeof fetch;
createRoot(document.getElementById('root')!).render(<Finora/>);
document.getElementById('demo-data')!.addEventListener('click',sample);
