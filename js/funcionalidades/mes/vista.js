// ═══════════════════════════════════════════════════════════
// VISTA DEL MES: resumen y alerta (RN-09), calendario, festivos del mes y semana a semana
// ═══════════════════════════════════════════════════════════
import { S, now } from '../../estado/estado.js';
import { MONTHS, DAYS, DOW, BASE, TYPE_UI } from '../../nucleo/constantes.js';
import { toKey, fromKey, addD, inMonth, fmtDay, fmtDayLong } from '../../nucleo/fechas.js';
import { getHol } from '../../nucleo/festivos.js';
import { estadoMes } from '../../nucleo/meta.js';
import { IC, FLAG } from '../../ui/iconos.js';
import { toggle } from '../marcar-dia/marcar.js';
import { openDaySheet } from '../historial/historial-dia.js';

const dayList=ks=>`<div class="must-days">${ks.map(k=>`<span>${fmtDay(k)}</span>`).join('')}</div>`;
const hab=x=>`${x} día${x===1?'':'s'} hábil${x===1?'':'es'}`;

// s: resultado de calcularMes() para el mes visible
export function renderMes(s){
  const {year,month}=S;
  const mName=MONTHS[month].toLowerCase();
  document.getElementById('nav-title').textContent=`${MONTHS[month]} ${year}`;

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
    'vas-bien':()=>`<div class="predict ok">${IC.ok}<div>Vas bien. Necesitas <strong>${s.remaining}</strong> en los <strong>${hab(s.open.length)}</strong> que quedan (margen de ${s.slack}). Lo ideal: 2 por semana.</div></div>`,
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
      <div class="kpi"><div class="kpi-v">${s.target}</div><div class="kpi-l">Meta <b>${BASE}−${s.adjN}</b></div></div>
      <div class="kpi"><div class="kpi-v">${s.adjN}</div><div class="kpi-l">Semanas con festivo</div></div>
      <div class="kpi"><div class="kpi-v">${s.open.length}</div><div class="kpi-l">Días hábiles libres</div></div>
    </div>
    ${msg}`;

  // Calendario
  document.getElementById('day-hdrs').innerHTML='<div></div>'+
    DAYS.map((d,i)=>`<div class="day-hdr ${i>=5?'we':''}">${d}</div>`).join('');

  document.getElementById('weeks').innerHTML=s.ws.map(w=>{
    const days=Array.from({length:7},(_,i)=>addD(w.mon,i));
    const wD=w.visited>=w.quota;
    return `<div class="cal-grid">
      <div class="week-ind ${wD?'done':w.hasAdj?'adj':''}" title="Semana: ${w.visited} de ${w.quota}">${wD?IC.check:w.visited}<small>/${w.quota}</small></div>
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
  festEl.innerHTML=s.mHols.length?`<div class="card-hd"><span class="card-ttl">Festivos de ${mName}</span><span class="card-sub">${FLAG} automáticos</span></div>`+
    s.mHols.map(([k,n])=>{const d=fromKey(k),p=d<now;return `<div class="fest-row ${p?'past':''}">
      <div class="fest-date"><b>${d.getDate()}</b><span>${DOW[d.getDay()]}</span></div>
      <div><div class="fest-name">${n}</div><div class="fest-meta">${p?'Ya pasó':'Esa semana la cuota baja a 1'}</div></div>
    </div>`;}).join(''):'';

  // Desglose semanal
  document.getElementById('breakdown').innerHTML=`<div class="card-hd"><span class="card-ttl">Semana a semana</span><span class="card-sub">cuota 2 · 1 con festivo</span></div>`+
    s.ws.map(w=>{
      const sl=`${w.mon.getDate()} ${MONTHS[w.mon.getMonth()].slice(0,3).toLowerCase()}`,el=`${w.sun.getDate()} ${MONTHS[w.sun.getMonth()].slice(0,3).toLowerCase()}`;
      const wD=w.visited>=w.quota,p=w.quota>0?Math.min(1,w.visited/w.quota):1;
      return `<div class="bk-row ${wD?'done':w.hasAdj?'adj':''}">
        <div class="bk-lbl">${sl} – ${el}</div>
        <div class="bk-bar-w"><div class="bk-bar" style="transform:scaleX(${p})"></div></div>
        <div class="bk-val">${w.visited}/${w.quota}</div>
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
