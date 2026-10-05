// ═══════════════════════════════════════════════════════════
// HISTORIAL DE UN DÍA (mantener presionado un día)
// ═══════════════════════════════════════════════════════════
function openDaySheet(key){
  const es=S.log.filter(e=>e.d===key).slice().reverse();
  const st=S.data[key]||null;
  const sync=!S.cid?'Solo en este dispositivo':S.pending[key]?'<span class="sync-t">Pendiente por subir</span>':
    S.evIds[key]?'<span class="ok-t">Guardado en Google Calendar ✓</span>':'—';
  const hol=getHol(fromKey(key));
  openSheet(`
    <h2>${fmtDayLong(key)}</h2>
    ${hol?`<p>${FLAG} ${hol}</p>`:''}
    <div class="state-row">${tchip(st)} ${sync}</div>
    <div class="day-log">${es.length?es.map(e=>{const [c,l]=srcBadge(e);return `
      <div class="dl-row">
        <div class="dl-top"><span class="badge ${c}">${l}</span><span class="dl-ts">${fmtTs(e.ts)}</span>
          <button class="log-del press" data-del="${e.id}" aria-label="Borrar este registro">${IC.trash}</button></div>
        <div class="dl-chg">${tico(e.from)}${TYPE_UI[e.from]} <span class="t-null">→</span> ${tico(e.to)}${TYPE_UI[e.to]}</div>
        <div class="dl-meta">${srcText(e)} · disp. ${e.dev}${e.dev===S.dev?' (este)':''} · id ${e.id}</div>
      </div>`;}).join(''):'<p>Sin cambios registrados para este día.</p>'}</div>
    ${S.sheetId?`<p><a class="card-link" href="${sheetUrl()}" target="_blank" rel="noopener">${IC.sheet}Ver el log completo en Google Sheets</a></p>`:''}
    <div class="sheet-btns"><button class="btn-s press" id="sheet-close">Cerrar</button></div>`);
  document.getElementById('sheet-close').addEventListener('click',closeSheet);
  document.querySelectorAll('#sheet-body .log-del').forEach(el=>el.addEventListener('click',()=>{ deleteLog([el.dataset.del]); openDaySheet(key); }));
}
function openSheet(html){ document.getElementById('sheet-body').innerHTML=html; showOv('sheet'); }
function closeSheet(){ hideOv('sheet'); }

