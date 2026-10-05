// ═══════════════════════════════════════════════════════════
// FECHAS: los días siempre son claves 'AAAA-MM-DD' en hora local
// ═══════════════════════════════════════════════════════════
import { MONTHS, DOW, DOW_L } from './constantes.js';

export const p2=n=>String(n).padStart(2,'0');
export function toKey(d){ return `${d.getFullYear()}-${p2(d.getMonth()+1)}-${p2(d.getDate())}`; }
export function fromKey(k){ const [y,m,d]=k.split('-').map(Number); return new Date(y,m-1,d); }
// ¿Es una clave de día real? (formato y fecha existente: '2026-02-30' no lo es)
export function esClave(k){ return typeof k==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(k)&&toKey(fromKey(k))===k; }
export function today(){ const d=new Date(); d.setHours(0,0,0,0); return d; }
export function addD(d,n){ const r=new Date(d); r.setDate(r.getDate()+n); return r; }
export function monday(d){ const r=new Date(d); r.setHours(0,0,0,0); const w=r.getDay(); r.setDate(r.getDate()+(w===0?-6:1-w)); return r; }
export function nextMon(d){ const w=d.getDay(); return w===1?new Date(d):addD(d,w===0?1:8-w); }
export function isWeekend(d){ const w=d.getDay(); return w===0||w===6; }
export function inMonth(d,y,mo){ return d.getFullYear()===y&&d.getMonth()===mo; }
export function fmtDay(k){ const d=fromKey(k); return `${DOW[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()].slice(0,3).toLowerCase()}`; }
export function fmtDayLong(k){ const d=fromKey(k); return `${DOW_L[d.getDay()]} ${d.getDate()} de ${MONTHS[d.getMonth()].toLowerCase()}`; }
export function fmtTs(ts){ const d=new Date(ts); return `${p2(d.getDate())}/${p2(d.getMonth()+1)} ${p2(d.getHours())}:${p2(d.getMinutes())}`; }
export const fmtClock=ts=>{ const d=new Date(ts); return `${p2(d.getHours())}:${p2(d.getMinutes())}`; };
export const fmtFull=ts=>{ const d=new Date(ts); return `${toKey(d)} ${p2(d.getHours())}:${p2(d.getMinutes())}:${p2(d.getSeconds())}`; };
export function isoTs(ts){
  const d=new Date(ts), o=-d.getTimezoneOffset(), a=Math.abs(o);
  return `${toKey(d)}T${p2(d.getHours())}:${p2(d.getMinutes())}:${p2(d.getSeconds())}.${String(d.getMilliseconds()).padStart(3,'0')}${o>=0?'+':'-'}${p2(a/60|0)}:${p2(a%60)}`;
}
export function isoWeek(k){
  const d=fromKey(k); d.setDate(d.getDate()+3-((d.getDay()+6)%7));
  const w1=new Date(d.getFullYear(),0,4);
  return `${d.getFullYear()}-W${p2(1+Math.round(((d-w1)/864e5-3+((w1.getDay()+6)%7))/7))}`;
}
