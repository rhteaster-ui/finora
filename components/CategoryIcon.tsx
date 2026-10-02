import {Utensils,Car,ShoppingBag,Receipt,HeartPulse,Gift,BriefcaseBusiness,Server,Globe,Megaphone,Package,Wallet,Ellipsis,HandCoins, type LucideIcon} from 'lucide-react';
export function categoryStyle(name:string):{Icon:LucideIcon;tone:string}{
 const n=name.toLowerCase();
 if(/makan|minum/.test(n))return {Icon:Utensils,tone:'coral'};
 if(/transport|bensin/.test(n))return {Icon:Car,tone:'blue'};
 if(/belanja|stok|produk/.test(n))return {Icon:ShoppingBag,tone:'mint'};
 if(/tagihan|admin/.test(n))return {Icon:Receipt,tone:'amber'};
 if(/kesehatan/.test(n))return {Icon:HeartPulse,tone:'rose'};
 if(/hadiah/.test(n))return {Icon:Gift,tone:'violet'};
 if(/gaji|freelance|jasa/.test(n))return {Icon:BriefcaseBusiness,tone:'mint'};
 if(/server/.test(n))return {Icon:Server,tone:'blue'};
 if(/domain/.test(n))return {Icon:Globe,tone:'violet'};
 if(/iklan/.test(n))return {Icon:Megaphone,tone:'amber'};
 if(/penjualan/.test(n))return {Icon:Package,tone:'mint'};
 if(/operasional/.test(n))return {Icon:HandCoins,tone:'coral'};
 return {Icon:Ellipsis,tone:'neutral'};
}
export default function CategoryIcon({name}:{name:string}){const {Icon,tone}=categoryStyle(name);return <span className={`category-symbol tone-${tone}`}><Icon size={20} strokeWidth={1.7}/></span>}
