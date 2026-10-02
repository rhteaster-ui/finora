'use client';
import {useEffect,useRef,useState} from 'react';
export type CompanionMood='idle'|'greeting'|'thinking'|'waiting'|'success';
export default function Companion({className='',mood='idle',onTap}:{className?:string;mood?:CompanionMood;onTap?:()=>void}){
 const ref=useRef<HTMLDivElement>(null),[visible,setVisible]=useState(true),[inView,setInView]=useState(true);
 useEffect(()=>{const update=()=>setVisible(!document.hidden);update();document.addEventListener('visibilitychange',update);const io=new IntersectionObserver(([entry])=>setInView(entry.isIntersecting),{threshold:.05});if(ref.current)io.observe(ref.current);return()=>{document.removeEventListener('visibilitychange',update);io.disconnect()}},[]);
 return <div ref={ref} className={`companion-rig ${className}`} data-mood={mood} data-live={visible&&inView}>
 <div className="companion-aura" aria-hidden="true"/><div className="companion-breath"><img className="companion-body" src="/art/elaina-main.webp" width="780" height="1040" alt="" draggable={false}/><div className="companion-head"><img className="companion-face-base" src="/art/elaina-main.webp" width="780" height="1040" alt="" draggable={false}/><img className="companion-blink" src="/art/elaina-blink.webp" width="167" height="142" alt=""/></div><span className="globe-light" aria-hidden="true"/><span className="wand-light" aria-hidden="true"/></div>
 {onTap?<button className="companion-touch" onClick={onTap} aria-label="Sapa Elaina"/>:<span className="sr-only">Elaina, teman keuanganmu</span>}
 </div>
}
