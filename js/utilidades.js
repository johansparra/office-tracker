// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════
const p2=n=>String(n).padStart(2,'0');
const enc=encodeURIComponent;
function rid(bytes){ const a=new Uint8Array(bytes); crypto.getRandomValues(a); return [...a].map(b=>b.toString(16).padStart(2,'0')).join(''); }
function toKey(d){ return `${d.getFullYear()}-${p2(d.getMonth()+1)}-${p2(d.getDate())}`; }
function fromKey(k){ const [y,m,d]=k.split('-').map(Number); return new Date(y,m-1,d); }
function addD(d,n){ const r=new Date(d); r.setDate(r.getDate()+n); return r; }
function monday(d){ const r=new Date(d); r.setHours(0,0,0,0); const w=r.getDay(); r.setDate(r.getDate()+(w===0?-6:1-w)); return r; }
function nextMon(d){ const w=d.getDay(); return w===1?new Date(d):addD(d,w===0?1:8-w); }
function isWeekend(d){ const w=d.getDay(); return w===0||w===6; }
function inMonth(d,y,mo){ return d.getFullYear()===y&&d.getMonth()===mo; }
function fmtDay(k){ const d=fromKey(k); return `${DOW[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()].slice(0,3).toLowerCase()}`; }
function fmtDayLong(k){ const d=fromKey(k); return `${DOW_L[d.getDay()]} ${d.getDate()} de ${MONTHS[d.getMonth()].toLowerCase()}`; }
function fmtTs(ts){ const d=new Date(ts); return `${p2(d.getDate())}/${p2(d.getMonth()+1)} ${p2(d.getHours())}:${p2(d.getMinutes())}`; }
const slotOf=id=>SLOTS.find(s=>s.id===id);

