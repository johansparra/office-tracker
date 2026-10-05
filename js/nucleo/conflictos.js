// ═══════════════════════════════════════════════════════════
// QUIÉN GANA CUANDO HAY DIFERENCIAS (RN-21..RN-25, RN-29)
// Solo deciden; quien ejecuta (llamar a Google, escribir en Firestore) es funcionalidades/sincronizacion.
// ═══════════════════════════════════════════════════════════

// RN-21: qué representa un evento del calendario Office Tracker
export function classify(ev){
  if(ev.status==='cancelled') return null;
  const t=(ev.summary||'').toLowerCase();
  if(/🏖|libre|vacaci/.test(t)) return 'vacation';
  if(/🏢|oficina|office/.test(t)) return 'office';
  const x=ev.extendedProperties?.private?.type;
  return (x==='office'||x==='vacation')?x:'office';   // cualquier otro evento en este calendario = oficina
}
export const esAviso=ev=>ev.extendedProperties?.private?.kind==='reminder';
export const fechaEvento=ev=>ev.start?.date||ev.start?.dateTime?.slice(0,10);

// Eventos de día (no avisos) del mes `prefix` ('AAAA-MM'), agrupados por día
export function eventosPorDia(items,prefix,conFecha=false){
  const byDay={};
  for(const ev of items){
    if(esAviso(ev)) continue;
    const ds=fechaEvento(ev), type=classify(ev);
    if(!ds||!ds.startsWith(prefix)||!type) continue;
    (byDay[ds]=byDay[ds]||[]).push(conFecha?{id:ev.id,type,upd:Date.parse(ev.updated)||0}:{id:ev.id,type});
  }
  return byDay;
}
// Días que un calendario ya tiene marcados (RN-24: al unirse a un calendario existente)
export function diasEnCalendario(items){
  const inCal=new Set();
  for(const ev of items){
    if(esAviso(ev)||!classify(ev)) continue;
    const ds=fechaEvento(ev); if(ds) inCal.add(ds);
  }
  return inCal;
}
// RN-25: si un día tiene varios eventos se queda el conocido (o el primero); el resto son duplicados
export const elegirEvento=(evs,idConocido)=>evs.find(e=>e.id===idConocido)||evs[0];

// RN-29: ¿el cambio que trae Calendar ya está explicado por el último registro de ese día
// (por ejemplo, de otro dispositivo)? Entonces no se registra otra vez como «Calendar».
export function explained(log,ds,to){
  let last=null;
  for(const e of log) if(e.d===ds&&(!last||e.ts>=last.ts)) last=e;
  return !!last&&(last.to??null)===to;
}
export const ultimoRegistro=(log,ds)=>log.reduce((m,e)=>e.d===ds&&e.ts>m?e.ts:m,0);

// RN-22 (sin Firebase): pendiente en el dispositivo → gana el dispositivo; si no, gana Calendar
export const importarDeCalendar=({pendiente,local,calendario})=>!pendiente&&local!==calendario;

// RN-23 (con Firebase): Firestore es la fuente de verdad. Una edición en Google Calendar se importa solo si es
// posterior al último cambio en Firestore, o si un evento conocido desapareció sin que Firestore cambiara.
//   → 'nada' | 'importar' (de Calendar) | 'corregir' (Calendar según Firestore)
export function decidirDiaConFirebase({calendario,local,pendiente,enVentana,evento,tsFirestore,tenia,ultimaSync}){
  if(calendario===local||pendiente||enVentana) return 'nada';
  const fromCal=evento?evento.upd>tsFirestore+5000:tenia&&tsFirestore<ultimaSync;
  return fromCal?'importar':'corregir';
}
// RN-23: llega un día desde Firestore. Si lo local es más nuevo (en la ventana de deshacer o con un registro
// posterior), se reescribe Firestore con lo local; si no, se aplica lo que llegó.
export const decidirDiaRemoto=({local,remoto,enVentana,ultimoLog})=>local!==remoto.type&&(enVentana||ultimoLog>remoto.ts)?'reescribir':'aplicar';
