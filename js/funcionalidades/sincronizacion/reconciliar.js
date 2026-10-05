// ═══════════════════════════════════════════════════════════
// RECONCILIAR CON GOOGLE CALENDAR: calendario único (RN-20), eventos de día y el mes visible.
// Las decisiones (quién gana) vienen de nucleo/conflictos.js; aquí se ejecutan contra Google.
// ═══════════════════════════════════════════════════════════
import { S } from '../../estado/estado.js';
import { save, LS_CAL } from '../../estado/almacenamiento.js';
import { APP_ID, CAL_NAME, TYPE_LBL } from '../../nucleo/constantes.js';
import { p2, toKey, fromKey, addD, fmtTs } from '../../nucleo/fechas.js';
import { srcText } from '../../nucleo/registro.js';
import { eventosPorDia, diasEnCalendario, elegirEvento, explained, importarDeCalendar, decidirDiaConFirebase } from '../../nucleo/conflictos.js';
import { AuthError } from '../../adaptadores/google-api.js';
import { listEvents, delEvent, crearEvento, actualizarEvento, listarCalendarios, crearCalendario, mergeCalendar } from '../../adaptadores/google-calendar.js';
import { timers } from '../marcar-dia/marcar.js';
import { logChange } from '../historial/registro.js';
import { syncRemindersForDate } from '../avisos/programar.js';
import { fsDay } from './tiempo-real.js';

// RN-20: calendario propio «Office Tracker», UNO solo por cuenta de Google sin importar cuántos dispositivos
// se conecten. En cada sync se busca por nombre; si hay varios (dos dispositivos que se conectaron a la vez),
// todos eligen el mismo (id menor), copian a él los días de los demás y borran los sobrantes.
export async function ensureCalendar(){
  let found;
  try{
    const r=await listarCalendarios();
    found=(r?.items||[]).filter(c=>c.summary===CAL_NAME&&!c.deleted).map(c=>c.id).sort();
    S.account=(r?.items||[]).find(c=>c.primary)?.id||S.account;   // el id del calendario principal es el correo (para el log)
  }catch(e){
    if(e instanceof AuthError) throw e;
    if(e.status||!S.calId||!S.calChecked) throw e;   // error de Google: se muestra tal cual
    return;                             // sin red: se sigue con el calendario conocido
  }                                     // nunca se crea uno nuevo sin haber podido buscar
  let id=found[0]||null, created=false;
  if(!id){ id=(await crearCalendario()).id; created=true; }
  for(const dup of found.slice(1)) await mergeCalendar(dup,id);
  if(S.calId!==id){
    // Cambio de calendario (primera conexión, otro dispositivo lo creó, o lo borraste en Google):
    // los ids guardados ya no sirven. RN-24, se unen los dos lados:
    //  - calendario nuevo y vacío → se sube todo lo local
    //  - calendario existente     → gana lo que ya está en Google; solo se suben los días que no tiene
    S.evIds={}; S.rem={}; S.calId=id;
    const inCal=created?new Set():diasEnCalendario(await listEvents({}));
    for(const k of Object.keys(S.data)) if(!inCal.has(k)) S.pending[k]=true;
    for(const k of Object.keys(S.pending)) if(inCal.has(k)) delete S.pending[k];
  }
  S.calChecked=true;
  localStorage.setItem(LS_CAL,S.calId); save();
}

// ── Eventos de día (la copia en Calendar) ──
// RN-30: los últimos 10 registros del día quedan en la descripción del evento
export function dayBody(key,type){
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
// Lleva a Calendar el estado local de un día. Nunca duplica.
export async function pushDay(key){
  if(timers[key]) return;                 // sigue en la ventana de "Deshacer"
  const type=S.data[key]||null, id=S.evIds[key];
  if(id&&type){
    const r=await actualizarEvento(id,dayBody(key,type));
    if(r?.notFound){ delete S.evIds[key]; return pushDay(key); }
  }else if(id&&!type){
    await delEvent(id); delete S.evIds[key];
  }else if(!id&&type){
    const r=await crearEvento(dayBody(key,type));
    if(r?.id) S.evIds[key]=r.id;
  }
  delete S.pending[key]; save();
  await syncRemindersForDate(key);
}
async function pushPending(){ for(const ds of Object.keys(S.pending)) if(!timers[ds]) await pushDay(ds); }
const eventosDelMes=(year,month)=>listEvents({timeMin:new Date(year,month,1).toISOString(),timeMax:new Date(year,month+1,1).toISOString()});

// RN-22 y RN-25, sin Firebase: pendiente en el dispositivo → gana el dispositivo; si no, gana Calendar
// (crear, mover, renombrar o borrar desde la app de Calendar). Duplicados del mismo día → se deja uno.
export async function reconcileMonth(year,month){
  const prefix=`${year}-${p2(month+1)}`;
  const byDay=eventosPorDia(await eventosDelMes(year,month),prefix);
  for(const [ds,evs] of Object.entries(byDay)){
    const keep=elegirEvento(evs,S.evIds[ds]);
    for(const e of evs) if(e!==keep) await delEvent(e.id);
    S.evIds[ds]=keep.id;
    if(importarDeCalendar({pendiente:S.pending[ds],local:S.data[ds],calendario:keep.type})){
      if(!explained(S.log,ds,keep.type)) logChange({d:ds,from:S.data[ds]||null,to:keep.type,src:'calendar'});
      S.data[ds]=keep.type;
    }
  }
  for(const ds of Object.keys(S.evIds)){
    if(ds.startsWith(prefix)&&!byDay[ds]&&!S.pending[ds]){   // borrado en Calendar
      if(S.data[ds]&&!explained(S.log,ds,null)) logChange({d:ds,from:S.data[ds],to:null,src:'calendar'});
      delete S.evIds[ds]; delete S.data[ds];
    }
  }
  save();
  await pushPending();
}

// RN-23, con Firestore activo: Calendar es una copia. Gana Firestore, salvo que el evento se haya
// editado en Google Calendar después del último cambio en Firestore (eso se importa).
export async function reconcileMonthFS(year,month){
  const prefix=`${year}-${p2(month+1)}`;
  const byDay=eventosPorDia(await eventosDelMes(year,month),prefix,true);
  const days=new Set([...Object.keys(byDay),...Object.keys(S.data),...Object.keys(S.evIds)].filter(k=>k.startsWith(prefix)));
  for(const ds of days){
    const evs=byDay[ds]||[], had=!!S.evIds[ds];
    const keep=elegirEvento(evs,S.evIds[ds]);
    for(const e of evs) if(e!==keep) await delEvent(e.id);
    if(keep) S.evIds[ds]=keep.id; else delete S.evIds[ds];
    const ct=keep?.type||null, lt=S.data[ds]||null;
    const accion=decidirDiaConFirebase({calendario:ct,local:lt,pendiente:S.pending[ds],enVentana:!!timers[ds],
      evento:keep,tsFirestore:S.fs[ds]?.ts||0,tenia:had,ultimaSync:S.lastSync});
    if(accion==='importar'){
      if(!explained(S.log,ds,ct)) logChange({d:ds,from:lt,to:ct,src:'calendar'});
      if(ct) S.data[ds]=ct; else delete S.data[ds];
      fsDay(ds,ct);
    }else if(accion==='corregir') S.pending[ds]=true;   // gana Firestore: se corrige la copia en Calendar
  }
  save();
  await pushPending();
}
