// ═══════════════════════════════════════════════════════════
// TARJETA «HISTORIAL DE CAMBIOS» del mes visible
// ═══════════════════════════════════════════════════════════
import { S } from '../../estado/estado.js';
import { MONTHS, DOW, SHEET_NAME } from '../../nucleo/constantes.js';
import { p2, fromKey, fmtTs } from '../../nucleo/fechas.js';
import { srcBadge } from '../../nucleo/registro.js';
import { sheetUrl } from '../../adaptadores/google-sheets.js';
import { IC, tico } from '../../ui/iconos.js';
import { render } from '../../ui/render.js';
import { deleteLog } from './registro.js';
import { openDaySheet } from './historial-dia.js';

export function renderHistorial(){
  const {year,month}=S;
  const prefix=`${year}-${p2(month+1)}`;
  const mLog=S.log.filter(e=>e.d.startsWith(prefix)).slice().reverse();
  const shown=S.showAllLog?mLog:mLog.slice(0,6);
  document.getElementById('history').innerHTML=`<div class="card-hd"><span class="card-ttl">Historial de cambios</span><span class="card-sub">${S.sheetId?`<a class="card-link" href="${sheetUrl()}" target="_blank" rel="noopener">${IC.sheet}Ver log</a>`:''}${mLog.length?`${S.sheetId?' · ':''}${mLog.length} este mes · <button class="card-act press" id="btn-log-clear">Borrar todos</button>`:''}</span></div>`+
    (mLog.length?shown.map(e=>{const [c,l]=srcBadge(e);const d=fromKey(e.d);return `
      <div class="log-row press" data-day="${e.d}" role="button" tabindex="0">
        <div class="log-d">${d.getDate()}<small>${DOW[d.getDay()]}</small></div>
        <div class="log-mid">
          <span class="log-chg">${tico(e.from)}<span class="arr">→</span>${tico(e.to)}</span>
          <span class="badge ${c}">${l}</span>${e.dev!==S.dev?'<span class="log-dev">otro disp.</span>':''}
        </div>
        <span class="log-ts">${fmtTs(e.ts)}</span>
        <button class="log-del press" data-del="${e.id}" aria-label="Borrar este registro">${IC.trash}</button>
      </div>`;}).join('')+(mLog.length>6?`<button class="log-more press" id="btn-log-more">${S.showAllLog?'Ver menos':`Ver los ${mLog.length}`}</button>`:'')
    :'<div class="log-empty">Aún no hay cambios este mes. Toca un día para marcarlo.</div>');

  document.querySelectorAll('.log-row[data-day]').forEach(el=>{
    el.addEventListener('click',()=>openDaySheet(el.dataset.day));
    el.addEventListener('keydown',e=>{ if(e.key==='Enter'){ openDaySheet(el.dataset.day); } });
  });
  document.getElementById('btn-log-more')?.addEventListener('click',()=>{ S.showAllLog=!S.showAllLog; render(); });
  document.querySelectorAll('#history .log-del').forEach(el=>el.addEventListener('click',e=>{ e.stopPropagation(); deleteLog([el.dataset.del]); }));
  document.getElementById('btn-log-clear')?.addEventListener('click',()=>{
    if(!confirm(`¿Borrar los ${mLog.length} registros de ${MONTHS[month].toLowerCase()} del historial de la app?\n\nTus días marcados no cambian, y los registros quedan guardados en la hoja «${SHEET_NAME}» de Google.`)) return;
    deleteLog(mLog.map(e=>e.id));
  });
}
