// ═══════════════════════════════════════════════════════════
// FIREBASE (tiempo real): Firestore es la fuente de verdad de los días y del historial.
// Google Calendar y la hoja del log quedan como copias (avisos y auditoría).
//   users/{uid}/days/{AAAA-MM-DD}  {type: office|vacation|null, ts, dev}   (null = vacío; no se borran: gana el ts mayor)
//   users/{uid}/log/{id}           el registro del historial
//   users/{uid}/hidden/{id}        registros borrados en la app
// ═══════════════════════════════════════════════════════════
const FB_CONFIG={
  apiKey:'AIzaSyBBm17sVG5NgOfmJ50kz3iAc4cAj2TMmLQ',
  authDomain:'office-tracker-510522.firebaseapp.com',
  projectId:'office-tracker-510522',
  storageBucket:'office-tracker-510522.firebasestorage.app',
  messagingSenderId:'394992259372',
  appId:'1:394992259372:web:b72d9a52e30cd9e03b5c89'
};
let fbAuth=null, fbDb=null, fbUser=null, fbUnsub=[], fbFirst={};
const fbOn=()=>!!fbUser;
const fbBase=()=>fbDb.collection('users').doc(fbUser.uid);
const clean=o=>JSON.parse(JSON.stringify(o));   // Firestore no acepta campos undefined

function fbInit(){
  if(!window.firebase?.firestore) return;   // sin conexión al cargar: la app sigue como antes
  firebase.initializeApp(FB_CONFIG);
  fbAuth=firebase.auth(); fbDb=firebase.firestore();
  fbDb.enablePersistence({synchronizeTabs:true}).catch(()=>{});   // copia local: funciona sin internet
  fbAuth.onAuthStateChanged(u=>{ fbStop(); fbUser=u; if(u) fbStart(); render(); });
  render();   // muestra «Activar tiempo real» sin esperar a que Firebase confirme la sesión
}
function fbErr(e){
  console.error('[firebase]',e);
  const c=e?.code||'';
  S.lastError=c==='permission-denied'?'Firebase: sin permiso (revisa las reglas de Firestore, paso A5 de docs/FIREBASE.md)'
    :c==='auth/unauthorized-domain'?'Firebase: agrega johansparra.github.io en Authentication → Dominios autorizados'
    :c==='auth/popup-blocked'?'El navegador bloqueó la ventana de Google: permite ventanas emergentes para este sitio'
    :`Firebase: ${e?.message||c}`;
  render();
}
function fbSignIn(){
  if(!fbAuth){ alert('No se pudo cargar Firebase. Revisa la conexión y vuelve a abrir la app.'); return; }
  const p=new firebase.auth.GoogleAuthProvider(); p.setCustomParameters({prompt:'select_account'});
  fbAuth.signInWithPopup(p).catch(e=>{ if(e?.code!=='auth/popup-closed-by-user'&&e?.code!=='auth/cancelled-popup-request') fbErr(e); });
}
function fbSignOut(){
  if(!confirm('¿Desactivar el tiempo real en este dispositivo?\n\nTus días se quedan aquí y en Google Calendar.')) return;
  fbAuth?.signOut();
}
function fbStop(){ fbUnsub.forEach(u=>u()); fbUnsub=[]; }
function fbStart(){
  fbFirst={days:true,log:true,hidden:true};
  const b=fbBase();
  // includeMetadataChanges: avisa también cuando llega la primera respuesta del servidor (aunque no haya datos)
  const M={includeMetadataChanges:true};
  fbUnsub.push(b.collection('days').onSnapshot(M,onFsDays,fbErr));
  fbUnsub.push(b.collection('log').orderBy('ts','desc').limit(1000).onSnapshot(M,onFsLog,fbErr));
  fbUnsub.push(b.collection('hidden').onSnapshot(M,onFsHidden,fbErr));
}

// ── Escrituras ──
function fsDay(ds,type=S.data[ds]||null,ts=Date.now()){
  if(!fbOn()) return;
  S.fs[ds]={type,ts,dev:S.dev};
  fbBase().collection('days').doc(ds).set({type,ts,dev:S.dev}).catch(fbErr);
}
function fsLog(e){
  if(!fbOn()) return;
  const {up,...rest}=e;
  fbBase().collection('log').doc(e.id).set(clean(rest)).catch(fbErr);
}
function fsHide(ids){
  if(!fbOn()) return;
  const b=fbDb.batch();
  for(const id of ids) b.set(fbBase().collection('hidden').doc(id),{ts:Date.now(),dev:S.dev});
  b.commit().catch(fbErr);
}
const lastLogTs=ds=>S.log.reduce((m,e)=>e.d===ds&&e.ts>m?e.ts:m,0);

// ── Lecturas en tiempo real ──
// La migración (subir lo local que Firestore no tiene) espera la primera respuesta del servidor:
// la caché local de un dispositivo nuevo viene vacía y no debe pisar datos más nuevos.
const firstFromServer=(snap,k)=>{ if(!fbFirst[k]||snap.metadata.fromCache) return false; fbFirst[k]=false; return true; };
function onFsDays(snap){
  const first=firstFromServer(snap,'days');
  for(const ch of snap.docChanges()){
    if(ch.type==='removed') continue;
    const ds=ch.doc.id, v=ch.doc.data(), fs={type:v.type||null,ts:v.ts||0,dev:v.dev};
    const lt=S.data[ds]||null;
    if(lt!==fs.type&&(timers[ds]||lastLogTs(ds)>fs.ts)){ fsDay(ds,lt,Math.max(Date.now(),fs.ts+1)); continue; }   // lo local es más nuevo
    S.fs[ds]=fs;
    if(lt!==fs.type){ if(fs.type) S.data[ds]=fs.type; else delete S.data[ds]; }
  }
  if(first){
    // Primera vez en este dispositivo: se suben los días que Firestore aún no tiene
    for(const ds of Object.keys(S.data)) if(!S.fs[ds]) fsDay(ds,S.data[ds],lastLogTs(ds)||Date.now());
  }
  save(); render();
}
function onFsLog(snap){
  const first=firstFromServer(snap,'log');
  const have=new Set(S.log.map(e=>e.id)), inFs=new Set();
  for(const ch of snap.docChanges()){
    if(ch.type==='removed') continue;
    const e=ch.doc.data(); inFs.add(e.id);
    if(!have.has(e.id)&&!S.hidden[e.id]){ S.log.push({...e,up:true}); have.add(e.id); }   // lo sube a la hoja el dispositivo que lo creó
  }
  if(first){
    const b=fbDb.batch(); let n=0;
    for(const e of S.log) if(!inFs.has(e.id)&&n<450){ const {up,...rest}=e; b.set(fbBase().collection('log').doc(e.id),clean(rest)); n++; }
    if(n) b.commit().catch(fbErr);
  }
  S.log=S.log.filter(e=>!S.hidden[e.id]).sort((a,b)=>a.ts-b.ts);
  if(S.log.length>1000) S.log.splice(0,S.log.length-1000);
  save(); render();
}
function onFsHidden(snap){
  const first=firstFromServer(snap,'hidden');
  const inFs=new Set();
  for(const ch of snap.docChanges()){ if(ch.type!=='removed'){ S.hidden[ch.doc.id]=1; inFs.add(ch.doc.id); } }
  if(first){ const up=Object.keys(S.hidden).filter(id=>!inFs.has(id)); if(up.length) fsHide(up.slice(0,450)); }
  S.log=S.log.filter(e=>!S.hidden[e.id]);
  save(); render();
}

// Con Firestore activo, Calendar es una copia: gana Firestore, salvo que el evento se haya
// editado en Google Calendar después del último cambio en Firestore (eso se importa).
async function reconcileMonthFS(year,month){
  const prefix=`${year}-${p2(month+1)}`;
  const items=await listEvents({timeMin:new Date(year,month,1).toISOString(),timeMax:new Date(year,month+1,1).toISOString()});
  const byDay={};
  for(const ev of items){
    if(ev.extendedProperties?.private?.kind==='reminder') continue;
    const ds=ev.start?.date||ev.start?.dateTime?.slice(0,10), type=classify(ev);
    if(!ds||!ds.startsWith(prefix)||!type) continue;
    (byDay[ds]=byDay[ds]||[]).push({id:ev.id,type,upd:Date.parse(ev.updated)||0});
  }
  const days=new Set([...Object.keys(byDay),...Object.keys(S.data),...Object.keys(S.evIds)].filter(k=>k.startsWith(prefix)));
  for(const ds of days){
    const evs=byDay[ds]||[], had=!!S.evIds[ds];
    const keep=evs.find(e=>e.id===S.evIds[ds])||evs[0];
    for(const e of evs) if(e!==keep) await delEvent(e.id);
    if(keep) S.evIds[ds]=keep.id; else delete S.evIds[ds];
    const ct=keep?.type||null, lt=S.data[ds]||null, fts=S.fs[ds]?.ts||0;
    if(ct===lt||S.pending[ds]||timers[ds]) continue;
    // ¿Se cambió en Google Calendar? Evento editado después del último cambio en Firestore,
    // o evento que conocíamos y desapareció sin que Firestore cambiara desde la última sincronización.
    const fromCal=keep?keep.upd>fts+5000:had&&fts<S.lastSync;
    if(fromCal){
      if(!explained(ds,ct)) logChange({d:ds,from:lt,to:ct,src:'calendar'});
      if(ct) S.data[ds]=ct; else delete S.data[ds];
      fsDay(ds,ct);
    }else S.pending[ds]=true;   // gana Firestore: se corrige la copia en Calendar
  }
  save();
  for(const ds of Object.keys(S.pending)) if(!timers[ds]) await pushDay(ds);
}

