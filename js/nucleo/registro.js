// ═══════════════════════════════════════════════════════════
// REGISTROS DEL HISTORIAL (RN-26): textos del origen y validación de un registro
// ═══════════════════════════════════════════════════════════
import { slotOf } from './constantes.js';
import { esClave } from './fechas.js';

export function srcBadge(e){
  if(e.src==='manual')   return ['b-manual','Manual'];
  if(e.src==='undo')     return ['b-undo','Deshecho'];
  if(e.src==='calendar') return ['b-calendar','Calendar'];
  if(e.src==='notif')    return e.ok==='ok'?['b-ok','Aviso ✓']:e.ok==='bad'?['b-bad','Aviso ⚠']:['b-unk','Aviso ?'];
  return ['b-manual',e.src];
}
export function srcText(e){
  if(e.src==='manual')   return 'Manual (toque en la app)';
  if(e.src==='undo')     return 'Deshecho';
  if(e.src==='calendar') return 'Editado en Google Calendar';
  if(e.src==='notif'){
    const v=e.ok==='ok'?'verificado ✓':e.ok==='bad'?'⚠ el código no coincide con el aviso':'sin verificar';
    return `Aviso de las ${slotOf(e.slot)?.label||'?'} · ${v}${e.ref?` · ref ${e.ref}`:''}${e.note?` · ${e.note}`:''}`;
  }
  return e.src;
}
// Un registro sirve si tiene id, un día real y una hora. Los que no, vienen de datos dañados y se descartan.
export function entradaValida(e){
  return !!e&&typeof e==='object'&&typeof e.id==='string'&&e.id!==''&&esClave(e.d)&&Number.isFinite(e.ts);
}
