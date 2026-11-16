// ═══════════════════════════════════════════════════════════
// REGISTROS DEL HISTORIAL (RN-26): textos del origen y validación de un registro
// ═══════════════════════════════════════════════════════════
import { slotOf, TIPOS, NOTA_NO_FUI } from './constantes.js';
import { esClave } from './fechas.js';

export function srcBadge(e){
  if(e.src==='manual')   return ['b-manual','Manual'];
  if(e.src==='undo')     return ['b-undo','Deshecho'];
  if(e.src==='calendar') return ['b-calendar','Calendar'];
  if(e.src==='notif')    return e.ok==='ok'?['b-ok','Aviso ✓']:e.ok==='bad'?['b-bad','Aviso ⚠']:['b-unk','Aviso ?'];
  return ['b-manual','Desconocido'];   // nunca se muestra un origen que no es de la app
}
export function srcText(e){
  if(e.src==='manual')   return 'Manual (toque en la app)';
  if(e.src==='undo')     return 'Deshecho';
  if(e.src==='calendar') return 'Editado en Google Calendar';
  if(e.src==='notif'){
    const v=e.ok==='ok'?'verificado ✓':e.ok==='bad'?'⚠ el código no coincide con el aviso':'sin verificar';
    return `Aviso de las ${slotOf(e.slot)?.label||'?'} · ${v}${e.ref?` · ref ${e.ref}`:''}${e.note?` · ${e.note}`:''}`;
  }
  return 'Desconocido';
}
// ═══ Validación (seguridad): lo que llega de la hoja, de Firestore o del dispositivo puede venir de otra persona ═══
const SRCS=['manual','undo','calendar','notif'], OKS=['ok','bad','unknown'], DIA=864e5;
// Id de registro u oculto: corto, sin «/» ni «__x__» (Firestore lo usa como id de documento)
export const idValido=id=>typeof id==='string'&&/^[A-Za-z0-9][\w-]{0,63}$/.test(id);
const opc=(v,ok)=>v==null||ok(v);
// Solo los campos que la app escribe (up: ya está en la hoja). Un registro de afuera con claves extra (por ejemplo un
// texto enorme) se recorta a estos campos, en el mismo orden, antes de guardarlo o subirlo.
const CAMPOS=['id','ts','d','from','to','src','dev','slot','ok','ref','note','up'];
export const soloCampos=e=>Object.fromEntries(Object.entries(e).filter(([k])=>CAMPOS.includes(k)));
// Un registro sirve si tiene id, día real, hora y solo valores que la app produce (origen, estados, aviso, nota) con
// textos cortos. Con `ahora`, además se descarta una hora más de un día en el futuro (RN-23 decide por la hora).
export function entradaValida(e,ahora){
  return !!e&&typeof e==='object'&&idValido(e.id)&&esClave(e.d)&&Number.isFinite(e.ts)&&(ahora==null||e.ts<=ahora+DIA)
    &&SRCS.includes(e.src)&&opc(e.from,t=>TIPOS.includes(t))&&opc(e.to,t=>TIPOS.includes(t))
    &&opc(e.dev,v=>typeof v==='string'&&/^[\w?-]{1,16}$/.test(v))&&opc(e.ok,v=>OKS.includes(v))&&opc(e.slot,v=>!!slotOf(v))
    &&opc(e.ref,v=>typeof v==='string'&&/^[0-9a-f]{0,32}$/.test(v))&&opc(e.note,v=>v===NOTA_NO_FUI);
}
