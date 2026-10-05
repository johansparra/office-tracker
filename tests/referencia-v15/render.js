// ═══════════════════════════════════════════════════════════
// RENDER
// ═══════════════════════════════════════════════════════════
function render(){
  const {year,month}=S; const s=stats();
  const mName=MONTHS[month].toLowerCase();

  document.getElementById('nav-title').textContent=`${MONTHS[month]} ${year}`;

  // Resumen del mes
  const past=s.active.length===0;
  const ok=s.slack>2;
  const n=Math.max(s.target,s.visited,1);
  const tone=s.done?'ok':past||!ok?'warn':'go';
  const dayList=ks=>`<div class="must-days">${ks.map(k=>`<span>${fmtDay(k)}</span>`).join('')}</div>`;
  const hab=x=>`${x} día${x===1?'':'s'} hábil${x===1?'':'es'}`;
  const pill=s.done?`${IC.check}Meta cumplida`:past?`Faltaron ${s.remaining}`:`Faltan ${s.remaining}`;
  const msg=s.done?`<div class="predict done">${IC.ok}<div>Meta cumplida${s.visited>s.target?` con <strong>${s.visited-s.target}</strong> de más`:''}. Lo que sumes ahora es extra.</div></div>`
    :past?`<div class="predict past">${IC.clock}<div>${MONTHS[month]} cerró con <strong>${s.visited} de ${s.target}</strong> visitas.</div></div>`
    :s.slack<0?`<div class="must-alert">${IC.warn}<div><strong>No alcanzas la meta.</strong> Necesitas ${s.remaining} y solo quedan ${hab(s.open.length)}. Ve todos los que puedas:${dayList(s.open)}</div></div>`
    :s.slack===0?`<div class="must-alert">${IC.warn}<div><strong>Tienes que ir sí o sí ${s.open.length===1?'el día hábil que queda':`los ${s.open.length} días hábiles que quedan`}</strong> para completar ${s.target}:${dayList(s.open)}</div></div>`
    :!ok?`<div class="predict warn">${IC.warn}<div>Poco margen: necesitas <strong>${s.remaining}</strong> de los <strong>${hab(s.open.length)}</strong> que quedan. Solo puedes faltar <strong>${s.slack}</strong>.</div></div>`
    :`<div class="predict ok">${IC.ok}<div>Vas bien. Necesitas <strong>${s.remaining}</strong> en los <strong>${hab(s.open.length)}</strong> que quedan (margen de ${s.slack}). Lo ideal: 2 por semana.</div></div>`;
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

  // Historial del mes
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

  // Google Calendar (tarjeta + chip del encabezado)
  const gb=document.getElementById('gcal-bar'), chip=document.getElementById('sync-chip');
  const pc=pendingCount(), lc=Object.keys(S.legacy).length;
  const err=S.lastError?`<span class="gcal-err">${S.lastError}</span>`:'';
  const busy=isBusy();
  document.getElementById('topbar').classList.toggle('on',busy);
  const rt=!fbAuth?'':fbUser
    ?`<br><span class="rt-on">${IC.bolt}Tiempo real · ${fbUser.email||''}</span> · <button class="gcal-link" id="btn-fb-out">Salir</button>`
    :`<br><button class="gcal-link" id="btn-fb-in">${IC.bolt}Activar tiempo real</button>`;
  if(hasToken()){
    gb.innerHTML=`<div class="gcal-ic">${IC.cal}</div>
    <div class="gcal-status"><strong>${busy?'<i class="dot sync pulse"></i>':S.lastError?'<i class="dot warn"></i>':pc?'<i class="dot sync"></i>':'<i class="dot ok"></i>'}Google Calendar</strong>
      ${busy?(S.step||'Sincronizando…'):S.lastError?'No se pudo sincronizar':pc?`${pc} cambio${pc>1?'s':''} por subir`:`Al día${S.lastSync?` · ${fmtClock(S.lastSync)}`:''}`}${err}
      ${lc?`<button class="gcal-link" id="btn-legacy">Borrar ${lc} evento${lc>1?'s':''} viejo${lc>1?'s':''} del calendario principal</button><br>`:''}
      ${S.sheetId?`<a class="gcal-link" href="${sheetUrl()}" target="_blank" rel="noopener">Ver log en Google Sheets</a> · `:''}<button class="gcal-link" id="btn-disconnect">Desconectar</button>${rt}</div>
    <button class="gcal-btn press ${busy?'syncing':''}" id="btn-sync" aria-label="Sincronizar" ${busy?'disabled':''}>${IC.sync}${busy?'':'Sync'}</button>`;
    chip.innerHTML=`<span class="chip">${busy?`<span class="spin">${IC.sync}</span>Sincronizando`:S.lastError?'<i class="dot warn"></i>Error':pc?`<i class="dot sync"></i>${pc} por subir`:fbUser?`<i class="dot ok"></i>${IC.bolt}En vivo`:'<i class="dot ok"></i>Al día'}</span>`;
  } else if(S.cid){
    gb.innerHTML=`<div class="gcal-ic">${IC.cal}</div>
    <div class="gcal-status"><strong><i class="dot warn"></i>Sesión vencida</strong>
      ${pc?`${pc} cambio${pc>1?'s':''} esperando para subir`:'Reconecta para seguir sincronizando'}${err}
      <br><button class="gcal-link" id="btn-cid">Cambiar Client ID</button> · <button class="gcal-link" id="btn-disconnect">Desconectar</button>${rt}</div>
    <button class="gcal-btn primary press" id="btn-reconnect">Reconectar</button>`;
    chip.innerHTML=`<span class="chip"><i class="dot warn"></i>${pc?`${pc} sin subir`:'Sin sesión'}</span>`;
  } else {
    gb.innerHTML=`<div class="gcal-ic">${IC.cal}</div>
    <div class="gcal-status"><strong><i class="dot"></i>Google Calendar</strong>Sincroniza tus días y recibe avisos a las 10:00 y 4:30${rt}</div>
    <button class="gcal-btn primary press" id="btn-connect">${IC.link}Conectar</button>`;
    chip.innerHTML=`<span class="chip"><i class="dot"></i>Solo local</span>`;
  }

  document.querySelectorAll('.day-cell[data-ts]').forEach(el=>{
    const date=new Date(+el.dataset.ts);
    el.addEventListener('click',()=>toggle(date));
    el.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); toggle(date); } });
    el.addEventListener('contextmenu',e=>{ e.preventDefault(); openDaySheet(toKey(date)); });
  });
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
  document.getElementById('btn-connect')?.addEventListener('click',showModal);
  document.getElementById('btn-cid')?.addEventListener('click',showModal);
  document.getElementById('btn-reconnect')?.addEventListener('click',connect);
  document.getElementById('btn-sync')?.addEventListener('click',syncAll);
  document.getElementById('btn-legacy')?.addEventListener('click',cleanupLegacy);
  document.getElementById('btn-disconnect')?.addEventListener('click',disconnect);
  document.getElementById('btn-fb-in')?.addEventListener('click',fbSignIn);
  document.getElementById('btn-fb-out')?.addEventListener('click',fbSignOut);
  afterRender(s);
}

