import type { Metadata, Viewport } from 'next';
import './globals.css';
import './celestial.css';
import './living.css';
export const metadata: Metadata = {title:'Finora — Keuangan lebih jelas',description:'Catatan keuangan pribadi dan bisnis di perangkatmu.',manifest:'/manifest.webmanifest',appleWebApp:{capable:true,title:'Finora',statusBarStyle:'default'}};
export const viewport: Viewport = {width:'device-width',initialScale:1,themeColor:'#171727'};
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="id"><body>{children}</body></html>}
