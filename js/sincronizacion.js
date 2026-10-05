// ═══════════════════════════════════════════════════════════
// COLA Y SINCRONIZACIÓN COMPLETA
// ═══════════════════════════════════════════════════════════
// Cola: todo lo que va a Calendar se ejecuta en orden, uno por uno
let chain=Promise.resolve();
// Cada trabajo en curso (subir un día, sync completo, escribir en la hoja) cuenta en S.busy para el indicador
function enqueue(fn){
  S.busy++; render();
  chain=chain.then(fn).then(()=>{ S.lastSync=Date.now(); },e=>{
    if(e instanceof AuthError) S.lastError=null;
    else { console.error(e); S.lastError=e.message; }
  }).finally(()=>{ S.busy--; S.step=''; render(); });
  return chain;
}
const isBusy=()=>S.syncing>0||S.busy>0;
const step=t=>{ S.step=t; render(); };
async function syncAll(){
  if(!hasToken()){ render(); return; }
  S.syncing++; render();
  const {year,month}=S;
  await enqueue(async()=>{
    S.lastError=null;
    step('Buscando el calendario…');
    await ensureCalendar();
    step('Leyendo el log…');
    let sheetErr=null;
    // Con tiempo real el historial llega por Firestore: no hace falta leer la hoja (sí se sigue escribiendo)
    if(!fbOn()) try{ await pullSheet(); }catch(e){ if(e instanceof AuthError) throw e; sheetErr=e; }
    step('Sincronizando días…');
    await (fbOn()?reconcileMonthFS:reconcileMonth)(year,month);
    step('Actualizando avisos…');
    await reconcileReminders();
    if(sheetErr) throw sheetErr;
    step('Escribiendo en el log…');
    await syncSheet();
    await pushHidden();
  });
  S.syncing--; render();
}

// Limpieza única de los eventos que la v2 dejó en el calendario principal
async function cleanupLegacy(){
  if(!await whenGIS()) return;
  if(!legacyClient) legacyClient=google.accounts.oauth2.initTokenClient({
    client_id:S.cid, scope:LEGACY_SCOPE, include_granted_scopes:false,
    callback:async r=>{
      if(r.error) return;
      S.syncing++; render();
      for(const [k,id] of Object.entries(S.legacy)){
        try{
          const res=await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${enc(id)}`,
            {method:'DELETE',headers:{Authorization:`Bearer ${r.access_token}`}});
          if(res.ok||res.status===404||res.status===410) delete S.legacy[k];
        }catch(_){}
      }
      save(); S.syncing--; render();
    }
  });
  legacyClient.requestAccessToken({prompt:''});
}

// ═══════════════════════════════════════════════════════════
// CUÁNDO SE SINCRONIZA (al volver a la app, cada 10/60 s, cada 5 min, al recuperar internet)
// ═══════════════════════════════════════════════════════════
// "Hoy" vivo y subida inmediata al salir de la app
function refreshToday(){ const t=today(); if(t.getTime()!==now.getTime()){ now=t; render(); } }
document.addEventListener('visibilitychange',()=>{
  if(document.hidden){ flushPushes(); return; }
  refreshToday(); render();
  if(hasToken()&&!isBusy()) syncAll();
});
setInterval(refreshToday,60*1000);
// ── Detección de cambios (app abierta) ──
// Se pregunta, con llamadas livianas, si algo cambió en otro lado:
//  - Calendar: eventos con `updated` posterior al último visto (incluye borrados).
//  - Drive: fecha de modificación de la hoja del log.
// Solo si hay cambios se hace la sincronización completa. Los cambios propios disparan
// a lo sumo una sincronización extra, porque el cursor avanza a lo último visto.
// Con tiempo real (Firebase) los cambios entre dispositivos y el historial ya llegan al instante
// por Firestore: se omite Drive y Calendar se revisa cada 60 s (solo para ediciones hechas allí).
const WATCH_MS=10*1000, WATCH_FB_MS=60*1000, FULL_MS=5*60*1000;
let calCursor=null, sheetMod=null, checking=false, lastCheck=0;
async function checkChanges(){
  if(checking||document.hidden||!online()||isBusy()) return;
  if(Date.now()-lastCheck<(fbOn()?WATCH_FB_MS:WATCH_MS)-500) return;
  checking=true; lastCheck=Date.now();
  try{
    let changed=false;
    if(!calCursor) calCursor=new Date(Date.now()-60*1000).toISOString();
    const r=await gcal('GET',`${calPath()}/events?updatedMin=${enc(calCursor)}&showDeleted=true&maxResults=50&fields=${enc('items(updated)')}`);
    const newer=(r?.items||[]).map(e=>e.updated).filter(u=>u>calCursor);
    if(newer.length){ changed=true; calCursor=newer.sort().pop(); }
    if(S.sheetId&&!fbOn()){
      const f=await gcal('GET',`${DRIVE}/${enc(S.sheetId)}?fields=modifiedTime`);
      if(f?.modifiedTime&&f.modifiedTime!==sheetMod){ if(sheetMod) changed=true; sheetMod=f.modifiedTime; }
    }
    if(changed&&!isBusy()) syncAll();
  }catch(e){
    if(e instanceof AuthError) render(); else console.warn('[watch]',e);
  }finally{ checking=false; }
}
setInterval(checkChanges,WATCH_MS);
// Respaldo: sincronización completa cada 5 minutos aunque no se detecte nada
setInterval(()=>{ if(!document.hidden&&hasToken()&&!isBusy()&&Date.now()-S.lastSync>FULL_MS) syncAll(); },60*1000);
// Al volver la conexión o al volver a la ventana (en PC cambiar de ventana no oculta la pestaña)
addEventListener('online',()=>{ if(hasToken()) syncAll(); });
addEventListener('focus',()=>{ if(hasToken()&&!isBusy()&&Date.now()-S.lastSync>WATCH_MS) syncAll(); });

