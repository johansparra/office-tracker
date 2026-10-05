// ═══════════════════════════════════════════════════════════
// TIEMPO REAL CON FIREBASE: Firestore es la fuente de verdad de los días y del historial (RN-23).
// Google Calendar y la hoja del log quedan como copias (avisos y auditoría).
// ═══════════════════════════════════════════════════════════
import { S } from '../../estado/estado.js';
import { save } from '../../estado/almacenamiento.js';
import { esClave } from '../../nucleo/fechas.js';
import { tipoValido } from '../../nucleo/marcado.js';
import { entradaValida } from '../../nucleo/registro.js';
import { ultimoRegistro, decidirDiaRemoto } from '../../nucleo/conflictos.js';
import { reportar } from '../../adaptadores/errores.js';
import { iniciarFirebase, setUsuario, fbOn, clean, escucharDias, escucharLog, escucharOcultos, escribir, lote } from '../../adaptadores/firestore.js';
import { timers } from '../marcar-dia/marcar.js';
import { render } from '../../ui/render.js';

let fbUnsub=[], fbFirst={};

export function iniciarTiempoReal(){
  if(!iniciarFirebase(u=>{ fbStop(); setUsuario(u); if(u) fbStart(); render(); })) return;   // sin conexión al cargar: la app sigue como antes
  render();   // muestra «Activar tiempo real» sin esperar a que Firebase confirme la sesión
}
export function fbErr(e){
  console.error('[firebase]',e);
  const c=e?.code||'';
  S.lastError=c==='permission-denied'?'Firebase: sin permiso (revisa las reglas de Firestore, paso A5 de docs/FIREBASE.md)'
    :c==='auth/unauthorized-domain'?'Firebase: agrega johansparra.github.io en Authentication → Dominios autorizados'
    :c==='auth/popup-blocked'?'El navegador bloqueó la ventana de Google: permite ventanas emergentes para este sitio'
    :`Firebase: ${e?.message||c}`;
  render();
}
function fbStop(){ fbUnsub.forEach(u=>u()); fbUnsub=[]; }
function fbStart(){
  fbFirst={days:true,log:true,hidden:true};
  fbUnsub.push(escucharDias(onFsDays,fbErr));
  fbUnsub.push(escucharLog(onFsLog,fbErr));
  fbUnsub.push(escucharOcultos(onFsHidden,fbErr));
}

// ── Escrituras ──
export function fsDay(ds,type=S.data[ds]||null,ts=Date.now()){
  if(!fbOn()) return;
  S.fs[ds]={type,ts,dev:S.dev};
  escribir('days',ds,{type,ts,dev:S.dev}).catch(fbErr);
}
export function fsLog(e){
  if(!fbOn()) return;
  const {up,...rest}=e;
  escribir('log',e.id,clean(rest)).catch(fbErr);
}
export function fsHide(ids){
  if(!fbOn()) return;
  lote(ids.map(id=>['hidden',id,{ts:Date.now(),dev:S.dev}])).catch(fbErr);
}

// ── Lecturas en tiempo real ──
// La migración (subir lo local que Firestore no tiene) espera la primera respuesta del servidor:
// la caché local de un dispositivo nuevo viene vacía y no debe pisar datos más nuevos.
const firstFromServer=(snap,k)=>{ if(!fbFirst[k]||snap.metadata.fromCache) return false; fbFirst[k]=false; return true; };
function onFsDays(snap){
  const first=firstFromServer(snap,'days');
  for(const ch of snap.docChanges()){
    if(ch.type==='removed') continue;
    const ds=ch.doc.id, v=ch.doc.data();
    if(!esClave(ds)||!tipoValido(v?.type)){ reportar('Día inválido recibido de Firestore (se ignora)',new Error(`${ds} = ${JSON.stringify(v)}`),'warn'); continue; }
    const fs={type:v.type||null,ts:v.ts||0,dev:v.dev};
    const lt=S.data[ds]||null;
    if(decidirDiaRemoto({local:lt,remoto:fs,enVentana:!!timers[ds],ultimoLog:ultimoRegistro(S.log,ds)})==='reescribir'){
      fsDay(ds,lt,Math.max(Date.now(),fs.ts+1)); continue;   // lo local es más nuevo
    }
    S.fs[ds]=fs;
    if(lt!==fs.type){ if(fs.type) S.data[ds]=fs.type; else delete S.data[ds]; }
  }
  if(first){
    // RN-24: primera vez en este dispositivo: se suben los días que Firestore aún no tiene
    for(const ds of Object.keys(S.data)) if(!S.fs[ds]) fsDay(ds,S.data[ds],ultimoRegistro(S.log,ds)||Date.now());
  }
  save(); render();
}
function onFsLog(snap){
  const first=firstFromServer(snap,'log');
  const have=new Set(S.log.map(e=>e.id)), inFs=new Set();
  for(const ch of snap.docChanges()){
    if(ch.type==='removed') continue;
    const e=ch.doc.data();
    if(!entradaValida(e)){ reportar('Registro inválido recibido de Firestore (se ignora)',new Error(JSON.stringify(e)),'warn'); continue; }
    inFs.add(e.id);
    if(!have.has(e.id)&&!S.hidden[e.id]){ S.log.push({...e,up:true}); have.add(e.id); }   // lo sube a la hoja el dispositivo que lo creó
  }
  if(first){
    const ops=[];
    for(const e of S.log) if(!inFs.has(e.id)&&ops.length<450){ const {up,...rest}=e; ops.push(['log',e.id,clean(rest)]); }
    if(ops.length) lote(ops).catch(fbErr);
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
