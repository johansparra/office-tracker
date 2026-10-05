// ═══════════════════════════════════════════════════════════
// GOOGLE CALENDAR API
// ═══════════════════════════════════════════════════════════
class AuthError extends Error{}

async function gcal(method,path,body){
  if(!hasToken()) throw new AuthError('sin token');
  const url=path.startsWith('https://')?path:`https://www.googleapis.com/calendar/v3${path}`;   // Sheets/Drive pasan la URL completa
  const r=await fetch(url,{
    method,
    headers:{'Authorization':`Bearer ${S.token}`,'Content-Type':'application/json'},
    body:body?JSON.stringify(body):undefined
  });
  if(r.status===401){ clearToken(); throw new AuthError('token vencido'); }
  if(r.status===404||r.status===410) return {notFound:true};
  if(r.status===204) return {};
  if(!r.ok){
    // Se muestra el motivo real que da Google, no solo el código
    let j=null; try{ j=await r.json(); }catch(_){}
    const reason=j?.error?.errors?.[0]?.reason||j?.error?.details?.find(d=>d.reason)?.reason||'', gm=j?.error?.message||'';
    const api=gm.match(/Google [A-Za-z ]+? API/)?.[0]||'Google Calendar API';
    const msg=reason==='accessNotConfigured'||reason==='SERVICE_DISABLED'||/has not been used|is disabled/i.test(gm)
        ?`La ${api} no está activada en tu proyecto de Google Cloud (APIs y servicios → Biblioteca → ${api} → Habilitar)`
      :reason==='insufficientPermissions'||reason==='ACCESS_TOKEN_SCOPE_INSUFFICIENT'||/insufficient.*scope/i.test(gm)
        ?'Faltan permisos: toca Reconectar y marca todas las casillas de Google Calendar'
      :`Google respondió ${r.status}${gm?`: ${gm}`:''}`;
    console.error('[gcal]',method,path,r.status,j);
    throw Object.assign(new Error(msg),{status:r.status,reason});
  }
  return r.json();
}
const calPath=()=>`/calendars/${enc(S.calId)}`;

async function listEvents(params){
  const qs=Object.entries({singleEvents:'true',maxResults:'250',...params}).map(([k,v])=>`${k}=${enc(v)}`).join('&');
  const items=[]; let pageToken='';
  do{
    const r=await gcal('GET',`${calPath()}/events?${qs}${pageToken?`&pageToken=${enc(pageToken)}`:''}`);
    items.push(...(r?.items||[])); pageToken=r?.nextPageToken||'';
  }while(pageToken);
  return items;
}
async function delEvent(id){ await gcal('DELETE',`${calPath()}/events/${enc(id)}`); }

// Calendario propio "Office Tracker": UNO solo por cuenta de Google, sin importar
// cuántos dispositivos se conecten. En cada sync se busca por nombre; si hay varios
// (dos dispositivos que se conectaron a la vez), todos eligen el mismo (id menor),
// copian a él los días de los demás y borran los sobrantes.
async function ensureCalendar(){
  let found;
  try{
    const r=await gcal('GET','/users/me/calendarList?minAccessRole=owner&maxResults=250');
    found=(r?.items||[]).filter(c=>c.summary===CAL_NAME&&!c.deleted).map(c=>c.id).sort();
    S.account=(r?.items||[]).find(c=>c.primary)?.id||S.account;   // el id del calendario principal es el correo (para el log)
  }catch(e){
    if(e instanceof AuthError) throw e;
    if(e.status||!S.calId||!S.calChecked) throw e;   // error de Google: se muestra tal cual
    return;                             // sin red: se sigue con el calendario conocido
  }                                     // nunca se crea uno nuevo sin haber podido buscar
  let id=found[0]||null, created=false;
  if(!id){
    const r=await gcal('POST','/calendars',{summary:CAL_NAME,timeZone:TZ,
      description:'Visitas a oficina y recordatorios diarios de Office Tracker (ScotiaTech).'});
    id=r.id; created=true;
  }
  for(const dup of found.slice(1)) await mergeCalendar(dup,id);
  if(S.calId!==id){
    // Cambio de calendario (primera conexión, otro dispositivo lo creó, o lo borraste en Google):
    // los ids guardados ya no sirven. Se unen los dos lados:
    //  - calendario nuevo y vacío → se sube todo lo local
    //  - calendario existente     → gana lo que ya está en Google; solo se suben los días que no tiene
    S.evIds={}; S.rem={}; S.calId=id;
    const inCal=new Set();
    if(!created) for(const ev of await listEvents({})){
      if(ev.extendedProperties?.private?.kind==='reminder'||!classify(ev)) continue;
      const ds=ev.start?.date||ev.start?.dateTime?.slice(0,10); if(ds) inCal.add(ds);
    }
    for(const k of Object.keys(S.data)) if(!inCal.has(k)) S.pending[k]=true;
    for(const k of Object.keys(S.pending)) if(inCal.has(k)) delete S.pending[k];
  }
  S.calChecked=true;
  localStorage.setItem(LS_CAL,S.calId); save();
}
// Copia los días (no los avisos) de un calendario duplicado al principal y borra el duplicado.
async function mergeCalendar(from,to){
  let pageToken='';
  do{
    const r=await gcal('GET',`/calendars/${enc(from)}/events?maxResults=250${pageToken?`&pageToken=${enc(pageToken)}`:''}`);
    for(const ev of r?.items||[]){
      if(ev.status==='cancelled'||ev.extendedProperties?.private?.kind==='reminder') continue;
      const {summary,description,start,end,recurrence,transparency,extendedProperties}=ev;
      await gcal('POST',`/calendars/${enc(to)}/events`,{summary,description,start,end,recurrence,transparency,extendedProperties});
    }
    pageToken=r?.nextPageToken||'';
  }while(pageToken);
  await gcal('DELETE',`/calendars/${enc(from)}`);
}

// ── Eventos de día (la "base de datos") ──────────────────────
function dayBody(key,type){
  const hist=S.log.filter(e=>e.d===key).slice(-10);
  const last=hist[hist.length-1]||{};
  const lines=hist.map(e=>`${fmtTs(e.ts)} · ${TYPE_LBL[e.from]} → ${TYPE_LBL[e.to]} · ${srcText(e)} · disp. ${e.dev}`);
  return {
    summary:TYPE_LBL[type], status:'confirmed',
    start:{date:key}, end:{date:toKey(addD(fromKey(key),1))},
    description:`Registrado por Office Tracker.\n\nHistorial de este día:\n${lines.join('\n')||'—'}`,
    extendedProperties:{private:{appId:APP_ID,kind:'day',type,
      src:last.src||'',ts:String(last.ts||''),dev:last.dev||'',ref:last.ref||'',ver:last.ok||''}}
  };
}
function classify(ev){
  if(ev.status==='cancelled') return null;
  const t=(ev.summary||'').toLowerCase();
  if(/🏖|libre|vacaci/.test(t)) return 'vacation';
  if(/🏢|oficina|office/.test(t)) return 'office';
  const x=ev.extendedProperties?.private?.type;
  return (x==='office'||x==='vacation')?x:'office';   // cualquier otro evento en este calendario = oficina
}

// Lleva a Calendar el estado local de un día. Nunca duplica.
async function pushDay(key){
  if(timers[key]) return;                 // sigue en la ventana de "Deshacer"
  const type=S.data[key]||null, id=S.evIds[key];
  if(id&&type){
    const r=await gcal('PATCH',`${calPath()}/events/${enc(id)}`,dayBody(key,type));
    if(r?.notFound){ delete S.evIds[key]; return pushDay(key); }
  }else if(id&&!type){
    await delEvent(id); delete S.evIds[key];
  }else if(!id&&type){
    const r=await gcal('POST',`${calPath()}/events`,dayBody(key,type));
    if(r?.id) S.evIds[key]=r.id;
  }
  delete S.pending[key]; save();
  await syncRemindersForDate(key);
}

// Reconciliación del mes visible:
//  - Pendiente en el celular → gana el celular.
//  - Sin pendientes → gana Calendar (crear, mover, renombrar o borrar desde la app de Calendar).
//  - Duplicados del mismo día → se deja uno.
async function reconcileMonth(year,month){
  const prefix=`${year}-${p2(month+1)}`;
  const items=await listEvents({timeMin:new Date(year,month,1).toISOString(),timeMax:new Date(year,month+1,1).toISOString()});
  const byDay={};
  for(const ev of items){
    if(ev.extendedProperties?.private?.kind==='reminder') continue;
    const ds=ev.start?.date||ev.start?.dateTime?.slice(0,10);
    const type=classify(ev);
    if(!ds||!ds.startsWith(prefix)||!type) continue;
    (byDay[ds]=byDay[ds]||[]).push({id:ev.id,type});
  }
  for(const [ds,evs] of Object.entries(byDay)){
    const keep=evs.find(e=>e.id===S.evIds[ds])||evs[0];
    for(const e of evs) if(e!==keep) await delEvent(e.id);
    S.evIds[ds]=keep.id;
    if(!S.pending[ds]&&S.data[ds]!==keep.type){
      if(!explained(ds,keep.type)) logChange({d:ds,from:S.data[ds]||null,to:keep.type,src:'calendar'});
      S.data[ds]=keep.type;
    }
  }
  for(const ds of Object.keys(S.evIds)){
    if(ds.startsWith(prefix)&&!byDay[ds]&&!S.pending[ds]){
      if(S.data[ds]&&!explained(ds,null)) logChange({d:ds,from:S.data[ds],to:null,src:'calendar'});
      delete S.evIds[ds]; delete S.data[ds];
    }
  }
  save();
  for(const ds of Object.keys(S.pending)) if(!timers[ds]) await pushDay(ds);
}

// ── Avisos 10:00 y 16:30 (lun–vie, sin festivos, sin días ya marcados) ──
// En un día obligatorio para llegar a la meta, el aviso de las 10:00 lo dice
function reminderTitle(key,slot){
  const d=fromKey(key);
  return slot==='r10'&&stats(d.getFullYear(),d.getMonth()).must.includes(key)?'⚠️ Hoy tienes que ir a la oficina':slotOf(slot).title;
}
function reminderBody(key,slot,nonce){
  const sl=slotOf(slot);
  return {
    summary:reminderTitle(key,slot), transparency:'transparent',
    start:{dateTime:`${key}T${p2(sl.h)}:${p2(sl.m)}:00`,timeZone:TZ},
    end:{dateTime:`${key}T${p2(sl.h)}:${p2(sl.m+5)}:00`,timeZone:TZ},
    description:`Toca el enlace para registrar el día:\n${APP_URL}?d=${key}&r=${slot}&n=${nonce}`,
    reminders:{useDefault:false,overrides:[{method:'popup',minutes:0}]},
    extendedProperties:{private:{appId:APP_ID,kind:'reminder',date:key,slot,nonce}}
  };
}
function desiredSlots(key){
  const d=fromKey(key);
  if(isWeekend(d)||getHol(d)||S.data[key]||S.skip[key]) return [];
  const t=new Date();
  return SLOTS.filter(sl=>{ const at=new Date(d); at.setHours(sl.h,sl.m,0,0); return at>t; }).map(sl=>sl.id);
}
async function syncRemindersForDate(key){
  if(key<toKey(now)||key>toKey(addD(now,HORIZON))) {
    // Fuera del horizonte: solo se borran avisos que ya no aplican
    for(const sl of SLOTS){ const k=`${key}|${sl.id}`; if(S.rem[k]&&(S.data[key]||S.skip[key])){ await delEvent(S.rem[k].id); delete S.rem[k]; } }
    save(); return;
  }
  const want=new Set(desiredSlots(key));
  for(const sl of SLOTS){
    const k=`${key}|${sl.id}`, have=S.rem[k];
    if(want.has(sl.id)&&!have){
      const nonce=rid(4);
      const r=await gcal('POST',`${calPath()}/events`,reminderBody(key,sl.id,nonce));
      if(r?.id){ S.rem[k]={id:r.id,nonce,t:reminderTitle(key,sl.id)}; S.nonces[nonce]={d:key,slot:sl.id}; }
    }else if(want.has(sl.id)&&have&&have.t!==reminderTitle(key,sl.id)){
      const t=reminderTitle(key,sl.id);   // el día pasó a ser (o dejó de ser) obligatorio
      const r=await gcal('PATCH',`${calPath()}/events/${enc(have.id)}`,{summary:t});
      if(r?.notFound) delete S.rem[k]; else have.t=t;
    }else if(!want.has(sl.id)&&have){
      await delEvent(have.id); delete S.rem[k];
    }
  }
  save();
}
async function reconcileReminders(){
  const from=addD(now,-7), to=addD(now,HORIZON+1), yest=toKey(addD(now,-1));
  const items=await listEvents({timeMin:from.toISOString(),timeMax:to.toISOString(),privateExtendedProperty:'kind=reminder'});
  const fresh={};
  for(const ev of items){
    const p=ev.extendedProperties?.private||{}, k=`${p.date}|${p.slot}`;
    if(p.nonce) S.nonces[p.nonce]={d:p.date,slot:p.slot};
    if(fresh[k]||!p.date||p.date<yest){ await delEvent(ev.id); continue; }   // duplicado o viejo
    fresh[k]={id:ev.id,nonce:p.nonce,t:ev.summary};
  }
  const a=toKey(from), b=toKey(to);
  for(const k of Object.keys(S.rem)){ const d=k.split('|')[0]; if(d>=a&&d<=b) delete S.rem[k]; }
  Object.assign(S.rem,fresh);
  for(let i=0;i<=HORIZON;i++) await syncRemindersForDate(toKey(addD(now,i)));
  const ks=Object.keys(S.nonces); if(ks.length>300) ks.slice(0,ks.length-300).forEach(k=>delete S.nonces[k]);
  save();
}

