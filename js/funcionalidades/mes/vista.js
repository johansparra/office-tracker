// ═══════════════════════════════════════════════════════════
// VISTA DEL MES: resumen y alerta (RN-09), calendario, festivos del mes y semana a semana
// ═══════════════════════════════════════════════════════════
import { S, now } from '../../estado/estado.js';
import { MONTHS, DAYS, DOW, TYPE_UI } from '../../nucleo/constantes.js';
import { toKey, fromKey, addD, inMonth, fmtDay, fmtDayLong } from '../../nucleo/fechas.js';
import { getHol } from '../../nucleo/festivos.js';
import { estadoMes, reglaMes } from '../../nucleo/meta.js';
import { IC, FLAG } from '../../ui/iconos.js';
import { toggle } from '../marcar-dia/marcar.js';
import { openDaySheet } from '../historial/historial-dia.js';

const dayList=ks=>`<div class="must-days">${ks.map(k=>`<span>${fmtDay(k)}</span>`).join('')}</div>`;
const hab=x=>`${x} día${x===1?'':'s'} hábil${x===1?'':'es'}`;
// Cuota que se muestra por semana: no más que sus días hábiles dentro del mes (una semana partida no pide 3 de 1 día)
const cuota=(w,y,m)=>Math.min(w.quota,Array.from({length:5},(_,i)=>addD(w.mon,i)).filter(d=>inMonth(d,y,m)&&!getHol(d)).length);

// s: resultado de calcularMes() para el mes visible
export function renderMes(s){
  const {year,month}=S;
  const mName=MONTHS[month].toLowerCase();
  document.getElementById('nav-title').textContent=`${MONTHS[month]} ${year}`;
  document.getElementById('btn-hoy').hidden=year===now.getFullYear()&&month===now.getMonth();
  const {sem}=reglaMes(year,month);

  // Resumen del mes
  const {past,tone,tipo}=estadoMes(s);
  const n=Math.max(s.target,s.visited,1);
  const pill=s.done?`${IC.check}Meta cumplida`:past?`Faltaron ${s.remaining}`:`Faltan ${s.remaining}`;
  const msg={
    'cumplida':()=>`<div class="predict done">${IC.ok}<div>Meta cumplida${s.visited>s.target?` con <strong>${s.visited-s.target}</strong> de más`:''}. Lo que sumes ahora es extra.</div></div>`,
    'cerrado':()=>`<div class="predict past">${IC.clock}<div>${MONTHS[month]} cerró con <strong>${s.visited} de ${s.target}</strong> visitas.</div></div>`,
    'no-alcanza':()=>`<div class="must-alert">${IC.warn}<div><strong>No alcanzas la meta.</strong> Necesitas ${s.remaining} y solo quedan ${hab(s.open.length)}. Ve todos los que puedas:${dayList(s.open)}</div></div>`,
    'si-o-si':()=>`<div class="must-alert">${IC.warn}<div><strong>Tienes que ir sí o sí ${s.open.length===1?'el día hábil que queda':`los ${s.open.length} días hábiles que quedan`}</strong> para completar ${s.target}:${dayList(s.open)}</div></div>`,
    'poco-margen':()=>`<div class="predict warn">${IC.warn}<div>Poco margen: necesitas <strong>${s.remaining}</strong> de los <strong>${hab(s.open.length)}</strong> que quedan. Solo puedes faltar <strong>${s.slack}</strong>.</div></div>`,
    'vas-bien':()=>`<div class="predict ok">${IC.ok}<div>Vas bien. Necesitas <strong>${s.remaining}</strong> en los <strong>${hab(s.open.length)}</strong> que quedan (margen de ${s.slack}). Lo ideal: ${reglaMes(year,month).sem} por semana.</div></div>`,
  }[tipo]();
  document.getElementById('stats').innerHTML=`
    <div class="hero-row">
      <div>
        <div class="hc"><span class="hc-num">${s.visited}</span><span class="hc-of">/${s.target}</span></div>
        <div class="hero-lbl">visitas en ${mName}</div>
      </div>
      <span class="pill ${tone}">${pill}</span>
    </div>
    <div class="segs ${s.done?'done':''}" role="img" aria-label="${s.visited} de ${s.target} visitas">${Array.from({length:n},(_,i)=>`<i class="seg ${i<s.visited||s.target===0?'on':''}"><b></b></i>`).join('')}</div>
    <div class="kpis">
      <div class="kpi"><div class="kpi-v">${s.target}</div><div class="kpi-l">Meta <b>${reglaMes(year,month).base}−${s.adjN}</b></div></div>
      <div class="kpi"><div class="kpi-v">${s.adjN}</div><div class="kpi-l">Semanas con festivo o libre</div></div>
      <div class="kpi"><div class="kpi-v">${s.open.length}</div><div class="kpi-l">Días hábiles que quedan</div></div>
    </div>
    ${msg}`;

  // Calendario
  document.getElementById('day-hdrs').innerHTML='<div></div>'+
    DAYS.map((d,i)=>`<div class="day-hdr ${i>=5?'we':''}">${d}</div>`).join('');

  document.getElementById('weeks').innerHTML=s.ws.map(w=>{
    const days=Array.from({length:7},(_,i)=>addD(w.mon,i));
    const q=cuota(w,year,month), wD=w.visited>=q;
    return `<div class="cal-grid">
      ${q?`<div class="week-ind ${wD?'done':w.hasAdj?'adj':''}" role="img" title="Semana: ${w.visited} de ${q}" aria-label="Semana: ${w.visited} de ${q}">${wD?IC.check:w.visited}<small>/${q}</small></div>`:'<div class="week-ind none"></div>'}
      ${days.map((date,di)=>{
        const k=toKey(date), inM=inMonth(date,year,month);
        const isTd=k===toKey(now),colH=getHol(date),st=S.data[k];
        const cls=['day-cell',!inM&&'other',di>=5&&'we',isTd&&'today',colH&&'hol',st&&`s-${st}`,inM&&s.must.includes(k)&&'must'].filter(Boolean).join(' ');
        const ic=st?IC[st]:colH?FLAG:'';
        const flag=colH&&st?`<span class="flag-c">${FLAG}</span>`:'';
        const pend=inM&&S.pending[k]&&S.cid?'<span class="pend-dot" title="Pendiente por subir"></span>':'';
        const lbl=`${fmtDayLong(k)}${colH?`, festivo ${colH}`:''}${st?`, ${TYPE_UI[st]}`:''}${isTd?', hoy':''}`;
        return `<div class="${cls}" ${inM?`data-ts="${date.getTime()}" role="button" tabindex="0" aria-label="${lbl}"`:'aria-hidden="true"'}>
          ${flag}${pend}<span class="day-num">${date.getDate()}</span>${ic}
        </div>`;
      }).join('')}
    </div>`;
  }).join('');

  // Festivos del mes
  const festEl=document.getElementById('festivos');
  festEl.hidden=!s.mHols.length;
  festEl.innerHTML=s.mHols.map(([k,n])=>{const d=fromKey(k),p=d<now;return `<div class="fest-row ${p?'past':''}">${FLAG}<span class="fest-d">${DOW[d.getDay()]} ${d.getDate()}</span><span class="fest-name">${n}</span><span class="fest-meta">${p?'ya pasó':`esa semana: ${sem-1}`}</span></div>`;}).join('');

  // Desglose semanal
  document.getElementById('bk-sub').textContent=`cuota ${sem} · ${sem-1} con festivo o libre`;
  document.getElementById('breakdown').innerHTML=s.ws.filter(w=>cuota(w,year,month)).map(w=>{
      const q=cuota(w,year,month);
      const sl=`${w.mon.getDate()} ${MONTHS[w.mon.getMonth()].slice(0,3).toLowerCase()}`,el=`${w.sun.getDate()} ${MONTHS[w.sun.getMonth()].slice(0,3).toLowerCase()}`;
      const wD=w.visited>=q,p=Math.min(1,w.visited/q);
      return `<div class="bk-row ${wD?'done':w.hasAdj?'adj':''}">
        <div class="bk-lbl">${sl} – ${el}</div>
        <div class="bk-bar-w"><div class="bk-bar" style="transform:scaleX(${p})"></div></div>
        <div class="bk-val">${w.visited}/${q}</div>
        <div class="bk-ico">${wD?IC.check:w.hasAdj?FLAG:''}</div>
      </div>`;
    }).join('');

  // Tocar marca · Enter/espacio marca · mantener presionado (o clic derecho) abre el historial del día
  document.querySelectorAll('.day-cell[data-ts]').forEach(el=>{
    const date=new Date(+el.dataset.ts);
    el.addEventListener('click',()=>toggle(date));
    el.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); toggle(date); } });
    el.addEventListener('contextmenu',e=>{ e.preventDefault(); openDaySheet(toKey(date)); });
  });
}
