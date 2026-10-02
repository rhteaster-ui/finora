'use client';
import {useEffect,useState} from 'react';
export type Preferences={motion:'normal'|'reduced';greetings:boolean;fontSize:'normal'|'large';hideBalance:boolean;autoTheme:boolean};
const defaults:Preferences={motion:'normal',greetings:true,fontSize:'normal',hideBalance:false,autoTheme:false};
export function usePreferences(){const [value,setValue]=useState<Preferences>(defaults);useEffect(()=>{try{const v=JSON.parse(localStorage.getItem('finora-preferences')||'{}');setValue({...defaults,...v})}catch{}},[]);
 useEffect(()=>{document.documentElement.dataset.motion=value.motion;document.documentElement.dataset.fontSize=value.fontSize},[value]);
 return [value,(next:Partial<Preferences>)=>setValue(old=>{const v={...old,...next};localStorage.setItem('finora-preferences',JSON.stringify(v));return v})] as const;
}
