import test from 'node:test';
import assert from 'node:assert/strict';
import {summary,bounds,previousBounds,debtState,dailySeries} from '../lib/finance.ts';
const t=(id,context,type,amount,date,hppAmount=0)=>({id,context,type,amount,date,hppAmount,categoryId:'x',description:'Uji',createdAt:'2026-09-26T00:00:00Z',updatedAt:'2026-09-26T00:00:00Z'});
test('modal tidak mengubah omzet atau laba, HPP dan tarik modal mengubah saldo sesuai aturan',()=>{
 const tx=[t('p1','personal','income',200000,'2026-09-25'),t('p2','personal','expense',25000,'2026-09-26'),t('b1','business','income',150000,'2026-09-26',90000),t('b2','business','expense',20000,'2026-09-26')];
 const capital=[{id:'c1',kind:'initial',amount:500000,date:'2026-09-01',description:'awal'},{id:'c2',kind:'withdraw',amount:30000,date:'2026-09-26',description:'tarik'}];
 const all=summary(tx,capital);assert.equal(all.personalBalance,175000);assert.equal(all.revenue,150000);assert.equal(all.hpp,90000);assert.equal(all.profit,40000);assert.equal(all.businessBalance,510000);assert.equal(all.capital,500000);
 const day=summary(tx,capital,{from:'2026-09-26',to:'2026-09-26'});assert.equal(day.income,0);assert.equal(day.profit,40000);assert.equal(day.businessBalance,10000);
 const points=dailySeries(tx,capital,'business',{from:'2026-09-25',to:'2026-09-26'});assert.equal(points.at(-1).balance,510000);
});
test('periode lokal dan baseline bulan sebelumnya memakai satu bulan penuh',()=>{const b=bounds('month',new Date(2026,8,26));assert.deepEqual(b,{from:'2026-09-01',to:'2026-09-30'});assert.deepEqual(previousBounds(b),{from:'2026-08-01',to:'2026-08-31'})});
test('pembayaran sebagian dan jatuh tempo',()=>{const debt={id:'d',context:'personal',kind:'debt',personName:'A',principal:100000,date:'2026-09-01',dueDate:'2026-09-20',description:''};assert.deepEqual(debtState(debt,[{id:'p',debtId:'d',amount:40000,date:'2026-09-10'}],'2026-09-26'),{paid:40000,remaining:60000,status:'Jatuh tempo'});assert.equal(debtState(debt,[{id:'p',debtId:'d',amount:100000,date:'2026-09-10'}],'2026-09-26').status,'Lunas')});
