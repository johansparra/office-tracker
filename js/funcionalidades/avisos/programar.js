// ═══════════════════════════════════════════════════════════
// PROGRAMAR AVISOS EN GOOGLE CALENDAR (10:00 y 16:30, lun–vie, sin festivos, sin días ya marcados)
// Qué avisos debe tener cada día y cuáles sobran lo decide nucleo/avisos.js (RN-15..RN-19, RN-10).
// ═══════════════════════════════════════════════════════════
import { S, now } from '../../estado/estado.js';
import { save } from '../../estado/almacenamiento.js';
import { HORIZON, SLOTS } from '../../nucleo/constantes.js';
import { toKey, addD } from '../../nucleo/fechas.js';
import { avisosDeseados, avisoSobra, diasNoFui, tituloAviso, textoAviso, cuerpoAviso } from '../../nucleo/avisos.js';
import { rid } from '../../adaptadores/aleatorio.js';
import { listEvents, delEvent, crearEvento, actualizarEvento } from '../../adaptadores/google-calendar.js';

const APP_URL=location.origin+location.pathname;
const titulo=(key,slot)=>tituloAviso(key,slot,S.data,now);
const noFui=()=>diasNoFui(S.log,S.skip);   // RN-19: «Hoy no fui» de este dispositivo y de los otros

export async function syncRemindersForDate(key){
  const skip=noFui(), sobra=avisoSobra(key,S.data,skip,toKey(now));   // RN-17
  if(key<toKey(now)||key>toKey(addD(now,HORIZON))) {
    // Fuera del horizonte: solo se borran avisos que ya no aplican
    for(const sl of SLOTS){ const k=`${key}|${sl.id}`; if(S.rem[k]&&sobra){ await delEvent(S.rem[k].id); delete S.rem[k]; } }
    save(); return;
  }
  const want=new Set(avisosDeseados(key,S.data,skip,new Date()));
  for(const sl of SLOTS){
    const k=`${key}|${sl.id}`, have=S.rem[k];
    if(want.has(sl.id)&&!have){
      const nonce=rid(4);
      const r=await crearEvento(cuerpoAviso(key,sl.id,nonce,titulo(key,sl.id),APP_URL));
      if(r?.id){ S.rem[k]={id:r.id,nonce,t:titulo(key,sl.id)}; S.nonces[nonce]={d:key,slot:sl.id}; }
    }else if(want.has(sl.id)&&have&&have.t!==titulo(key,sl.id)){
      const t=titulo(key,sl.id);   // el día pasó a ser (o dejó de ser) obligatorio
      const r=await actualizarEvento(have.id,{summary:t});
      if(r?.notFound) delete S.rem[k]; else have.t=t;
    }else if(!want.has(sl.id)&&have&&sobra){
      await delEvent(have.id); delete S.rem[k];   // RN-17: día respondido → se borran sus avisos (sin responder, los de hoy se quedan)
    }
  }
  save();
}
export async function reconcileReminders(){
  const hoy=toKey(now), to=addD(now,HORIZON+1), skip=noFui();
  // Sin fecha de inicio: también aparecen (y se borran) los avisos viejos de días en que ningún dispositivo se conectó
  const items=await listEvents({timeMax:to.toISOString(),privateExtendedProperty:'kind=reminder'});
  const fresh={};
  for(const ev of items){
    const p=ev.extendedProperties?.private||{}, k=`${p.date}|${p.slot}`;
    if(p.nonce) S.nonces[p.nonce]={d:p.date,slot:p.slot};
    if(fresh[k]||!p.date||avisoSobra(p.date,S.data,skip,hoy)){ await delEvent(ev.id); continue; }   // duplicado, de un día que pasó o ya respondido
    fresh[k]={id:ev.id,nonce:p.nonce,t:ev.summary};
    // RN-18: los avisos creados antes de los enlaces para responder con un toque se actualizan una vez con el texto nuevo
    if(p.nonce&&!ev.description?.includes('&a=')){ const r=await actualizarEvento(ev.id,{description:textoAviso(`${APP_URL}?d=${p.date}&r=${p.slot}&n=${p.nonce}`)}); if(r?.notFound) delete fresh[k]; }
  }
  const b=toKey(to);
  for(const k of Object.keys(S.rem)) if(k.split('|')[0]<=b) delete S.rem[k];
  Object.assign(S.rem,fresh);
  for(let i=0;i<=HORIZON;i++) await syncRemindersForDate(toKey(addD(now,i)));
  const ks=Object.keys(S.nonces); if(ks.length>300) ks.slice(0,ks.length-300).forEach(k=>delete S.nonces[k]);
  save();
}
