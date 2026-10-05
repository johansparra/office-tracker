// ═══════════════════════════════════════════════════════════
// ENLACE DESDE EL AVISO (?d=AAAA-MM-DD&r=r10|r16&n=código)
// ═══════════════════════════════════════════════════════════
function readDeepLink(){
  const q=new URLSearchParams(location.search);
  const d=q.get('d'), r=q.get('r'), n=q.get('n');
  if(q.toString()) history.replaceState(null,'',location.pathname);
  if(!d||!/^\d{4}-\d{2}-\d{2}$/.test(d)) return null;
  return {d, slot:slotOf(r)?r:null, nonce:n&&/^[0-9a-f]{6,32}$/.test(n)?n:null};
}
async function verifyNonce(d,n){
  if(S.nonces[n]) return S.nonces[n].d===d?'ok':'bad';
  if(online()){
    try{
      const r=await gcal('GET',`${calPath()}/events?privateExtendedProperty=${enc('nonce='+n)}&showDeleted=true&maxResults=5`);
      const p=r?.items?.[0]?.extendedProperties?.private;
      if(p) return p.date===d?'ok':'bad';
    }catch(_){}
  }
  return 'unknown';
}
async function openNotifSheet(link){
  const sl=slotOf(link.slot);
  let ok=link.nonce?'checking':'unknown';
  const okTxt=()=>ok==='checking'?'verificando código…':ok==='ok'?'<span class="ok-t">código verificado ✓</span>':
    ok==='bad'?'<span class="bad-t">⚠ el código no coincide con ese día</span>':'<span class="unk-t">sin verificar</span>';
  const paint=()=>{
    const cur=S.data[link.d]||null;
    openSheet(`
      <h2>${fmtDayLong(link.d)}</h2>
      <p>Aviso de las ${sl?.label||'—'} · ${okTxt()}${link.nonce?`<br><span class="ref">ref ${link.nonce}</span>`:''}</p>
      <div class="state-row">Estado actual ${tchip(cur)}</div>
      <div class="sheet-btns">
        <button class="btn-p press" data-pick="office">${IC.office}Fui a la oficina</button>
        <button class="btn-s opt t-vacation press" data-pick="vacation">${IC.vacation}<span>Día libre</span></button>
        <button class="btn-s opt press" data-pick="none">${IC.x}<span>Hoy no fui</span></button>
        <button class="btn-s btn-ghost press" data-pick="close">Cerrar</button>
      </div>`);
    document.querySelectorAll('[data-pick]').forEach(b=>b.addEventListener('click',()=>pick(b.dataset.pick)));
  };
  const pick=v=>{
    closeSheet(); if(v==='close') return;
    const meta={slot:link.slot,ref:link.nonce||'',ok:ok==='checking'?'unknown':ok};
    if(v==='none'){
      const cur=S.data[link.d]||null;
      S.skip[link.d]=true;
      logChange({d:link.d,from:cur,to:cur,src:'notif',note:'Hoy no fui',...meta});
      save(); render();
      if(online()) enqueue(()=>syncRemindersForDate(link.d)).then(render);
      return;
    }
    applyChange(link.d,v,'notif',meta);
  };
  const d=fromKey(link.d); S.year=d.getFullYear(); S.month=d.getMonth(); render();
  paint();
  if(link.nonce){ ok=await verifyNonce(link.d,link.nonce); const sh=document.getElementById('sheet'); if(sh.style.display!=='none'&&!sh.dataset.closing) paint(); }
}

