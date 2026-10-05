// ═══════════════════════════════════════════════════════════
// PROGRAMAR AVISOS EN GOOGLE CALENDAR (10:00 y 16:30, lun–vie, sin festivos, sin días ya marcados)
// Qué avisos debe tener cada día lo decide nucleo/avisos.js (RN-15..RN-17, RN-10).
// ═══════════════════════════════════════════════════════════
import { S, now } from '../../estado/estado.js';
import { save } from '../../estado/almacenamiento.js';
import { HORIZON, SLOTS } from '../../nucleo/constantes.js';
import { toKey, addD } from '../../nucleo/fechas.js';
import { avisosDeseados, tituloAviso, cuerpoAviso } from '../../nucleo/avisos.js';
import { rid } from '../../adaptadores/aleatorio.js';
import { listEvents, delEvent, crearEvento, actualizarEvento } from '../../adaptadores/google-calendar.js';

const APP_URL=location.origin+location.pathname;
const titulo=(key,slot)=>tituloAviso(key,slot,S.data,now);

export async function syncRemindersForDate(key){
  if(key<toKey(now)||key>toKey(addD(now,HORIZON))) {
    // Fuera del horizonte: solo se borran avisos que ya no aplican
    for(const sl of SLOTS){ const k=`${key}|${sl.id}`; if(S.rem[k]&&(S.data[key]||S.skip[key])){ await delEvent(S.rem[k].id); delete S.rem[k]; } }
    save(); return;
  }
  const want=new Set(avisosDeseados(key,S.data,S.skip,new Date()));
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
    }else if(!want.has(sl.id)&&have){
      await delEvent(have.id); delete S.rem[k];   // RN-17: día marcado → se borran sus avisos
    }
  }
  save();
}
export async function reconcileReminders(){
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
