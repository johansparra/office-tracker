// ═══════════════════════════════════════════════════════════
// AVISOS DIARIOS (RN-15..RN-17, RN-10): qué avisos debe tener un día y con qué texto
// ═══════════════════════════════════════════════════════════
import { SLOTS, slotOf, APP_ID, TZ } from './constantes.js';
import { p2, fromKey, isWeekend } from './fechas.js';
import { getHol } from './festivos.js';
import { calcularMes } from './meta.js';

// RN-16: lun–vie, sin festivo, sin marcar, sin «Hoy no fui», y solo las horas que aún no pasaron
export function avisosDeseados(key,data,skip,ahora){
  const d=fromKey(key);
  if(isWeekend(d)||getHol(d)||data[key]||skip[key]) return [];
  return SLOTS.filter(sl=>{ const at=new Date(d); at.setHours(sl.h,sl.m,0,0); return at>ahora; }).map(sl=>sl.id);
}
// RN-10: en un día obligatorio para llegar a la meta, el aviso de las 10:00 lo dice
export function tituloAviso(key,slot,data,now){
  const d=fromKey(key);
  return slot==='r10'&&calcularMes(data,d.getFullYear(),d.getMonth(),now).must.includes(key)?'⚠️ Hoy tienes que ir a la oficina':slotOf(slot).title;
}
// Evento de Google Calendar para un aviso (con el enlace y su código único, RN-18)
export function cuerpoAviso(key,slot,nonce,titulo,appUrl){
  const sl=slotOf(slot);
  return {
    summary:titulo, transparency:'transparent',
    start:{dateTime:`${key}T${p2(sl.h)}:${p2(sl.m)}:00`,timeZone:TZ},
    end:{dateTime:`${key}T${p2(sl.h)}:${p2(sl.m+5)}:00`,timeZone:TZ},
    description:`Toca el enlace para registrar el día:\n${appUrl}?d=${key}&r=${slot}&n=${nonce}`,
    reminders:{useDefault:false,overrides:[{method:'popup',minutes:0}]},
    extendedProperties:{private:{appId:APP_ID,kind:'reminder',date:key,slot,nonce}}
  };
}
