import Dexie,{type Table} from 'dexie';
import {defaultCategories,type Transaction,type Capital,type Category,type Debt,type Payment,type Goal,type Limit} from './finance';
export type Attachment={id:string;mimeType:string;blob:Blob;createdAt:string;size:number};
export type AgentEvent={id:string;type:string;message:string;priority:number;createdAt:string;key:string;context?:'personal'|'business';title?:string;recordIds?:string[];formula?:string;readAt?:string;dismissed?:boolean};
export type AgentRule={id:string;phrase:string;context:'personal'|'business';categoryId:string;active:boolean};
export type QuickTemplate={id:string;context:'personal'|'business';type:'income'|'expense';amount:number;hppAmount:number;categoryId:string;description:string;sourceDestination?:string;createdAt:string};
export type AgentMemory={id:string;context:'personal'|'business'|'all';text:string;createdAt:string};
export type ChatRecord={id:string;context:'personal'|'business';role:'user'|'agent';text:string;createdAt:string;recordIds?:string[];trace?:string[];source?:'local'|'gemini'};
export class FinoraDB extends Dexie{
 transactions!:Table<Transaction,string>;capitals!:Table<Capital,string>;categories!:Table<Category,string>;debts!:Table<Debt,string>;payments!:Table<Payment,string>;goals!:Table<Goal,string>;limits!:Table<Limit,string>;attachments!:Table<Attachment,string>;events!:Table<AgentEvent,string>;rules!:Table<AgentRule,string>;
 templates!:Table<QuickTemplate,string>;memories!:Table<AgentMemory,string>;chats!:Table<ChatRecord,string>;
 constructor(){super('finora-v1');this.version(1).stores({transactions:'id,context,type,date,categoryId',capitals:'id,date,kind',categories:'id,context,type',debts:'id,context,kind,dueDate',payments:'id,debtId,date',goals:'id,month',limits:'id,categoryId',attachments:'id',events:'id,key,createdAt',rules:'id,phrase'});this.version(2).stores({templates:'id,context',memories:'id,context',chats:'id,context,createdAt',events:'id,key,createdAt,context'});}
}
export const db=new FinoraDB();
export async function initialize(){if(await db.categories.count()===0)await db.categories.bulkPut(defaultCategories.map(x=>({...x,createdAt:new Date().toISOString()})));}
export async function eraseTransaction(row:Transaction){await db.transaction('rw',db.transactions,db.attachments,async()=>{await db.transactions.delete(row.id);if(row.attachmentId)await db.attachments.delete(row.attachmentId)})}
export const uid=()=>crypto.randomUUID();
