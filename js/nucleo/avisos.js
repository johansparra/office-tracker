// ═══════════════════════════════════════════════════════════
// AVISOS DIARIOS (RN-15..RN-19, RN-10): qué avisos debe tener un día, cuáles sobran y con qué texto
// ═══════════════════════════════════════════════════════════
import { SLOTS, slotOf, APP_ID, TZ, RESPUESTAS, NOTA_NO_FUI } from './constantes.js';
import { p2, fromKey, isWeekend, esClave } from './fechas.js';
import { getHol } from './festivos.js';
import { calcularMes } from './meta.js';

// RN-16: lun–vie, sin festivo, sin marcar, sin «Hoy no fui», y solo las horas que aún no pasaron
export function avisosDeseados(key,data,skip,ahora){
  const d=fromKey(key);
  if(isWeekend(d)||getHol(d)||data[key]||skip[key]) return [];
  return SLOTS.filter(sl=>{ const at=new Date(d); at.setHours(sl.h,sl.m,0,0); return at>ahora; }).map(sl=>sl.id);
}
// RN-17: un aviso sobra (se borra del calendario) si su día ya se respondió (marcado o «Hoy no fui»), si el día ya pasó
// o si no es día hábil. Sin respuesta, los de hoy se quedan aunque ya hayan sonado: todavía se puede responder desde ellos.
export function avisoSobra(key,data,skip,hoy){
  if(!esClave(key)) return true;
  const d=fromKey(key);
  return !!(data[key]||skip[key])||key<hoy||isWeekend(d)||!!getHol(d);
}
// RN-19: días con «Hoy no fui», también los respondidos en otro dispositivo (llegan con el historial compartido)
export function diasNoFui(log,skip){
  const out={...skip};
  for(const e of log) if(e?.note===NOTA_NO_FUI&&esClave(e.d)) out[e.d]=true;
  return out;
}
// RN-18: texto del evento con un enlace por respuesta y uno que abre todas las opciones
export function textoAviso(link){
  const resp=Object.entries(RESPUESTAS).map(([a,t])=>`${t}\n${link}&a=${a}`).join('\n\n');
  return `Responde con un toque:\n\n${resp}\n\nVer todas las opciones:\n${link}`;
}
// RN-10: en un día obligatorio para llegar a la meta, el aviso de las 10:00 lo dice
export function tituloAviso(key,slot,data,now){
  const d=fromKey(key);
  return slot==='r10'&&calcularMes(data,d.getFullYear(),d.getMonth(),now).must.includes(key)?'⚠️ Hoy tienes que ir a la oficina':slotOf(slot).title;
}
// Evento de Google Calendar para un aviso (con los enlaces y su código único, RN-18)
export function cuerpoAviso(key,slot,nonce,titulo,appUrl){
  const sl=slotOf(slot);
  return {
    summary:titulo, transparency:'transparent',
    start:{dateTime:`${key}T${p2(sl.h)}:${p2(sl.m)}:00`,timeZone:TZ},
    end:{dateTime:`${key}T${p2(sl.h)}:${p2(sl.m+5)}:00`,timeZone:TZ},
    description:textoAviso(`${appUrl}?d=${key}&r=${slot}&n=${nonce}`),
    reminders:{useDefault:false,overrides:[{method:'popup',minutes:0}]},
    extendedProperties:{private:{appId:APP_ID,kind:'reminder',date:key,slot,nonce}}
  };
}
