import {type Context,type Transaction,type Capital,type Debt,type Payment,type Category,type Goal,type Limit,summary,validAmount,money} from './finance';
import {db,uid} from './db';
export type Draft={kind:'transaction'|'capital'|'debt'|'payment'|'edit_transaction'|'delete_transaction'|'target'|'limit';context:Context;type?:'income'|'expense';amount?:number;hppAmount?:number;categoryId?:string;description?:string;date?:string;sourceDestination?:string;capitalKind?:'initial'|'add'|'withdraw';debtKind?:'debt'|'receivable';personName?:string;dueDate?:string;debtId?:string;transactionId?:string;month?:string;revenueTarget?:number;profitTarget?:number;limitId?:string;warningThreshold?:number};
export type Pending={id:string;actions:Draft[];createdAt:number;preview:string[];expected:string;revision:string};
export function validateDraft(d:Draft,state:{tx:Transaction[];debts:Debt[];payments:Payment[];categories:Category[]}){
 if(!d||!['transaction','capital','debt','payment','edit_transaction','delete_transaction','target','limit'].includes(d.kind))throw Error('Jenis tindakan Agent tidak dikenal.');
 if(!['personal','business'].includes(d.context))throw Error('Konteks tidak valid.');
 if(d.date&&(!/^\d{4}-\d{2}-\d{2}$/.test(d.date)||Number.isNaN(Date.parse(`${d.date}T12:00:00`))||new Date(`${d.date}T12:00:00Z`).toISOString().slice(0,10)!==d.date))throw Error('Tanggal tindakan tidak valid.');
 if(d.kind==='delete_transaction'||d.kind==='edit_transaction'){const found=state.tx.find(x=>x.id===d.transactionId&&x.context===d.context);if(!found)throw Error('Transaksi yang dimaksud tidak ditemukan.');if(d.kind==='delete_transaction')return;}
 if(d.kind==='target'){if(d.context!=='business'||!/^\d{4}-(0[1-9]|1[0-2])$/.test(d.month||''))throw Error('Bulan target tidak valid.');if(![d.revenueTarget,d.profitTarget].every(x=>Number.isSafeInteger(x)&&Number(x)>=0&&Number(x)<=1_000_000_000_000))throw Error('Target tidak valid.');return}
 if(d.kind==='limit'){if(d.context!=='personal'||!validAmount(Number(d.amount))||d.categoryId&&!state.categories.some(x=>x.id===d.categoryId&&x.context==='personal'&&x.type==='expense')||d.warningThreshold!==undefined&&(d.warningThreshold<=0||d.warningThreshold>1))throw Error('Limit tidak valid.');return}
 if(!validAmount(Number(d.amount)))throw Error('Nominal harus lebih dari nol.');
 if(d.kind==='transaction'||d.kind==='edit_transaction'){
  if(!['income','expense'].includes(d.type||''))throw Error('Jenis transaksi belum jelas.');
  if(!d.description?.trim()||!d.categoryId||!state.categories.some(x=>x.id===d.categoryId&&x.context===d.context&&x.type===d.type))throw Error('Deskripsi/kategori perlu diperjelas.');
  if(!Number.isSafeInteger(d.hppAmount||0)||Number(d.hppAmount)<0||Number(d.hppAmount)>Number(d.amount)||d.context==='personal'&&!!d.hppAmount||d.type==='expense'&&!!d.hppAmount)throw Error('HPP tidak valid.');
 }
 if(d.kind==='capital'&&(d.context!=='business'||!['initial','add','withdraw'].includes(d.capitalKind||'')))throw Error('Jenis modal belum jelas.');
 if(d.kind==='payment'){const debt=state.debts.find(x=>x.id===d.debtId&&x.context===d.context);const paid=state.payments.filter(x=>x.debtId===d.debtId).reduce((a,x)=>a+x.amount,0);if(!debt||Number(d.amount)>debt.principal-paid)throw Error('Pembayaran melebihi sisa atau record tidak ada.');}
 if(d.kind==='debt'&&(!d.personName?.trim()||!['debt','receivable'].includes(d.debtKind||'')))throw Error('Nama atau jenis kewajiban belum jelas.');
}
export function prepare(actions:Draft[],state:{tx:Transaction[];capitals:Capital[];debts:Debt[];payments:Payment[];categories:Category[];goals:Goal[];limits:Limit[]}):Pending{
 if(!actions.length||actions.length>8)throw Error('Rencana tindakan tidak valid.');actions.forEach(d=>validateDraft(d,state));const byDebt=new Map<string,number>();for(const d of actions.filter(x=>x.kind==='payment')){const id=d.debtId!;byDebt.set(id,(byDebt.get(id)||0)+d.amount!)}for(const [id,total] of byDebt){const debt=state.debts.find(x=>x.id===id)!;const paid=state.payments.filter(x=>x.debtId===id).reduce((a,x)=>a+x.amount,0);if(total>debt.principal-paid)throw Error('Total pembayaran dalam rencana melebihi sisa.')}const mutations=actions.filter(d=>d.transactionId).map(d=>d.transactionId);if(new Set(mutations).size!==mutations.length)throw Error('Satu record hanya boleh diubah sekali per rencana.');const revision=JSON.stringify(actions.map(d=>({id:d.transactionId,tx:d.transactionId?state.tx.find(x=>x.id===d.transactionId):null,debt:d.debtId?state.debts.find(x=>x.id===d.debtId):null,payments:d.debtId?state.payments.filter(x=>x.debtId===d.debtId):null,goal:d.kind==='target'?state.goals.find(g=>g.month===d.month):null,limit:d.kind==='limit'?state.limits.find(l=>l.id===d.limitId):null})));const preview:string[]=[];let personal=0,business=0,profit=0;
 for(const d of actions){const a=Number(d.amount)||0;let impact=0;let label='';
 if(d.kind==='transaction'||d.kind==='edit_transaction'){const old=d.kind==='edit_transaction'?state.tx.find(x=>x.id===d.transactionId):undefined;const now=(d.type==='income'?a-(d.context==='business'?d.hppAmount||0:0):-a);const was=old?(old.type==='income'?old.amount-(old.context==='business'?old.hppAmount||0:0):-old.amount):0;impact=now-was;profit+=d.context==='business'?impact:0;label=`${d.kind==='edit_transaction'?'Ubah':'Catat'} ${d.description} · ${money(a)}${d.hppAmount?` · HPP ${money(d.hppAmount)}`:''}`}
 else if(d.kind==='delete_transaction'){const old=state.tx.find(x=>x.id===d.transactionId)!;impact=old.type==='income'?-old.amount+(old.context==='business'?old.hppAmount:0):old.amount;profit+=d.context==='business'?impact:0;label=`Hapus ${old.description} · ${money(old.amount)}`}
 else if(d.kind==='capital'){impact=d.capitalKind==='withdraw'?-a:a;label=`${d.capitalKind==='withdraw'?'Tarik':'Tambah'} modal · ${money(a)}`}
 else if(d.kind==='payment')label=`Bayar kewajiban · ${money(a)}`;
 else if(d.kind==='debt')label=`${d.debtKind==='receivable'?'Piutang':'Utang'} ${d.personName} · ${money(a)}`;
 else if(d.kind==='target')label=`Atur target ${d.month}: omzet ${money(d.revenueTarget||0)}, laba ${money(d.profitTarget||0)}`;
 else label=`Atur limit pengeluaran · ${money(a)}`;
 if(d.context==='personal')personal+=impact;else business+=impact;preview.push(label)}
 const expected=`Dampak saldo: Pribadi ${personal>=0?'+':''}${money(personal)}, Bisnis ${business>=0?'+':''}${money(business)}${profit?` · dampak laba ${profit>=0?'+':''}${money(profit)}`:''}.`;
 return {id:uid(),actions,createdAt:Date.now(),preview,expected,revision};
}
export async function commit(p:Pending,state:{tx:Transaction[];capitals:Capital[];debts:Debt[];payments:Payment[];categories:Category[];goals:Goal[];limits:Limit[]}){
 if(Date.now()-p.createdAt>10*60_000)throw Error('Pratinjau kedaluwarsa. Minta rencana baru.');let before:ReturnType<typeof summary>,after:ReturnType<typeof summary>;
 await db.transaction('rw',[db.transactions,db.capitals,db.debts,db.payments,db.goals,db.limits,db.attachments,db.categories,db.events],async()=>{
 if(await db.events.get(`commit:${p.id}`))throw Error('Tindakan ini sudah disimpan.');
 const live={tx:await db.transactions.toArray(),capitals:await db.capitals.toArray(),debts:await db.debts.toArray(),payments:await db.payments.toArray(),categories:await db.categories.toArray(),goals:await db.goals.toArray(),limits:await db.limits.toArray()};const refreshed=prepare(p.actions,live);if(refreshed.revision!==p.revision||refreshed.expected!==p.expected)throw Error('Data berubah sejak pratinjau. Minta rencana baru.');before=summary(live.tx,live.capitals);
 for(const d of p.actions){const id=uid(),date=d.date||new Date().toLocaleDateString('sv-SE');const stamp=new Date().toISOString();
 if(d.kind==='transaction')await db.transactions.add({id,context:d.context,type:d.type!,amount:d.amount!,hppAmount:d.hppAmount||0,categoryId:d.categoryId!,description:d.description!.trim(),date,sourceDestination:d.sourceDestination||'',createdAt:stamp,updatedAt:stamp});
 if(d.kind==='edit_transaction'){const old=await db.transactions.get(d.transactionId!);if(!old)throw Error('Transaksi berubah.');await db.transactions.put({...old,type:d.type!,amount:d.amount!,hppAmount:d.hppAmount||0,categoryId:d.categoryId!,description:d.description!.trim(),date,updatedAt:stamp})}
 if(d.kind==='delete_transaction'){const old=await db.transactions.get(d.transactionId!);if(!old)throw Error('Transaksi berubah.');await db.transactions.delete(old.id);if(old.attachmentId)await db.attachments.delete(old.attachmentId)}
 if(d.kind==='capital')await db.capitals.add({id,kind:d.capitalKind||'add',amount:d.amount!,description:d.description||'Modal bisnis',date});
 if(d.kind==='debt')await db.debts.add({id,context:d.context,kind:d.debtKind||'debt',personName:d.personName!,principal:d.amount!,description:d.description||'',date,dueDate:d.dueDate});
 if(d.kind==='payment')await db.payments.add({id,debtId:d.debtId!,amount:d.amount!,date,note:d.description||''});
 if(d.kind==='target')await db.goals.put({id:d.month!,month:d.month!,revenueTarget:d.revenueTarget||0,profitTarget:d.profitTarget||0});
 if(d.kind==='limit')await db.limits.put({id:d.limitId||id,categoryId:d.categoryId,amount:d.amount!,warningThreshold:d.warningThreshold||0.8});
 }
 after=summary(await db.transactions.toArray(),await db.capitals.toArray());await db.events.put({id:`commit:${p.id}`,key:`commit:${p.id}`,type:'commit',message:`${p.actions.length} tindakan terverifikasi`,priority:0,createdAt:new Date().toISOString()});});
 return `Tersimpan ${p.actions.length} tindakan. Saldo Pribadi ${money(before!.personalBalance)} → ${money(after!.personalBalance)}; Bisnis ${money(before!.businessBalance)} → ${money(after!.businessBalance)}. Laba kumulatif ${money(after!.profit)}.`;
}
